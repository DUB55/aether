'use client';

import React, { useState } from 'react';
import { ChromeExtensionService } from '@/lib/ai/types';

interface ServiceSelectorProps {
  selectedService: ChromeExtensionService;
  customUrl?: string;
  onServiceChange: (service: ChromeExtensionService, customUrl?: string) => void;
  isConnected: boolean;
  className?: string;
}

const AI_SERVICES = [
  {
    id: 'copilot' as ChromeExtensionService,
    name: 'Microsoft Copilot',
    description: 'General queries, coding help, research',
    url: 'https://copilot.microsoft.com',
    icon: '🤖'
  },
  {
    id: 'chatgpt' as ChromeExtensionService,
    name: 'ChatGPT',
    description: 'Creative writing, detailed explanations, coding',
    url: 'https://chat.openai.com',
    icon: '💬'
  },
  {
    id: 'gemini' as ChromeExtensionService,
    name: 'Google Gemini',
    description: 'Research, analysis, multimodal tasks',
    url: 'https://gemini.google.com',
    icon: '✨'
  },
  {
    id: 'claude' as ChromeExtensionService,
    name: 'Claude AI',
    description: 'Analysis, writing, ethical reasoning',
    url: 'https://claude.ai',
    icon: '🧠'
  },
  {
    id: 'custom' as ChromeExtensionService,
    name: 'Custom URL',
    description: 'Use your own AI service endpoint',
    url: '',
    icon: '🔧'
  }
];

export function ServiceSelector({
  selectedService,
  customUrl = '',
  onServiceChange,
  isConnected,
  className = ''
}: ServiceSelectorProps) {
  const [localCustomUrl, setLocalCustomUrl] = useState(customUrl);
  const [urlError, setUrlError] = useState('');

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('URL is required for custom service');
      return false;
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        setUrlError('URL must use HTTPS protocol');
        return false;
      }
      setUrlError('');
      return true;
    } catch {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleServiceChange = (service: ChromeExtensionService) => {
    if (service === 'custom') {
      if (validateUrl(localCustomUrl)) {
        onServiceChange(service, localCustomUrl);
      }
    } else {
      onServiceChange(service);
    }
  };

  const handleCustomUrlChange = (url: string) => {
    setLocalCustomUrl(url);
    if (selectedService === 'custom' && url.trim()) {
      if (validateUrl(url)) {
        onServiceChange('custom', url);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          AI Service
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        {AI_SERVICES.map((service) => (
          <label
            key={service.id}
            className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <input
              type="radio"
              name="ai-service"
              value={service.id}
              checked={selectedService === service.id}
              onChange={() => handleServiceChange(service.id)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <div className="text-2xl">{service.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {service.name}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {service.description}
              </p>
              {service.url && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {service.url}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Custom URL Input */}
      {selectedService === 'custom' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom AI Service URL
          </label>
          <input
            type="url"
            value={localCustomUrl}
            onChange={(e) => handleCustomUrlChange(e.target.value)}
            placeholder="https://your-ai-service.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
          {urlError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {urlError}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter the HTTPS URL of your custom AI service. The service must have text input and response elements.
          </p>
        </div>
      )}

      {/* Service Requirements */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-sm">
          <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
            Service Requirements
          </p>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
            <li>• Make sure you're logged into your selected AI service</li>
            <li>• The DUB5 Chrome Extension must be installed and enabled</li>
            <li>• Check that the extension has necessary permissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}