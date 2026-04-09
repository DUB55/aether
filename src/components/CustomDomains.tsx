"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface Domain {
  id: string
  domain: string
  status: 'pending' | 'active' | 'error'
  sslStatus: 'pending' | 'active' | 'error'
  createdAt: number
}

interface CustomDomainsProps {
  projectId: string
  className?: string
}

export function CustomDomains({ projectId, className }: CustomDomainsProps) {
  const [domains, setDomains] = useState<Domain[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    loadDomains()
  }, [projectId])

  const loadDomains = () => {
    // Load from localStorage (in production, this would be from Firebase/Supabase)
    const stored = localStorage.getItem(`aether_domains_${projectId}`)
    if (stored) {
      setDomains(JSON.parse(stored))
    }
  }

  const handleAddDomain = () => {
    if (!newDomain.trim()) {
      toast.error('Please enter a domain')
      return
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/
    if (!domainRegex.test(newDomain)) {
      toast.error('Invalid domain format')
      return
    }

    setIsAdding(true)

    // Simulate domain addition (in production, this would call a domain API)
    setTimeout(() => {
      const newDomainObj: Domain = {
        id: `domain_${Date.now()}`,
        domain: newDomain,
        status: 'pending',
        sslStatus: 'pending',
        createdAt: Date.now()
      }

      const updated = [...domains, newDomainObj]
      setDomains(updated)
      localStorage.setItem(`aether_domains_${projectId}`, JSON.stringify(updated))
      
      setNewDomain('')
      setIsAdding(false)
      toast.success('Domain added successfully')
    }, 1000)
  }

  const handleVerifyDomain = (domainId: string) => {
    // Simulate domain verification
    setDomains(domains.map(d => 
      d.id === domainId ? { ...d, status: 'active' as const, sslStatus: 'active' as const } : d
    ))
    toast.success('Domain verified successfully')
  }

  const handleDeleteDomain = (domainId: string) => {
    if (confirm('Are you sure you want to remove this domain?')) {
      const updated = domains.filter(d => d.id !== domainId)
      setDomains(updated)
      localStorage.setItem(`aether_domains_${projectId}`, JSON.stringify(updated))
      toast.success('Domain removed')
    }
  }

  const handleCopyDns = (domain: string) => {
    const dnsRecord = `CNAME ${domain} -> aether.app`
    navigator.clipboard.writeText(dnsRecord)
    toast.success('DNS record copied')
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Custom Domains
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Domain */}
        <div className="flex gap-2">
          <Input
            placeholder="yourdomain.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            disabled={isAdding}
          />
          <Button onClick={handleAddDomain} disabled={isAdding}>
            {isAdding ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Domain
              </>
            )}
          </Button>
        </div>

        {/* Domain List */}
        {domains.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No custom domains added yet</p>
            <p className="text-sm">Add your first custom domain to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {domains.map((domain) => (
              <div key={domain.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {domain.status === 'active' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : domain.status === 'error' ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
                    )}
                    <div>
                      <div className="font-medium">{domain.domain}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusBadge(domain.status)} variant="secondary">
                          {domain.status}
                        </Badge>
                        <Badge className={getStatusBadge(domain.sslStatus)} variant="secondary">
                          SSL: {domain.sslStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyDomain(domain.id)}
                      >
                        Verify
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDomain(domain.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {domain.status === 'pending' && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">DNS Configuration Required</p>
                      <p className="mb-2">Add the following DNS record to your domain provider:</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded border">
                      <code className="text-sm flex-1">CNAME {domain.domain} -&gt; aether.app</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyDns(domain.domain)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">About Custom Domains:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Free SSL certificates are automatically provisioned</li>
              <li>DNS propagation may take up to 24 hours</li>
              <li>Your domain must point to aether.app via CNAME</li>
              <li>Multiple custom domains are supported</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
