// Workspace service for team collaboration
// Manages shared workspaces, roles, and permissions

export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId: string
  members: WorkspaceMember[]
  projects: string[]
  createdAt: number
  updatedAt: number
}

export interface WorkspaceMember {
  userId: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  joinedAt: number
}

interface WorkspaceRole {
  name: string
  permissions: Permission[]
}

interface Permission {
  resource: string
  actions: string[]
}

export const workspaceService = {
  // Role definitions
  roles: {
    owner: {
      name: 'Owner',
      permissions: [
        { resource: 'workspace', actions: ['*'] },
        { resource: 'projects', actions: ['*'] },
        { resource: 'members', actions: ['*'] },
        { resource: 'settings', actions: ['*'] },
      ],
    },
    admin: {
      name: 'Admin',
      permissions: [
        { resource: 'workspace', actions: ['read', 'update'] },
        { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'members', actions: ['read', 'invite', 'remove'] },
        { resource: 'settings', actions: ['read', 'update'] },
      ],
    },
    editor: {
      name: 'Editor',
      permissions: [
        { resource: 'workspace', actions: ['read'] },
        { resource: 'projects', actions: ['create', 'read', 'update'] },
        { resource: 'members', actions: ['read'] },
        { resource: 'settings', actions: ['read'] },
      ],
    },
    viewer: {
      name: 'Viewer',
      permissions: [
        { resource: 'workspace', actions: ['read'] },
        { resource: 'projects', actions: ['read'] },
        { resource: 'members', actions: ['read'] },
        { resource: 'settings', actions: ['read'] },
      ],
    },
  },

  // Create workspace
  createWorkspace: (name: string, ownerId: string, description?: string): Workspace => {
    const workspace: Workspace = {
      id: `workspace_${Date.now()}`,
      name,
      description,
      ownerId,
      members: [
        {
          userId: ownerId,
          email: '', // Will be filled from user data
          role: 'owner',
          joinedAt: Date.now(),
        },
      ],
      projects: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Store in localStorage for now (would be Firebase/Supabase in production)
    const workspaces = workspaceService.getWorkspaces()
    workspaces.push(workspace)
    localStorage.setItem('aether_workspaces', JSON.stringify(workspaces))

    return workspace
  },

  // Get all workspaces for a user
  getWorkspaces: (): Workspace[] => {
    const stored = localStorage.getItem('aether_workspaces')
    return stored ? JSON.parse(stored) : []
  },

  // Get workspace by ID
  getWorkspace: (id: string): Workspace | null => {
    const workspaces = workspaceService.getWorkspaces()
    return workspaces.find(w => w.id === id) || null
  },

  // Update workspace
  updateWorkspace: (id: string, updates: Partial<Workspace>): Workspace | null => {
    const workspaces = workspaceService.getWorkspaces()
    const index = workspaces.findIndex(w => w.id === id)
    
    if (index === -1) return null

    workspaces[index] = { ...workspaces[index], ...updates, updatedAt: Date.now() }
    localStorage.setItem('aether_workspaces', JSON.stringify(workspaces))

    return workspaces[index]
  },

  // Delete workspace
  deleteWorkspace: (id: string): boolean => {
    const workspaces = workspaceService.getWorkspaces()
    const filtered = workspaces.filter(w => w.id !== id)
    
    if (filtered.length === workspaces.length) return false

    localStorage.setItem('aether_workspaces', JSON.stringify(filtered))
    return true
  },

  // Add member to workspace
  addMember: (workspaceId: string, email: string, role: 'admin' | 'editor' | 'viewer'): boolean => {
    const workspace = workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    const member: WorkspaceMember = {
      userId: `user_${Date.now()}`, // In production, this would be the actual user ID
      email,
      role,
      joinedAt: Date.now(),
    }

    workspace.members.push(member)
    workspace.updatedAt = Date.now()
    workspaceService.updateWorkspace(workspaceId, workspace)

    return true
  },

  // Remove member from workspace
  removeMember: (workspaceId: string, userId: string): boolean => {
    const workspace = workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    // Cannot remove owner
    if (userId === workspace.ownerId) return false

    workspace.members = workspace.members.filter(m => m.userId !== userId)
    workspace.updatedAt = Date.now()
    workspaceService.updateWorkspace(workspaceId, workspace)

    return true
  },

  // Update member role
  updateMemberRole: (workspaceId: string, userId: string, newRole: 'admin' | 'editor' | 'viewer'): boolean => {
    const workspace = workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    // Cannot change owner's role
    if (userId === workspace.ownerId) return false

    const member = workspace.members.find(m => m.userId === userId)
    if (!member) return false

    member.role = newRole
    workspace.updatedAt = Date.now()
    workspaceService.updateWorkspace(workspaceId, workspace)

    return true
  },

  // Check if user has permission
  hasPermission: (workspace: Workspace, userId: string, resource: string, action: string): boolean => {
    const member = workspace.members.find(m => m.userId === userId)
    if (!member) return false

    const role = workspaceService.roles[member.role]
    if (!role) return false

    // Check if role has wildcard permission
    const wildcardPermission = role.permissions.find(p => p.resource === '*' || p.actions.includes('*'))
    if (wildcardPermission) return true

    // Check specific permission
    const permission = role.permissions.find(p => p.resource === resource)
    if (!permission) return false

    return permission.actions.includes('*') || permission.actions.includes(action)
  },

  // Add project to workspace
  addProject: (workspaceId: string, projectId: string): boolean => {
    const workspace = workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    if (!workspace.projects.includes(projectId)) {
      workspace.projects.push(projectId)
      workspace.updatedAt = Date.now()
      workspaceService.updateWorkspace(workspaceId, workspace)
    }

    return true
  },

  // Remove project from workspace
  removeProject: (workspaceId: string, projectId: string): boolean => {
    const workspace = workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    workspace.projects = workspace.projects.filter(p => p !== projectId)
    workspace.updatedAt = Date.now()
    workspaceService.updateWorkspace(workspaceId, workspace)

    return true
  },
}
