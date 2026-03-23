export interface ErrorResponse {
  message: string;
  actions: ErrorAction[];
  recoverable: boolean;
  code: string;
}

export interface ErrorAction {
  type: 'install-extension' | 'switch-backend' | 'retry-connection' | 'check-service-status' | 'switch-service';
  label: string;
  url?: string;
  target?: string;
}

export class ChromeExtensionErrorHandler {
  /**
   * Handle Chrome Extension connection errors
   */
  static handleConnectionError(error: Error): ErrorResponse {
    return {
      code: 'EXTENSION_NOT_FOUND',
      message: 'Chrome Extension not detected. Please install the DUB5 Chrome Extension to use this feature.',
      actions: [
        {
          type: 'install-extension',
          label: 'Install Extension',
          url: 'chrome://extensions'
        },
        {
          type: 'switch-backend',
          label: 'Use DUB5 Backend Instead',
          target: 'dub5'
        },
        {
          type: 'retry-connection',
          label: 'Retry Connection'
        }
      ],
      recoverable: true
    };
  }

  /**
   * Handle Chrome Extension timeout errors
   */
  static handleTimeoutError(error: Error): ErrorResponse {
    return {
      code: 'EXTENSION_TIMEOUT',
      message: 'Request timed out. Please check your AI service login status and try again.',
      actions: [
        {
          type: 'check-service-status',
          label: 'Check Service Status'
        },
        {
          type: 'switch-service',
          label: 'Try Different Service'
        },
        {
          type: 'switch-backend',
          label: 'Use DUB5 Backend',
          target: 'dub5'
        },
        {
          type: 'retry-connection',
          label: 'Retry Request'
        }
      ],
      recoverable: true
    };
  }

  /**
   * Handle Chrome Extension authentication errors
   */
  static handleAuthError(error: Error): ErrorResponse {
    return {
      code: 'SERVICE_AUTH_ERROR',
      message: 'Authentication failed. Please log into your AI service and try again.',
      actions: [
        {
          type: 'check-service-status',
          label: 'Check Login Status'
        },
        {
          type: 'switch-service',
          label: 'Try Different Service'
        },
        {
          type: 'retry-connection',
          label: 'Retry After Login'
        }
      ],
      recoverable: true
    };
  }

  /**
   * Handle configuration errors
   */
  static handleConfigError(error: Error): ErrorResponse {
    return {
      code: 'INVALID_CONFIG',
      message: 'Invalid configuration detected. Settings have been reset to defaults.',
      actions: [
        {
          type: 'retry-connection',
          label: 'Continue with Defaults'
        },
        {
          type: 'switch-backend',
          label: 'Use DUB5 Backend',
          target: 'dub5'
        }
      ],
      recoverable: true
    };
  }

  /**
   * Handle service switching errors
   */
  static handleServiceSwitchError(error: Error): ErrorResponse {
    return {
      code: 'SERVICE_SWITCH_FAILED',
      message: 'Failed to switch AI service. The previous service has been restored.',
      actions: [
        {
          type: 'retry-connection',
          label: 'Retry Service Switch'
        },
        {
          type: 'check-service-status',
          label: 'Check Service Status'
        }
      ],
      recoverable: true
    };
  }

  /**
   * Handle general Chrome Extension errors
   */
  static handleGeneralError(error: Error): ErrorResponse {
    const message = error.message || 'An unknown error occurred with the Chrome Extension';
    
    // Determine error type based on message content
    if (message.includes('timeout') || message.includes('Timeout')) {
      return this.handleTimeoutError(error);
    }
    
    if (message.includes('not found') || message.includes('not detected')) {
      return this.handleConnectionError(error);
    }
    
    if (message.includes('auth') || message.includes('login')) {
      return this.handleAuthError(error);
    }
    
    if (message.includes('config') || message.includes('Invalid')) {
      return this.handleConfigError(error);
    }

    // Default error response
    return {
      code: 'UNKNOWN_ERROR',
      message: `Chrome Extension error: ${message}`,
      actions: [
        {
          type: 'retry-connection',
          label: 'Retry'
        },
        {
          type: 'switch-backend',
          label: 'Use DUB5 Backend',
          target: 'dub5'
        }
      ],
      recoverable: true
    };
  }
}

/**
 * Chrome Extension Detection Utility
 */
export class ChromeExtensionDetector {
  private static detectionPromise: Promise<boolean> | null = null;

  /**
   * Detect if Chrome Extension is available
   */
  static async detect(): Promise<boolean> {
    // Cache detection result for a short time to avoid repeated checks
    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    this.detectionPromise = this.performDetection();
    
    // Clear cache after 5 seconds
    setTimeout(() => {
      this.detectionPromise = null;
    }, 5000);

    return this.detectionPromise;
  }

  private static async performDetection(): Promise<boolean> {
    return new Promise((resolve) => {
      const requestId = `detect_${Date.now()}`;
      let resolved = false;

      // Set up timeout
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 2000);

      // Listen for response
      const listener = (event: MessageEvent) => {
        if (event.source !== window || resolved) {
          return;
        }

        const data = event.data;
        if (data.type === 'SERVICE_INFO_RESPONSE' && data.requestId === requestId) {
          resolved = true;
          clearTimeout(timeout);
          window.removeEventListener('message', listener);
          resolve(true);
        }
      };

      window.addEventListener('message', listener);

      // Send detection message
      try {
        window.postMessage({
          type: 'GET_SERVICE_INFO',
          requestId
        }, '*');
      } catch {
        resolved = true;
        clearTimeout(timeout);
        window.removeEventListener('message', listener);
        resolve(false);
      }
    });
  }

  /**
   * Get detailed extension status
   */
  static async getStatus(): Promise<{
    available: boolean;
    connected: boolean;
    currentService?: string;
    error?: string;
  }> {
    try {
      const available = await this.detect();
      if (!available) {
        return {
          available: false,
          connected: false,
          error: 'Extension not detected'
        };
      }

      // Try to get service info
      const requestId = `status_${Date.now()}`;
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            available: true,
            connected: false,
            error: 'Extension not responding'
          });
        }, 3000);

        const listener = (event: MessageEvent) => {
          if (event.source !== window) return;

          const data = event.data;
          if (data.type === 'SERVICE_INFO_RESPONSE' && data.requestId === requestId) {
            clearTimeout(timeout);
            window.removeEventListener('message', listener);
            resolve({
              available: true,
              connected: data.isConnected,
              currentService: data.currentService
            });
          }
        };

        window.addEventListener('message', listener);
        window.postMessage({
          type: 'GET_SERVICE_INFO',
          requestId
        }, '*');
      });
    } catch (error) {
      return {
        available: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}