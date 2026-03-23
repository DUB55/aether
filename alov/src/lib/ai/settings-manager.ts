import { AIBackendSettings, StoredSettings, AIBackendType, ChromeExtensionService } from './types';

export class SettingsManager {
  private static readonly STORAGE_KEY = 'aether-ai-settings';
  private static readonly CURRENT_VERSION = '1.0.0';

  private static getDefaultSettings(): AIBackendSettings {
    return {
      selectedBackend: 'chrome-extension', // Default to Chrome Extension as requested
      chromeExtension: {
        selectedService: 'copilot',
        customUrl: undefined,
      },
    };
  }

  private static getDefaultStoredSettings(): StoredSettings {
    const defaults = this.getDefaultSettings();
    return {
      version: this.CURRENT_VERSION,
      aiBackend: {
        selected: defaults.selectedBackend,
        lastUpdated: new Date().toISOString(),
      },
      chromeExtension: {
        selectedService: defaults.chromeExtension.selectedService,
        customUrl: defaults.chromeExtension.customUrl,
        serviceHistory: ['copilot'],
      },
      preferences: {
        showConnectionStatus: true,
        autoFallback: true,
      },
    };
  }

  static getSettings(): AIBackendSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultSettings();
      }

      const parsed: StoredSettings = JSON.parse(stored);
      
      // Validate and migrate if necessary
      if (!this.validateStoredSettings(parsed)) {
        console.warn('Invalid settings found, resetting to defaults');
        this.resetToDefaults();
        return this.getDefaultSettings();
      }

      return {
        selectedBackend: parsed.aiBackend.selected,
        chromeExtension: {
          selectedService: parsed.chromeExtension.selectedService,
          customUrl: parsed.chromeExtension.customUrl,
        },
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      this.resetToDefaults();
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings: AIBackendSettings): void {
    try {
      if (!this.validateSettings(settings)) {
        throw new Error('Invalid settings provided');
      }

      const currentStored = this.getStoredSettings();
      const updatedStored: StoredSettings = {
        ...currentStored,
        aiBackend: {
          selected: settings.selectedBackend,
          lastUpdated: new Date().toISOString(),
        },
        chromeExtension: {
          selectedService: settings.chromeExtension.selectedService,
          customUrl: settings.chromeExtension.customUrl,
          serviceHistory: this.updateServiceHistory(
            currentStored.chromeExtension.serviceHistory,
            settings.chromeExtension.selectedService
          ),
        },
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedStored));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  static resetToDefaults(): void {
    try {
      const defaultStored = this.getDefaultStoredSettings();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultStored));
    } catch (error) {
      console.error('Error resetting settings:', error);
      // If localStorage fails, we'll just use in-memory defaults
    }
  }

  static validateSettings(settings: AIBackendSettings): boolean {
    if (!settings || typeof settings !== 'object') {
      return false;
    }

    if (!['dub5', 'chrome-extension'].includes(settings.selectedBackend)) {
      return false;
    }

    if (!settings.chromeExtension || typeof settings.chromeExtension !== 'object') {
      return false;
    }

    const validServices: ChromeExtensionService[] = ['copilot', 'chatgpt', 'gemini', 'claude', 'custom'];
    if (!validServices.includes(settings.chromeExtension.selectedService)) {
      return false;
    }

    // Validate custom URL if service is 'custom'
    if (settings.chromeExtension.selectedService === 'custom') {
      if (!settings.chromeExtension.customUrl || 
          !this.isValidUrl(settings.chromeExtension.customUrl)) {
        return false;
      }
    }

    return true;
  }

  private static validateStoredSettings(stored: StoredSettings): boolean {
    if (!stored || typeof stored !== 'object') {
      return false;
    }

    if (!stored.version || !stored.aiBackend || !stored.chromeExtension) {
      return false;
    }

    // Convert to AIBackendSettings format for validation
    const settings: AIBackendSettings = {
      selectedBackend: stored.aiBackend.selected,
      chromeExtension: {
        selectedService: stored.chromeExtension.selectedService,
        customUrl: stored.chromeExtension.customUrl,
      },
    };

    return this.validateSettings(settings);
  }

  private static getStoredSettings(): StoredSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultStoredSettings();
      }
      return JSON.parse(stored);
    } catch {
      return this.getDefaultStoredSettings();
    }
  }

  private static updateServiceHistory(history: string[], newService: ChromeExtensionService): string[] {
    const updated = [newService, ...history.filter(s => s !== newService)];
    return updated.slice(0, 5); // Keep only last 5 services
  }

  private static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Get service history for UI
  static getServiceHistory(): string[] {
    const stored = this.getStoredSettings();
    return stored.chromeExtension.serviceHistory;
  }

  // Get preferences
  static getPreferences() {
    const stored = this.getStoredSettings();
    return stored.preferences;
  }

  // Update preferences
  static updatePreferences(preferences: Partial<StoredSettings['preferences']>): void {
    try {
      const stored = this.getStoredSettings();
      stored.preferences = { ...stored.preferences, ...preferences };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }
}