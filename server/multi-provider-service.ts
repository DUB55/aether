import { GoogleGenAI } from "@google/genai";

export type ProviderType = 
  | 'gemini' 
  | 'groq' 
  | 'openrouter' 
  | 'cerebras' 
  | 'mistral' 
  | 'cloudflare' 
  | 'github' 
  | 'nvidia' 
  | 'huggingface' 
  | 'cohere' 
  | 'sambanova' 
  | 'fireworks' 
  | 'deepseek' 
  | 'xai' 
  | 'ai21';

export interface ProviderConfig {
  type: ProviderType;
  name: string;
  envKey: string;
  defaultModel: string;
  baseUrl?: string;
}

export interface KeyState {
  key: string;
  status: 'available' | 'exhausted' | 'error';
  lastError?: string;
  usageRemaining: number;
  lastUsed?: number;
}

export class MultiProviderService {
  private providers: Map<ProviderType, KeyState[]> = new Map();
  private currentProvider: ProviderType = 'gemini';
  private providerConfigs: ProviderConfig[] = [
    { type: 'gemini', name: 'Gemini', envKey: 'GEMINI_API_KEYS', defaultModel: 'gemini-2.0-flash-exp' },
    { type: 'groq', name: 'Groq', envKey: 'GROQ_API_KEYS', defaultModel: 'llama-3.3-70b-versatile', baseUrl: 'https://api.groq.com/openai/v1' },
    { type: 'openrouter', name: 'OpenRouter', envKey: 'OPENROUTER_API_KEYS', defaultModel: 'anthropic/claude-3.5-sonnet', baseUrl: 'https://openrouter.ai/api/v1' },
    { type: 'cerebras', name: 'Cerebras', envKey: 'CEREBRAS_API_KEYS', defaultModel: 'llama-3.3-70b', baseUrl: 'https://api.cerebras.ai/v1' },
    { type: 'mistral', name: 'Mistral', envKey: 'MISTRAL_API_KEYS', defaultModel: 'mistral-large-latest', baseUrl: 'https://api.mistral.ai/v1' },
    { type: 'cloudflare', name: 'Cloudflare Workers AI', envKey: 'CLOUDFLARE_AI_API_KEYS', defaultModel: '@cf/meta/llama-3.3-70b-instruct', baseUrl: 'https://api.cloudflare.com/client/v4/accounts' },
    { type: 'github', name: 'GitHub Models', envKey: 'GITHUB_MODELS_API_KEYS', defaultModel: 'gpt-4o', baseUrl: 'https://models.inference.ai.azure.com' },
    { type: 'nvidia', name: 'NVIDIA NIM', envKey: 'NVIDIA_NIM_API_KEYS', defaultModel: 'meta/llama-3.3-70b-instruct', baseUrl: 'https://integrate.api.nvidia.com/v1' },
    { type: 'huggingface', name: 'Hugging Face', envKey: 'HUGGINGFACE_API_KEYS', defaultModel: 'meta-llama/Llama-3.3-70B-Instruct', baseUrl: 'https://api-inference.huggingface.co' },
    { type: 'cohere', name: 'Cohere', envKey: 'COHERE_API_KEYS', defaultModel: 'command-r-plus', baseUrl: 'https://api.cohere.ai/v1' },
    { type: 'sambanova', name: 'SambaNova', envKey: 'SAMBA_NOVA_API_KEYS', defaultModel: 'Meta-Llama-3.3-70B-Instruct', baseUrl: 'https://api.sambanova.ai/v1' },
    { type: 'fireworks', name: 'Fireworks AI', envKey: 'FIREWORKS_AI_API_KEYS', defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct', baseUrl: 'https://api.fireworks.ai/inference/v1' },
    { type: 'deepseek', name: 'DeepSeek', envKey: 'DEEPSEEK_API_KEYS', defaultModel: 'deepseek-chat', baseUrl: 'https://api.deepseek.com' },
    { type: 'xai', name: 'xAI', envKey: 'XAI_API_KEYS', defaultModel: 'grok-beta', baseUrl: 'https://api.x.ai/v1' },
    { type: 'ai21', name: 'AI21 Labs', envKey: 'AI21_LABS_API_KEYS', defaultModel: 'jamba-1-5-large', baseUrl: 'https://api.ai21.com/studio/v1' },
  ];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    console.log('[MultiProviderService] Initializing providers...');
    
    for (const config of this.providerConfigs) {
      const envValue = process.env[config.envKey] || "";
      // Handle both comma-separated lists and single keys
      const keys = envValue.includes(",") 
        ? envValue.split(",").map(k => k.trim()).filter(Boolean)
        : envValue.trim() ? [envValue.trim()] : [];
      
      if (keys.length > 0) {
        const keyStates: KeyState[] = keys.map(key => ({
          key,
          status: 'available',
          usageRemaining: 1000000, // Default high limit, will be updated based on actual usage
        }));
        
        this.providers.set(config.type, keyStates);
        console.log(`[MultiProviderService] ${config.name}: ${keys.length} keys configured`);
      } else {
        console.log(`[MultiProviderService] ${config.name}: No keys configured`);
      }
    }

    // Set initial provider to the first available one
    for (const config of this.providerConfigs) {
      const keys = this.providers.get(config.type);
      if (keys && keys.length > 0) {
        this.currentProvider = config.type;
        console.log(`[MultiProviderService] Initial provider: ${config.name}`);
        break;
      }
    }
  }

  private getNextAvailableKey(providerType: ProviderType): KeyState | null {
    const keys = this.providers.get(providerType);
    if (!keys || keys.length === 0) return null;

    // Find first available key with remaining usage
    const availableKey = keys.find(k => k.status === 'available' && k.usageRemaining > 0);
    
    if (availableKey) {
      return availableKey;
    }

    // All keys exhausted or errored
    console.warn(`[MultiProviderService] All keys for ${providerType} are exhausted or errored`);
    return null;
  }

