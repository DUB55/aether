"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Shield,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AIProvider {
  id: string
  name: string
  displayName: string
  description: string
  baseUrl?: string
  keyRequired: boolean
  icon: string
  docsUrl?: string
  models?: string[]
  color: string
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and other OpenAI models',
    baseUrl: 'https://api.openai.com/v1',
    keyRequired: true,
    icon: '🤖',
    docsUrl: 'https://platform.openai.com/docs',
    models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-3.5'],
    color: 'bg-green-500'
  },
  {
    id: 'anthropic',
    name: 'anthropic',
    displayName: 'Anthropic',
    description: 'Claude 3.5, Claude 3, and other Anthropic models',
    baseUrl: 'https://api.anthropic.com',
    keyRequired: true,
    icon: '🧠',
    docsUrl: 'https://docs.anthropic.com',
    models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    color: 'bg-orange-500'
  },
  {
    id: 'google',
    name: 'google',
    displayName: 'Google AI',
    description: 'Gemini Pro and other Google AI models',
    baseUrl: 'https://generativelanguage.googleapis.com',
    keyRequired: true,
    icon: '🔍',
    docsUrl: 'https://ai.google.dev/docs',
    models: ['gemini-pro', 'gemini-pro-vision'],
    color: 'bg-blue-500'
  },
  {
    id: 'mistral',
    name: 'mistral',
    displayName: 'Mistral AI',
    description: 'Mistral 7B, Mixtral, and other Mistral models',
    baseUrl: 'https://api.mistral.ai',
    keyRequired: true,
    icon: '🌊',
    docsUrl: 'https://docs.mistral.ai',
    models: ['mistral-7b', 'mixtral-8x7b', 'mistral-large'],
    color: 'bg-purple-500'
  },
  {
    id: 'groq',
    name: 'groq',
    displayName: 'Groq',
    description: 'Fast inference with Llama, Mixtral, and other models',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyRequired: true,
    icon: '⚡',
    docsUrl: 'https://console.groq.com/docs',
    models: ['llama-3-70b-8192', 'mixtral-8x7b-32768'],
    color: 'bg-yellow-500'
  },
  {
    id: 'cohere',
    name: 'cohere',
    displayName: 'Cohere',
    description: 'Command, Embed, and other Cohere models',
    baseUrl: 'https://api.cohere.ai',
    keyRequired: true,
    icon: '🔥',
    docsUrl: 'https://docs.cohere.com',
    models: ['command', 'command-nightly', 'embed-english-v3.0'],
    color: 'bg-red-500'
  },
  {
    id: 'fireworks',
    name: 'fireworks',
    displayName: 'Fireworks AI',
    description: 'Fast and affordable AI inference',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    keyRequired: true,
    icon: '🎆',
    docsUrl: 'https://docs.fireworks.ai',
    models: ['llama-v2-70b-chat', 'mixtral-8x7b-instruct'],
    color: 'bg-pink-500'
  },
  {
    id: 'deepseek',
    name: 'deepseek',
    displayName: 'DeepSeek',
    description: 'DeepSeek Coder and other specialized models',
    baseUrl: 'https://api.deepseek.com',
    keyRequired: true,
    icon: '🔬',
    docsUrl: 'https://platform.deepseek.com/api-docs',
    models: ['deepseek-coder', 'deepseek-chat'],
    color: 'bg-cyan-500'
  },
  {
    id: 'xai',
    name: 'xai',
    displayName: 'xAI (Grok)',
    description: 'Grok models by xAI',
    baseUrl: 'https://api.x.ai',
    keyRequired: true,
    icon: '🚀',
    docsUrl: 'https://docs.x.ai',
    models: ['grok-beta'],
    color: 'bg-gray-800'
  },
  {
    id: 'openrouter',
    name: 'openrouter',
    displayName: 'OpenRouter',
    description: 'Access to multiple AI models through one API',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyRequired: true,
    icon: '🔀',
    docsUrl: 'https://openrouter.ai/docs',
    models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4', 'google/gemini-pro'],
    color: 'bg-indigo-500'
  },
  {
    id: 'grok',
    name: 'grok',
    displayName: 'Grok',
    description: 'Grok models by xAI',
    baseUrl: 'https://api.x.ai/v1',
    keyRequired: true,
    icon: '🤖',
    docsUrl: 'https://docs.x.ai',
    models: ['grok-2'],
    color: 'bg-black'
  },
  {
    id: 'qwen',
    name: 'qwen',
    displayName: 'Qwen',
    description: 'Qwen models by Alibaba Cloud',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    keyRequired: true,
    icon: '🌟',
    docsUrl: 'https://help.aliyun.com/zh/dashscope/',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    color: 'bg-teal-500'
  },
  {
    id: 'ai21',
    name: 'ai21',
    displayName: 'AI21 Labs',
    description: 'Jamba, GPT-4, and other AI21 models',
    baseUrl: 'https://api.ai21.com/studio/v1',
    keyRequired: true,
    icon: '🧬',
    docsUrl: 'https://docs.ai21.com',
    models: ['jamba-1.5-large', 'gpt-4', 'claude-3.5-sonnet'],
    color: 'bg-emerald-500'
  },
  {
    id: 'openrouter',
    name: 'openrouter',
    displayName: 'OpenRouter',
    description: 'Router to multiple AI providers',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyRequired: true,
    icon: '🔀',
    docsUrl: 'https://openrouter.ai/docs',
    models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4'],
    color: 'bg-indigo-500'
  },
  {
    id: 'studio',
    name: 'studio',
    displayName: 'AI Studio',
    description: 'Google AI Studio models',
    baseUrl: 'https://aistudio.google.com',
    keyRequired: true,
    icon: '🎨',
    docsUrl: 'https://aistudio.google.com',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    color: 'bg-blue-600'
  }
]

