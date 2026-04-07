"use client"

import React, { useState } from 'react'
import { File, Folder, Plus, Trash2, X, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileExplorerProps {
  files: { [key: string]: string }
  activeFile: string
  onFileSelect: (path: string) => void
  onFileCreate: (path: string) => void
  onFileDelete: (path: string) => void
}

export function FileExplorer({ files, activeFile, onFileSelect, onFileCreate, onFileDelete }: FileExplorerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (newFileName.trim()) {
      onFileCreate(newFileName.trim())
      setNewFileName('')
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/20 border-r border-white/5">
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <Folder className="w-3.5 h-3.5 text-white/40" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Explorer</span>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-2 overflow-y-auto scrollbar-none flex-1">
        {isCreating && (
          <form onSubmit={handleCreate} className="mb-2 px-2">
            <input
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={() => setIsCreating(false)}
              placeholder="filename.html"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none focus:border-white/20"
            />
          </form>
        )}

        <div className="space-y-0.5">
          {Object.keys(files).sort().map((path) => (
            <div
              key={path}
              onClick={() => onFileSelect(path)}
              className={cn(
                "group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all",
                activeFile === path ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/60"
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <File className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  activeFile === path ? "text-blue-400" : "text-white/20"
                )} />
                <span className="text-[11px] truncate">{path}</span>
              </div>
              
              {path !== 'index.html' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onFileDelete(path)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
