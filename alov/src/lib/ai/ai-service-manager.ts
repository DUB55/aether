import { AIServiceBridge } from './backend';
import { DUB5Backend } from './dub5-backend';
import { ChromeExtensionBackend } from './chrome-extension-backend';
import { SettingsManager } from './settings-manager';
import { AIBackendSettings, AIRequest } from './types';

/**
 * AI Service Manager - Singleton for managing AI services across the application
 */
export class AIServiceManager {
  private static instance: AIServiceManager | null = null;
  private bridge: AIServiceBridge;
  private isInitialized = false;

  private constructor() {
    const dub5Backend = new DUB5Backend();
    const chromeExtensionBackend = new ChromeExtensionBackend();
    this.bridge = new AIServiceBridge(dub5Backend, chromeExtensionBackend);
  }

  static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  /**
   * Initialize the AI service manager with user settings
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const settings = SettingsManager.getSettings();
      await this.bridge.initialize(settings.selectedBackend);
      
      // If using Chrome Extension, set the service
      if (settings.selectedBackend === 'chrome-extension') {
        const chromeBackend = this.bridge['chromeExtensionBackend'] as ChromeExtensionBackend;
        await chromeBackend.setAIService(
          settings.chromeExtension.selectedService,
          settings.chromeExtension.customUrl
        );
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AI Service Manager:', error);
      throw error;
    }
  }

  /**
   * Update settings and switch backend if necessary
   */
  async updateSettings(settings: AIBackendSettings): Promise<void> {
    try {
      // Save settings
      SettingsManager.saveSettings(settings);

      // Switch backend if changed
      const currentBackend = this.bridge.getCurrentBackendType();
      if (currentBackend !== settings.selectedBackend) {
        await this.bridge.switchBackend(settings.selectedBackend);
      }

      // Update Chrome Extension service if using Chrome Extension
      if (settings.selectedBackend === 'chrome-extension') {
        const chromeBackend = this.bridge['chromeExtensionBackend'] as ChromeExtensionBackend;
        await chromeBackend.setAIService(
          settings.chromeExtension.selectedService,
          settings.chromeExtension.customUrl
        );
      }
    } catch (error) {
      console.error('Failed to update AI settings:', error);
      throw error;
    }
  }

  /**
   * Stream an AI request through the current backend
   */
  async streamRequest(request: AIRequest): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.bridge.streamRequest(request);
  }

  /**
   * Check if current backend is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch {
        return false;
      }
    }

    return this.bridge.isAvailable();
  }

  /**
   * Get current backend type
   */
  getCurrentBackendType() {
    return this.bridge.getCurrentBackendType();
  }

  /**
   * Get service information
   */
  async getServiceInfo() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.bridge.getServiceInfo();
  }

  /**
   * Detect Chrome Extension availability
   */
  async detectChromeExtension(): Promise<boolean> {
    return this.bridge.detectChromeExtension();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.bridge.cleanup();
    this.isInitialized = false;
  }
}

// Export singleton instance getter (lazy-loaded)
export const getAIServiceManager = (): AIServiceManager => {
  return AIServiceManager.getInstance();
};