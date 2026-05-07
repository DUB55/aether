"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Cloud, 
  HardDrive, 
  FolderOpen, 
  Check, 
  AlertCircle,
  ArrowRight,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectTypeDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: 'cloud' | 'hybrid', localPath?: string) => void
  projectName: string
}

export function ProjectTypeDialog({ isOpen, onClose, onSelect, projectName }: ProjectTypeDialogProps) {
  const [selectedType, setSelectedType] = useState<'cloud' | 'hybrid'>('cloud')
  const [localPath, setLocalPath] = useState<string>('')
  const [isSelectingFolder, setIsSelectingFolder] = useState(false)
  const [error, setError] = useState<string>('')

  // Check if running in Tauri (desktop app)
  const [isTauri, setIsTauri] = useState(false)
  
  useEffect(() => {
    const checkTauri = () => {
      const tauri = typeof window !== 'undefined' && '__TAURI__' in window
      setIsTauri(tauri)
      if (!tauri) {
        setSelectedType('cloud') // Force cloud mode on web
      }
    }
    checkTauri()
  }, [])

  const handleFolderSelect = async () => {
    if (!isTauri) return
    
    setIsSelectingFolder(true)
    setError('')
    
    try {
      // Import Tauri API dynamically to avoid SSR issues
      const { invoke } = await import('@tauri-apps/api/core')
      
      const selected = await invoke('open_directory_dialog', {
        title: 'Select Project Folder'
      })
      
      if (selected && typeof selected === 'string') {
        setLocalPath(selected)
      }
    } catch (err) {
      console.error('Failed to select folder:', err)
      setError('Failed to select folder. Please try again.')
    } finally {
      setIsSelectingFolder(false)
    }
  }

  const handleConfirm = () => {
    if (selectedType === 'hybrid' && !localPath) {
      setError('Please select a local folder for hybrid projects')
      return
    }
    
    onSelect(selectedType, selectedType === 'hybrid' ? localPath : undefined)
    onClose()
    
    // Reset state
    setSelectedType('cloud')
    setLocalPath('')
    setError('')
  }

  const projectTypes = [
    {
      id: 'cloud' as const,
      title: 'Aether Cloud Only',
      description: 'Files stored securely in Aether cloud. Access from any device, anywhere.',
      icon: Cloud,
      features: [
        'Works on web and desktop',
        'No local storage required',
        'Instant access from anywhere',
        'Automatic cloud backup'
      ],
      recommended: !isTauri
    },
    {
      id: 'hybrid' as const,
      title: 'Cloud + Local',
      description: 'Files stored both in Aether cloud and locally on your computer.',
      icon: HardDrive,
      features: [
        'Work completely offline',
        'Local development tools',
        'Automatic cloud sync',
        'Version control integration'
      ],
      recommended: isTauri,
      disabled: !isTauri
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Choose Project Storage Type
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project name display */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Creating project:</p>
            <p className="font-medium text-lg">{projectName}</p>
          </div>

          {/* Storage type options */}
          <div className="space-y-4">
            {projectTypes.map((type) => {
              const IconComponent = type.icon
              const isSelected = selectedType === type.id
              const isDisabled = type.disabled
              
              return (
                <motion.div
                  key={type.id}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  onClick={() => !isDisabled && setSelectedType(type.id)}
                  className={cn(
                    "relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50 bg-background",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {type.recommended && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        Recommended
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{type.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{type.description}</p>
                      
                      <div className="space-y-1">
                        {type.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  {isDisabled && (
                    <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Available in desktop app only
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Local folder selection for hybrid */}
          <AnimatePresence>
            {selectedType === 'hybrid' && isTauri && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Select Local Folder
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={localPath}
                        onChange={(e) => setLocalPath(e.target.value)}
                        placeholder="Choose a folder for your project..."
                        className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFolderSelect}
                        disabled={isSelectingFolder}
                      >
                        {isSelectingFolder ? '...' : 'Browse'}
                      </Button>
                    </div>
                    
                    {localPath && (
                      <div className="text-sm text-muted-foreground">
                        <Info className="w-4 h-4 inline mr-1" />
                        Project files will be saved to: <code className="bg-muted px-1 rounded">{localPath}</code>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex items-center gap-2">
              Create Project
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
