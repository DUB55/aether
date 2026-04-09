// SCIM (System for Cross-domain Identity Management) service
// Handles automated user provisioning for enterprise teams

export interface SCIMUser {
  id: string
  userName: string
  name: {
    givenName: string
    familyName: string
  }
  email: string
  active: boolean
  displayName?: string
  groups?: string[]
}

export interface SCIMGroup {
  id: string
  displayName: string
  members: string[]
}

export interface SCIMConfig {
  enabled: boolean
  bearerToken: string
  endpointUrl: string
}

export const scimService = {
  // Configure SCIM for workspace
  configureSCIM: (workspaceId: string, config: SCIMConfig): boolean => {
    const scimConfigs = JSON.parse(localStorage.getItem('aether_scim_configs') || '{}')
    scimConfigs[workspaceId] = config
    localStorage.setItem('aether_scim_configs', JSON.stringify(scimConfigs))
    return true
  },

  // Get SCIM configuration
  getSCIMConfig: (workspaceId: string): SCIMConfig | null => {
    const scimConfigs = JSON.parse(localStorage.getItem('aether_scim_configs') || '{}')
    return scimConfigs[workspaceId] || null
  },

  // Create user via SCIM
  createUser: (workspaceId: string, user: Omit<SCIMUser, 'id'>): SCIMUser => {
    const newUser: SCIMUser = {
      ...user,
      id: `scim_user_${Date.now()}`
    }

    // Store user (in production, this would sync with identity provider)
    const scimUsers = JSON.parse(localStorage.getItem('aether_scim_users') || '{}')
    if (!scimUsers[workspaceId]) {
      scimUsers[workspaceId] = []
    }
    scimUsers[workspaceId].push(newUser)
    localStorage.setItem('aether_scim_users', JSON.stringify(scimUsers))

    return newUser
  },

  // Get all users
  getUsers: (workspaceId: string): SCIMUser[] => {
    const scimUsers = JSON.parse(localStorage.getItem('aether_scim_users') || '{}')
    return scimUsers[workspaceId] || []
  },

  // Update user
  updateUser: (workspaceId: string, userId: string, updates: Partial<SCIMUser>): SCIMUser | null => {
    const scimUsers = JSON.parse(localStorage.getItem('aether_scim_users') || '{}')
    const users = scimUsers[workspaceId] || []
    const index = users.findIndex(u => u.id === userId)

    if (index === -1) return null

    users[index] = { ...users[index], ...updates }
    scimUsers[workspaceId] = users
    localStorage.setItem('aether_scim_users', JSON.stringify(scimUsers))

    return users[index]
  },

  // Deactivate user
  deactivateUser: (workspaceId: string, userId: string): boolean => {
    const user = scimService.updateUser(workspaceId, userId, { active: false })
    return user !== null
  },

  // Create group
  createGroup: (workspaceId: string, group: Omit<SCIMGroup, 'id'>): SCIMGroup => {
    const newGroup: SCIMGroup = {
      ...group,
      id: `scim_group_${Date.now()}`
    }

    const scimGroups = JSON.parse(localStorage.getItem('aether_scim_groups') || '{}')
    if (!scimGroups[workspaceId]) {
      scimGroups[workspaceId] = []
    }
    scimGroups[workspaceId].push(newGroup)
    localStorage.setItem('aether_scim_groups', JSON.stringify(scimGroups))

    return newGroup
  },

  // Get all groups
  getGroups: (workspaceId: string): SCIMGroup[] => {
    const scimGroups = JSON.parse(localStorage.getItem('aether_scim_groups') || '{}')
    return scimGroups[workspaceId] || []
  },

  // Add user to group
  addUserToGroup: (workspaceId: string, groupId: string, userId: string): boolean => {
    const scimGroups = JSON.parse(localStorage.getItem('aether_scim_groups') || '{}')
    const groups = scimGroups[workspaceId] || []
    const group = groups.find(g => g.id === groupId)

    if (!group) return false

    if (!group.members.includes(userId)) {
      group.members.push(userId)
      scimGroups[workspaceId] = groups
      localStorage.setItem('aether_scim_groups', JSON.stringify(scimGroups))
    }

    return true
  },

  // Remove user from group
  removeUserFromGroup: (workspaceId: string, groupId: string, userId: string): boolean => {
    const scimGroups = JSON.parse(localStorage.getItem('aether_scim_groups') || '{}')
    const groups = scimGroups[workspaceId] || []
    const group = groups.find(g => g.id === groupId)

    if (!group) return false

    group.members = group.members.filter(id => id !== userId)
    scimGroups[workspaceId] = groups
    localStorage.setItem('aether_scim_groups', JSON.stringify(scimGroups))

    return true
  },

  // Sync with identity provider
  syncWithProvider: async (workspaceId: string): Promise<{ success: boolean; synced: number }> => {
    // In production, this would call the SCIM endpoint of the identity provider
    // For now, we'll simulate a sync
    const users = scimService.getUsers(workspaceId)
    
    return {
      success: true,
      synced: users.length
    }
  }
}
