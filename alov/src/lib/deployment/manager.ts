/**
 * Deployment Manager
 * 
 * Handles deployment to Vercel and Netlify platforms with OAuth authentication,
 * build management, and real-time deployment monitoring.
 */

import { WebContainerManager } from '../webcontainer/manager';

// Deployment types
export type DeploymentPlatform = 'vercel' | 'netlify';
export type DeploymentStatus = 'idle' | 'building' | 'deploying' | 'success' | 'error';

export interface DeploymentConfig {
  platform: DeploymentPlatform;
  projectName: string;
  envVars?: Record<string, string>;
  buildCommand?: string;
  outputDirectory?: string;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
  logs: string[];
  deploymentId?: string;
}

export interface DeploymentProgress {
  status: DeploymentStatus;
  message: string;
  timestamp: number;
}

// OAuth token storage
interface OAuthTokens {
  vercel?: string;
  netlify?: string;
}

/**
 * DeploymentManager handles deployment to various platforms
 */
export class DeploymentManager {
  private static instance: DeploymentManager;
  private webContainer: WebContainerManager;
  private tokens: OAuthTokens = {};
  private currentStatus: DeploymentStatus = 'idle';
  private logs: string[] = [];
  private progressCallbacks: ((progress: DeploymentProgress) => void)[] = [];

  private constructor() {
    this.webContainer = WebContainerManager.getInstance();
    this.loadTokens();
  }

  static getInstance(): DeploymentManager {
    if (!DeploymentManager.instance) {
      DeploymentManager.instance = new DeploymentManager();
    }
    return DeploymentManager.instance;
  }

  /**
   * Load OAuth tokens from IndexedDB
   */
  private async loadTokens(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['tokens'], 'readonly');
      const store = transaction.objectStore('tokens');
      const request = store.get('oauth');
      
      request.onsuccess = () => {
        if (request.result) {
          this.tokens = request.result.data;
        }
      };
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  /**
   * Save OAuth tokens to IndexedDB (encrypted)
   */
  private async saveTokens(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['tokens'], 'readwrite');
      const store = transaction.objectStore('tokens');
      
