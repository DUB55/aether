import { type Project, type FileChange } from '@/types'
import { localStorageService } from './local-storage'

export interface FileWatcherEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed'
  filePath: string
  oldPath?: string // For renamed files
  timestamp: string
}

export interface FileWatcherConfig {
  debounceMs?: number
  ignorePatterns?: string[]
  includePatterns?: string[]
}

export class FileWatcherService {
  private static instance: FileWatcherService
  private watchers: Map<string, FileWatcherInstance> = new Map()
  private isDesktop: boolean

  static getInstance(): FileWatcherService {
    if (!FileWatcherService.instance) {
      FileWatcherService.instance = new FileWatcherService()
    }
    return FileWatcherService.instance
  }

  constructor() {
    this.isDesktop = typeof window !== 'undefined' && '__TAURI__' in window
  }

  /**
   * Start watching a project directory for changes
   */
  async startWatching(
    projectId: string,
    projectPath: string,
    config: FileWatcherConfig = {},
    onChange: (changes: FileChange[]) => void
  ): Promise<void> {
    if (!this.isDesktop) {
      console.warn('[FileWatcherService] File watching is only available in desktop app')
      return
    }

    // Stop existing watcher for this project if any
    if (this.watchers.has(projectId)) {
      await this.stopWatching(projectId)
    }

    const watcher = new FileWatcherInstance(projectId, projectPath, config, onChange)
    this.watchers.set(projectId, watcher)

    try {
      await watcher.start()
      console.log('[FileWatcherService] Started watching project:', projectId)
    } catch (error) {
      console.error('[FileWatcherService] Failed to start watcher:', error)
      this.watchers.delete(projectId)
      throw error
    }
  }

  /**
   * Stop watching a project directory
   */
  async stopWatching(projectId: string): Promise<void> {
    const watcher = this.watchers.get(projectId)
    if (watcher) {
      await watcher.stop()
      this.watchers.delete(projectId)
      console.log('[FileWatcherService] Stopped watching project:', projectId)
    }
  }

  /**
   * Stop all watchers
   */
  async stopAllWatchers(): Promise<void> {
    const stopPromises = Array.from(this.watchers.keys()).map(projectId => 
      this.stopWatching(projectId)
    )
    
    await Promise.all(stopPromises)
    console.log('[FileWatcherService] Stopped all watchers')
  }

  /**
   * Check if a project is being watched
   */
  isWatching(projectId: string): boolean {
    return this.watchers.has(projectId)
  }

  /**
   * Get list of watched projects
   */
  getWatchedProjects(): string[] {
    return Array.from(this.watchers.keys())
  }

  /**
   * Get watcher status for a project
   */
  getWatcherStatus(projectId: string): 'active' | 'stopped' | 'error' | null {
    const watcher = this.watchers.get(projectId)
    return watcher?.status || null
  }
}

class FileWatcherInstance {
  private projectId: string
  private projectPath: string
  private config: FileWatcherConfig
  private onChange: (changes: FileChange[]) => void
  public status: 'active' | 'stopped' | 'error' = 'stopped'
  private debounceTimer: NodeJS.Timeout | null = null
  private pendingChanges: Map<string, FileWatcherEvent> = new Map()
  private lastKnownHashes: Map<string, string> = new Map()

