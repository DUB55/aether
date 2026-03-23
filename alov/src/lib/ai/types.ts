// AI Backend Types and Interfaces

export type AIBackendType = 'dub5' | 'chrome-extension';

export type ChromeExtensionService = 'copilot' | 'chatgpt' | 'gemini' | 'claude' | 'custom';

export interface AIBackendSettings {
  selectedBackend: AIBackendType;
  chromeExtension: {
    selectedService: ChromeExtensionService;
    customUrl?: string;
  };
}

export interface StoredSettings {
  version: string;
  aiBackend: {
    selected: AIBackendType;
    lastUpdated: string;
  };
  chromeExtension: {
    selectedService: ChromeExtensionService;
    customUrl?: string;
    serviceHistory: string[];
  };
  preferences: {
    showConnectionStatus: boolean;
    autoFallback: boolean;
  };
}

export interface AIServiceState {
  currentBackend: AIBackendType;
  chromeExtensionAvailable: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'checking';
  lastError?: string;
  serviceInfo?: {
    currentService: string;
    isLoggedIn: boolean;
    availableServices: string[];
  };
}

export interface AIRequest {
  messages: Array<{role: 'user' | 'assistant', content: string}>;
  onChunk?: (chunk: string) => void;
  signal?: AbortSignal;
}

export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

export interface ServiceInfo {
  currentService: string;
  isConnected: boolean;
  availableServices: string[];
}

// Chrome Extension Message Types
export interface DUB5QueryMessage {
  type: 'DUB5_QUERY';
  prompt: string;
  serviceId: string;
  customUrl?: string;
  requestId: string;
}

export interface DUB5ResponseMessage {
  type: 'DUB5_RESPONSE';
  requestId: string;
  success: boolean;
  result?: string;
  error?: string;
}

export interface ServiceInfoQuery {
  type: 'GET_SERVICE_INFO';
  requestId: string;
}

export interface ServiceInfoResponse {
  type: 'SERVICE_INFO_RESPONSE';
  requestId: string;
  currentService: string;
  isConnected: boolean;
  availableServices: string[];
}

export interface SetServiceMessage {
  type: 'SET_AI_SERVICE';
  serviceId: string;
  customUrl?: string;
  requestId: string;
}