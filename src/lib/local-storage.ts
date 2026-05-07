import { invoke } from '@tauri-apps/api/core'
import { type Project, type FileChange } from '@/types'

export interface FileOperationResult {
  success: boolean
  message: string
  data?: any
}

export interface DirectoryItem {
  name: string
  path: string
  is_file: boolean
  size?: number
}

export class LocalStorageService {
  private static instance: LocalStorageService

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService()
    }
    return LocalStorageService.instance
  }

  /**
   * Check if running in Tauri (desktop) environment
   */
  isDesktop(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window
  }

  /**
   * Select a directory using native dialog
   */
  async selectDirectory(title: string = 'Select Directory'): Promise<string | null> {
    if (!this.isDesktop()) {
      throw new Error('Directory selection is only available in desktop app')
    }

    try {
      // Use Tauri invoke command instead of direct dialog import
      // This avoids the Vite build error while still working in Tauri
      const selected = await invoke<string>('open_directory_dialog', { title })
      return selected || null
    } catch (error) {
      console.error('[LocalStorageService] Failed to select directory:', error)
      throw error
    }
  }

  /**
   * Create project files in local directory
   */
  async createProjectFiles(projectPath: string, files: Record<string, string>): Promise<FileOperationResult> {
    if (!this.isDesktop()) {
      throw new Error('Local file operations are only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('create_project_files', {
        projectPath,
        files
      })

      console.log('[LocalStorageService] Created project files:', result)
      return result
    } catch (error) {
      console.error('[LocalStorageService] Failed to create project files:', error)
      throw error
    }
  }

  /**
   * Read a file from local storage
   */
  async readFile(filePath: string): Promise<string> {
    if (!this.isDesktop()) {
      throw new Error('Local file operations are only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('read_file', { path: filePath })
      
      if (!result.success) {
        throw new Error(result.message)
      }

      return result.data?.content || ''
    } catch (error) {
      console.error('[LocalStorageService] Failed to read file:', error)
      throw error
    }
  }

  /**
   * Write content to a local file
   */
  async writeFile(filePath: string, content: string): Promise<FileOperationResult> {
    if (!this.isDesktop()) {
      throw new Error('Local file operations are only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('write_file', {
        path: filePath,
        content
      })

      console.log('[LocalStorageService] Wrote file:', result)
      return result
    } catch (error) {
      console.error('[LocalStorageService] Failed to write file:', error)
      throw error
    }
  }

  /**
   * Delete a local file
   */
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    if (!this.isDesktop()) {
      throw new Error('Local file operations are only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('delete_file', { file_path: filePath })
      
      console.log('[LocalStorageService] Deleted file:', result)
      return result
    } catch (error) {
      console.error('[LocalStorageService] Failed to delete file:', error)
      throw error
    }
  }

  /**
   * Copy a file from source to destination
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<FileOperationResult> {
    if (!this.isDesktop()) {
      throw new Error('Local file operations are only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('copy_file', {
        src: sourcePath,
        dst: destinationPath
      })

      console.log('[LocalStorageService] Copied file:', result)
      return result
    } catch (error) {
      console.error('[LocalStorageService] Failed to copy file:', error)
      throw error
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    if (!this.isDesktop()) {
      return false
    }

    try {
      const result = await invoke<FileOperationResult>('file_exists', { file_path: filePath })
      
      return result.data?.exists || false
    } catch (error) {
      console.error('[LocalStorageService] Failed to check file existence:', error)
      return false
    }
  }

  /**
   * Compute hash for a single file
   */
  async computeFileHash(filePath: string): Promise<string> {
    if (!this.isDesktop()) {
      throw new Error('File hashing is only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('compute_file_hash', { file_path: filePath })
      
      if (!result.success) {
        throw new Error(result.message)
      }

      return result.data?.hash || ''
    } catch (error) {
      console.error('[LocalStorageService] Failed to compute file hash:', error)
      throw error
    }
  }

  /**
   * Compute hashes for all files in a project directory
   */
  async computeProjectHashes(projectPath: string): Promise<Record<string, string>> {
    if (!this.isDesktop()) {
      throw new Error('Project hashing is only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('compute_project_hashes', { project_path: projectPath })
      
      if (!result.success) {
        throw new Error(result.message)
      }

      return result.data?.hashes || {}
    } catch (error) {
      console.error('[LocalStorageService] Failed to compute project hashes:', error)
      throw error
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(directoryPath: string): Promise<DirectoryItem[]> {
    if (!this.isDesktop()) {
      throw new Error('Directory listing is only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('manage_directory', {
        action: 'list',
        path: directoryPath
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      return result.data?.items || []
    } catch (error) {
      console.error('[LocalStorageService] Failed to list directory:', error)
      throw error
    }
  }

  /**
   * Create a directory
   */
  async createDirectory(directoryPath: string): Promise<FileOperationResult> {
    if (!this.isDesktop()) {
      throw new Error('Directory creation is only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('manage_directory', {
        action: 'create',
        path: directoryPath
      })

      console.log('[LocalStorageService] Created directory:', result)
      return result
    } catch (error) {
      console.error('[LocalStorageService] Failed to create directory:', error)
      throw error
    }
  }

  /**
   * Delete a directory
   */
  async deleteDirectory(directoryPath: string): Promise<FileOperationResult> {
    if (!this.isDesktop()) {
      throw new Error('Directory deletion is only available in desktop app')
    }

    try {
      const result = await invoke<FileOperationResult>('manage_directory', {
        action: 'delete',
        path: directoryPath
      })

      console.log('[LocalStorageService] Deleted directory:', result)
      return result
    } catch (error) {
      console.error('[LocalStorageService] Failed to delete directory:', error)
      throw error
    }
  }

  /**
   * Initialize a hybrid project locally
   */
  async initializeHybridProject(project: Project, localPath: string): Promise<void> {
    if (!this.isDesktop()) {
      throw new Error('Hybrid project initialization is only available in desktop app')
    }

    try {
      console.log('[LocalStorageService] Initializing hybrid project:', project.id, 'at:', localPath)

      // Create the project directory
      await this.createDirectory(localPath)

      // Create all project files
      await this.createProjectFiles(localPath, project.files)

      // Create a .aether metadata file
      const metadata = {
        projectId: project.id,
        projectName: project.name,
        storageMode: project.storageMode,
        createdAt: project.createdAt,
        lastSyncAt: new Date().toISOString(),
        version: '1.0.0'
      }

      await this.writeFile(
        `${localPath}/.aether/project.json`,
        JSON.stringify(metadata, null, 2)
      )

      // Create .gitignore to exclude sensitive files
      const gitignoreContent = `
# Aether AI IDE
.aether/
node_modules/
dist/
build/
*.log
.env
.env.local

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`.trim()

      await this.writeFile(`${localPath}/.gitignore`, gitignoreContent)

      console.log('[LocalStorageService] Hybrid project initialized successfully')
    } catch (error) {
      console.error('[LocalStorageService] Failed to initialize hybrid project:', error)
      throw error
    }
  }

  /**
   * Get project metadata from local directory
   */
  async getProjectMetadata(localPath: string): Promise<any | null> {
    if (!this.isDesktop()) {
      return null
    }

    try {
      const metadataPath = `${localPath}/.aether/project.json`
      
      if (!(await this.fileExists(metadataPath))) {
        return null
      }

      const content = await this.readFile(metadataPath)
      return JSON.parse(content)
    } catch (error) {
      console.error('[LocalStorageService] Failed to get project metadata:', error)
      return null
    }
  }

  /**
   * Update project metadata
   */
  async updateProjectMetadata(localPath: string, metadata: any): Promise<void> {
    if (!this.isDesktop()) {
      throw new Error('Metadata update is only available in desktop app')
    }

    try {
      const metadataPath = `${localPath}/.aether/project.json`
      await this.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
    } catch (error) {
      console.error('[LocalStorageService] Failed to update project metadata:', error)
      throw error
    }
  }

  /**
   * Detect changes between local files and project files
   */
  async detectChanges(project: Project, localPath: string): Promise<FileChange[]> {
    if (!this.isDesktop() || !project.localPath) {
      return []
    }

    try {
      const localHashes = await this.computeProjectHashes(localPath)
      const changes: FileChange[] = []

      // Check for modified and deleted files
      for (const [filePath, localHash] of Object.entries(localHashes)) {
        const cloudContent = project.files[filePath]
        
        if (!cloudContent) {
          // File exists locally but not in cloud (added locally)
          changes.push({
            filePath,
            type: 'added',
            timestamp: new Date().toISOString(),
            source: 'local'
          })
        } else {
          // Compute hash of cloud content to compare
          const cloudHash = await this.computeContentHash(cloudContent)
          
          if (cloudHash !== localHash) {
            // File has different content (modified)
            changes.push({
              filePath,
              type: 'modified',
              timestamp: new Date().toISOString(),
              source: 'local'
            })
          }
        }
      }

      // Check for files that exist in cloud but not locally (deleted locally)
      for (const filePath of Object.keys(project.files)) {
        if (!localHashes[filePath]) {
          changes.push({
            filePath,
            type: 'deleted',
            timestamp: new Date().toISOString(),
            source: 'local'
          })
        }
      }

      return changes
    } catch (error) {
      console.error('[LocalStorageService] Failed to detect changes:', error)
      return []
    }
  }

  /**
   * Compute hash for content (without writing to disk)
   */
  private async computeContentHash(content: string): Promise<string> {
    // Simple hash function for content comparison
    // In a real implementation, you might want to use a proper crypto library
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

// Export singleton instance
export const localStorageService = LocalStorageService.getInstance()
