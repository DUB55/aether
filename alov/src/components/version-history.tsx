"use client"

import React from 'react'
import { History, RotateCcw, Clock, FileCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

export interface VersionHistoryItem {
  id: string
  timestamp: number
  description: string
  filesModified: string[]
  filesSnapshot?: Record<string, string>
}

interface VersionHistoryProps {
  history: VersionHistoryItem[]
  onRestore: (id: string) => void
  className?: string
}

export function VersionHistory({ history, onRestore, className }: VersionHistoryProps) {
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Version History</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {history.length} {history.length === 1 ? 'version' : 'versions'}
        </span>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/20 mb-3" />
            <p className="text-xs text-muted-foreground">No version history yet</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Changes will be tracked automatically
            </p>
          </div>
        )}

        {history.map((item, index) => (
          <div
            key={item.id}
            className="group relative flex flex-col gap-2 p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-all"
          >
            {/* Timeline Connector */}
            {index < history.length - 1 && (
              <div className="absolute left-[19px] top-[40px] w-px h-[calc(100%+12px)] bg-border" />
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center relative z-10">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatTime(item.timestamp)}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRestore(item.id)}
                className="opacity-0 group-hover:opacity-100 h-7 px-2 text-[10px] font-bold transition-opacity"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Restore
              </Button>
            </div>

            {/* Files Modified */}
            {item.filesModified && item.filesModified.length > 0 && (
              <div className="ml-8 flex flex-wrap gap-1">
                {item.filesModified.slice(0, 3).map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50 border border-border/50"
                  >
                    <FileCode className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground truncate max-w-[100px]">
                      {file}
                    </span>
                  </div>
                ))}
                {item.filesModified.length > 3 && (
                  <div className="flex items-center px-2 py-0.5 rounded bg-muted/50 border border-border/50">
                    <span className="text-[9px] text-muted-foreground">
                      +{item.filesModified.length - 3} more
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
