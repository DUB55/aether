"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  Settings, 
  Trash2, 
  UserPlus,
  Crown,
  Shield,
  Edit,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { workspaceService, Workspace, WorkspaceMember } from '@/lib/workspace-service'

interface WorkspaceManagerProps {
  currentUserId: string
  className?: string
}

export function WorkspaceManager({ currentUserId, className }: WorkspaceManagerProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')

  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = () => {
    const loaded = workspaceService.getWorkspaces()
    setWorkspaces(loaded)
  }

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      toast.error('Please enter a workspace name')
      return
    }

    const workspace = workspaceService.createWorkspace(newWorkspaceName, currentUserId, newWorkspaceDesc)
    setWorkspaces([...workspaces, workspace])
    setSelectedWorkspace(workspace)
    setNewWorkspaceName('')
    setNewWorkspaceDesc('')
    setShowCreateForm(false)
    toast.success('Workspace created successfully!')
  }

  const handleDeleteWorkspace = (workspaceId: string) => {
    const workspace = workspaceService.getWorkspace(workspaceId)
    if (!workspace) return

    if (workspace.ownerId !== currentUserId) {
      toast.error('Only workspace owners can delete workspaces')
      return
    }

    if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      workspaceService.deleteWorkspace(workspaceId)
      setWorkspaces(workspaces.filter(w => w.id !== workspaceId))
      if (selectedWorkspace?.id === workspaceId) {
        setSelectedWorkspace(null)
      }
      toast.success('Workspace deleted')
    }
  }

  const handleInviteMember = () => {
    if (!selectedWorkspace) return

    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    const success = workspaceService.addMember(selectedWorkspace.id, inviteEmail, inviteRole)
    if (success) {
      const updated = workspaceService.getWorkspace(selectedWorkspace.id)
      setSelectedWorkspace(updated)
      setInviteEmail('')
      setShowInviteForm(false)
      toast.success('Member invited successfully!')
    } else {
      toast.error('Failed to invite member')
    }
  }

  const handleRemoveMember = (memberId: string) => {
    if (!selectedWorkspace) return

    if (selectedWorkspace.ownerId !== currentUserId) {
      toast.error('Only workspace owners can remove members')
      return
    }

    if (confirm('Are you sure you want to remove this member?')) {
      const success = workspaceService.removeMember(selectedWorkspace.id, memberId)
      if (success) {
        const updated = workspaceService.getWorkspace(selectedWorkspace.id)
        setSelectedWorkspace(updated)
        toast.success('Member removed')
      }
    }
  }

  const handleUpdateRole = (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    if (!selectedWorkspace) return

    if (selectedWorkspace.ownerId !== currentUserId) {
      toast.error('Only workspace owners can update roles')
      return
    }

    const success = workspaceService.updateMemberRole(selectedWorkspace.id, memberId, newRole)
    if (success) {
      const updated = workspaceService.getWorkspace(selectedWorkspace.id)
      setSelectedWorkspace(updated)
      toast.success('Role updated')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'editor':
        return <Edit className="w-4 h-4" />
      case 'viewer':
        return <Eye className="w-4 h-4" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-purple-100 text-purple-800',
      editor: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800',
    }
    return colors[role as keyof typeof colors] || colors.viewer
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Workspaces
            </div>
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Workspace
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCreateForm && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <Input
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={newWorkspaceDesc}
                onChange={(e) => setNewWorkspaceDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateWorkspace} size="sm">
                  Create
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {workspaces.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No workspaces yet</p>
              <p className="text-sm">Create a workspace to collaborate with your team</p>
            </div>
          ) : (
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedWorkspace?.id === workspace.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedWorkspace(workspace)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{workspace.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {workspace.members.length} members
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {workspace.projects.length} projects
                        </Badge>
                      </div>
                      {workspace.description && (
                        <p className="text-sm text-muted-foreground mt-1">{workspace.description}</p>
                      )}
                    </div>
                    {workspace.ownerId === currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteWorkspace(workspace.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedWorkspace && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {selectedWorkspace.name} - Members
              </div>
              <Button onClick={() => setShowInviteForm(true)} size="sm">
                <UserPlus className="w-4 h-4 mr-1" />
                Invite
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showInviteForm && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <Input
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full p-2 border rounded"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={handleInviteMember} size="sm">
                    Send Invite
                  </Button>
                  <Button onClick={() => setShowInviteForm(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {selectedWorkspace.members.map((member) => (
                <div
                  key={member.userId}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {getRoleIcon(member.role)}
                    <div>
                      <p className="font-medium">{member.email || 'User'}</p>
                      <Badge className={getRoleBadge(member.role)} variant="secondary">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  {selectedWorkspace.ownerId === currentUserId && member.userId !== currentUserId && (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.userId, e.target.value as any)}
                        className="text-sm p-1 border rounded"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
