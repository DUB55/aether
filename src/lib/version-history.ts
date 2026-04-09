// Version history and rollback service
// Manages project versions and allows rollback to previous states

export interface ProjectVersion {
  id: string
  projectId: string
  version: string
  description: string
  files: Record<string, string>
  createdAt: number
  createdBy: string
  isCurrent: boolean
}

export interface RollbackResult {
  success: boolean
  message: string
  restoredVersion?: ProjectVersion
}

export const versionHistoryService = {
  // Save a new version
  saveVersion: (
    projectId: string,
    files: Record<string, string>,
    description: string,
    createdBy: string
  ): ProjectVersion => {
    const versions = versionHistoryService.getVersions(projectId)
    
    // Mark previous current version as not current
    versions.forEach(v => v.isCurrent = false)
    
    // Generate version number
    const versionNumber = versions.length + 1
    
    const newVersion: ProjectVersion = {
      id: `version_${Date.now()}`,
      projectId,
      version: `v${versionNumber}`,
      description,
      files: { ...files },
      createdAt: Date.now(),
      createdBy,
      isCurrent: true
    }
    
    versions.push(newVersion)
    
    // Store in localStorage (in production, this would be in Firebase/Supabase)
    const allVersions = JSON.parse(localStorage.getItem('aether_version_history') || '{}')
    allVersions[projectId] = versions
    localStorage.setItem('aether_version_history', JSON.stringify(allVersions))
    
    return newVersion
  },

  // Get all versions for a project
  getVersions: (projectId: string): ProjectVersion[] => {
    const allVersions = JSON.parse(localStorage.getItem('aether_version_history') || '{}')
    return allVersions[projectId] || []
  },

  // Get a specific version
  getVersion: (projectId: string, versionId: string): ProjectVersion | null => {
    const versions = versionHistoryService.getVersions(projectId)
    return versions.find(v => v.id === versionId) || null
  },

  // Get current version
  getCurrentVersion: (projectId: string): ProjectVersion | null => {
    const versions = versionHistoryService.getVersions(projectId)
    return versions.find(v => v.isCurrent) || null
  },

  // Rollback to a specific version
  rollbackToVersion: (projectId: string, versionId: string): RollbackResult => {
    try {
      const versions = versionHistoryService.getVersions(projectId)
      const targetVersion = versions.find(v => v.id === versionId)
      
      if (!targetVersion) {
        return {
          success: false,
          message: 'Version not found'
        }
      }
      
      // Create a new version with the rolled-back state
      const rollbackVersion = versionHistoryService.saveVersion(
        projectId,
        targetVersion.files,
        `Rollback to ${targetVersion.version}`,
        'system'
      )
      
      return {
        success: true,
        message: `Successfully rolled back to ${targetVersion.version}`,
        restoredVersion: rollbackVersion
      }
    } catch (error) {
      console.error('Rollback error:', error)
      return {
        success: false,
        message: 'Failed to rollback to version'
      }
    }
  },

  // Delete a version (cannot delete current version)
  deleteVersion: (projectId: string, versionId: string): boolean => {
    try {
      const versions = versionHistoryService.getVersions(projectId)
      const version = versions.find(v => v.id === versionId)
      
      if (!version) return false
      if (version.isCurrent) {
        console.error('Cannot delete current version')
        return false
      }
      
      const filteredVersions = versions.filter(v => v.id !== versionId)
      
      const allVersions = JSON.parse(localStorage.getItem('aether_version_history') || '{}')
      allVersions[projectId] = filteredVersions
      localStorage.setItem('aether_version_history', JSON.stringify(allVersions))
      
      return true
    } catch (error) {
      console.error('Delete version error:', error)
      return false
    }
  },

  // Compare two versions
  compareVersions: (projectId: string, versionId1: string, versionId2: string): {
    added: string[]
    modified: string[]
    deleted: string[]
  } => {
    const version1 = versionHistoryService.getVersion(projectId, versionId1)
    const version2 = versionHistoryService.getVersion(projectId, versionId2)
    
    if (!version1 || !version2) {
      return { added: [], modified: [], deleted: [] }
    }
    
    const files1 = Object.keys(version1.files)
    const files2 = Object.keys(version2.files)
    
    const added = files2.filter(f => !files1.includes(f))
    const deleted = files1.filter(f => !files2.includes(f))
    const modified = files1.filter(f => files2.includes(f) && version1.files[f] !== version2.files[f])
    
    return { added, modified, deleted }
  },

  // Get version statistics
  getVersionStats: (projectId: string) => {
    const versions = versionHistoryService.getVersions(projectId)
    
    return {
      totalVersions: versions.length,
      currentVersion: versions.find(v => v.isCurrent)?.version || 'none',
      firstVersion: versions[0]?.version || 'none',
      lastVersion: versions[versions.length - 1]?.version || 'none',
      totalStorage: JSON.stringify(versions).length // Approximate storage size
    }
  }
}