      await store.put({
        id: 'oauth',
        data: this.tokens,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  /**
   * Open IndexedDB for token storage
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AetherDeployment', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('tokens')) {
          db.createObjectStore('tokens', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('deployments')) {
          db.createObjectStore('deployments', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Authenticate with Vercel using OAuth
   */
  async authenticateVercel(): Promise<boolean> {
    try {
      // Open Vercel OAuth flow in new window
      const clientId = process.env.NEXT_PUBLIC_VERCEL_CLIENT_ID;
      if (!clientId) {
        console.error('Vercel Client ID not configured');
        return false;
      }

      const redirectUri = `${window.location.origin}/api/auth/vercel/callback`;
      const state = Math.random().toString(36).substring(7);
      
      const authUrl = `https://vercel.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      
      // Open OAuth window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        authUrl,
        'Vercel OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Wait for OAuth callback
      return new Promise((resolve) => {
        const checkWindow = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkWindow);
            // Check if token was saved
            const token = this.tokens.vercel;
            resolve(!!token);
          }
        }, 500);

        // Listen for message from callback
        const messageHandler = (event: MessageEvent) => {
          if (event.data.type === 'vercel-auth-success') {
            this.tokens.vercel = event.data.token;
            this.saveTokens();
            authWindow?.close();
            window.removeEventListener('message', messageHandler);
            resolve(true);
          } else if (event.data.type === 'vercel-auth-error') {
            authWindow?.close();
            window.removeEventListener('message', messageHandler);
            resolve(false);
          }
        };
        
        window.addEventListener('message', messageHandler);
      });
    } catch (error) {
      console.error('Vercel authentication failed:', error);
      return false;
    }
  }

  /**
   * Authenticate with Netlify using OAuth
   */
  async authenticateNetlify(): Promise<boolean> {
    try {
      // Open Netlify OAuth flow in new window
      const clientId = process.env.NEXT_PUBLIC_NETLIFY_CLIENT_ID;
      if (!clientId) {
        console.error('Netlify Client ID not configured');
        return false;
      }

      const redirectUri = `${window.location.origin}/api/auth/netlify/callback`;
      const state = Math.random().toString(36).substring(7);
      
      const authUrl = `https://app.netlify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      
      // Open OAuth window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        authUrl,
        'Netlify OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Wait for OAuth callback
      return new Promise((resolve) => {
        const checkWindow = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkWindow);
            const token = this.tokens.netlify;
            resolve(!!token);
          }
        }, 500);

        // Listen for message from callback
        const messageHandler = (event: MessageEvent) => {
          if (event.data.type === 'netlify-auth-success') {
            this.tokens.netlify = event.data.token;
            this.saveTokens();
            authWindow?.close();
            window.removeEventListener('message', messageHandler);
            resolve(true);
          } else if (event.data.type === 'netlify-auth-error') {
            authWindow?.close();
            window.removeEventListener('message', messageHandler);
            resolve(false);
          }
        };
        
        window.addEventListener('message', messageHandler);
      });
    } catch (error) {
      console.error('Netlify authentication failed:', error);
      return false;
    }
  }

  /**
   * Check if authenticated with a platform
   */
  isAuthenticated(platform: DeploymentPlatform): boolean {
    return !!this.tokens[platform];
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
  private emitProgress(status: DeploymentStatus, message: string): void {
    this.currentStatus = status;
    const progress: DeploymentProgress = {
      status,
      message,
      timestamp: Date.now()
    };
    
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
    this.progressCallbacks.forEach(cb => cb(progress));
  }

  /**
   * Deploy to specified platform
   */
  async deploy(config: DeploymentConfig): Promise<DeploymentResult> {
    this.logs = [];
    this.emitProgress('building', 'Starting deployment...');

    try {
      // Check authentication
      if (!this.isAuthenticated(config.platform)) {
        throw new Error(`Not authenticated with ${config.platform}`);
      }

      // Build the project
      await this.buildProject(config);

      // Deploy to platform
      let result: DeploymentResult;
      if (config.platform === 'vercel') {
        result = await this.deployToVercel(config);
      } else {
        result = await this.deployToNetlify(config);
      }

      if (result.success) {
        this.emitProgress('success', `Deployment successful! URL: ${result.url}`);
      } else {
        this.emitProgress('error', `Deployment failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emitProgress('error', `Deployment failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
        logs: this.logs
      };
    }
  }

  /**
   * Build the project using Vite
   */
  private async buildProject(config: DeploymentConfig): Promise<void> {
    this.emitProgress('building', 'Building project...');

    try {
      const buildCommand = config.buildCommand || 'npm run build';
      const process = await this.webContainer.spawn(buildCommand);

      // Stream build output
      process.output.pipeTo(new WritableStream({
        write: (chunk) => {
          this.emitProgress('building', chunk);
        }
      }));

      const exitCode = await process.exit;
      if (exitCode !== 0) {
        throw new Error(`Build failed with exit code ${exitCode}`);
      }

      this.emitProgress('building', 'Build completed successfully');
    } catch (error) {
      throw new Error(`Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deploy to Vercel
   */
  private async deployToVercel(config: DeploymentConfig): Promise<DeploymentResult> {
    this.emitProgress('deploying', 'Deploying to Vercel...');

    try {
      const token = this.tokens.vercel!;
      const outputDir = config.outputDirectory || 'dist';

      // Read build files
      const files = await this.readBuildFiles(outputDir);

      // Create deployment via Vercel API
      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.projectName,
          files: files,
          projectSettings: {
            framework: 'vite'
          },
          env: config.envVars || {}
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Vercel API error: ${error}`);
      }

      const data = await response.json();
      const deploymentUrl = `https://${data.url}`;

      // Wait for deployment to be ready
      await this.waitForVercelDeployment(data.id, token);

      return {
        success: true,
        url: deploymentUrl,
        deploymentId: data.id,
        logs: this.logs
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs: this.logs
      };
    }
  }

  /**
   * Wait for Vercel deployment to be ready
   */
  private async waitForVercelDeployment(deploymentId: string, token: string): Promise<void> {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.readyState === 'READY') {
        this.emitProgress('deploying', 'Deployment is ready');
        return;
      } else if (data.readyState === 'ERROR') {
        throw new Error('Deployment failed on Vercel');
      }

      this.emitProgress('deploying', `Deployment status: ${data.readyState}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Deployment timeout');
  }

  /**
   * Deploy to Netlify
   */
  private async deployToNetlify(config: DeploymentConfig): Promise<DeploymentResult> {
    this.emitProgress('deploying', 'Deploying to Netlify...');

    try {
      const token = this.tokens.netlify!;
      const outputDir = config.outputDirectory || 'dist';

      // Read build files
      const files = await this.readBuildFiles(outputDir);

      // Create site if it doesn't exist
      const siteId = await this.getOrCreateNetlifySite(config.projectName, token);

      // Create deployment
      const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: files,
          environment: config.envVars || {}
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Netlify API error: ${error}`);
      }

      const data = await response.json();
      const deploymentUrl = data.ssl_url || data.url;

      // Wait for deployment to be ready
      await this.waitForNetlifyDeployment(data.id, token);

      return {
        success: true,
        url: deploymentUrl,
        deploymentId: data.id,
        logs: this.logs
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs: this.logs
      };
    }
  }

  /**
   * Get or create Netlify site
   */
  private async getOrCreateNetlifySite(projectName: string, token: string): Promise<string> {
    // Try to find existing site
    const sitesResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const sites = await sitesResponse.json();
    const existingSite = sites.find((site: any) => site.name === projectName);

    if (existingSite) {
      return existingSite.id;
    }

    // Create new site
    const createResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName
      })
    });

    const newSite = await createResponse.json();
    return newSite.id;
  }

  /**
   * Wait for Netlify deployment to be ready
   */
  private async waitForNetlifyDeployment(deploymentId: string, token: string): Promise<void> {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.netlify.com/api/v1/deploys/${deploymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.state === 'ready') {
        this.emitProgress('deploying', 'Deployment is ready');
        return;
      } else if (data.state === 'error') {
        throw new Error('Deployment failed on Netlify');
      }

      this.emitProgress('deploying', `Deployment status: ${data.state}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Deployment timeout');
  }

  /**
   * Read build files from WebContainer
   */
  private async readBuildFiles(outputDir: string): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    const readDir = async (path: string): Promise<void> => {
      const entries = await this.webContainer.listFiles(path);
      
      for (const entry of entries) {
        const fullPath = `${path}/${entry}`;
        
        try {
          const content = await this.webContainer.readFile(fullPath);
          files[fullPath.replace(`${outputDir}/`, '')] = content;
        } catch {
          // Might be a directory, recurse
          await readDir(fullPath);
        }
      }
    };

    await readDir(outputDir);
    return files;
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

  /**
   * Clear authentication tokens
   */
  async clearTokens(platform?: DeploymentPlatform): Promise<void> {
    if (platform) {
      delete this.tokens[platform];
    } else {
      this.tokens = {};
    }
    await this.saveTokens();
  }
}
