import { AIBackend } from './backend';
import { 
  AIRequest, 
  ServiceInfo, 
  DUB5QueryMessage, 
  DUB5ResponseMessage,
  ServiceInfoQuery,
  ServiceInfoResponse,
  SetServiceMessage,
  ChromeExtensionService
} from './types';

interface PendingRequest {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

/**
 * Chrome Extension Backend - Communicates with DUB5 Chrome Extension
 */
export class ChromeExtensionBackend extends AIBackend {
  private static readonly TIMEOUT_MS = 15000;
  private pendingRequests = new Map<string, PendingRequest>();
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private isInitialized = false;
  private currentService: ChromeExtensionService = 'copilot';

  constructor() {
    super();
    // Only setup message listener in browser environment
    if (typeof window !== 'undefined') {
      this.setupMessageListener();
    }
  }

  /**
   * Stream an AI request through Chrome Extension
   */
  async streamRequest(request: AIRequest): Promise<string> {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Chrome Extension backend only works in browser environment');
    }

    if (!this.isInitialized) {
      this.setupMessageListener();
      if (!this.isInitialized) {
        throw new Error('Chrome Extension backend not initialized');
      }
    }

    const requestId = this.generateRequestId();
    const prompt = this.formatMessages(request.messages);

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('AI service timeout - check extension and login status'));
      }, ChromeExtensionBackend.TIMEOUT_MS);

      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout
      });

      // Send query to Chrome Extension
      const message: DUB5QueryMessage = {
        type: 'DUB5_QUERY',
        prompt,
        serviceId: this.getCurrentService(),
        requestId
      };

      try {
        window.postMessage(message, '*');
      } catch (error) {
        this.pendingRequests.delete(requestId);
        clearTimeout(timeout);
        reject(new Error('Failed to send message to Chrome Extension'));
      }
    });
  }

  /**
   * Check if Chrome Extension is available
   */
  async isAvailable(): Promise<boolean> {
    // Not available in server environment
    if (typeof window === 'undefined') {
      return false;
    }

    // Ensure message listener is set up
    if (!this.isInitialized) {
      this.setupMessageListener();
    }
    return new Promise((resolve) => {
      const requestId = this.generateRequestId();
      
      // Set up timeout for detection
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        resolve(false);
      }, 2000); // Shorter timeout for availability check

      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve: () => {
          clearTimeout(timeout);
          resolve(true);
        },
        reject: () => {
          clearTimeout(timeout);
          resolve(false);
        },
        timeout
      });

      // Send service info query to test connection
      const message: ServiceInfoQuery = {
        type: 'GET_SERVICE_INFO',
        requestId
      };

      try {
        window.postMessage(message, '*');
      } catch {
        clearTimeout(timeout);
        this.pendingRequests.delete(requestId);
        resolve(false);
      }
    });
  }

  /**
   * Get service information from Chrome Extension
   */
  async getServiceInfo(): Promise<ServiceInfo> {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Chrome Extension backend only works in browser environment');
    }

    if (!this.isInitialized) {
      this.setupMessageListener();
    }
    const requestId = this.generateRequestId();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Service info request timeout'));
      }, 5000);

      this.pendingRequests.set(requestId, {
        resolve: (data: string) => {
          clearTimeout(timeout);
          try {
            const serviceInfo = JSON.parse(data) as ServiceInfo;
            resolve(serviceInfo);
          } catch {
            reject(new Error('Invalid service info response'));
          }
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout
      });

      const message: ServiceInfoQuery = {
        type: 'GET_SERVICE_INFO',
        requestId
      };

      window.postMessage(message, '*');
    });
  }

  /**
   * Set AI service in Chrome Extension
   */
  async setAIService(serviceId: ChromeExtensionService, customUrl?: string): Promise<void> {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Chrome Extension backend only works in browser environment');
    }

    if (!this.isInitialized) {
      this.setupMessageListener();
    }
    const requestId = this.generateRequestId();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Service switching timeout'));
      }, 5000);

      this.pendingRequests.set(requestId, {
        resolve: () => {
          clearTimeout(timeout);
          this.updateCurrentService(serviceId);
          resolve();
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout
      });

      const message: SetServiceMessage = {
        type: 'SET_AI_SERVICE',
        serviceId,
        customUrl,
        requestId
      };

      window.postMessage(message, '*');
    });
  }

  /**
   * Setup message listener for Chrome Extension responses
   */
  private setupMessageListener(): void {
    // Only setup in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    if (this.messageListener) {
      return; // Already set up
    }

    this.messageListener = (event: MessageEvent) => {
      if (event.source !== window) {
        return; // Only accept messages from same window
      }

      const data = event.data;
      
      if (data.type === 'DUB5_RESPONSE') {
        this.handleDUB5Response(data as DUB5ResponseMessage);
      } else if (data.type === 'SERVICE_INFO_RESPONSE') {
        this.handleServiceInfoResponse(data as ServiceInfoResponse);
      }
    };

    window.addEventListener('message', this.messageListener);
    this.isInitialized = true;
  }

  /**
   * Handle DUB5_RESPONSE messages
   */
  private handleDUB5Response(response: DUB5ResponseMessage): void {
    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) {
      return; // No pending request for this ID
    }

    this.pendingRequests.delete(response.requestId);
    clearTimeout(pending.timeout);

    if (response.success && response.result) {
      pending.resolve(response.result);
    } else {
      pending.reject(new Error(response.error || 'Unknown error from Chrome Extension'));
    }
  }

  /**
   * Handle SERVICE_INFO_RESPONSE messages
   */
  private handleServiceInfoResponse(response: ServiceInfoResponse): void {
    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) {
      return;
    }

    this.pendingRequests.delete(response.requestId);
    clearTimeout(pending.timeout);

    const serviceInfo: ServiceInfo = {
      currentService: response.currentService,
      isConnected: response.isConnected,
      availableServices: response.availableServices
    };

    pending.resolve(JSON.stringify(serviceInfo));
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format messages array into a single prompt string
   */
  private formatMessages(messages: Array<{role: 'user' | 'assistant', content: string}>): string {
    return messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (typeof window !== 'undefined' && this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }

    // Clear all pending requests
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Backend cleanup'));
    }
    this.pendingRequests.clear();
    this.isInitialized = false;
  }

  /**
   * Get current service
   */
  private getCurrentService(): string {
    return this.currentService;
  }

  /**
   * Update current service when switching
   */
  private updateCurrentService(service: ChromeExtensionService): void {
    this.currentService = service;
  }
}