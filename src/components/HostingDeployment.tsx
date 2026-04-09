"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Server, 
  Globe, 
  Rocket, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Settings,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface Deployment {
  id: string
  projectId: string
  url: string
  status: 'deploying' | 'success' | 'failed'
  createdAt: number
  environment: 'production' | 'staging' | 'preview'
}

interface HostingDeploymentProps {
  projectId: string
  projectFiles: Record<string, string>
  className?: string
}

export function HostingDeployment({ projectId, projectFiles, className }: HostingDeploymentProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [autoDeploy, setAutoDeploy] = useState(false)

  const handleDeploy = async (environment: 'production' | 'staging' | 'preview') => {
    if (!projectFiles || Object.keys(projectFiles).length === 0) {
      toast.error('No files to deploy')
      return
    }

    setIsDeploying(true)
    
    // Simulate deployment (in production, this would call a deployment API)
    setTimeout(() => {
      const newDeployment: Deployment = {
        id: `deploy_${Date.now()}`,
        projectId,
        url: `https://${projectId}-${environment}.aether.app`,
        status: 'success',
        createdAt: Date.now(),
        environment
      }
      
      setDeployments([...deployments, newDeployment])
      setIsDeploying(false)
      toast.success(`Successfully deployed to ${environment}`)
    }, 3000)
  }

  const handleAddCustomDomain = () => {
    if (!customDomain.trim()) {
      toast.error('Please enter a domain')
      return
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/
    if (!domainRegex.test(customDomain)) {
      toast.error('Invalid domain format')
      return
    }

    toast.success('Custom domain added successfully')
    setCustomDomain('')
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      deploying: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || styles.deploying
  }

  const getEnvBadge = (environment: string) => {
    const styles = {
      production: 'bg-purple-100 text-purple-800',
      staging: 'bg-blue-100 text-blue-800',
      preview: 'bg-gray-100 text-gray-800'
    }
    return styles[environment as keyof typeof styles] || styles.preview
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Hosting & Deployment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deployment Options */}
          <div className="space-y-4">
            <h3 className="font-medium">Deploy to Environment</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleDeploy('production')}
                disabled={isDeploying}
                variant="default"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Production
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleDeploy('staging')}
                disabled={isDeploying}
                variant="outline"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4 mr-2" />
                    Staging
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleDeploy('preview')}
                disabled={isDeploying}
                variant="outline"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Custom Domain</h3>
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoDeploy}
                  onCheckedChange={setAutoDeploy}
                />
                <span className="text-sm">Auto-deploy on changes</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="yourdomain.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
              <Button onClick={handleAddCustomDomain} variant="outline">
                <Globe className="w-4 h-4 mr-1" />
                Add Domain
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add your custom domain and configure DNS records to point to Aether.
            </p>
          </div>

          {/* Deployment History */}
          <div className="space-y-4">
            <h3 className="font-medium">Deployment History</h3>
            {deployments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No deployments yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {deployment.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : deployment.status === 'failed' ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getEnvBadge(deployment.environment)} variant="secondary">
                            {deployment.environment}
                          </Badge>
                          <Badge className={getStatusBadge(deployment.status)} variant="secondary">
                            {deployment.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(deployment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Free Tier Features:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Unlimited deployments</li>
                  <li>Automatic SSL certificates</li>
                  <li>Global CDN</li>
                  <li>Preview environments</li>
                  <li>Custom domain support</li>
                  <li>Auto-deploy on git push</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
