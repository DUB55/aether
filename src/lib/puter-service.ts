import { puter } from '@heyputer/puter.js';

export interface PuterModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export interface PuterAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class PuterService {
  private static instance: PuterService;
  private isInitialized = false;

  static getInstance(): PuterService {
    if (!PuterService.instance) {
      PuterService.instance = new PuterService();
    }
    return PuterService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Puter.js is automatically loaded when imported
      if (typeof window !== 'undefined' && window.puter) {
        this.isInitialized = true;
        console.log('Puter.js initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Puter.js:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return this.isInitialized && typeof window !== 'undefined' && window.puter && window.puter.ai !== undefined;
    } catch {
      return false;
    }
  }

  getAvailableModels(): PuterModel[] {
    return [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: 'Fast and efficient model for general tasks'
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        description: 'Fast and compact model'
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'Google',
        description: 'Fast multimodal model'
      },
      {
        id: 'llama-3-8b',
        name: 'Llama 3 8B',
        provider: 'Meta',
        description: 'Open source model'
      },
      {
        id: 'mixtral-8x7b',
        name: 'Mixtral 8x7B',
        provider: 'Mistral',
        description: 'High quality open source model'
      }
    ];
  }

  async generateText(
    prompt: string,
    options?: {
      model?: string;
      testMode?: boolean;
    }
  ): Promise<any> {
    if (!(await this.isAvailable())) {
      throw new Error('Puter.js is not available');
    }

    try {
      const response = await window.puter.ai.chat(prompt, options);
      return response;
    } catch (error) {
      console.error('Puter AI generation failed:', error);
      throw new Error(`Puter AI request failed: ${error}`);
    }
  }

  async generateImage(
    prompt: string,
    testMode: boolean = true
  ): Promise<HTMLImageElement> {
    if (!(await this.isAvailable())) {
      throw new Error('Puter.js is not available');
    }

    try {
      const response = await window.puter.ai.txt2img(prompt, testMode);
      return response;
    } catch (error) {
      console.error('Puter image generation failed:', error);
      throw new Error(`Puter image generation failed: ${error}`);
    }
  }

  // Cloud storage methods
  async writeFile(path: string, content: string): Promise<any> {
    if (!(await this.isAvailable())) {
      throw new Error('Puter.js is not available');
    }

    try {
      const response = await window.puter.fs.write(path, content);
      return response;
    } catch (error) {
      console.error('Puter file write failed:', error);
      throw new Error(`Puter file write failed: ${error}`);
    }
  }

  async readFile(path: string): Promise<Blob> {
    if (!(await this.isAvailable())) {
      throw new Error('Puter.js is not available');
    }

    try {
      const response = await window.puter.fs.read(path);
      return response;
    } catch (error) {
      console.error('Puter file read failed:', error);
      throw new Error(`Puter file read failed: ${error}`);
    }
  }

  async uploadFile(file: File, path?: string): Promise<any> {
    if (!(await this.isAvailable())) {
      throw new Error('Puter.js is not available');
    }

    try {
      const response = await window.puter.fs.upload(file, path);
      return response;
    } catch (error) {
      console.error('Puter file upload failed:', error);
      throw new Error(`Puter file upload failed: ${error}`);
    }
  }

  // Key-value store methods
  async setKey(key: string, value: any): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error('Puter.js is not available');
    }

    try {
      await window.puter.kv.set(key, value);
    } catch (error) {
      console.error('Puter KV set failed:', error);
      throw new Error(`Puter KV set failed: ${error}`);
    }
  }

  async getKey(key: string): Promise<any> {
    if (!(await this.isAvailable())) {
      throw new Error('Puter.js is not available');
    }

    try {
      return await window.puter.kv.get(key);
    } catch (error) {
      console.error('Puter KV get failed:', error);
      throw new Error(`Puter KV get failed: ${error}`);
    }
  }

  // Authentication methods
  async signIn(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error('Puter.js is not available');
    }

    try {
      await window.puter.auth.signIn();
    } catch (error) {
      console.error('Puter sign in failed:', error);
      throw new Error(`Puter sign in failed: ${error}`);
    }
  }

  async signOut(): Promise<void> {
    try {
      if (window.puter && window.puter.auth) {
        await window.puter.auth.signOut();
      }
    } catch (error) {
      console.error('Puter sign out failed:', error);
      throw new Error(`Puter sign out failed: ${error}`);
    }
  }

  async getCurrentUser(): Promise<any> {
    if (!(await this.isAvailable())) {
      return null;
    }

    try {
      return await window.puter.auth.getUser();
    } catch (error) {
      console.error('Puter get user failed:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }
}

// Extend Window interface to include puter
declare global {
  interface Window {
    puter: any;
  }
}
