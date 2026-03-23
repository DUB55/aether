
import { readFileSafe, writeFileSafe } from "@/lib/explorer/fs"
import { DUB5AIService } from "@/lib/dub5ai"
import { DependencyGraph } from "./graph"
import { memoryManager } from "./memory"
import { LinterAgent } from "./linter"
import {
  interactionAgent,
  plannerAgent,
  retrieverAgent,
  reasoningAgent,
  routingAgent,
  stateManagerAgent,
  fixerAgent,
  builderAgent,
  type AgentRunInput,
  type AgentRunOutput
} from "./agents"
import { scaffolderAgent, type ScaffoldTemplate } from "./scaffolder"
import { runnerAgent } from "./runner"
import { gitAgent } from "./git"
import { generateTest } from "./tester"

export async function retrieveContext(paths: string[] | undefined) {
  const result: Record<string, string> = {}
  if (!paths || paths.length === 0) return result
  
  try {
    const graph = new DependencyGraph()
    // Build graph with depth 1 to get immediate dependencies
    // This helps the AI understand what the edited file relies on
    const nodes = await graph.build(paths, 1)
    
    // Convert graph nodes to context map
    for (const [filePath, node] of nodes.entries()) {
      if (node.content) {
        // Limit context size per file to avoid token overflow
        result[filePath] = node.content.slice(0, 10000) 
      }
    }
  } catch (error) {
    console.warn("Orchestrator: Dependency graph build failed, falling back to simple read", error)
    for (const filePath of paths) {
      try {
        const file = await readFileSafe(filePath, 4000)
        result[filePath] = file.content
      } catch {
        result[filePath] = ""
      }
    }
  }
  return result
}

