'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AIBackendSelector } from './ai-backend-selector';
import { ServiceSelector } from './service-selector';
import { SettingsManager } from '@/lib/ai/settings-manager';
import { ChromeExtensionDetector } from '@/lib/ai/error-handler';
import { AIBackendSettings, AIBackendType, ChromeExtensionService } from '@/lib/ai/types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AIBackendSettings) => void;
}

interface ConnectionStatus {
  chromeExtensionAvailable: boolean;
  isConnected: boolean;
  currentService?: string;
  error?: string;
}

export function SettingsPanel({ isOpen, onClose, onSettingsChange }: SettingsPanelProps) {
  const [settings, setSettings] = useState<AIBackendSettings>(() => SettingsManager.getSettings());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    chromeExtensionAvailable: false,
    isConnected: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load connection status
  useEffect(() => {
    if (isOpen) {
      checkConnectionStatus();
    }
  }, [isOpen]);

  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      const status = await ChromeExtensionDetector.getStatus();
      setConnectionStatus({
        chromeExtensionAvailable: status.available,
        isConnected: status.connected,
        currentService: status.currentService,
        error: status.error
      });
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setConnectionStatus({
        chromeExtensionAvailable: false,
        isConnected: false,
        error: 'Failed to check extension status'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackendChange = (backend: AIBackendType) => {
    const newSettings = { ...settings, selectedBackend: backend };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleServiceChange = (service: ChromeExtensionService, customUrl?: string) => {
    const newSettings = {
      ...settings,
      chromeExtension: {
        selectedService: service,
        customUrl
      }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const saveSettings = async (newSettings: AIBackendSettings) => {
    setSaveStatus('saving');
    try {
      SettingsManager.saveSettings(newSettings);
      setSaveStatus('saved');
      onSettingsChange?.(newSettings);
      
      // Reset save status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    SettingsManager.resetToDefaults();
    const defaultSettings = SettingsManager.getSettings();
    setSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleTestConnection = async () => {
    await checkConnectionStatus();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>AI Settings</span>
            {saveStatus === 'saving' && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            {saveStatus === 'saved' && (
              <span className="text-green-600 text-sm">✓ Saved</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600 text-sm">✗ Error</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Connection Status
              </h3>
              <button
                onClick={handleTestConnection}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus.chromeExtensionAvailable ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-gray-700 dark:text-gray-300">
                  Chrome Extension: {connectionStatus.chromeExtensionAvailable ? 'Available' : 'Not Available'}
                </span>
              </div>
              
              {connectionStatus.chromeExtensionAvailable && (
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus.isConnected ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-gray-700 dark:text-gray-300">
                    Service: {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                    {connectionStatus.currentService && ` (${connectionStatus.currentService})`}
                  </span>
                </div>
              )}
              
              {connectionStatus.error && (
                <div className="text-red-600 dark:text-red-400">
                  Error: {connectionStatus.error}
                </div>
              )}
            </div>
          </div>

          {/* AI Backend Selection */}
          <AIBackendSelector
            selectedBackend={settings.selectedBackend}
            onBackendChange={handleBackendChange}
            chromeExtensionAvailable={connectionStatus.chromeExtensionAvailable}
          />

          {/* Chrome Extension Service Selection */}
          {settings.selectedBackend === 'chrome-extension' && (
            <ServiceSelector
              selectedService={settings.chromeExtension.selectedService}
              customUrl={settings.chromeExtension.customUrl}
              onServiceChange={handleServiceChange}
              isConnected={connectionStatus.isConnected}
            />
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Reset to Defaults
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}