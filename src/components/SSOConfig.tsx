"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Plus, 
  CheckCircle2, 
  Trash2,
  ExternalLink,
  Key,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { ssoService, SSOProvider } from '@/lib/sso-service'

interface SSOConfigProps {
  workspaceId: string
  className?: string
}

export function SSOConfig({ workspaceId, className }: SSOConfigProps) {
  const [configuredProviders, setConfiguredProviders] = useState<SSOProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: window.location.origin + '/auth/callback',
    metadataUrl: '',
    issuer: ''
  })
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [workspaceSSO, setWorkspaceSSO] = useState<any>(null)

  useEffect(() => {
    loadConfiguredProviders()
    loadWorkspaceSSO()
  }, [workspaceId])

  const loadConfiguredProviders = () => {
    const providers = ssoService.getConfiguredProviders()
    setConfiguredProviders(providers)
  }

  const loadWorkspaceSSO = () => {
    const connection = ssoService.getWorkspaceSSOConnection(workspaceId)
    setWorkspaceSSO(connection)
  }

  const handleConfigureProvider = () => {
    if (!selectedProvider) {
      toast.error('Please select a provider')
      return
    }

    if (!config.clientId) {
      toast.error('Client ID is required')
      return
    }

    setIsConfiguring(true)

    try {
      ssoService.configureProvider(selectedProvider, config)
      loadConfiguredProviders()
      setShowConfigForm(false)
      setConfig({
        clientId: '',
        clientSecret: '',
        redirectUri: window.location.origin + '/auth/callback',
        metadataUrl: '',
        issuer: ''
      })
      setSelectedProvider('')
      toast.success('SSO provider configured successfully')
    } catch (error) {
      toast.error('Failed to configure SSO provider')
    } finally {
      setIsConfiguring(false)
    }
  }

  const handleRemoveProvider = (providerId: string) => {
    if (confirm('Are you sure you want to remove this SSO provider?')) {
      ssoService.removeProvider(providerId)
      loadConfiguredProviders()
      toast.success('SSO provider removed')
    }
  }

  const handleEnableForWorkspace = (providerId: string) => {
    ssoService.enableSSOForWorkspace(workspaceId, providerId)
    loadWorkspaceSSO()
    toast.success('SSO enabled for workspace')
  }

  const handleDisableForWorkspace = () => {
    ssoService.disableSSOForWorkspace(workspaceId)
    loadWorkspaceSSO()
    toast.success('SSO disabled for workspace')
  }

  const handleTestSSO = (providerId: string) => {
    try {
      const authUrl = ssoService.initiateLogin(providerId)
      window.open(authUrl, '_blank')
      toast.success('SSO login initiated')
    } catch (error) {
      toast.error('Failed to initiate SSO login')
    }
  }

  const availableProviders = Object.entries(ssoService.providers)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Single Sign-On (SSO)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workspace SSO Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {workspaceSSO?.enabled ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <div className="font-medium">
                  {workspaceSSO?.enabled ? 'SSO Enabled' : 'SSO Not Enabled'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {workspaceSSO?.enabled 
                    ? `Using ${ssoService.providers[workspaceSSO.providerId as keyof typeof ssoService.providers]?.name}`
                    : 'Configure an SSO provider to enable'}
                </div>
              </div>
            </div>
            {workspaceSSO?.enabled && (
              <Button variant="outline" size="sm" onClick={handleDisableForWorkspace}>
                Disable
              </Button>
            )}
          </div>
        </div>

        {/* Add Provider */}
        <div className="space-y-3">
          <h3 className="font-medium">Configure SSO Provider</h3>
          {!showConfigForm ? (
            <div className="grid grid-cols-2 gap-3">
              {availableProviders.map(([id, provider]) => {
                const isConfigured = configuredProviders.some(p => p.id === id)
                return (
                  <Button
                    key={id}
                    variant={isConfigured ? "outline" : "default"}
                    onClick={() => {
                      setSelectedProvider(id)
                      setShowConfigForm(true)
                    }}
                    className="justify-start"
                    disabled={isConfigured}
                  >
                    <span className="mr-2">{provider.icon}</span>
                    {provider.name}
                    {isConfigured && <Badge className="ml-auto">Configured</Badge>}
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">
                  {ssoService.providers[selectedProvider as keyof typeof ssoService.providers]?.icon}
                </span>
                <span className="font-medium">
                  {ssoService.providers[selectedProvider as keyof typeof ssoService.providers]?.name}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Client ID</label>
                  <Input
                    value={config.clientId}
                    onChange={(e) => setConfig({...config, clientId: e.target.value})}
                    placeholder="Enter client ID"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Client Secret</label>
                  <Input
                    type="password"
                    value={config.clientSecret}
                    onChange={(e) => setConfig({...config, clientSecret: e.target.value})}
                    placeholder="Enter client secret"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Redirect URI</label>
                  <Input
                    value={config.redirectUri}
                    onChange={(e) => setConfig({...config, redirectUri: e.target.value})}
                    disabled
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConfigureProvider} disabled={isConfiguring}>
                  {isConfiguring ? 'Configuring...' : 'Configure'}
                </Button>
                <Button variant="outline" onClick={() => setShowConfigForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Configured Providers */}
        {configuredProviders.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Configured Providers</h3>
            <div className="space-y-2">
              {configuredProviders.map((provider) => (
                <div key={provider.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.icon}</span>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-muted-foreground">{provider.type.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestSSO(provider.id)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    {!workspaceSSO?.enabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnableForWorkspace(provider.id)}
                      >
                        Enable for Workspace
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveProvider(provider.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">About SSO:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>OAuth 2.0 and SAML 2.0 supported</li>
                <li>Secure authentication with enterprise providers</li>
                <li>Automatic user provisioning</li>
                <li>Free tier includes up to 3 SSO providers</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