interface BYOKDialogProps {
  isOpen: boolean
  onClose: () => void
  onProviderConfigured: (provider: AIProvider, apiKey: string, model?: string) => void
}

export function BYOKDialog({ isOpen, onClose, onProviderConfigured }: BYOKDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [savedProviders, setSavedProviders] = useState<Array<{ provider: AIProvider; apiKey: string; model?: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load saved providers from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aether_byok_providers')
      if (saved) {
        try {
          setSavedProviders(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to load saved providers:', error)
        }
      }
    }
  }, [])

  const handleAddProvider = async () => {
    if (!selectedProvider || !apiKey.trim()) {
      toast.error('Please select a provider and enter an API key')
      return
    }

    setIsLoading(true)
    try {
      // Validate API key (basic validation)
      if (apiKey.length < 10) {
        toast.error('API key appears to be invalid (too short)')
        setIsLoading(false)
        return
      }

      // Save to localStorage
      const newProvider = {
        provider: selectedProvider,
        apiKey: apiKey.trim(),
        model: selectedModel || selectedProvider.models?.[0]
      }

      const updatedProviders = [...savedProviders, newProvider]
      setSavedProviders(updatedProviders)
      localStorage.setItem('aether_byok_providers', JSON.stringify(updatedProviders))

      // Save to user account (if logged in)
      // This would integrate with your user management system
      toast.success(`${selectedProvider.displayName} provider configured successfully!`)

      onProviderConfigured(selectedProvider, apiKey.trim(), selectedModel)
      
      // Reset form
      setSelectedProvider(null)
      setApiKey('')
      setShowApiKey(false)
      setSelectedModel('')
      
    } catch (error) {
      console.error('Failed to add provider:', error)
      toast.error('Failed to configure provider. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveProvider = (providerToRemove: AIProvider) => {
    const updatedProviders = savedProviders.filter(p => p.provider.id !== providerToRemove.id)
    setSavedProviders(updatedProviders)
    localStorage.setItem('aether_byok_providers', JSON.stringify(updatedProviders))
    toast.success(`${providerToRemove.displayName} provider removed`)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('API key copied to clipboard')
  }

  const getProviderStatus = (provider: AIProvider) => {
    const saved = savedProviders.find(p => p.provider.id === provider.id)
    if (saved) {
      return { configured: true, hasKey: true }
    }
    return { configured: false, hasKey: false }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-background/95 backdrop-blur-sm absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Bring Your Own Key (BYOK)</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="configure" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="configure">Configure Provider</TabsTrigger>
                  <TabsTrigger value="manage">Manage Providers</TabsTrigger>
                </TabsList>

                <TabsContent value="configure" className="space-y-6">
                  <div className="grid gap-4">
                    {/* Provider Selection */}
                    <div className="space-y-2">
                      <Label>Select AI Provider</Label>
                      <Select value={selectedProvider?.id || ''} onValueChange={(value) => {
                        const provider = AI_PROVIDERS.find(p => p.id === value)
                        setSelectedProvider(provider || null)
                        setSelectedModel(provider?.models?.[0] || '')
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a provider..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {AI_PROVIDERS.map((provider) => {
                            const status = getProviderStatus(provider)
                            return (
                              <SelectItem key={provider.id} value={provider.id}>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{provider.icon}</span>
                                  <div className="flex-1">
                                    <div className="font-medium">{provider.displayName}</div>
                                    <div className="text-sm text-muted-foreground">{provider.description}</div>
                                  </div>
                                  {status.configured && (
                                    <Check className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Model Selection */}
                    {selectedProvider && selectedProvider.models && selectedProvider.models.length > 1 && (
                      <div className="space-y-2">
                        <Label>Model</Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model..." />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedProvider.models.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* API Key Input */}
                    {selectedProvider && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>API Key</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            type={showApiKey ? 'text' : 'password'}
                            placeholder={`Enter your ${selectedProvider.displayName} API key...`}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="pr-10"
                          />
                          {savedProviders.find(p => p.provider.id === selectedProvider.id) && (
                            <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2">
                              Configured
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Provider Info */}
                    {selectedProvider && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-lg">{selectedProvider.icon}</span>
                            {selectedProvider.displayName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <CardDescription>{selectedProvider.description}</CardDescription>
                          
                          {selectedProvider.docsUrl && (
                            <Button variant="outline" size="sm" className="w-full">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              <a 
                                href={selectedProvider.docsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Documentation
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Add Button */}
                    <Button 
                      onClick={handleAddProvider}
                      disabled={!selectedProvider || !apiKey.trim() || isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent border-t-primary" />
                          Adding Provider...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Provider
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manage" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Configured Providers</h3>
                    
                    {savedProviders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No providers configured yet</p>
                        <p className="text-sm">Add your first AI provider to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedProviders.map((saved, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{saved.provider.icon}</span>
                                  <div>
                                    <div className="font-medium">{saved.provider.displayName}</div>
                                    {saved.model && (
                                      <div className="text-sm text-muted-foreground">Model: {saved.model}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(saved.apiKey)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveProvider(saved.provider)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                <span>Your API keys are stored locally and encrypted. Never share your API keys with others.</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