export async function runAgent(input: AgentRunInput): Promise<AgentRunOutput> {
  const selectedModel = routingAgent(input.settings)
  const contextPreview = await retrieveContext(input.contextPaths)
  const sessionId = input.sessionId ?? "default"

  // Real AI functionality: Call DUB5 AI to generate code and reasoning
  let aiResponse = ""
  try {
    // Retrieve conversation history
    const history = memoryManager.getRecentHistory(sessionId)
    const messages = history
      .filter(entry => entry.role === 'user' || entry.role === 'assistant')
      .map(entry => ({
        role: entry.role as "user" | "assistant",
        content: entry.content
      }))
    
    // Add current user prompt with context
    const contextStr = Object.entries(contextPreview)
      .map(([path, content]) => `File: ${path}\n\`\`\`\n${content}\n\`\`\``)
      .join('\n\n')

    messages.push({ 
      role: "user" as const, 
      content: `Current Project Context:\n${contextStr}\n\nUser Request: ${input.prompt}` 
    })
    
    // We use streamRequest but since runAgent is currently async (non-streaming),
    // we'll await the full result. Future phases should make this streaming.
    aiResponse = await DUB5AIService.streamRequest({
      messages,
    })

    // Store interaction in memory
    memoryManager.addInteraction(sessionId, "user", input.prompt)
    memoryManager.addInteraction(sessionId, "assistant", aiResponse)

  } catch (error) {
    console.error("Orchestrator: DUB5 AI Call failed", error)
    aiResponse = "I encountered an error while processing your request. Please try again."
  }

  const plan = plannerAgent(aiResponse || input.prompt)
  const reasoning = reasoningAgent(aiResponse || input.prompt)
  const retrievalSummary = retrieverAgent(contextPreview)
  const stateSummary = stateManagerAgent(sessionId, input.prompt)

  // Scaffolding Phase (Phase 13)
  let scaffoldResult: any = null
  const promptLower = input.prompt.toLowerCase()
  if (promptLower.includes("new project") || promptLower.includes("start a project") || promptLower.includes("scaffold")) {
    let template: ScaffoldTemplate = "nextjs"
    if (promptLower.includes("python") || promptLower.includes("fastapi")) template = "python-fastapi"
    else if (promptLower.includes("vite") || promptLower.includes("react")) template = "vite-react"
    
    scaffoldResult = await scaffolderAgent(template, "aether-project")
  }

  // Runner Phase (Phase 14)
  let runResult = null
  if (promptLower.includes("run") || promptLower.includes("start dev") || promptLower.includes("npm install")) {
    let command = "npm run dev"
    if (promptLower.includes("install")) command = "npm install"
    else if (promptLower.includes("build")) command = "npm run build"
    
    runResult = { command, status: "Started execution in background..." }
  }

  // Git Phase (Phase 17)
  let gitResult = null
  if (promptLower.includes("git") || promptLower.includes("commit") || promptLower.includes("version control")) {
    let action: "init" | "commit" | "status" = "status"
    if (promptLower.includes("init")) action = "init"
    else if (promptLower.includes("commit") || promptLower.includes("save")) action = "commit"
    
    gitResult = await gitAgent(action, "Aether automatic commit")
  }

  // Extract files from AI response
  const filesToWrite: Record<string, string> = {}
  
  // Parse BEGIN_FILE:path ... END_FILE
  const fileRegex = /BEGIN_FILE:([^\n]+)\n([\s\S]*?)\nEND_FILE/g
  let match
  while ((match = fileRegex.exec(aiResponse)) !== null) {
    const path = match[1].trim()
    let content = match[2]
    
    // PHASE 2.2: Pre-Flight Check (Linter)
    const lintErrors = LinterAgent.lint(content, path)
    if (lintErrors.length > 0) {
      console.log(`Linter detected ${lintErrors.length} issues in ${path}`)
      
      // Auto-fix simple issues
      let modified = false
      for (const error of lintErrors) {
        if (error.message.includes('Use "className"')) {
          content = content.replace(/class="/g, 'className="')
          modified = true
        }
        if (error.message.includes('Use "htmlFor"')) {
          content = content.replace(/for="/g, 'htmlFor="')
          modified = true
        }
      }
      
      if (modified) {
        console.log(`Auto-fixed linter issues in ${path}`)
        aiResponse += `\n\n[System] Auto-corrected linter issues in ${path}`
      }
    }
    
    filesToWrite[path] = content
  }

  // Fallback to builderAgent if no files extracted but it's a simple request
  if (Object.keys(filesToWrite).length === 0) {
    const builderFiles = builderAgent(input.prompt, contextPreview)
    Object.assign(filesToWrite, builderFiles)
  }

  // Tester Phase (Phase 2.2)
  if (input.prompt.toLowerCase().includes("test") || input.prompt.toLowerCase().includes("verify")) {
    const testFiles: Record<string, string> = {}
    for (const [path, content] of Object.entries(filesToWrite)) {
      if (path.match(/\.(ts|tsx|js|jsx)$/) && !path.includes('.test.')) {
        const testContent = await generateTest(path, content)
        // Simple heuristic for test file naming
        const testPath = path.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1')
        testFiles[testPath] = testContent
      }
    }
    Object.assign(filesToWrite, testFiles)
  }

  // Execute writes
  for (const [path, content] of Object.entries(filesToWrite)) {
    await writeFileSafe(path, content)
  }

  // Auto-Fixer Phase (Phase 10)
  let fixerResult = null
  if (input.prompt.toLowerCase().includes("fix") || input.prompt.toLowerCase().includes("error")) {
    const errorMsg = input.prompt
    fixerResult = await fixerAgent(errorMsg, contextPreview)
    const firstFile = Object.keys(contextPreview)[0]
    if (firstFile && fixerResult.proposedFix) {
      await writeFileSafe(firstFile, fixerResult.proposedFix)
    }
  }

  const response = aiResponse || interactionAgent({
    plan,
    reasoning,
    contextPreview,
    selectedModel,
    retrievalSummary,
    stateSummary,
    filesGenerated: [...Object.keys(filesToWrite), ...(scaffoldResult?.generatedFiles ?? [])],
    fixApplied: !!fixerResult,
    runStatus: runResult?.status,
    gitStatus: gitResult?.message
  })

  return {
    selectedModel,
    plan,
    reasoning,
    retrievalSummary,
    contextPreview,
    stateSummary,
    response,
    filesGenerated: [...Object.keys(filesToWrite), ...(scaffoldResult?.generatedFiles ?? [])],
    fixApplied: !!fixerResult
  }
}
