'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAIServiceManager } from '@/lib/ai/ai-service-manager';
import { SettingsManager } from '@/lib/ai/settings-manager';
import { ChromeExtensionDetector } from '@/lib/ai/error-handler';
import { AIBackendSettings, AIRequest, AIBackendType } from '@/lib/ai/types';

interface AIServiceState {
  isInitialized: boolean;
  currentBackend: AIBackendType | null;
  isAvailable: boolean;
  chromeExtensionAvailable: boolean;
  settings: AIBackendSettings;
  isLoading: boolean;
  error: string | null;
}

export function useAIService() {
  const [state, setState] = useState<AIServiceState>({
    isInitialized: false,
    currentBackend: null,
    isAvailable: false,
    chromeExtensionAvailable: false,
    settings: SettingsManager.getSettings(),
    isLoading: true,
    error: null
  });

  // Initialize AI service
  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Initialize AI service manager
      const aiServiceManager = getAIServiceManager();
      await aiServiceManager.initialize();

      // Check Chrome Extension availability
      const chromeExtensionAvailable = await ChromeExtensionDetector.detect();

      // Check if current backend is available
      const isAvailable = await aiServiceManager.isAvailable();

      setState(prev => ({
        ...prev,
        isInitialized: true,
        currentBackend: aiServiceManager.getCurrentBackendType(),
        isAvailable,
        chromeExtensionAvailable,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize AI service'
      }));
    }
  };

  const updateSettings = useCallback(async (newSettings: AIBackendSettings) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const aiServiceManager = getAIServiceManager();
      await aiServiceManager.updateSettings(newSettings);

      setState(prev => ({
        ...prev,
        settings: newSettings,
        currentBackend: aiServiceManager.getCurrentBackendType(),
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to update AI settings:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update settings'
      }));
    }
  }, []);

  const streamRequest = useCallback(async (request: AIRequest): Promise<string> => {
    if (!state.isInitialized) {
      throw new Error('AI service not initialized');
    }

    return getAIServiceManager().streamRequest(request);
  }, [state.isInitialized]);

  const checkAvailability = useCallback(async () => {
    try {
      const isAvailable = await getAIServiceManager().isAvailable();
      const chromeExtensionAvailable = await ChromeExtensionDetector.detect();

      setState(prev => ({
        ...prev,
        isAvailable,
        chromeExtensionAvailable
      }));

      return { isAvailable, chromeExtensionAvailable };
    } catch (error) {
      console.error('Failed to check AI service availability:', error);
      return { isAvailable: false, chromeExtensionAvailable: false };
    }
  }, []);

  const getServiceInfo = useCallback(async () => {
    if (!state.isInitialized) {
      throw new Error('AI service not initialized');
    }

    return getAIServiceManager().getServiceInfo();
  }, [state.isInitialized]);

  return {
    ...state,
    updateSettings,
    streamRequest,
    checkAvailability,
    getServiceInfo,
    refresh: initializeService
  };
}