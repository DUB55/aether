"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  History, 
  RotateCw, 
  Trash2, 
  Eye, 
  GitBranch,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { versionHistoryService, ProjectVersion } from '@/lib/version-history'

interface VersionHistoryProps {
  projectId: string
  currentUserId: string
  onRollback?: (files: Record<string, string>) => void
  onPreview?: (version: ProjectVersion) => void
  className?: string
}

export function VersionHistory({ 
  projectId, 
  currentUserId, 
  onRollback, 
  onPreview,
  className 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ProjectVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [compareVersionId, setCompareVersionId] = useState<string>('')
  const [newDescription, setNewDescription] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [currentFiles, setCurrentFiles] = useState<Record<string, string>>({})

  useEffect(() => {
    loadVersions()
  }, [projectId])

  const loadVersions = () => {
    const loaded = versionHistoryService.getVersions(projectId)
    setVersions(loaded.sort((a, b) => b.createdAt - a.createdAt))
  }

  const handleSaveVersion = () => {
    if (!newDescription.trim()) {
      toast.error('Please enter a description for this version')
      return
    }

    const version = versionHistoryService.saveVersion(
      projectId,
      currentFiles,
      newDescription,
      currentUserId
    )
    
    loadVersions()
    setNewDescription('')
    setShowSaveForm(false)
    toast.success('Version saved successfully')
  }

  const handleRollback = (versionId: string) => {
    if (confirm('Are you sure you want to rollback to this version? This will create a new version with the rolled-back state.')) {
      const result = versionHistoryService.rollbackToVersion(projectId, versionId)
      
      if (result.success) {
        loadVersions()
        if (result.restoredVersion && onRollback) {
          onRollback(result.restoredVersion.files)
        }
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    }
  }

  const handleDelete = (versionId: string) => {
    if (confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
      const deleted = versionHistoryService.deleteVersion(projectId, versionId)
      
      if (deleted) {
        loadVersions()
        toast.success('Version deleted')
      } else {
        toast.error('Failed to delete version')
      }
    }
  }

  const handlePreview = (version: ProjectVersion) => {
    setSelectedVersion(version)
    if (onPreview) {
      onPreview(version)
    }
  }

  const handleCompare = () => {
    if (!compareVersionId) {
      toast.error('Please select a version to compare')
      return
    }

    const current = versionHistoryService.getCurrentVersion(projectId)
    if (!current) {
      toast.error('No current version to compare')
      return
    }

    const diff = versionHistoryService.compareVersions(projectId, current.id, compareVersionId)
    
    toast.success(
      `Comparison: ${diff.added.length} added, ${diff.modified.length} modified, ${diff.deleted.length} deleted`
    )
    
    console.log('Comparison result:', diff)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const stats = versionHistoryService.getVersionStats(projectId)

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Version History
            </div>
            <Button onClick={() => setShowSaveForm(!showSaveForm)} size="sm">
              <GitBranch className="w-4 h-4 mr-1" />
              Save Version
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSaveForm && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <Input
                placeholder="Version description (e.g., 'Fixed login bug')"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveVersion} size="sm">
                  Save
                </Button>
                <Button onClick={() => setShowSaveForm(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold">{stats.totalVersions}</div>
              <div className="text-xs text-muted-foreground">Total Versions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.currentVersion}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{stats.firstVersion}</div>
              <div className="text-xs text-muted-foreground">First</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{stats.lastVersion}</div>
              <div className="text-xs text-muted-foreground">Latest</div>
            </div>
          </div>

          {/* Compare */}
          <div className="flex gap-2 items-center">
            <select
              value={compareVersionId}
              onChange={(e) => setCompareVersionId(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Select version to compare</option>
              {versions.map(v => (
                <option key={v.id} value={v.id}>
                  {v.version} - {v.description}
                </option>
              ))}
            </select>
            <Button onClick={handleCompare} variant="outline" size="sm" disabled={!compareVersionId}>
              Compare
            </Button>
          </div>

          {/* Version List */}
          {versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No versions saved yet</p>
              <p className="text-sm">Save your first version to start tracking changes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 rounded-lg border ${
                    version.isCurrent ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {version.isCurrent && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={version.isCurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {version.version}
                          </Badge>
                          {version.isCurrent && (
                            <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                          )}
                        </div>
                        <div className="font-medium">{version.description}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(version.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {version.createdBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {Object.keys(version.files).length} files
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(version)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!version.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRollback(version.id)}
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      )}
                      {!version.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(version.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
