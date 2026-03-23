import { AIBackend } from './backend';
import { AIRequest, ServiceInfo } from './types';
import { DUB5AIService } from '@/lib/dub5ai';

/**
 * DUB5 Backend - Wrapper for existing DUB5AIService
 */
export class DUB5Backend extends AIBackend {
  /**
   * Stream an AI request through DUB5 service
   */
  async streamRequest(request: AIRequest): Promise<string> {
    try {
      // Convert to DUB5AIService format
      const response = await DUB5AIService.streamRequest({
        messages: request.messages,
        onChunk: request.onChunk,
        signal: request.signal
      });

      return response;
    } catch (error) {
      console.error('DUB5 backend request failed:', error);
      throw error;
    }
  }

  /**
   * Check if DUB5 service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Test with a simple request
      await DUB5AIService.streamRequest({
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch (error) {
      console.error('DUB5 backend availability check failed:', error);
      return false;
    }
  }

  /**
   * Get service information for DUB5 backend
   */
  async getServiceInfo(): Promise<ServiceInfo> {
    return {
      currentService: 'DUB5 AI Backend',
      isConnected: await this.isAvailable(),
      availableServices: ['DUB5 AI Backend']
    };
  }

  /**
   * No cleanup needed for DUB5 backend
   */
  cleanup(): void {
    // No cleanup required for DUB5 backend
  }
}