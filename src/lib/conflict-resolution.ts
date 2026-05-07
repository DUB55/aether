import { type SyncConflict, type Project } from '@/types'
import { diffDetectionService } from './diff-detection'
import { localStorageService } from './local-storage'

export interface ConflictResolution {
  conflictId: string
  resolution: 'local' | 'cloud' | 'merge'
  mergedContent?: string
  resolvedContent?: string
  resolvedAt: string
}

export interface MergeOptions {
  strategy: 'latest' | 'manual' | 'auto-merge'
  preferLocal?: boolean
  ignoreWhitespace?: boolean
}

export interface MergeResult {
  success: boolean
  resolvedContent?: string
  conflicts: string[]
  message: string
}

export class ConflictResolutionService {
  private static instance: ConflictResolutionService

  static getInstance(): ConflictResolutionService {
    if (!ConflictResolutionService.instance) {
      ConflictResolutionService.instance = new ConflictResolutionService()
    }
    return ConflictResolutionService.instance
  }

  /**
   * Resolve a single conflict
   */
  async resolveConflict(
    conflict: SyncConflict,
    resolution: 'local' | 'cloud' | 'merge',
    mergedContent?: string,
    options: MergeOptions = { strategy: 'manual' }
  ): Promise<ConflictResolution> {
    try {
      console.log('[ConflictResolutionService] Resolving conflict:', conflict.id, 'with strategy:', resolution)

      let resolvedContent: string | undefined

      switch (resolution) {
        case 'local':
          resolvedContent = conflict.localVersion
          break
        case 'cloud':
          resolvedContent = conflict.cloudVersion
          break
        case 'merge':
          if (mergedContent) {
            resolvedContent = mergedContent
          } else {
            const mergeResult = await this.autoMerge(conflict, options)
            if (!mergeResult.success) {
              throw new Error(`Auto-merge failed: ${mergeResult.message}`)
            }
            resolvedContent = mergeResult.resolvedContent
          }
          break
      }

      const conflictResolution: ConflictResolution = {
        conflictId: conflict.id,
        resolution,
        resolvedContent,
        resolvedAt: new Date().toISOString()
      }

      console.log('[ConflictResolutionService] Conflict resolved successfully')
      return conflictResolution
    } catch (error) {
      console.error('[ConflictResolutionService] Failed to resolve conflict:', error)
      throw error
    }
  }