  constructor(
    projectId: string,
    projectPath: string,
    config: FileWatcherConfig,
    onChange: (changes: FileChange[]) => void
  ) {
    this.projectId = projectId
    this.projectPath = projectPath
    this.config = {
      debounceMs: 500, // Default debounce 500ms
      ignorePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/.aether/**',
        '**/*.log',
        '**/.DS_Store',
        '**/Thumbs.db'
      ],
      includePatterns: [
        '**/*'
      ],
      ...config
    }
    this.onChange = onChange
  }

  async start(): Promise<void> {
    this.status = 'active'
    
    // Initialize with current file hashes
    try {
      this.lastKnownHashes = await this.computeAllFileHashes()
    } catch (error) {
      console.error('[FileWatcherInstance] Failed to initialize file hashes:', error)
      this.status = 'error'
      throw error
    }

    // Start polling for changes (since we can't use native file system watchers easily)
    this.startPolling()
  }

  async stop(): Promise<void> {
    this.status = 'stopped'
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  private startPolling(): void {
    const pollInterval = 2000 // Poll every 2 seconds

    const poll = async () => {
      if (this.status !== 'active') {
        return
      }

      try {
        const currentHashes = await this.computeAllFileHashes()
        const changes = this.detectChanges(this.lastKnownHashes, currentHashes)
        
        if (changes.length > 0) {
          this.debounceChanges(changes)
        }

        this.lastKnownHashes = currentHashes
      } catch (error) {
        console.error('[FileWatcherInstance] Error during polling:', error)
        this.status = 'error'
      }

      // Schedule next poll
      if (this.status === 'active') {
        setTimeout(poll, pollInterval)
      }
    }

    // Start first poll
    poll()
  }

  private async computeAllFileHashes(): Promise<Map<string, string>> {
    try {
      const hashes = await localStorageService.computeProjectHashes(this.projectPath)
      return new Map(Object.entries(hashes))
    } catch (error) {
      console.error('[FileWatcherInstance] Failed to compute hashes:', error)
      return new Map()
    }
  }

  private detectChanges(
    previousHashes: Map<string, string>,
    currentHashes: Map<string, string>
  ): FileChange[] {
    const changes: FileChange[] = []

    // Check for modified and new files
    for (const [filePath, currentHash] of currentHashes.entries()) {
      if (this.shouldIgnoreFile(filePath)) {
        continue
      }

      const previousHash = previousHashes.get(filePath)
      
      if (!previousHash) {
        // New file
        changes.push({
          filePath,
          type: 'added',
          timestamp: new Date().toISOString(),
          source: 'local'
        })
      } else if (previousHash !== currentHash) {
        // Modified file
        changes.push({
          filePath,
          type: 'modified',
          timestamp: new Date().toISOString(),
          source: 'local'
        })
      }
    }

    // Check for deleted files
    for (const [filePath, previousHash] of previousHashes.entries()) {
      if (this.shouldIgnoreFile(filePath)) {
        continue
      }

      if (!currentHashes.has(filePath)) {
        // Deleted file
        changes.push({
          filePath,
          type: 'deleted',
          timestamp: new Date().toISOString(),
          source: 'local'
        })
      }
    }

    return changes
  }

  private shouldIgnoreFile(filePath: string): boolean {
    // Check ignore patterns
    for (const pattern of this.config.ignorePatterns || []) {
      if (this.matchesPattern(filePath, pattern)) {
        return true
      }
    }

    // Check include patterns (if specified)
    if (this.config.includePatterns && this.config.includePatterns.length > 0) {
      for (const pattern of this.config.includePatterns) {
        if (this.matchesPattern(filePath, pattern)) {
          return false
        }
      }
      return true // Not included in any pattern
    }

    return false
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple glob pattern matching
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]')
    
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(filePath)
  }

  private debounceChanges(changes: FileChange[]): void {
    // Add changes to pending map
    for (const change of changes) {
      this.pendingChanges.set(change.filePath, {
        type: change.type as 'created' | 'modified' | 'deleted',
        filePath: change.filePath,
        timestamp: change.timestamp
      })
    }

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.flushChanges()
    }, this.config.debounceMs || 500)
  }

  private flushChanges(): void {
    if (this.pendingChanges.size === 0) {
      return
    }

    const changes: FileChange[] = Array.from(this.pendingChanges.values()).map(event => ({
      filePath: event.filePath,
      type: event.type as 'added' | 'modified' | 'deleted',
      timestamp: event.timestamp,
      source: 'local' as const
    }))

    this.pendingChanges.clear()
    this.onChange(changes)
  }
}

// Export singleton instance
export const fileWatcherService = FileWatcherService.getInstance()
