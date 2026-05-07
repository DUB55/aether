import { type Project, type FileChange, type SyncConflict } from '@/types'
import { localStorageService } from './local-storage'

export interface DiffResult {
  changes: FileChange[]
  conflicts: SyncConflict[]
  summary: {
    added: number
    modified: number
    deleted: number
    conflicts: number
  }
}

export interface DiffOptions {
  ignoreWhitespace?: boolean
  ignoreCase?: boolean
  conflictResolution?: 'latest' | 'manual' | 'merge'
}

export class DiffDetectionService {
  private static instance: DiffDetectionService

  static getInstance(): DiffDetectionService {
    if (!DiffDetectionService.instance) {
      DiffDetectionService.instance = new DiffDetectionService()
    }
    return DiffDetectionService.instance
  }

  /**
   * Compare cloud and local files to detect changes and conflicts
   */
  async detectDifferences(
    project: Project,
    localPath: string,
    options: DiffOptions = {}
  ): Promise<DiffResult> {
    if (!localStorageService.isDesktop()) {
      throw new Error('Diff detection is only available in desktop app')
    }

    try {
      console.log('[DiffDetectionService] Starting diff detection for project:', project.id)

      // Get local file hashes
      const localHashes = await localStorageService.computeProjectHashes(localPath)
      
      // Compute cloud file hashes
      const cloudHashes = await this.computeCloudHashes(project.files)

      // Detect changes
      const changes = await this.detectChanges(project, localHashes, cloudHashes)
      
      // Detect conflicts
      const conflicts = await this.detectConflicts(project, localPath, changes, options)

      // Create summary
      const summary = this.createSummary(changes, conflicts)

      console.log('[DiffDetectionService] Diff detection completed:', {
        changes: changes.length,
        conflicts: conflicts.length,
        summary
      })

      return {
        changes,
        conflicts,
        summary
      }
    } catch (error) {
      console.error('[DiffDetectionService] Failed to detect differences:', error)
      throw error
    }
  }

  /**
   * Detect changes between local and cloud files
   */
  private async detectChanges(
    project: Project,
    localHashes: Record<string, string>,
    cloudHashes: Record<string, string>
  ): Promise<FileChange[]> {
    const changes: FileChange[] = []

    // Check for files added locally (exist locally but not in cloud)
    for (const [filePath, localHash] of Object.entries(localHashes)) {
      if (!cloudHashes[filePath]) {
        changes.push({
          filePath,
          type: 'added',
          timestamp: new Date().toISOString(),
          source: 'local'
        })
      }
    }

    // Check for files deleted locally (exist in cloud but not locally)
    for (const [filePath, cloudHash] of Object.entries(cloudHashes)) {
      if (!localHashes[filePath]) {
        changes.push({
          filePath,
          type: 'deleted',
          timestamp: new Date().toISOString(),
          source: 'local'
        })
      }
    }

    // Check for modified files (exist in both but have different hashes)
    for (const [filePath, localHash] of Object.entries(localHashes)) {
      const cloudHash = cloudHashes[filePath]
      if (cloudHash && localHash !== cloudHash) {
        changes.push({
          filePath,
          type: 'modified',
          timestamp: new Date().toISOString(),
          source: 'local'
        })
      }
    }

    return changes
  }

  /**
   * Detect conflicts between local and cloud changes
   */
  private async detectConflicts(
    project: Project,
    localPath: string,
    changes: FileChange[],
    options: DiffOptions
  ): Promise<SyncConflict[]> {
    const conflicts: SyncConflict[] = []

    for (const change of changes) {
      if (change.type === 'modified') {
        const conflict = await this.detectModificationConflict(
          project,
          localPath,
          change.filePath,
          options
        )
        
        if (conflict) {
          conflicts.push(conflict)
        }
      }
    }

    return conflicts
  }

