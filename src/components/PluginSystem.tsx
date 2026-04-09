"use client"

import React, { useState, useEffect } from 'react'
import { Puzzle, Plus, Trash2, Settings, Play, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Plugin {
  id: string
  name: string
  description: string
  author: string
  version: string
  enabled: boolean
  config?: Record<string, any>
}

interface PluginSystemProps {
  onPluginToggle?: (pluginId: string, enabled: boolean) => void
  onPluginConfig?: (pluginId: string, config: Record<string, any>) => void
}

export function PluginSystem({ onPluginToggle, onPluginConfig }: PluginSystemProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: 'code-formatter',
      name: 'Code Formatter',
      description: 'Automatically formats code according to style guidelines',
      author: 'Aether',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'security-scanner',
      name: 'Security Scanner',
      description: 'Scans code for potential security vulnerabilities',
      author: 'Aether',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'performance-optimizer',
      name: 'Performance Optimizer',
      description: 'Optimizes code for better performance',
      author: 'Aether',
      version: '1.0.0',
      enabled: false
    },
    {
      id: 'accessibility-checker',
      name: 'Accessibility Checker',
      description: 'Ensures code meets accessibility standards',
      author: 'Aether',
      version: '1.0.0',
      enabled: false
    }
  ])
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)

  const togglePlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === pluginId 
        ? { ...plugin, enabled: !plugin.enabled }
        : plugin
    ))
    onPluginToggle?.(pluginId, !plugins.find(p => p.id === pluginId)?.enabled)
  }

  const removePlugin = (pluginId: string) => {
    setPlugins(prev => prev.filter(plugin => plugin.id !== pluginId))
    if (selectedPlugin?.id === pluginId) {
      setSelectedPlugin(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Puzzle className="w-5 h-5" />
          Plugin System
        </h3>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Plugin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plugins.map(plugin => (
          <div
            key={plugin.id}
            className={cn(
              "p-4 rounded-xl border cursor-pointer transition-all",
              plugin.enabled 
                ? "bg-[var(--bg2)] border-[var(--bdr)]" 
                : "bg-[var(--bg)] border-[var(--bdr)] opacity-50",
              selectedPlugin?.id === plugin.id && "border-primary"
            )}
            onClick={() => setSelectedPlugin(plugin)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  plugin.enabled ? "bg-primary/20" : "bg-[var(--bg3)]"
                )}>
                  <Puzzle className={cn(
                    "w-5 h-5",
                    plugin.enabled ? "text-primary" : "text-[var(--t3)]"
                  )} />
                </div>
                <div>
                  <h4 className="font-medium">{plugin.name}</h4>
                  <p className="text-xs text-[var(--t3)]">v{plugin.version} by {plugin.author}</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  removePlugin(plugin.id)
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
            <p className="text-sm text-[var(--t2)] mb-3">{plugin.description}</p>
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant={plugin.enabled ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlugin(plugin.id)
                }}
                className="gap-2"
              >
                {plugin.enabled ? (
                  <>
                    <StopCircle className="w-4 h-4" />
                    Enabled
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Disabled
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlugin && (
        <div className="p-4 rounded-xl bg-[var(--bg2)] border border-[var(--bdr)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {selectedPlugin.name} Configuration
            </h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedPlugin(null)}
            >
              Close
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Plugin Priority</label>
              <select className="w-full p-2 rounded-lg bg-[var(--bg3)] border border-[var(--bdr)] text-sm">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Auto-apply on save</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={true}
                  className="w-4 h-4"
                />
                <span className="text-sm text-[var(--t2)]">Automatically run this plugin when saving</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
