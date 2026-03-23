/**
 * DUB5 AI Service Integration
 * Implements streaming, prompt engineering, and code generation support.
 */

export type DUB5ChunkCallback = (chunk: string) => void;

export interface DUB5Message {
  role: "user" | "assistant"; // Strict adherence to API docs: only user or assistant
  content: string;
}

export interface DUB5RequestOptions {
  messages: DUB5Message[];
  onChunk?: DUB5ChunkCallback;
  signal?: AbortSignal;
  apiUrl?: string;
}

export class DUB5AIService {
  private static API_URL = "/api/dub5"; 

  /**
   * Core streaming request logic following the DUB5 Integration Protocol
   */
  static async streamRequest(options: DUB5RequestOptions): Promise<string> {
    const { messages, onChunk, signal, apiUrl } = options;

    try {
      console.log("[DUB5] Sending request to:", apiUrl || this.API_URL);
      console.log("[DUB5] Payload messages count:", messages.length);
      
      // Extract the last message content to use as 'input', which is required by the API
      // when using personality: "coder"
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      const inputContent = lastMessage ? lastMessage.content : "";
      
      // Extract history (all messages except the last one)
      const history = messages.slice(0, -1);

      const response = await fetch(apiUrl || this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          history: history,
          input: inputContent,
          personality: "coder"
        }),
      });

      if (!response.ok) {
        let errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) errorText = errorJson.error;
        } catch (e) {
          // Not JSON, use raw text
        }
        throw new Error(`DUB5 API Error (${response.status}): ${errorText || response.statusText}`);
      }
      if (!response.body) throw new Error("DUB5 API Error: No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Handle standard SSE format
        const lines = buffer.split("\n");
        // Keep the last line in the buffer if it's incomplete
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === "" || !trimmedLine.startsWith("data: ")) continue;
          
          const rawData = trimmedLine.slice(6).trim();
          
          try {
            const data = JSON.parse(rawData);
            
            // Handle different event types based on the new protocol
            if (data.type === "chunk") {
              const content = data.content || "";
              fullResponse += content;
              if (onChunk) onChunk(content);
            } else if (data.type === "end") {
               // Stream finished
               break;
            } else if (data.type === "error") {
              throw new Error(data.content || "Unknown error from AI stream");
            }
            
            // Handle OpenAI-compatible chunks (choices array)
            if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
              const delta = data.choices[0].delta;
              if (delta) {
                // Prioritize standard content, but also capture reasoning if available (and content is empty or alongside)
                // Note: Some models stream reasoning_content first, then content.
                // We'll treat reasoning_content as content for now to ensure visibility, 
                // or we could wrap it. Let's append it.
                
                const content = delta.content || delta.reasoning_content || "";
                if (content) {
                  fullResponse += content;
                  if (onChunk) onChunk(content);
                }
              }
            }

            // Fallback for previous protocol or variations
            if (data.content && !data.type) {
                 fullResponse += data.content;
                 if (onChunk) onChunk(data.content);
            }

          } catch (e) {
             // Ignore parse errors for non-JSON lines or log them
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error("DUB5 Streaming Error:", error);
      throw error;
    }
  }

  /**
   * Specialized method for planning execution
   */
  static async planExecution(prompt: string, context: Record<string, string>, onChunk?: DUB5ChunkCallback, signal?: AbortSignal, knowledge?: string): Promise<string> {
    const contextStr = Object.entries(context).length > 0 
      ? `\n\nCURRENT PROJECT FILES:\n${Object.entries(context).map(([path, content]) => `File: ${path}\n\`\`\`\n${content}\n\`\`\``).join('\n\n')}`
      : "\n\nCURRENT PROJECT FILES: (empty project)";

    const knowledgeStr = knowledge ? `\n\n### PROJECT KNOWLEDGE BASE (IMPORTANT CONTEXT)\n${knowledge}` : "";

    const systemInstructions = `You are Aether AI, an advanced autonomous web app builder.
You are currently in PLAN mode. Before writing any code, you must create a detailed, structured plan.
${knowledgeStr}

INSTRUCTIONS:
1. Analyze the user request and the current project context.
2. Break down the task into logical steps.
3. If new files are needed, specify their purpose and structure.
4. If modifying existing files, explain the intended changes.
5. Use <file path="filepath">code</file> to propose changes.
6. Use <shell_command>command</shell_command> to execute shell commands.
7. Use <delete_file path="filepath" /> to delete files.
8. Use <rename_file from="oldpath" to="newpath" /> to rename files.

Your plan should be concise but comprehensive. Focus on high-quality, modern, and beautiful code.`;

    // Combine instructions and user prompt into a single User message
    const fullContent = `${systemInstructions}\n\nUser Request: ${prompt}${contextStr}`;

    return this.streamRequest({
      messages: [{ role: "user", content: fullContent }],
      onChunk,
      signal
    });
  }
}
