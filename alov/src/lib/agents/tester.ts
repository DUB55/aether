
import { AgentRunInput, AgentRunOutput } from "./agents"
import { DUB5AIService } from "@/lib/dub5ai"

export async function generateTest(filePath: string, fileContent: string): Promise<string> {
  const testFileName = filePath.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1')
  
  const prompt = `
Generate a Vitest test file for the following code:
File: ${filePath}
Content:
\`\`\`
${fileContent}
\`\`\`

Requirements:
1. Import necessary testing libraries (@testing-library/react, vitest).
2. Write unit tests covering main functionality.
3. Use describe/it blocks.
4. Output ONLY the code block.
`

  const systemPrompt = "You are an expert QA engineer. Generate robust unit tests.";
  const fullPrompt = `${systemPrompt}\n\n${prompt}`;

  try {
    const response = await DUB5AIService.streamRequest({
      messages: [{ role: "user", content: fullPrompt }],
    })
    
    // Extract code block
    const match = response.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)```/)
    return match ? match[1].trim() : response
  } catch (error) {
    console.error("Test generation failed", error)
    return "// Test generation failed"
  }
}