  /**
   * Detect conflict for a modified file
   */
  private async detectModificationConflict(
    project: Project,
    localPath: string,
    filePath: string,
    options: DiffOptions
  ): Promise<SyncConflict | null> {
    try {
      // Get local content
      const localContent = await localStorageService.readFile(`${localPath}/${filePath}`)
      
      // Get cloud content
      const cloudContent = project.files[filePath]
      
      if (!cloudContent) {
        return null // No conflict if file doesn't exist in cloud
      }

      // Check if both versions have been modified since last sync
      const lastSyncTime = project.lastSyncAt ? new Date(project.lastSyncAt).getTime() : 0
      const currentTime = Date.now()
      
      // For this implementation, we'll consider it a conflict if both sides have changes
      // In a real implementation, you'd track modification times more precisely
      
      const localLines = this.normalizeContent(localContent, options)
      const cloudLines = this.normalizeContent(cloudContent, options)

      // Simple conflict detection: if content differs significantly
      const similarity = this.calculateSimilarity(localLines, cloudLines)
      
      if (similarity < 0.8) { // Less than 80% similarity indicates potential conflict
        return {
          id: `conflict-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          projectId: project.id,
          filePath,
          conflictType: 'content',
          localVersion: localContent,
          cloudVersion: cloudContent,
          localHash: await this.computeContentHash(localContent),
          cloudHash: await this.computeContentHash(cloudContent),
          resolved: false,
          createdAt: new Date().toISOString()
        }
      }

      return null
    } catch (error) {
      console.error('[DiffDetectionService] Failed to detect modification conflict:', error)
      return null
    }
  }

  /**
   * Compute hashes for cloud files
   */
  private async computeCloudHashes(files: Record<string, string>): Promise<Record<string, string>> {
    const hashes: Record<string, string> = {}

    for (const [filePath, content] of Object.entries(files)) {
      hashes[filePath] = await this.computeContentHash(content)
    }

    return hashes
  }

  /**
   * Compute hash for content
   */
  private async computeContentHash(content: string): Promise<string> {
    // Simple hash function (same as in LocalStorageService)
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Normalize content for comparison
   */
  private normalizeContent(content: string, options: DiffOptions): string[] {
    let normalized = content

    if (options.ignoreWhitespace) {
      normalized = normalized.replace(/\s+/g, ' ').trim()
    }

    if (options.ignoreCase) {
      normalized = normalized.toLowerCase()
    }

    return normalized.split('\n')
  }

  /**
   * Calculate similarity between two text arrays
   */
  private calculateSimilarity(lines1: string[], lines2: string[]): number {
    const longer = lines1.length > lines2.length ? lines1 : lines2
    const shorter = lines1.length > lines2.length ? lines2 : lines1

    if (longer.length === 0) {
      return 1.0 // Both are empty
    }

    const editDistance = this.calculateEditDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * Calculate Levenshtein distance between two arrays
   */
  private calculateEditDistance(arr1: string[], arr2: string[]): number {
    const matrix: number[][] = []

    for (let i = 0; i <= arr2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= arr1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= arr2.length; i++) {
      for (let j = 1; j <= arr1.length; j++) {
        if (arr2[i - 1] === arr1[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        }
      }
    }

    return matrix[arr2.length][arr1.length]
  }

  /**
   * Create summary of changes and conflicts
   */
  private createSummary(changes: FileChange[], conflicts: SyncConflict[]) {
    const summary = {
      added: 0,
      modified: 0,
      deleted: 0,
      conflicts: conflicts.length
    }

    for (const change of changes) {
      switch (change.type) {
        case 'added':
          summary.added++
          break
        case 'modified':
          summary.modified++
          break
        case 'deleted':
          summary.deleted++
          break
      }
    }

    return summary
  }

  /**
   * Generate a unified diff for display
   */
  async generateUnifiedDiff(
    localContent: string,
    cloudContent: string,
    filePath: string,
    options: DiffOptions = {}
  ): Promise<string> {
    const localLines = this.normalizeContent(localContent, options)
    const cloudLines = this.normalizeContent(cloudContent, options)

    let diff = `--- ${filePath} (cloud)\n`
    diff += `+++ ${filePath} (local)\n`

    const hunks = this.generateHunks(cloudLines, localLines)
    
    for (const hunk of hunks) {
      diff += `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@\n`
      
      for (const line of hunk.lines) {
        switch (line.type) {
          case 'context':
            diff += ` ${line.content}\n`
            break
          case 'removed':
            diff += `-${line.content}\n`
            break
          case 'added':
            diff += `+${line.content}\n`
            break
        }
      }
    }

    return diff
  }

  /**
   * Generate diff hunks
   */
  private generateHunks(oldLines: string[], newLines: string[]): DiffHunk[] {
    const hunks: DiffHunk[] = []
    let currentHunk: DiffHunk | null = null

    const matrix = this.createDiffMatrix(oldLines, newLines)
    const path = this.findShortestPath(matrix, oldLines.length, newLines.length)

    let oldIndex = 0
    let newIndex = 0

    for (const point of path) {
      while (oldIndex < point[0] || newIndex < point[1]) {
        if (oldIndex < point[0] && newIndex < point[1]) {
          // Context line
          if (!currentHunk) {
            currentHunk = {
              oldStart: oldIndex + 1,
              newStart: newIndex + 1,
              oldLines: 0,
              newLines: 0,
              lines: []
            }
          }
          currentHunk.lines.push({
            type: 'context',
            content: oldLines[oldIndex]
          })
          currentHunk.oldLines++
          currentHunk.newLines++
          oldIndex++
          newIndex++
        } else if (oldIndex < point[0]) {
          // Removed line
          if (!currentHunk) {
            currentHunk = {
              oldStart: oldIndex + 1,
              newStart: newIndex + 1,
              oldLines: 0,
              newLines: 0,
              lines: []
            }
          }
          currentHunk.lines.push({
            type: 'removed',
            content: oldLines[oldIndex]
          })
          currentHunk.oldLines++
          oldIndex++
        } else {
          // Added line
          if (!currentHunk) {
            currentHunk = {
              oldStart: oldIndex + 1,
              newStart: newIndex + 1,
              oldLines: 0,
              newLines: 0,
              lines: []
            }
          }
          currentHunk.lines.push({
            type: 'added',
            content: newLines[newIndex]
          })
          currentHunk.newLines++
          newIndex++
        }
      }

      if (currentHunk && (oldIndex === oldLines.length || newIndex === newLines.length)) {
        hunks.push(currentHunk)
        currentHunk = null
      }
    }

    return hunks
  }

  /**
   * Create diff matrix for LCS algorithm
   */
  private createDiffMatrix(oldLines: string[], newLines: string[]): number[][] {
    const matrix: number[][] = Array(oldLines.length + 1).fill(null).map(() => 
      Array(newLines.length + 1).fill(0)
    )

    for (let i = 1; i <= oldLines.length; i++) {
      for (let j = 1; j <= newLines.length; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1])
        }
      }
    }

    return matrix
  }

  /**
   * Find shortest path through diff matrix
   */
  private findShortestPath(matrix: number[][], oldLen: number, newLen: number): number[][] {
    const path: number[][] = []
    let i = oldLen
    let j = newLen

    while (i > 0 || j > 0) {
      path.push([i, j])

      if (i > 0 && j > 0 && matrix[i][j] === matrix[i - 1][j - 1] + 1) {
        i--
        j--
      } else if (j > 0 && (i === 0 || matrix[i][j] === matrix[i][j - 1])) {
        j--
      } else {
        i--
      }
    }

    path.push([0, 0])
    return path.reverse()
  }
}

interface DiffHunk {
  oldStart: number
  newStart: number
  oldLines: number
  newLines: number
  lines: DiffLine[]
}

interface DiffLine {
  type: 'context' | 'added' | 'removed'
  content: string
}

// Export singleton instance
export const diffDetectionService = DiffDetectionService.getInstance()
