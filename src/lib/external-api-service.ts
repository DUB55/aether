// External API service
// Supports integration with OpenAI, Claude, and other AI providers

export interface APIProvider {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'cohere' | 'custom'
  baseUrl: string
  models: string[]
  enabled: boolean
}

export interface APIKey {
  id: string
  providerId: string
  key: string
  name: string
  createdAt: number
}

export interface APIRequest {
  provider: string
  model: string
  messages: Array<{ role: string; content: string }>
  parameters?: Record<string, any>
}

export interface APIResponse {
  success: boolean
  data?: any
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export const externalApiService = {
  // Available API providers
  providers: {
    openai: {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai' as const,
      baseUrl: 'https://api.openai.com/v1',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o'],
      enabled: false
    },
    anthropic: {
      id: 'anthropic',
      name: 'Anthropic Claude',
      type: 'anthropic' as const,
      baseUrl: 'https://api.anthropic.com/v1',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      enabled: false
    },
    cohere: {
      id: 'cohere',
      name: 'Cohere',
      type: 'cohere' as const,
      baseUrl: 'https://api.cohere.ai/v1',
      models: ['command', 'command-light', 'command-nightly'],
      enabled: false
    }
  },

  // Add API key
  addApiKey: (providerId: string, key: string, name: string): APIKey => {
    const apiKey: APIKey = {
      id: `apikey_${Date.now()}`,
      providerId,
      key,
      name,
      createdAt: Date.now()
    }

    const apiKeys = JSON.parse(localStorage.getItem('aether_api_keys') || '[]')
    apiKeys.push(apiKey)
    localStorage.setItem('aether_api_keys', JSON.stringify(apiKeys))

    // Enable provider
    const provider = externalApiService.providers[providerId as keyof typeof externalApiService.providers]
    if (provider) {
      provider.enabled = true
      const enabledProviders = JSON.parse(localStorage.getItem('aether_enabled_providers') || '{}')
      enabledProviders[providerId] = true
      localStorage.setItem('aether_enabled_providers', JSON.stringify(enabledProviders))
    }

    return apiKey
  },

  // Get API keys
  getApiKeys: (providerId?: string): APIKey[] => {
    const apiKeys = JSON.parse(localStorage.getItem('aether_api_keys') || '[]')
    if (providerId) {
      return apiKeys.filter((k: APIKey) => k.providerId === providerId)
    }
    return apiKeys
  },

  // Remove API key
  removeApiKey: (keyId: string): boolean => {
    const apiKeys = JSON.parse(localStorage.getItem('aether_api_keys') || '[]')
    const filtered = apiKeys.filter((k: APIKey) => k.id !== keyId)
    
    if (filtered.length === apiKeys.length) return false

    localStorage.setItem('aether_api_keys', JSON.stringify(filtered))
    return true
  },

  // Call external API
  callAPI: async (request: APIRequest): Promise<APIResponse> => {
    try {
      const provider = externalApiService.providers[request.provider as keyof typeof externalApiService.providers]
      if (!provider || !provider.enabled) {
        return { success: false, error: 'Provider not configured' }
      }

      const apiKeys = externalApiService.getApiKeys(request.provider)
      if (apiKeys.length === 0) {
        return { success: false, error: 'No API key configured' }
      }

      const apiKey = apiKeys[0].key

      // Make API call based on provider
      if (request.provider === 'openai') {
        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            ...request.parameters
          })
        })

        const data = await response.json()
        return {
          success: response.ok,
          data: response.ok ? data : null,
          error: response.ok ? undefined : data.error?.message || 'API call failed',
          usage: response.ok ? {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0
          } : undefined
        }
      } else if (request.provider === 'anthropic') {
        const response = await fetch(`${provider.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            max_tokens: 4096,
            ...request.parameters
          })
        })

        const data = await response.json()
        return {
          success: response.ok,
          data: response.ok ? data : null,
          error: response.ok ? undefined : data.error?.message || 'API call failed',
          usage: response.ok ? {
            promptTokens: data.usage?.input_tokens || 0,
            completionTokens: data.usage?.output_tokens || 0,
            totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
          } : undefined
        }
      }

      return { success: false, error: 'Provider not supported' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'API call failed' }
    }
  },

  // Get enabled providers
  getEnabledProviders: (): APIProvider[] => {
    const enabledProviders = JSON.parse(localStorage.getItem('aether_enabled_providers') || '{}')
    return Object.entries(externalApiService.providers)
      .filter(([id]) => enabledProviders[id])
      .map(([_, provider]) => provider)
  },

  // Test API connection
  testConnection: async (providerId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = externalApiService.providers[providerId as keyof typeof externalApiService.providers]
      if (!provider) {
        return { success: false, error: 'Provider not found' }
      }

      const apiKeys = externalApiService.getApiKeys(providerId)
      if (apiKeys.length === 0) {
        return { success: false, error: 'No API key configured' }
      }

      // Test with a simple request
      const testRequest: APIRequest = {
        provider: providerId,
        model: provider.models[0],
        messages: [{ role: 'user', content: 'Hello' }]
      }

      const response = await externalApiService.callAPI(testRequest)
      return response.success 
        ? { success: true } 
        : { success: false, error: response.error }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection test failed' }
    }
  }
}
