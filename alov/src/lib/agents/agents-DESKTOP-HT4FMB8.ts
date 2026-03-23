
import { selectModel, type RoutingResult } from "@/lib/ai/routing"
import { DUB5AIService } from "@/lib/dub5ai"

export type AgentSettings = {
  modelId?: string | null
  performanceMode?: "speed" | "balanced" | "intelligence" | "unlimited"
  allowSlowInfiniteMode?: boolean
}

export type AgentRunInput = {
  prompt: string
  contextPaths?: string[]
  settings?: AgentSettings
  sessionId?: string
}

export type AgentRunOutput = {
  selectedModel: RoutingResult
  plan: string[]
  reasoning: string
  retrievalSummary: string
  contextPreview: Record<string, string>
  stateSummary: string
  response: string
  filesGenerated?: string[]
  fixApplied?: boolean
}

export function plannerAgent(content: string) {
  const lines = content
    .split(/[.!?\n]+/)
    .map((line) => line.trim())
    .filter(Boolean)
  
  if (lines.length === 0) return ["Analyze request", "Identify files", "Execute changes"]
  
  // If it's an AI response, look for BEGIN_FILE markers
  const files = content.match(/BEGIN_FILE:([^\n]+)/g)
  if (files) {
    return [
      "Process AI generation",
      ...files.map(f => `Update ${f.split(':')[1]}`),
      "Verify changes"
    ]
  }

  return lines.slice(0, 5).map((line) => line.length > 30 ? line.slice(0, 27) + "..." : line)
}

export function reasoningAgent(content: string) {
  if (!content.trim()) return "No content provided."
  
  // Try to extract reasoning from AI response (text before first BEGIN_FILE)
  const firstMarker = content.indexOf("BEGIN_FILE:")
  if (firstMarker !== -1) {
    const reasoning = content.slice(0, firstMarker).trim()
    if (reasoning.length > 20) {
      return reasoning.length > 240 ? `${reasoning.slice(0, 237)}...` : reasoning
    }
  }

  const summary = content.length > 240 ? `${content.slice(0, 237)}...` : content
  return `Strategic Focus: ${summary}`
}

export function routingAgent(settings?: AgentSettings) {
  return selectModel({
    mode: settings?.performanceMode ?? "balanced",
    userSelectedModel: settings?.modelId ?? null,
    allowSlowInfiniteMode: settings?.allowSlowInfiniteMode ?? false
  })
}

type AgentState = {
  history: string[]
  updatedAt: number
}

const stateStore = new Map<string, AgentState>()

export function stateManagerAgent(sessionId: string, prompt: string) {
  const current = stateStore.get(sessionId) ?? { history: [], updatedAt: Date.now() }
  const history = [...current.history, prompt].slice(-8)
  const next = { history, updatedAt: Date.now() }
  stateStore.set(sessionId, next)
  return `State updated. Stored ${next.history.length} prompt(s).`
}

export function retrieverAgent(contextPreview: Record<string, string>) {
  const keys = Object.keys(contextPreview)
  if (keys.length === 0) return "No file context retrieved."
  const nonEmpty = keys.filter((key) => contextPreview[key]?.trim())
  return `Retrieved ${nonEmpty.length} file(s) from ${keys.length} selection(s).`
}

export async function fixerAgent(error: string, context: Record<string, string>) {
  const fileToFix = Object.keys(context)[0] || "unknown"
  const fileContent = context[fileToFix] || ""
  
  console.log(`FixerAgent: Analyzing error in ${fileToFix}...`)

  const prompt = `
I encountered an error in the following file. Please fix it.

File: ${fileToFix}
Error: ${error}

Content:
\`\`\`
${fileContent}
\`\`\`

Return ONLY the fixed file content inside a code block.
`

  try {
    const systemPrompt = "You are an expert debugger. Fix the code errors.";
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    
    const response = await DUB5AIService.streamRequest({
      messages: [{ role: "user", content: fullPrompt }],
    })
    
    // Extract code block
    const match = response.match(/```(?:typescript|ts|javascript|js|tsx|jsx)?\n([\s\S]*?)```/)
    const fixedContent = match ? match[1].trim() : response

    return {
      analysis: `Detected error: "${error}". Analyzing ${fileToFix}...`,
      proposedFix: fixedContent,
      confidence: 0.95
    }
  } catch (err) {
    console.error("FixerAgent failed", err)
    return {
      analysis: `Failed to fix error: ${error}`,
      proposedFix: fileContent, // Return original if failed
      confidence: 0
    }
  }
}

export function interactionAgent(data: {
  plan: string[]
  reasoning: string
  contextPreview: Record<string, string>
  selectedModel: RoutingResult
  retrievalSummary: string
  stateSummary: string
  filesGenerated?: string[]
  fixApplied?: boolean
  runStatus?: string
  gitStatus?: string
}) {
  const contextList = Object.keys(data.contextPreview)
  const contextLine =
    contextList.length === 0
      ? "No file context used."
      : `Context files: ${contextList.join(", ")}`
  
  const generatedLine = data.filesGenerated && data.filesGenerated.length > 0
    ? `\nGenerated/Updated ${data.filesGenerated.length} file(s).`
    : ""

  const fixLine = data.fixApplied ? "\n✨ Auto-Fixer: Applied self-healing code to resolve detected issues." : ""
  const runLine = data.runStatus ? `\n🚀 Runner: ${data.runStatus}` : ""
  const gitLine = data.gitStatus ? `\n📦 Git: ${data.gitStatus}` : ""

  return [
    `Using ${data.selectedModel.model.label} (${data.selectedModel.source}).`,
    contextLine,
    data.retrievalSummary,
    data.stateSummary,
    `Plan: ${data.plan.join(" | ")}`,
    `Reasoning: ${data.reasoning}`,
    generatedLine,
    fixLine,
    runLine,
    gitLine
  ].join("\n")
}

import { shadcnRegistry } from "@/lib/ai/shadcn-registry"

export function builderAgent(prompt: string, context: Record<string, string>) {
  const files: Record<string, string> = {}
  const promptLower = prompt.toLowerCase()
  
  // ShadCN Integration (Phase 15)
  if (promptLower.includes("shadcn") || promptLower.includes("ui component")) {
    for (const [key, component] of Object.entries(shadcnRegistry)) {
      if (promptLower.includes(key)) {
        files[`src/components/ui/${key}.tsx`] = component.code
      }
    }
  }

  if (promptLower.includes("button") && promptLower.includes("component") && !files["src/components/ui/button.tsx"]) {
    // Custom button if not shadcn
    files["src/components/ui/custom-button.tsx"] = `
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
}

export const CustomButton = ({ className, variant = 'primary', ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500',
    secondary: 'bg-slate-800 text-white hover:bg-slate-700',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800'
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
`
  }
  
  return files
}
