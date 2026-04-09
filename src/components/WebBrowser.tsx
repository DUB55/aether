"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, ExternalLink, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'

interface WebBrowserProps {
  onContentSelect?: (content: string, url: string) => void
  className?: string
}

export function WebBrowser({ onContentSelect, className }: WebBrowserProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const fetchWebContent = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')
    setContent('')

    try {
      const response = await fetch('/api/browse-web', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch web content')
      }

      const data = await response.json()
      setContent(data.content)
      toast.success('Web content fetched successfully!')
    } catch (error: any) {
      console.error('Web browsing error:', error)
      setError(error.message || 'Failed to fetch web content')
      toast.error('Failed to fetch web content')
    } finally {
      setLoading(false)
    }
  }

  const useContent = () => {
    if (content && onContentSelect) {
      onContentSelect(content, url)
      toast.success('Content selected for analysis!')
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          AI Web Browser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter URL to browse (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchWebContent()}
            className="flex-1"
          />
          <Button 
            onClick={fetchWebContent} 
            disabled={!url.trim() || loading}
            size="sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Browse
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {content && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Content Preview</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={useContent}
                disabled={!onContentSelect}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Use for Analysis
              </Button>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap">{content.substring(0, 2000)}{content.length > 2000 && '...'}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
