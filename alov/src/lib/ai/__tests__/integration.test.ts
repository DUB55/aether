/**
 * Integration tests for dual AI functionality
 */

import { SettingsManager } from '../settings-manager';
import { AIServiceBridge } from '../backend';
import { DUB5Backend } from '../dub5-backend';
import { ChromeExtensionBackend } from '../chrome-extension-backend';
import { AIBackendSettings } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.postMessage
Object.defineProperty(window, 'postMessage', {
  value: jest.fn()
});

describe('Dual AI Functionality Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Settings Manager', () => {
    it('should return default settings with Chrome Extension as default', () => {
      const settings = SettingsManager.getSettings();
      
      expect(settings.selectedBackend).toBe('chrome-extension');
      expect(settings.chromeExtension.selectedService).toBe('copilot');
    });

    it('should validate settings correctly', () => {
      const validSettings: AIBackendSettings = {
        selectedBackend: 'chrome-extension',
        chromeExtension: {
          selectedService: 'chatgpt',
          customUrl: undefined
        }
      };

      expect(SettingsManager.validateSettings(validSettings)).toBe(true);
    });

    it('should reject invalid settings', () => {
      const invalidSettings = {
        selectedBackend: 'invalid-backend',
        chromeExtension: {
          selectedService: 'copilot'
        }
      } as any;

      expect(SettingsManager.validateSettings(invalidSettings)).toBe(false);
    });

    it('should require custom URL for custom service', () => {
      const settingsWithoutUrl: AIBackendSettings = {
        selectedBackend: 'chrome-extension',
        chromeExtension: {
          selectedService: 'custom',
          customUrl: undefined
        }
      };

      expect(SettingsManager.validateSettings(settingsWithoutUrl)).toBe(false);

      const settingsWithUrl: AIBackendSettings = {
        selectedBackend: 'chrome-extension',
        chromeExtension: {
          selectedService: 'custom',
          customUrl: 'https://example.com'
        }
      };

      expect(SettingsManager.validateSettings(settingsWithUrl)).toBe(true);
    });
  });

  describe('AI Service Bridge', () => {
    let bridge: AIServiceBridge;
    let dub5Backend: DUB5Backend;
    let chromeExtensionBackend: ChromeExtensionBackend;

    beforeEach(() => {
      dub5Backend = new DUB5Backend();
      chromeExtensionBackend = new ChromeExtensionBackend();
      bridge = new AIServiceBridge(dub5Backend, chromeExtensionBackend);
    });

    it('should initialize with default backend', async () => {
      // Mock backend availability
      jest.spyOn(chromeExtensionBackend, 'isAvailable').mockResolvedValue(true);
      
      await bridge.initialize('chrome-extension');
      
      expect(bridge.getCurrentBackendType()).toBe('chrome-extension');
    });

    it('should fallback to DUB5 when Chrome Extension unavailable', async () => {
      // Mock Chrome Extension as unavailable
      jest.spyOn(chromeExtensionBackend, 'isAvailable').mockResolvedValue(false);
      jest.spyOn(dub5Backend, 'isAvailable').mockResolvedValue(true);
      
      await bridge.initialize('chrome-extension');
      
      expect(bridge.getCurrentBackendType()).toBe('dub5');
    });

    it('should switch backends correctly', async () => {
      // Mock both backends as available
      jest.spyOn(chromeExtensionBackend, 'isAvailable').mockResolvedValue(true);
      jest.spyOn(dub5Backend, 'isAvailable').mockResolvedValue(true);
      
      await bridge.switchBackend('dub5');
      expect(bridge.getCurrentBackendType()).toBe('dub5');
      
      await bridge.switchBackend('chrome-extension');
      expect(bridge.getCurrentBackendType()).toBe('chrome-extension');
    });
  });

  describe('Chrome Extension Backend', () => {
    let backend: ChromeExtensionBackend;

    beforeEach(() => {
      backend = new ChromeExtensionBackend();
    });

    afterEach(() => {
      backend.cleanup();
    });

    it('should generate unique request IDs', () => {
      const id1 = (backend as any).generateRequestId();
      const id2 = (backend as any).generateRequestId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should format messages correctly', () => {
      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
        { role: 'user' as const, content: 'How are you?' }
      ];

      const formatted = (backend as any).formatMessages(messages);
      
      expect(formatted).toBe('User: Hello\n\nAssistant: Hi there!\n\nUser: How are you?');
    });
  });

  describe('DUB5 Backend', () => {
    let backend: DUB5Backend;

    beforeEach(() => {
      backend = new DUB5Backend();
    });

    it('should provide service info', async () => {
      const serviceInfo = await backend.getServiceInfo();
      
      expect(serviceInfo.currentService).toBe('DUB5 AI Backend');
      expect(serviceInfo.availableServices).toContain('DUB5 AI Backend');
    });
  });
});

// Export for Jest
export {};