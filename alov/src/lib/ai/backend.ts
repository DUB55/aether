import { AIRequest, AIResponse, ServiceInfo } from './types';

/**
 * Abstract base class for AI backends
 */
export abstract class AIBackend {
  abstract streamRequest(request: AIRequest): Promise<string>;
  abstract isAvailable(): Promise<boolean>;
  abstract getServiceInfo(): Promise<ServiceInfo>;
  abstract cleanup?(): void;
}

/**
 * AI Service Bridge - Unified interface for all AI backends
 */
export class AIServiceBridge {
  private currentBackend: AIBackend | null = null;
  private backendType: 'dub5' | 'chrome-extension' | null = null;

  constructor(
    private dub5Backend: AIBackend,
    private chromeExtensionBackend: AIBackend
  ) {}

  /**
   * Switch to a different AI backend
   */
  async switchBackend(type: 'dub5' | 'chrome-extension'): Promise<void> {
    try {
      // Cleanup current backend if it has cleanup method
      if (this.currentBackend?.cleanup) {
        this.currentBackend.cleanup();
      }

      // Switch to new backend
      const newBackend = type === 'dub5' ? this.dub5Backend : this.chromeExtensionBackend;
      
      // Check if new backend is available
      const isAvailable = await newBackend.isAvailable();
      if (!isAvailable && type === 'chrome-extension') {
        throw new Error('Chrome Extension backend is not available');
      }

      this.currentBackend = newBackend;
      this.backendType = type;
    } catch (error) {
      console.error('Failed to switch backend:', error);
      throw error;
    }
  }

  /**
   * Stream an AI request through the current backend
   */
  async streamRequest(request: AIRequest): Promise<string> {
    if (!this.currentBackend) {
      throw new Error('No AI backend selected');
    }

    try {
      return await this.currentBackend.streamRequest(request);
    } catch (error) {
      console.error('AI request failed:', error);
      throw error;
    }
  }

  /**
   * Check if current backend is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.currentBackend) {
      return false;
    }

    try {
      return await this.currentBackend.isAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Get service information from current backend
   */
  async getServiceInfo(): Promise<ServiceInfo> {
    if (!this.currentBackend) {
      throw new Error('No AI backend selected');
    }

    try {
      return await this.currentBackend.getServiceInfo();
    } catch (error) {
      console.error('Failed to get service info:', error);
      throw error;
    }
  }

  /**
   * Get current backend type
   */
  getCurrentBackendType(): 'dub5' | 'chrome-extension' | null {
    return this.backendType;
  }

  /**
   * Check if Chrome Extension backend is available
   */
  async detectChromeExtension(): Promise<boolean> {
    try {
      return await this.chromeExtensionBackend.isAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Initialize the bridge with default backend
   */
  async initialize(preferredBackend: 'dub5' | 'chrome-extension' = 'chrome-extension'): Promise<void> {
    try {
      // Try preferred backend first
      await this.switchBackend(preferredBackend);
    } catch (error) {
      console.warn(`Failed to initialize ${preferredBackend} backend:`, error);
      
      // Fallback to alternative backend
      const fallbackBackend = preferredBackend === 'dub5' ? 'chrome-extension' : 'dub5';
      try {
        await this.switchBackend(fallbackBackend);
        console.info(`Fell back to ${fallbackBackend} backend`);
      } catch (fallbackError) {
        console.error('Failed to initialize any backend:', fallbackError);
        throw new Error('No AI backend available');
      }
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.currentBackend?.cleanup) {
      this.currentBackend.cleanup();
    }
    this.currentBackend = null;
    this.backendType = null;
  }
}