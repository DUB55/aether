import { type Project, type FileChange, type SyncConflict, type SyncSession } from '@/types'
import { localStorageService } from './local-storage'
import { fileWatcherService } from './file-watcher'
import { diffDetectionService } from './diff-detection'
import { conflictResolutionService } from './conflict-resolution'

export interface SyncOptions {
  autoResolveConflicts?: boolean
  conflictResolution?: 'latest' | 'manual' | 'merge'
  bidirectional?: boolean
  excludePatterns?: string[]
}

export interface SyncResult {
  success: boolean
  sessionId: string
  changes: FileChange[]
  conflicts: SyncConflict[]
  resolvedConflicts: string[]
  errors: string[]
  summary: {
    uploaded: number
    downloaded: number
    conflicts: number
    errors: number
  }
  duration: number
}

export interface SyncStatus {
  isSyncing: boolean
  lastSyncAt?: string
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error'
  pendingChanges: number
  conflicts: number
}

export class SyncEngine {
  private static instance: SyncEngine
  private activeSyncs: Map<string, SyncSession> = new Map()
  private syncStatuses: Map<string, SyncStatus> = new Map()
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine()
    }
    return SyncEngine.instance
  }

  /**
   * Start auto-sync for a hybrid project
   */
  async startAutoSync(
    project: Project,
    options: SyncOptions = {}
  ): Promise<void> {
    if (project.storageMode !== 'hybrid' || !project.localPath) {
      throw new Error('Auto-sync is only available for hybrid projects with local paths')
    }

    const projectId = project.id
    
    // Stop existing auto-sync if running
    await this.stopAutoSync(projectId)

    // Set up file watcher
    await fileWatcherService.startWatching(
      projectId,
      project.localPath,
      {
        debounceMs: 1000,
        ignorePatterns: options.excludePatterns || [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/.git/**',
          '**/.aether/**',
          '**/*.log'
        ]
      },
      (changes) => this.handleFileChanges(projectId, changes)
    )

    // Set up periodic sync
    const syncInterval = setInterval(() => {
      this.syncProject(project, options).catch(error => {
        console.error(`[SyncEngine] Auto-sync failed for project ${projectId}:`, error)
      })
    }, (project.settings?.syncInterval || 5) * 60 * 1000) // Convert minutes to milliseconds

    this.syncIntervals.set(projectId, syncInterval)

    // Initialize sync status
    this.syncStatuses.set(projectId, {
      isSyncing: false,
      syncStatus: 'synced',
      pendingChanges: 0,
      conflicts: 0
    })

    console.log(`[SyncEngine] Auto-sync started for project ${projectId}`)
  }

  /**
   * Stop auto-sync for a project
   */
  async stopAutoSync(projectId: string): Promise<void> {
    // Stop file watcher
    await fileWatcherService.stopWatching(projectId)

    // Clear sync interval
    const interval = this.syncIntervals.get(projectId)
    if (interval) {
      clearInterval(interval)
      this.syncIntervals.delete(projectId)
    }

    console.log(`[SyncEngine] Auto-sync stopped for project ${projectId}`)
  }

  /**
   * Manual sync for a project
   */
  async syncProject(
    project: Project,
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    if (project.storageMode !== 'hybrid' || !project.localPath) {
      throw new Error('Sync is only available for hybrid projects with local paths')
    }

    const projectId = project.id
    const startTime = Date.now()
    const sessionId = `sync-${projectId}-${startTime}`

    console.log(`[SyncEngine] Starting manual sync for project ${projectId}`)

    // Update sync status
    const status = this.syncStatuses.get(projectId) || {
      isSyncing: false,
      syncStatus: 'synced',
      pendingChanges: 0,
      conflicts: 0
    }
    status.isSyncing = true
    status.syncStatus = 'pending'
    this.syncStatuses.set(projectId, status)

    try {
      // Create sync session
      const session: SyncSession = {
        id: sessionId,
        projectId,
        startTime: new Date().toISOString(),
        status: 'in-progress',
        changes: [],
        conflicts: []
      }
      this.activeSyncs.set(sessionId, session)

      // Detect differences
      const diffResult = await diffDetectionService.detectDifferences(
        project,
        project.localPath,
        {
          ignoreWhitespace: true,
          conflictResolution: options.conflictResolution || 'latest'
        }
      )

      console.log(`[SyncEngine] Detected ${diffResult.changes.length} changes, ${diffResult.conflicts.length} conflicts`)

      // Handle conflicts
      let resolvedConflicts: string[] = []
      if (diffResult.conflicts.length > 0) {
        if (options.autoResolveConflicts) {
          const conflictResults = await this.autoResolveConflicts(
            diffResult.conflicts,
            options.conflictResolution || 'latest'
          )
          resolvedConflicts = conflictResults.successful
        } else {
          // Add conflicts to session for manual resolution
          session.conflicts = diffResult.conflicts
        }
      }

      // Apply changes
      const syncChanges = await this.applyChanges(
        project,
        diffResult.changes,
        options.bidirectional !== false
      )

      // Update session
      session.changes = syncChanges
      session.endTime = new Date().toISOString()
      session.status = 'completed'

      // Update project metadata
      await this.updateProjectMetadata(project, syncChanges)

      // Update sync status
      status.isSyncing = false
      status.syncStatus = diffResult.conflicts.length > resolvedConflicts.length ? 'conflict' : 'synced'
      status.pendingChanges = 0
      status.conflicts = diffResult.conflicts.length - resolvedConflicts.length
      status.lastSyncAt = session.endTime

      const duration = Date.now() - startTime
      const result: SyncResult = {
        success: true,
        sessionId,
        changes: syncChanges,
        conflicts: diffResult.conflicts,
        resolvedConflicts,
        errors: [],
        summary: {
          uploaded: syncChanges.filter(c => c.source === 'local').length,
          downloaded: syncChanges.filter(c => c.source === 'cloud').length,
          conflicts: diffResult.conflicts.length,
          errors: 0
        },
        duration
      }

      console.log(`[SyncEngine] Sync completed for project ${projectId} in ${duration}ms`)
      return result

    } catch (error) {
      console.error(`[SyncEngine] Sync failed for project ${projectId}:`, error)

      // Update sync status
      status.isSyncing = false
      status.syncStatus = 'error'
      this.syncStatuses.set(projectId, status)

      // Update session
      const session = this.activeSyncs.get(sessionId)
      if (session) {
        session.status = 'failed'
        session.endTime = new Date().toISOString()
        session.errorMessage = error instanceof Error ? error.message : 'Unknown error'
      }

      const duration = Date.now() - startTime
      return {
        success: false,
        sessionId,
        changes: [],
        conflicts: [],
        resolvedConflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        summary: {
          uploaded: 0,
          downloaded: 0,
          conflicts: 0,
          errors: 1
        },
        duration
      }
    } finally {
      // Clean up session
      this.activeSyncs.delete(sessionId)
    }
  }

  /**
   * Handle file changes from file watcher
   */
  private async handleFileChanges(projectId: string, changes: FileChange[]): Promise<void> {
    const status = this.syncStatuses.get(projectId)
    if (!status) return

    status.pendingChanges += changes.length
    status.syncStatus = 'pending'
    this.syncStatuses.set(projectId, status)

    console.log(`[SyncEngine] File changes detected for project ${projectId}: ${changes.length} changes`)
  }

  /**
   * Auto-resolve conflicts
   */
  private async autoResolveConflicts(
    conflicts: SyncConflict[],
    resolution: 'latest' | 'manual' | 'merge'
  ): Promise<{ successful: string[]; failed: string[] }> {
    const successful: string[] = []
    const failed: string[] = []

    for (const conflict of conflicts) {
      try {
        const canAutoResolve = conflictResolutionService.canAutoResolve(conflict)
        
        if (canAutoResolve) {
          const resolved = await conflictResolutionService.resolveConflict(
            conflict,
            resolution === 'latest' ? 'cloud' : resolution === 'manual' ? 'local' : resolution,
            undefined,
            { strategy: 'auto-merge' }
          )
          successful.push(conflict.id)
        } else {
          failed.push(conflict.id)
        }
      } catch (error) {
        failed.push(conflict.id)
        console.error(`[SyncEngine] Failed to auto-resolve conflict ${conflict.id}:`, error)
      }
    }

    return { successful, failed }
  }

  /**
   * Apply changes to local and cloud
   */
  private async applyChanges(
    project: Project,
    changes: FileChange[],
    bidirectional: boolean
  ): Promise<FileChange[]> {
    const appliedChanges: FileChange[] = []

    if (!project.localPath) {
      throw new Error('Project local path is required for sync')
    }

    for (const change of changes) {
      try {
        if (change.source === 'local') {
          // Upload local changes to cloud
          await this.applyLocalChange(project, change)
          appliedChanges.push(change)
        } else if (bidirectional && change.source === 'cloud') {
          // Download cloud changes to local
          await this.applyCloudChange(project, change)
          appliedChanges.push(change)
        }
      } catch (error) {
        console.error(`[SyncEngine] Failed to apply change ${change.filePath}:`, error)
        throw error
      }
    }

    return appliedChanges
  }

  /**
   * Apply local change to cloud
   */
  private async applyLocalChange(project: Project, change: FileChange): Promise<void> {
    const filePath = change.filePath
    const localPath = `${project.localPath}/${filePath}`

    switch (change.type) {
      case 'added':
      case 'modified':
        // Read local file and update project
        const content = await localStorageService.readFile(localPath)
        project.files[filePath] = content
        break

      case 'deleted':
        // Remove from project files
        delete project.files[filePath]
        break
    }
  }

  /**
   * Apply cloud change to local
   */
  private async applyCloudChange(project: Project, change: FileChange): Promise<void> {
    if (!project.localPath) return

    const localPath = `${project.localPath}/${change.filePath}`

    switch (change.type) {
      case 'added':
      case 'modified':
        // Write cloud content to local file
        const content = project.files[change.filePath]
        if (content) {
          await localStorageService.writeFile(localPath, content)
        }
        break

      case 'deleted':
        // Delete local file
        await localStorageService.deleteFile(localPath)
        break
    }
  }

  /**
   * Update project metadata after sync
   */
  private async updateProjectMetadata(project: Project, changes: FileChange[]): Promise<void> {
    if (!project.localPath) return

    try {
      // Update last sync time
      project.lastSyncAt = new Date().toISOString()
      project.syncStatus = 'synced'

      // Update local file hashes
      const localHashes = await localStorageService.computeProjectHashes(project.localPath)
      project.localFileHashes = localHashes

      // Update cloud file hashes
      const cloudHashes: Record<string, string> = {}
      for (const [filePath, content] of Object.entries(project.files)) {
        cloudHashes[filePath] = await this.computeContentHash(content)
      }
      project.cloudFileHashes = cloudHashes

      // Update project metadata file
      const metadata = await localStorageService.getProjectMetadata(project.localPath)
      if (metadata) {
        metadata.lastSyncAt = project.lastSyncAt
        metadata.syncStatus = project.syncStatus
        await localStorageService.updateProjectMetadata(project.localPath, metadata)
      }

      console.log(`[SyncEngine] Updated metadata for project ${project.id}`)
    } catch (error) {
      console.error(`[SyncEngine] Failed to update metadata for project ${project.id}:`, error)
    }
  }

  /**
   * Compute content hash
   */
  private async computeContentHash(content: string): Promise<string> {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Get sync status for a project
   */
  getSyncStatus(projectId: string): SyncStatus | null {
    return this.syncStatuses.get(projectId) || null
  }

  /**
   * Get active sync sessions
   */
  getActiveSyncs(): SyncSession[] {
    return Array.from(this.activeSyncs.values())
  }

  /**
   * Resolve conflicts manually
   */
  async resolveConflicts(
    projectId: string,
    resolutions: Array<{ conflictId: string; resolution: 'local' | 'cloud' | 'merge'; mergedContent?: string }>
  ): Promise<{ successful: string[]; failed: string[] }> {
    const status = this.syncStatuses.get(projectId)
    if (!status) {
      throw new Error('Project not found or not syncing')
    }

    const session = Array.from(this.activeSyncs.values()).find(s => s.projectId === projectId)
    if (!session) {
      throw new Error('No active sync session found')
    }

    const result = await conflictResolutionService.resolveMultipleConflicts(
      session.conflicts,
      resolutions.map(r => ({
        conflictId: r.conflictId,
        resolution: r.resolution,
        resolvedContent: r.mergedContent,
        resolvedAt: new Date().toISOString()
      })),
      {} as Project // This would need to be passed in properly
    )

    if (result.success) {
      status.conflicts = 0
      status.syncStatus = 'synced'
    }

    return {
      successful: result.resolvedConflicts.map(r => r.conflictId),
      failed: result.failedConflicts
    }
  }

  /**
   * Stop all sync operations
   */
  async stopAllSyncs(): Promise<void> {
    // Stop all auto-sync intervals
    for (const [projectId, interval] of this.syncIntervals) {
      clearInterval(interval)
    }
    this.syncIntervals.clear()

    // Stop all file watchers
    await fileWatcherService.stopAllWatchers()

    // Clear all status
    this.syncStatuses.clear()
    this.activeSyncs.clear()

    console.log('[SyncEngine] All sync operations stopped')
  }
}

// Export singleton instance
export const syncEngine = SyncEngine.getInstance()