  private markKeyExhausted(providerType: ProviderType, key: string, error?: string) {
    const keys = this.providers.get(providerType);
    if (!keys) return;

    const keyState = keys.find(k => k.key === key);
    if (keyState) {
      keyState.status = 'exhausted';
      keyState.lastError = error;
      keyState.usageRemaining = 0;
      console.log(`[MultiProviderService] Marked key as exhausted for ${providerType}: ${this.maskKey(key)}`);
    }
  }

  private maskKey(key: string): string {
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  }

  private getNextProvider(): ProviderType | null {
    const providerOrder = this.providerConfigs.map(c => c.type);
    const currentIndex = providerOrder.indexOf(this.currentProvider);
    
    // Try next providers in order
    for (let i = 1; i < providerOrder.length; i++) {
      const nextIndex = (currentIndex + i) % providerOrder.length;
      const nextProvider = providerOrder[nextIndex];
      const keys = this.providers.get(nextProvider);
      
      if (keys && keys.some(k => k.status === 'available' && k.usageRemaining > 0)) {
        console.log(`[MultiProviderService] Switching to provider: ${nextProvider}`);
        this.currentProvider = nextProvider;
        return nextProvider;
      }
    }

    console.warn('[MultiProviderService] No available providers found');
    return null;
  }

  public async chat(params: {
    input: string;
    history: any[];
    personality?: string;
    thinking_mode?: string;
    onChunk: (chunk: string) => void;
    onProvider?: (provider: string, model?: string) => void;
    forceProvider?: ProviderType;
    model?: string;
    customApiKey?: string;
    files?: Record<string, string>;
    image?: { data: string; mimeType: string };
  }) {
    const maxAttempts = this.providerConfigs.length * 3; // Try each provider 3 times
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      const providerType = params.forceProvider || this.currentProvider;
      const config = this.providerConfigs.find(c => c.type === providerType);
      
      if (!config) {
        console.error(`[MultiProviderService] Unknown provider: ${providerType}`);
        throw new Error(`Unknown provider: ${providerType}`);
      }

      const keyState = this.getNextAvailableKey(providerType);
      if (!keyState) {
        console.log(`[MultiProviderService] No available keys for ${config.name}, trying next provider`);
        const nextProvider = this.getNextProvider();
        if (!nextProvider) {
          throw new Error('All AI providers are exhausted or unavailable');
        }
        continue;
      }

      console.log(`[MultiProviderService] Attempt ${attempts}: Using ${config.name} with key ${this.maskKey(keyState.key)}`);
      params.onProvider?.(config.name, params.model || config.defaultModel);

      try {
        let result: string;
        
        if (providerType === 'gemini') {
          result = await this.callGemini(keyState.key, params, config.defaultModel);
        } else {
          result = await this.callOpenAICompatible(keyState.key, params, config);
        }

        // Update usage tracking
        keyState.usageRemaining -= 1;
        keyState.lastUsed = Date.now();

        return result;
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        console.error(`[MultiProviderService] ${config.name} failed:`, errorMessage);

        // Check if error indicates quota exhaustion
        const isQuotaError = 
          errorMessage.includes("429") || 
          errorMessage.toLowerCase().includes("quota") || 
          errorMessage.toLowerCase().includes("rate limit") ||
          errorMessage.toLowerCase().includes("exhausted") ||
          errorMessage.toLowerCase().includes("limit reached");

        if (isQuotaError || errorMessage.toLowerCase().includes("unauthorized")) {
          this.markKeyExhausted(providerType, keyState.key, errorMessage);
        }

        // First try to get another key from the same provider
        const nextKeyInSameProvider = this.getNextAvailableKey(providerType);
        if (nextKeyInSameProvider) {
          console.log(`[MultiProviderService] Trying next key in ${config.name}`);
          continue; // Retry with next key in same provider
        }

        // If no more keys in this provider, try next provider
        console.log(`[MultiProviderService] All keys exhausted for ${config.name}, trying next provider`);
        const nextProvider = this.getNextProvider();
        if (!nextProvider) {
          throw new Error(`All AI providers failed. Last error: ${errorMessage}`);
        }
      }
    }

    throw new Error('Maximum retry attempts reached');
  }

  private async callGemini(apiKey: string, params: any, defaultModel: string): Promise<string> {
    const modelName = params.model || defaultModel;
    const ai = new GoogleGenAI({ apiKey });
    const contents: any[] = [
      ...params.history.map((m: any) => ({
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

  private async callOpenAICompatible(apiKey: string, params: any, config: ProviderConfig): Promise<string> {
    const modelName = params.model || config.defaultModel;
    const baseUrl = config.baseUrl || '';

    // Build messages array
    const messages = [
      ...params.history.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      })),
      { role: "user", content: params.input }
    ];

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

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemInstruction },
          ...messages
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is null");

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
          const content = json.choices?.[0]?.delta?.content || "";
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
  }

  public getProviderStatus(): Record<ProviderType, { available: boolean; totalKeys: number; availableKeys: number }> {
    const status: Record<ProviderType, { available: boolean; totalKeys: number; availableKeys: number }> = {} as any;
    
    for (const config of this.providerConfigs) {
      const keys = this.providers.get(config.type);
      status[config.type] = {
        available: keys ? keys.some(k => k.status === 'available' && k.usageRemaining > 0) : false,
        totalKeys: keys ? keys.length : 0,
        availableKeys: keys ? keys.filter(k => k.status === 'available' && k.usageRemaining > 0).length : 0
      };
    }
    
    return status;
  }
}
