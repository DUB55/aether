import { GoogleGenAI } from "@google/genai";
import { GeminiPoolManager, KeyStatus } from "./gemini-pool";

export class GeminiService {
  private pool: GeminiPoolManager;

  constructor(apiKeys: string[]) {
    this.pool = new GeminiPoolManager(apiKeys);
  }

  public async chat(params: {
    input: string;
    history: any[];
    personality?: string;
    thinking_mode?: string;
    onChunk: (chunk: string) => void;
    onProvider?: (provider: string, model?: string) => void;
    forceDub5?: boolean;
    model?: string;
    image?: { data: string; mimeType: string };
    customApiKey?: string;
    files?: Record<string, string>;
  }) {
    if (params.forceDub5) {
      console.log('Forcing DUB5 AI provider as requested.');
      params.onProvider?.('dub5', 'auto');
      return this.callDub5AI(params);
    }

    if (params.customApiKey) {
      console.log('Using custom Gemini API key provided by user.');
      try {
        const modelName = params.model || 'gemini-3-flash-preview';
        params.onProvider?.('gemini', `${modelName} (custom)`);
        const result = await this.callGeminiWithKey(params.customApiKey, params);
        return result;
      } catch (error: any) {
        console.error('Custom API key failed, falling back to pool:', error.message);
        // Fall through to pool
      }
    }

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const keyState = this.pool.getNextAvailableKey();
      if (!keyState) {
        console.warn("All Gemini API keys are exhausted. Falling back to DUB5 AI.");
        params.onProvider?.('dub5', 'auto (fallback)');
        return this.callDub5AI(params);
      }

      const apiKey = keyState.key;
      
      try {
        const modelName = params.model || 'gemini-3-flash-preview';
        console.log(`Using Gemini API key from pool (attempt ${attempts + 1}): ${this.pool.maskKey(apiKey)}`);
        params.onProvider?.('gemini', modelName);
        const result = await this.callGeminiWithKey(apiKey, params);
        return result;
      } catch (error: any) {
        attempts++;
        const errorMessage = error.message || String(error);
        console.error(`Attempt ${attempts} failed with key ${this.pool.maskKey(apiKey)}:`, errorMessage);

        const isQuotaError = 
          errorMessage.includes("429") || 
          errorMessage.toLowerCase().includes("quota") || 
          errorMessage.toLowerCase().includes("rate limit") ||
          errorMessage.toLowerCase().includes("exhausted");
        
        const isInvalidKey = 
          errorMessage.toLowerCase().includes("api key") || 
          errorMessage.toLowerCase().includes("invalid") || 
          errorMessage.toLowerCase().includes("unauthorized") ||
          errorMessage.toLowerCase().includes("disabled");

        if (isQuotaError || isInvalidKey) {
          this.pool.markKeyFailed(apiKey, errorMessage, isInvalidKey);
          continue;
        } else {
          this.pool.markKeyFailed(apiKey, errorMessage, false);
          continue;
        }
      }
    }

    console.warn("Maximum Gemini retry attempts reached. Falling back to DUB5 AI.");
    params.onProvider?.('dub5', 'auto (fallback)');
    return this.callDub5AI(params);
  }

  private async callGeminiWithKey(apiKey: string, params: {
    input: string;
    history: any[];
    personality?: string;
    thinking_mode?: string;
    model?: string;
    image?: { data: string; mimeType: string };
    onChunk: (chunk: string) => void;
    files?: Record<string, string>;
  }) {
    const modelName = params.model || "gemini-3-flash-preview";
    const ai = new GoogleGenAI({ apiKey });
    const contents: any[] = [
      ...params.history.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }))
    ];

    const userParts: any[] = [{ text: params.input }];
    if (params.image) {
      userParts.push({
        inlineData: {
          data: params.image.data,
          mimeType: params.image.mimeType
        }
      });
    }
    contents.push({ role: "user", parts: userParts });

    const systemInstruction = `You are Aether, a world-class AI developer.
Your goal is to help the user build and refine their web application.

ENVIRONMENT AWARENESS:
- You are integrated into a web-based development platform.
- The user does NOT need to install anything locally.
- NEVER provide local setup instructions (e.g., "Ensure you have Node.js installed", "Run npm install", "npm run dev", "Open localhost:5173"). The platform handles all environment setup automatically.

COMMUNICATION STYLE:
- Be concise and beginner-friendly.
- Provide short, clear descriptions of what you have built or changed.
- Avoid overly technical jargon or deep architectural explanations unless explicitly asked.
- Focus on how the user can interact with the app (e.g., "I've built a 3D racing game. Use the arrow keys to move!").

${params.files ? `CURRENT PROJECT FILES:
${Object.entries(params.files).map(([path, content]) => `--- FILE: ${path} ---\n${content}\n`).join('\n')}
` : ''}

When you want to create or update a file, use the following format:

BEGIN FILE: path/to/file.ext
// content of the file
END FILE: path/to/file.ext

Always provide the FULL content of the file. Do not use placeholders like "// ... rest of code".
You can write multiple files in one response.
Outside of file blocks, you can provide explanations, guidance, and answer questions.
Keep your tone professional, helpful, and concise.
Personality: ${params.personality || "coder"}.
Thinking mode: ${params.thinking_mode || "balanced"}.`;

    const result = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        systemInstruction
      }
    });

    let fullText = "";
    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        params.onChunk(text);
      }
    }
    return fullText;
  }

  private async callDub5AI(params: {
    input: string;
    history: any[];
    personality?: string;
    thinking_mode?: string;
    onChunk: (chunk: string) => void;
  }) {
    try {
      const response = await fetch("https://dub5-ai.onrender.com/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: params.input,
          history: params.history,
          personality: params.personality || "coder",
          thinking_mode: params.thinking_mode || "balanced",
          session_id: `fallback-${Date.now()}`,
          model: "auto"
        })
      });

      if (!response.ok) throw new Error(`DUB5 AI Error: ${response.statusText}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("DUB5 AI response body is null");

      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

          const dataStr = trimmedLine.replace(/^data:\s*/, "");
          if (dataStr === "[DONE]") continue;

          try {
            const json = JSON.parse(dataStr);
            const content = json.content || json.choices?.[0]?.delta?.content || "";
            if (content) {
              fullText += content;
              params.onChunk(content);
            }
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
      return fullText;
    } catch (error: any) {
      console.error("DUB5 AI Fallback Error:", error);
      throw error;
    }
  }
}
