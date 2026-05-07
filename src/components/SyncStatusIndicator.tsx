"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, 
  HardDrive, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChevronDown,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { syncEngine, type SyncStatus } from '@/lib/sync-engine'

interface SyncStatusIndicatorProps {
  projectId: string
  storageMode: 'cloud' | 'hybrid'
  localPath?: string
  className?: string
  compact?: boolean
}

export function SyncStatusIndicator({ 
  projectId, 
  storageMode, 
  localPath,
  className,
  compact = false 
}: SyncStatusIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Update sync status periodically
    const updateStatus = () => {
      const status = syncEngine.getSyncStatus(projectId)
      setSyncStatus(status)
      
      if (status?.lastSyncAt) {
        setLastSyncTime(formatRelativeTime(status.lastSyncAt))
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [projectId])

  const handleManualSync = async () => {
    if (isSyncing || storageMode !== 'hybrid') return

    setIsSyncing(true)
    try {
      // This would need to be implemented with the actual project
      // For now, just show the syncing state
      console.log('Manual sync triggered for project:', projectId)
    } catch (error) {
      console.error('Manual sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusIcon = () => {
    if (storageMode === 'cloud') {
      return <Cloud className="w-4 h-4" />
    }

    if (!syncStatus) {
      return <Clock className="w-4 h-4" />
    }

    if (syncStatus.isSyncing || isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin" />
    }

    switch (syncStatus.syncStatus) {
      case 'synced':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'conflict':
        return <AlertTriangle className="w-4 h-4" />
      case 'error':
        return <XCircle className="w-4 h-4" />
      default:
        return <HardDrive className="w-4 h-4" />
    }
  }

  const getStatusColor = () => {
    if (storageMode === 'cloud') {
      return 'text-blue-500'
    }

    if (!syncStatus) {
      return 'text-muted-foreground'
    }

    if (syncStatus.isSyncing || isSyncing) {
      return 'text-blue-500'
    }

    switch (syncStatus.syncStatus) {
      case 'synced':
        return 'text-green-500'
      case 'pending':
        return 'text-yellow-500'
      case 'conflict':
        return 'text-orange-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusText = () => {
    if (storageMode === 'cloud') {
      return 'Cloud Only'
    }

    if (!syncStatus) {
      return 'Initializing...'
    }

    if (syncStatus.isSyncing || isSyncing) {
      return 'Syncing...'
    }

    switch (syncStatus.syncStatus) {
      case 'synced':
        return 'Synced'
      case 'pending':
        return syncStatus.pendingChanges > 0 
          ? `${syncStatus.pendingChanges} pending`
          : 'Pending sync'
      case 'conflict':
        return syncStatus.conflicts > 0 
          ? `${syncStatus.conflicts} conflicts`
          : 'Conflict detected'
      case 'error':
        return 'Sync error'
      default:
        return 'Unknown'
    }
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <div className={cn("flex items-center gap-1", getStatusColor())}>
          {getStatusIcon()}
          <span className="text-xs">{getStatusText()}</span>
        </div>
      </div>
    )
  }

  return (
    <Popover open={isExpanded} onOpenChange={setIsExpanded}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-2 h-8 px-3 text-xs",
            getStatusColor(),
            "hover:bg-muted/50"
          )}
        >
          {getStatusIcon()}
          <span>{getStatusText()}</span>
          {storageMode === 'hybrid' && (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
      </PopoverTrigger>
      
      {storageMode === 'hybrid' && (
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Sync Status</h4>
              <div className={cn("flex items-center gap-1 text-xs", getStatusColor())}>
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage Mode:</span>
                <span className="font-medium">Hybrid</span>
              </div>
              
              {localPath && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Local Path:</span>
                  <span className="font-mono text-xs truncate max-w-32" title={localPath}>
                    {localPath.split('/').pop() || localPath}
                  </span>
                </div>
              )}

              {lastSyncTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span>{lastSyncTime}</span>
                </div>
              )}

              {syncStatus && (
                <>
                  {syncStatus.pendingChanges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending Changes:</span>
                      <span className="text-yellow-500">{syncStatus.pendingChanges}</span>
                    </div>
                  )}

                  {syncStatus.conflicts > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conflicts:</span>
                      <span className="text-orange-500">{syncStatus.conflicts}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleManualSync}
                disabled={isSyncing || syncStatus?.isSyncing}
                className="w-full"
                size="sm"
              >
                {isSyncing || syncStatus?.isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>

              {syncStatus?.conflicts > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Resolve Conflicts
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Hybrid projects sync between cloud and local storage</span>
              </div>
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Changes are automatically detected and synced</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}
