/**
 * GitHub Deployment Manager
 * 
 * Handles deployment to GitHub using encrypted JSON payloads.
 * Replaces OAuth-based deployment with simpler GitHub token authentication.
 */

import { createEncryptedSharePayload, EncryptedPayload } from '../crypto/share-crypto';
import { WebContainerManager } from '../webcontainer/manager';

export type DeploymentStatus = 'idle' | 'collecting' | 'encrypting' | 'uploading' | 'complete' | 'error';

export interface DeploymentConfig {
  projectId: string;
  projectName: string;
  files: Array<{ name: string; content: string }>;
  pathHint?: string;
}

export interface DeploymentResult {
  success: boolean;
  shareUrl?: string;
  rawUrl?: string;
  commitUrl?: string;
  error?: string;
}

export interface DeploymentProgress {
  status: DeploymentStatus;
  message: string;
  percentage: number;
}

/**
 * GitHubDeploymentManager handles deployment to GitHub with encryption
 */
export class GitHubDeploymentManager {
  private static instance: GitHubDeploymentManager;
  private currentStatus: DeploymentStatus = 'idle';
  private logs: string[] = [];
  private progressCallbacks: ((progress: DeploymentProgress) => void)[] = [];
  private webContainer: WebContainerManager;

  private constructor() {
    this.webContainer = WebContainerManager.getInstance();
  }

  static getInstance(): GitHubDeploymentManager {
    if (!GitHubDeploymentManager.instance) {
      GitHubDeploymentManager.instance = new GitHubDeploymentManager();
    }
    return GitHubDeploymentManager.instance;
  }

  /**
   * Subscribe to deployment progress updates
   */
  onProgress(callback: (progress: DeploymentProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Emit progress update
   */
  private emitProgress(status: DeploymentStatus, message: string, percentage: number): void {
    this.currentStatus = status;
    const progress: DeploymentProgress = {
      status,
      message,
      percentage
    };
    
    const logMessage = `[${new Date().toISOString()}] ${message}`;
    this.logs.push(logMessage);
    console.log(logMessage);
    
    this.progressCallbacks.forEach(cb => {
      try {
        cb(progress);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });
  }

  /**
   * Collect all project files from WebContainer
   */
  async collectFiles(projectPath: string = '/'): Promise<Array<{ name: string; content: string }>> {
    this.emitProgress('collecting', 'Collecting project files...', 10);
    
    const files: Array<{ name: string; content: string }> = [];
    
    try {
      await this.collectFilesRecursive(projectPath, '', files);
      
      this.emitProgress('collecting', `Collected ${files.length} files`, 20);
      return files;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emitProgress('error', `Failed to collect files: ${errorMessage}`, 0);
      throw error;
    }
  }

  /**
   * Recursively collect files from a directory
   */
  private async collectFilesRecursive(
    basePath: string,
    relativePath: string,
    files: Array<{ name: string; content: string }>
  ): Promise<void> {
    const fullPath = relativePath ? `${basePath}/${relativePath}` : basePath;
    
    try {
      const entries = await this.webContainer.listFiles(fullPath);
      
      for (const entry of entries) {
        // Skip node_modules and hidden files
        if (entry === 'node_modules' || entry.startsWith('.')) {
          continue;
        }
        
        const entryPath = relativePath ? `${relativePath}/${entry}` : entry;
        const entryFullPath = `${fullPath}/${entry}`;
        
        try {
          // Try to read as file
          const content = await this.webContainer.readFile(entryFullPath);
          files.push({
            name: entryPath,
            content
          });
        } catch {
          // If read fails, it's likely a directory - recurse
          await this.collectFilesRecursive(basePath, entryPath, files);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${fullPath}:`, error);
      // Continue with other files
    }
  }

  /**
   * Deploy project to GitHub
   */
  async deployProject(config: DeploymentConfig): Promise<DeploymentResult> {
    this.logs = [];
    this.emitProgress('idle', 'Starting deployment...', 0);

    try {
      // Step 1: Collect files (if not provided)
      let files = config.files;
      if (!files || files.length === 0) {
        files = await this.collectFiles();
      }

      if (files.length === 0) {
        throw new Error('No files to deploy');
      }

      // Step 2: Encrypt and compress
      this.emitProgress('encrypting', 'Encrypting project...', 30);
      
      const { encryptedPayload, keyB64 } = await createEncryptedSharePayload(files);
      
      this.emitProgress('encrypting', 'Project encrypted successfully', 50);

      // Step 3: Upload to GitHub
      this.emitProgress('uploading', 'Uploading to GitHub...', 60);
      
      const publishResponse = await fetch('/api/publish-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: config.projectId,
          pathHint: config.pathHint,
          encryptedPayload,
          message: `Deploy ${config.projectName}`
        })
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(errorData.error || `Upload failed with status ${publishResponse.status}`);
      }

      const publishResult = await publishResponse.json();
      
      this.emitProgress('uploading', 'Upload complete', 80);

      // Step 4: Generate shareable URL
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/editor?src=${encodeURIComponent(publishResult.rawUrl)}#key=${keyB64}`;
      
      this.emitProgress('complete', 'Deployment successful!', 100);

      return {
        success: true,
        shareUrl,
        rawUrl: publishResult.rawUrl,
        commitUrl: publishResult.commitUrl
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emitProgress('error', `Deployment failed: ${errorMessage}`, 0);
      
      console.error('Deployment error:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get current deployment status
   */
  getStatus(): DeploymentStatus {
    return this.currentStatus;
  }

  /**
   * Get deployment logs
   */
  getLogs(): string[] {
    return [...this.logs];
  }
}
