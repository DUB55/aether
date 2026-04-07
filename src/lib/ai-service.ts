import { type Message } from "@/types";

export interface StreamOptions {
  input: string;
  history: Message[];
  personality?: string;
  thinkingMode?: string;
  sessionId: string;
  provider?: "dub5" | "gemini" | "openai" | "anthropic";
  model?: string;
  image?: { data: string; mimeType: string };
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  files?: Record<string, string>;
  onChunk: (chunk: string) => void;
  onProvider?: (provider: string, model?: string) => void;
  onFileBlock?: (path: string, content: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: any) => void;
  signal?: AbortSignal;
}

export const streamRequest = async (options: StreamOptions, retryCount = 0) => {
  const {
    input,
    history,
    personality = "coder",
    thinkingMode = "balanced",
    sessionId,
    provider = "gemini",
    model,
    image,
    geminiApiKey,
    openaiApiKey,
    anthropicApiKey,
    files,
    onChunk,
    onProvider,
    onComplete,
    onError,
    signal,
  } = options;

  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      body: JSON.stringify({
        input,
        personality,
        thinking_mode: thinkingMode,
        session_id: sessionId,
        provider,
        model,
        image,
        gemini_api_key: geminiApiKey,
        openai_api_key: openaiApiKey,
        anthropic_api_key: anthropicApiKey,
        files,
        history: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal,
    });

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (e) {
        errorBody = "Could not read error body";
      }
      
      console.error("AI Request Failed:", {
        url: "/api/ai/chat",
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });

      throw new Error(`AI Service Error (${response.status}): ${errorBody || response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is null");

    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Ignore heartbeats (lines starting with :)
        if (trimmedLine.startsWith(":")) continue;
        
        if (!trimmedLine.startsWith("data:")) continue;

        const dataStr = trimmedLine.replace(/^data:\s*/, "");
        if (dataStr === "[DONE]") continue;

        try {
          const json = JSON.parse(dataStr);
          
          if (json.error) {
            throw new Error(json.error);
          }

          if (json.provider) {
            onProvider?.(json.provider, json.model);
            continue;
          }

          // Support multiple chunk formats
          const content = 
            json.content || 
            json.choices?.[0]?.delta?.content || 
            json.text || 
            json.delta || 
            json.message || 
            "";

          if (content) {
            accumulatedText += content;
            onChunk(content);
          }
        } catch (e) {
          console.warn("Failed to parse SSE JSON chunk:", dataStr, e);
        }
      }
    }

    onComplete?.(accumulatedText);
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Stream aborted");
      return;
    }
    
    // Retry once on network errors (Load failed)
    if (retryCount < 1 && (error.message.includes("Load failed") || error.message.includes("Failed to fetch"))) {
      console.warn("Retrying AI request due to network error...", error);
      return streamRequest(options, retryCount + 1);
    }

    console.error("AI Stream Error:", error);
    onError?.(error);
  }
};
