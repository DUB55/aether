"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Settings, Eye, EyeOff, DollarSign, Target, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

interface AdConfig {
  enabled: boolean
  placement: 'sidebar' | 'header' | 'footer' | 'inline'
  provider: 'google-adsense' | 'carbon' | 'custom'
  publisherId: string
  adSlot: string
  customCode?: string
  targeting?: {
    demographics?: string[]
    interests?: string[]
    keywords?: string[]
    locations?: string[]
  }
}

interface AdsProps {
  onConfigChange?: (config: AdConfig) => void
  className?: string
}

export function Ads({ onConfigChange, className }: AdsProps) {
  const [config, setConfig] = useState<AdConfig>({
    enabled: false,
    placement: 'sidebar',
    provider: 'google-adsense',
    publisherId: 'ca-pub-12345678901234567890',
    adSlot: 'aether-sidebar-ad',
    targeting: {
      demographics: ['developers', 'tech-enthusiasts'],
      interests: ['programming', 'web-development', 'ai', 'technology'],
      keywords: ['code generation', 'ai development', 'software development']
    }
  })

  useEffect(() => {
    // Load ads configuration
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/ads-config')
        const data = await response.json()
        setConfig(data)
      } catch (error) {
        console.error('Failed to load ads config:', error)
        // Use default config if API fails
      }
    }

    loadConfig()
  }, [])

  const handleConfigUpdate = async (newConfig: AdConfig) => {
    try {
      const response = await fetch('/api/ads-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig)
      })
      
      if (response.ok) {
        const updatedConfig = await response.json()
        setConfig(updatedConfig)
        toast.success('Ads configuration updated successfully!')
        if (onConfigChange) {
          onConfigChange(updatedConfig)
        }
      } else {
        toast.error('Failed to update ads configuration')
      }
    } catch (error) {
      console.error('Error updating ads config:', error)
      toast.error('Failed to update ads configuration')
    }
  }

  const getPlacementIcon = (placement: string) => {
    switch (placement) {
      case 'header':
        return <BarChart3 className="w-4 h-4" />
      case 'sidebar':
        return <Target className="w-4 h-4" />
      case 'footer':
        return <DollarSign className="w-4 h-4" />
      case 'inline':
        return <Eye className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google-adsense':
        return 'Google AdSense'
      case 'carbon':
        return 'Carbon Ads'
      case 'custom':
        return 'Custom Network'
      default:
        return provider
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${className}`}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
              Advertisement Settings
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Configure and manage advertisement display across your Aether experience.
            </p>
          </div>

          {/* Ad Settings Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getPlacementIcon(config.placement)}
                Ad Placement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">Advertisement Status</h3>
                  <p className="text-sm text-slate-600">
                    {config.enabled 
                      ? 'Advertisements are currently enabled and will be displayed according to your configuration.'
                      : 'Advertisements are currently disabled.'
                    }
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(enabled) => {
                    setConfig(prev => ({ ...prev, enabled }))
                  }}
                  className="w-12 h-6"
                />
              </div>

              {/* Placement Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Ad Placement</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['sidebar', 'header', 'footer', 'inline'] as const).map((placement) => (
                    <Button
                      key={placement}
                      variant={config.placement === placement ? 'default' : 'outline'}
                      onClick={() => setConfig(prev => ({ ...prev, placement }))}
                      className="h-12 p-3 text-sm font-medium transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {getPlacementIcon(placement)}
                        <span className="capitalize">{placement}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Ad Provider</h3>
                <div className="space-y-3">
                  {(['google-adsense', 'carbon', 'custom'] as const).map((provider) => (
                    <Button
                      key={provider}
                      variant={config.provider === provider ? 'default' : 'outline'}
                      onClick={() => setConfig(prev => ({ ...prev, provider }))}
                      className="w-full h-12 p-3 text-sm font-medium transition-colors justify-start"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-medium">{getProviderName(provider)}</div>
                          <div className="text-xs text-slate-500">{provider}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Publisher ID */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Publisher ID</h3>
                <input
                  type="text"
                  value={config.publisherId}
                  onChange={(e) => setConfig(prev => ({ ...prev, publisherId: e.target.value }))}
                  placeholder="Enter your publisher ID"
                  className="w-full h-12 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Ad Slot */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Ad Slot</h3>
                <input
                  type="text"
                  value={config.adSlot}
                  onChange={(e) => setConfig(prev => ({ ...prev, adSlot: e.target.value }))}
                  placeholder="Enter your ad slot identifier"
                  className="w-full h-12 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Custom Ad Code */}
              {config.provider === 'custom' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Custom Ad Code</h3>
                  <textarea
                    value={config.customCode || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, customCode: e.target.value }))}
                    placeholder="Paste your custom advertisement code here..."
                    rows={6}
                    className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                  />
                </div>
              )}

              {/* Targeting Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Targeting Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Demographics */}
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-slate-800 mb-2">Demographics</h4>
                    <input
                      type="text"
                      value={config.targeting?.demographics?.join(', ') || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        targeting: {
                          ...prev.targeting,
                          demographics: e.target.value.split(',').map(d => d.trim())
                        }
                      }))}
                      placeholder="e.g., developers, tech-enthusiasts, students"
                      className="w-full h-12 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Interests */}
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-slate-800 mb-2">Interests</h4>
                    <input
                      type="text"
                      value={config.targeting?.interests?.join(', ') || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        targeting: {
                          ...prev.targeting,
                          interests: e.target.value.split(',').map(i => i.trim())
                        }
                      }))}
                      placeholder="e.g., programming, web-development, ai, technology"
                      className="w-full h-12 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Keywords */}
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-slate-800 mb-2">Keywords</h4>
                    <input
                      type="text"
                      value={config.targeting?.keywords?.join(', ') || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        targeting: {
                          ...prev.targeting,
                          keywords: e.target.value.split(',').map(k => k.trim())
                        }
                      }))}
                      placeholder="e.g., code generation, ai development, software development"
                      className="w-full h-12 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-slate-200">
                <Button
                  onClick={() => handleConfigUpdate(config)}
                  className="w-full py-3 text-lg font-semibold transition-colors"
                >
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-5 h-5" />
                Advertisement Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                {config.enabled ? (
                  <>
                    <div className="w-full h-32 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                      <div className="text-slate-500">
                        <BarChart3 className="w-8 h-8 mb-2" />
                        <p className="text-sm">Advertisement Preview</p>
                        <p className="text-xs">Your ad would appear here</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      <div className="text-center">
                        <div className="font-medium">Provider</div>
                        <div>{getProviderName(config.provider)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Placement</div>
                        <div className="capitalize">{config.placement}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Status</div>
                        <Badge variant={config.enabled ? 'default' : 'secondary'}>
                          {config.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-32 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <EyeOff className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-slate-500">Advertisements are currently disabled</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="w-5 h-5" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-slate-700">Estimated Monthly Revenue</div>
                    <div className="text-2xl font-bold text-slate-900">$0</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">Total Impressions</div>
                    <div className="text-2xl font-bold text-slate-900">0</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">Click-Through Rate</div>
                    <div className="text-2xl font-bold text-slate-900">0%</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Revenue will be calculated once advertisements are enabled and impressions are tracked. 
                    Connect your ad provider account to view detailed analytics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-slate-600">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">1. Configure Your Ad Provider</h4>
                  <p>Set up your account with Google AdSense, Carbon, or your custom ad network.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">2. Enter Publisher Details</h4>
                  <p>Add your publisher ID and ad slot information in the settings above.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">3. Choose Placement</h4>
                  <p>Select where ads should appear in your application interface.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">4. Enable Ads</h4>
                  <p>Toggle the advertisement status to start displaying ads to your users.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">5. Monitor Performance</h4>
                  <p>Track revenue and impressions through the analytics dashboard.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
