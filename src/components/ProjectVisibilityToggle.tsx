"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Globe, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface ProjectVisibilityToggleProps {
  projectId: string
  currentVisibility: 'public' | 'private'
  onVisibilityChange: (visibility: 'public' | 'private') => void
  className?: string
}

export function ProjectVisibilityToggle({ 
  projectId, 
  currentVisibility, 
  onVisibilityChange,
  className 
}: ProjectVisibilityToggleProps) {
  const handleToggle = (isPublic: boolean) => {
    const newVisibility = isPublic ? 'public' : 'private'
    
    // Store visibility in localStorage for now (would be Firebase/Supabase in production)
    const projectVisibilities = JSON.parse(localStorage.getItem('aether_project_visibilities') || '{}')
    projectVisibilities[projectId] = newVisibility
    localStorage.setItem('aether_project_visibilities', JSON.stringify(projectVisibilities))
    
    onVisibilityChange(newVisibility)
    
    toast.success(
      `Project is now ${newVisibility === 'public' ? 'public' : 'private'}`,
      {
        description: newVisibility === 'public' 
          ? 'Anyone with the link can view this project' 
          : 'Only you can view this project'
      }
    )
  }

  const isPublic = currentVisibility === 'public'

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Project Visibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isPublic ? (
              <Globe className="w-5 h-5 text-blue-600" />
            ) : (
              <Lock className="w-5 h-5 text-gray-600" />
            )}
            <div>
              <div className="font-medium">
                {isPublic ? 'Public Project' : 'Private Project'}
              </div>
              <div className="text-sm text-muted-foreground">
                {isPublic 
                  ? 'Visible to anyone with the link' 
                  : 'Only visible to you'}
              </div>
            </div>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={handleToggle}
          />
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Globe className="w-4 h-4 mt-0.5" />
            <div>
              <strong>Public:</strong> Anyone with the project link can view it. Great for sharing portfolios, demos, or open-source projects.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 mt-0.5" />
            <div>
              <strong>Private:</strong> Only you can view and edit the project. Best for sensitive work or projects in development.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
