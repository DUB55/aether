"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { 
  Github, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  GitBranch
} from 'lucide-react'
import { toast } from 'sonner'
import { githubService } from '@/lib/github-service'

interface GitHubImportExportProps {
  projectFiles?: Record<string, string>
  onImport?: (files: Record<string, string>) => void
  onExport?: (repositoryUrl: string) => void
  className?: string
}

export function GitHubImportExport({ 
  projectFiles, 
  onImport, 
  onExport, 
  className 
}: GitHubImportExportProps) {
  const [accessToken, setAccessToken] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  const [importRepo, setImportRepo] = useState('')
  const [importBranch, setImportBranch] = useState('main')
  const [importing, setImporting] = useState(false)

  const [exportRepo, setExportRepo] = useState('')
  const [exportPrivate, setExportPrivate] = useState(false)
  const [exporting, setExporting] = useState(false)

  const validateToken = async () => {
    if (!accessToken.trim()) {
      toast.error('Please enter a GitHub access token')
      return
    }

    setIsValidating(true)
    try {
      const validation = await githubService.validateToken(accessToken)
      if (validation && typeof validation === 'object' && 'valid' in validation && validation.valid) {
        setTokenValid(true)
        setUserInfo(validation)
        toast.success('GitHub token validated successfully!')
      } else {
        setTokenValid(false)
        setUserInfo(null)
        toast.error('Invalid GitHub access token')
      }
    } catch (error) {
      setTokenValid(false)
      setUserInfo(null)
      toast.error('Failed to validate GitHub token')
    } finally {
      setIsValidating(false)
    }
  }

  const handleImport = async () => {
    if (!tokenValid) {
      toast.error('Please validate your GitHub token first')
      return
    }

    if (!importRepo.trim()) {
      toast.error('Please enter a repository (format: owner/repo)')
      return
    }

    setImporting(true)
    try {
      const result = await githubService.importFromGitHub(
        { repository: importRepo, branch: importBranch },
        accessToken
      )

      if (result.success && onImport) {
        onImport(result.files)
        toast.success(`Imported ${Object.keys(result.files).length} files from GitHub!`)
      }
    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(error.message || 'Failed to import repository')
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    if (!tokenValid) {
      toast.error('Please validate your GitHub token first')
      return
    }

    if (!projectFiles || Object.keys(projectFiles).length === 0) {
      toast.error('No project files to export')
      return
    }

    if (!exportRepo.trim()) {
      toast.error('Please enter a repository name')
      return
    }

    setExporting(true)
    try {
      const result = await githubService.exportToGitHub(
        projectFiles,
        { repository: exportRepo, isPrivate: exportPrivate },
        accessToken
      )

      if (result.success && onExport) {
        onExport(result.repositoryUrl)
        toast.success(`Project exported to GitHub: ${result.repositoryUrl}`)
      }
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export to GitHub')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Validation */}
        <div className="space-y-3">
          <div className="text-sm font-medium">GitHub Access Token</div>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={validateToken}
              disabled={!accessToken.trim() || isValidating}
              size="sm"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </Button>
          </div>
          {tokenValid && userInfo && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Connected as {userInfo.username}</span>
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            Import from GitHub
          </h4>
          <div className="space-y-2">
            <Input
              placeholder="owner/repo (e.g., facebook/react)"
              value={importRepo}
              onChange={(e) => setImportRepo(e.target.value)}
              disabled={!tokenValid || importing}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Branch (default: main)"
                value={importBranch}
                onChange={(e) => setImportBranch(e.target.value)}
                disabled={!tokenValid || importing}
                className="flex-1"
              />
              <Button
                onClick={handleImport}
                disabled={!tokenValid || !importRepo.trim() || importing}
                size="sm"
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Export to GitHub
          </h4>
          <div className="space-y-2">
            <Input
              placeholder="Repository name"
              value={exportRepo}
              onChange={(e) => setExportRepo(e.target.value)}
              disabled={!tokenValid || exporting}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={exportPrivate}
                  onCheckedChange={setExportPrivate}
                  disabled={!tokenValid || exporting}
                />
                <span className="text-sm">Private repository</span>
              </div>
              <Button
                onClick={handleExport}
                disabled={!tokenValid || !exportRepo.trim() || exporting || !projectFiles}
                size="sm"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800 space-y-1">
              <p>Create a GitHub personal access token with 'repo' scope at:</p>
              <a href="https://github.com/settings/tokens" target="_blank" className="text-blue-600 hover:underline">
                github.com/settings/tokens
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