  /**
   * Auto-merge conflicting content
   */
  async autoMerge(
    conflict: SyncConflict,
    options: MergeOptions
  ): Promise<MergeResult> {
    try {
      if (!conflict.localVersion || !conflict.cloudVersion) {
        return {
          success: false,
          conflicts: ['Missing content for merge'],
          message: 'Cannot merge: missing local or cloud content'
        }
      }

      console.log('[ConflictResolutionService] Attempting auto-merge for:', conflict.filePath)

      // Try different merge strategies
      const strategies = ['line-based', 'block-based', 'character-based']
      
      for (const strategy of strategies) {
        const result = await this.tryMergeStrategy(conflict, strategy, options)
        if (result.success) {
          console.log('[ConflictResolutionService] Auto-merge successful with strategy:', strategy)
          return result
        }
      }

      return {
        success: false,
        conflicts: ['Auto-merge failed with all strategies'],
        message: 'Unable to auto-merge conflicting content'
      }
    } catch (error) {
      console.error('[ConflictResolutionService] Auto-merge failed:', error)
      return {
        success: false,
        conflicts: ['Auto-merge error'],
        message: `Auto-merge error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Try a specific merge strategy
   */
  private async tryMergeStrategy(
    conflict: SyncConflict,
    strategy: string,
    options: MergeOptions
  ): Promise<MergeResult> {
    switch (strategy) {
      case 'line-based':
        return this.lineBasedMerge(conflict, options)
      case 'block-based':
        return this.blockBasedMerge(conflict, options)
      case 'character-based':
        return this.characterBasedMerge(conflict, options)
      default:
        return {
          success: false,
          conflicts: ['Unknown merge strategy'],
          message: `Unknown merge strategy: ${strategy}`
        }
    }
  }

  /**
   * Line-based merge strategy
   */
  private async lineBasedMerge(
    conflict: SyncConflict,
    options: MergeOptions
  ): Promise<MergeResult> {
    const localLines = this.normalizeLines(conflict.localVersion!, options)
    const cloudLines = this.normalizeLines(conflict.cloudVersion!, options)

    const mergedLines: string[] = []
    const conflicts: string[] = []
    let localIndex = 0
    let cloudIndex = 0

    while (localIndex < localLines.length || cloudIndex < cloudLines.length) {
      const localLine = localLines[localIndex]
      const cloudLine = cloudLines[cloudIndex]

      if (localIndex >= localLines.length) {
        // Only cloud lines remaining
        mergedLines.push(cloudLine!)
        cloudIndex++
      } else if (cloudIndex >= cloudLines.length) {
        // Only local lines remaining
        mergedLines.push(localLine!)
        localIndex++
      } else if (localLine === cloudLine) {
        // Lines are the same
        mergedLines.push(localLine!)
        localIndex++
        cloudIndex++
      } else {
        // Lines differ - check if we can find a match ahead
        const localMatchIndex = this.findNextMatch(localLines, localIndex + 1, cloudLine!)
        const cloudMatchIndex = this.findNextMatch(cloudLines, cloudIndex + 1, localLine!)

        if (localMatchIndex !== -1 && cloudMatchIndex !== -1) {
          // Both sides have matches ahead - take the shorter path
          if (localMatchIndex - localIndex <= cloudMatchIndex - cloudIndex) {
            // Take local lines until match
            for (let i = localIndex; i < localMatchIndex; i++) {
              mergedLines.push(localLines[i])
            }
            localIndex = localMatchIndex
          } else {
            // Take cloud lines until match
            for (let i = cloudIndex; i < cloudMatchIndex; i++) {
              mergedLines.push(cloudLines[i])
            }
            cloudIndex = cloudMatchIndex
          }
        } else if (localMatchIndex !== -1) {
          // Only local has a match ahead
          for (let i = localIndex; i < localMatchIndex; i++) {
            mergedLines.push(localLines[i])
          }
          localIndex = localMatchIndex
        } else if (cloudMatchIndex !== -1) {
          // Only cloud has a match ahead
          for (let i = cloudIndex; i < cloudMatchIndex; i++) {
            mergedLines.push(cloudLines[i])
          }
          cloudIndex = cloudMatchIndex
        } else {
          // No matches found - create conflict markers
          mergedLines.push('<<<<<<< LOCAL')
          mergedLines.push(localLine!)
          mergedLines.push('=======')
          mergedLines.push(cloudLine!)
          mergedLines.push('>>>>>>> CLOUD')
          conflicts.push(`Line conflict at ${localIndex + 1}`)
          localIndex++
          cloudIndex++
        }
      }
    }

    return {
      success: conflicts.length === 0,
      resolvedContent: mergedLines.join('\n'),
      conflicts,
      message: conflicts.length === 0 ? 'Line-based merge successful' : `Line-based merge with ${conflicts.length} conflicts`
    }
  }

  /**
   * Block-based merge strategy (for larger chunks of code)
   */
  private async blockBasedMerge(
    conflict: SyncConflict,
    options: MergeOptions
  ): Promise<MergeResult> {
    // This is a simplified implementation
    // In a real system, you'd use more sophisticated block detection
    return this.lineBasedMerge(conflict, options)
  }

  /**
   * Character-based merge strategy (for very small changes)
   */
  private async characterBasedMerge(
    conflict: SyncConflict,
    options: MergeOptions
  ): Promise<MergeResult> {
    const localContent = conflict.localVersion!
    const cloudContent = conflict.cloudVersion!

    // Use a simple character-level diff
    const diff = await diffDetectionService.generateUnifiedDiff(
      localContent,
      cloudContent,
      conflict.filePath,
      { ignoreWhitespace: options.ignoreWhitespace }
    )

    // For now, return the cloud version if there are conflicts
    // In a real implementation, you'd parse the diff and apply changes
    if (diff.includes('@@') && (diff.includes('-') || diff.includes('+'))) {
      return {
        success: false,
        conflicts: ['Character-level conflicts detected'],
        message: 'Character-based merge not fully implemented'
      }
    }

    return {
      success: true,
      resolvedContent: cloudContent,
      conflicts: [],
      message: 'Character-based merge successful'
    }
  }

  /**
   * Normalize lines for comparison
   */
  private normalizeLines(content: string, options: MergeOptions): string[] {
    let lines = content.split('\n')

    if (options.ignoreWhitespace) {
      lines = lines.map(line => line.trim())
    }

    return lines
  }

  /**
   * Find next matching line in array
   */
  private findNextMatch(lines: string[], startIndex: number, target: string): number {
    for (let i = startIndex; i < lines.length; i++) {
      if (lines[i] === target) {
        return i
      }
    }
    return -1
  }

  /**
   * Resolve multiple conflicts at once
   */
  async resolveMultipleConflicts(
    conflicts: SyncConflict[],
    resolutions: ConflictResolution[],
    project: Project
  ): Promise<{
    success: boolean
    resolvedConflicts: ConflictResolution[]
    failedConflicts: string[]
    message: string
  }> {
    const resolvedConflicts: ConflictResolution[] = []
    const failedConflicts: string[] = []

    try {
      console.log(`[ConflictResolutionService] Resolving ${conflicts.length} conflicts`)

      for (const conflict of conflicts) {
        const resolution = resolutions.find(r => r.conflictId === conflict.id)
        
        if (!resolution) {
          failedConflicts.push(`No resolution found for conflict ${conflict.id}`)
          continue
        }

        try {
          const resolved = await this.resolveConflict(
            conflict,
            resolution.resolution,
            resolution.resolvedContent
          )
          
          resolvedConflicts.push(resolved)

          // Apply the resolution to the project
          if (resolved.resolvedContent && conflict.localPath) {
            await localStorageService.writeFile(
              `${conflict.localPath}/${conflict.filePath}`,
              resolved.resolvedContent
            )
          }
        } catch (error) {
          failedConflicts.push(`Failed to resolve conflict ${conflict.id}: ${error}`)
        }
      }

      const success = failedConflicts.length === 0
      const message = success 
        ? `Successfully resolved ${resolvedConflicts.length} conflicts`
        : `Resolved ${resolvedConflicts.length} conflicts, ${failedConflicts.length} failed`

      console.log('[ConflictResolutionService] Batch resolution completed:', message)

      return {
        success,
        resolvedConflicts,
        failedConflicts,
        message
      }
    } catch (error) {
      console.error('[ConflictResolutionService] Batch resolution failed:', error)
      return {
        success: false,
        resolvedConflicts,
        failedConflicts: [...failedConflicts, `Batch resolution error: ${error}`],
        message: `Batch resolution failed: ${error}`
      }
    }
  }

  /**
   * Generate a three-way merge preview
   */
  async generateMergePreview(
    localContent: string,
    cloudContent: string,
    baseContent?: string,
    options: MergeOptions = { strategy: 'manual' }
  ): Promise<{
    preview: string
    conflicts: number
    canAutoMerge: boolean
  }> {
    try {
      if (!baseContent) {
        // If no base content, do a two-way merge
        const result = await this.lineBasedMerge({
          id: 'preview',
          projectId: 'preview',
          filePath: 'preview',
          conflictType: 'content',
          localVersion: localContent,
          cloudVersion: cloudContent,
          resolved: false,
          createdAt: new Date().toISOString()
        }, options)

        return {
          preview: result.resolvedContent || '',
          conflicts: result.conflicts.length,
          canAutoMerge: result.success
        }
      }

      // Three-way merge would be more complex - for now, return two-way merge
      return this.generateMergePreview(localContent, cloudContent, undefined, options)
    } catch (error) {
      console.error('[ConflictResolutionService] Failed to generate merge preview:', error)
      return {
        preview: '',
        conflicts: 0,
        canAutoMerge: false
      }
    }
  }

  /**
   * Check if a conflict can be auto-resolved
   */
  canAutoResolve(conflict: SyncConflict): boolean {
    if (!conflict.localVersion || !conflict.cloudVersion) {
      return false
    }

    // Check if one version is a subset of the other
    if (conflict.localVersion.includes(conflict.cloudVersion)) {
      return true
    }
    if (conflict.cloudVersion.includes(conflict.localVersion)) {
      return true
    }

    // Check if they're very similar (simple heuristic)
    const similarity = this.calculateSimilarity(conflict.localVersion, conflict.cloudVersion)
    return similarity > 0.9
  }

  /**
   * Calculate similarity between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) {
      return 1.0
    }

    const editDistance = this.calculateEditDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * Calculate edit distance between two strings
   */
  private calculateEditDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2[i - 1] === str1[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }
}

// Export singleton instance
export const conflictResolutionService = ConflictResolutionService.getInstance()
