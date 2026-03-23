'use client';

import React from 'react';
import { AIBackendType } from '@/lib/ai/types';

interface AIBackendSelectorProps {
  selectedBackend: AIBackendType;
  onBackendChange: (backend: AIBackendType) => void;
  chromeExtensionAvailable?: boolean;
  className?: string;
}

export function AIBackendSelector({
  selectedBackend,
  onBackendChange,
  chromeExtensionAvailable = false,
  className = ''
}: AIBackendSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        AI Backend
      </div>
      
      <div className="space-y-2">
        {/* Chrome Extension Option */}
        <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <input
            type="radio"
            name="ai-backend"
            value="chrome-extension"
            checked={selectedBackend === 'chrome-extension'}
            onChange={(e) => onBackendChange(e.target.value as AIBackendType)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                DUB5 Chrome Extension Bridge
              </span>
              {chromeExtensionAvailable ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Not Available
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Use popular AI services (Copilot, ChatGPT, Gemini, Claude) through Chrome Extension
            </p>
          </div>
        </label>

        {/* DUB5 Backend Option */}
        <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <input
            type="radio"
            name="ai-backend"
            value="dub5"
            checked={selectedBackend === 'dub5'}
            onChange={(e) => onBackendChange(e.target.value as AIBackendType)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                DUB5 AI Backend
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Default
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Use the existing DUB5 AI service for code generation and assistance
            </p>
          </div>
        </label>
      </div>

      {/* Warning for Chrome Extension not available */}
      {selectedBackend === 'chrome-extension' && !chromeExtensionAvailable && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Chrome Extension Not Available
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Please install the DUB5 Chrome Extension to use this feature, or switch to the DUB5 AI Backend.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}