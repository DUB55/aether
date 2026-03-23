/**
 * WebContainer Runtime Manager
 * Manages the WebContainer instance lifecycle and provides a unified interface for code execution.
 */

import { WebContainer, WebContainerProcess } from '@webcontainer/api';

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
}

export interface WebContainerProcessWrapper {
  output: ReadableStream<string>;
  input: WritableStream<string>;
  exit: Promise<number>;
  kill(): void;
}

export class WebContainerManager {
  private static instance: WebContainerManager | null = null;
  private container: WebContainer | null = null;
  private bootPromise: Promise<void> | null = null;
  private isBooting = false;
  private isReady = false;

  private constructor() {}

  /**
   * Get the singleton instance of WebContainerManager
   */
  static getInstance(): WebContainerManager {
    if (!WebContainerManager.instance) {
      WebContainerManager.instance = new WebContainerManager();
    }
    return WebContainerManager.instance;
  }

  /**
   * Initialize the WebContainer instance
   */
  async initialize(): Promise<void> {
    if (this.isReady) {
      return;
    }

    if (this.isBooting && this.bootPromise) {
      return this.bootPromise;
    }

    this.isBooting = true;
    this.bootPromise = this._boot();
    
    try {
      await this.bootPromise;
      this.isReady = true;
    } finally {
      this.isBooting = false;
    }
  }

  private async _boot(): Promise<void> {
    try {
      console.log('[WebContainer] Booting...');
      this.container = await WebContainer.boot();
      console.log('[WebContainer] Ready');
    } catch (error) {
      console.error('[WebContainer] Boot failed:', error);
      throw new Error(`Failed to boot WebContainer: ${error}`);
    }
  }

  /**
   * Dispose of the WebContainer instance
   */
  async dispose(): Promise<void> {
    if (this.container) {
      await this.container.teardown();
      this.container = null;
      this.isReady = false;
      this.bootPromise = null;
    }
  }

  /**
   * Ensure WebContainer is initialized before operations
   */
  private async ensureReady(): Promise<WebContainer> {
    if (!this.isReady) {
      await this.initialize();
    }
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    return this.container;
  }

  /**
   * Write a file to the WebContainer filesystem
   */
  async writeFile(path: string, content: string): Promise<void> {
    const container = await this.ensureReady();
    await container.fs.writeFile(path, content);
  }

  /**
   * Read a file from the WebContainer filesystem
   */
  async readFile(path: string): Promise<string> {
    const container = await this.ensureReady();
    const content = await container.fs.readFile(path, 'utf-8');
    return content;
  }

  /**
   * Delete a file from the WebContainer filesystem
   */
  async deleteFile(path: string): Promise<void> {
    const container = await this.ensureReady();
    await container.fs.rm(path);
  }

  /**
   * List files in a directory
   */
  async listFiles(directory: string = '.'): Promise<FileNode[]> {
    const container = await this.ensureReady();
    const entries = await container.fs.readdir(directory, { withFileTypes: true });
    
    return entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      path: `${directory}/${entry.name}`.replace(/^\.\//, '')
    }));
  }

  /**
   * Create a directory
   */
  async mkdir(path: string, recursive: boolean = true): Promise<void> {
    const container = await this.ensureReady();
    if (recursive) {
      await container.fs.mkdir(path, { recursive: true });
    } else {
      await container.fs.mkdir(path, { recursive: false });
    }
  }

  /**
   * Spawn a process in the WebContainer
   */
  async spawn(command: string, args: string[] = []): Promise<WebContainerProcessWrapper> {
    const container = await this.ensureReady();
    const process = await container.spawn(command, args);
    
    return {
      output: process.output,
      input: process.input,
      exit: process.exit,
      kill: () => process.kill()
    };
  }

  /**
   * Execute a command and wait for completion
   */
  async exec(command: string, args: string[] = []): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const container = await this.ensureReady();
    const process = await container.spawn(command, args);
    
    let stdout = '';
    let stderr = '';

    // Read output
    const reader = process.output.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (value) {
          stdout += value;
        }
      }
    } catch (error) {
      stderr = String(error);
    } finally {
      reader.releaseLock();
    }

    const exitCode = await process.exit;
    
    return { stdout, stderr, exitCode };
  }

  /**
   * Listen for server-ready events
   */
  onServerReady(callback: (port: number, url: string) => void): void {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    
    this.container.on('server-ready', (port, url) => {
      callback(port, url);
    });
  }

  /**
   * Listen for error events
   */
  onError(callback: (error: Error) => void): void {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    
    this.container.on('error', (error) => {
      // Ensure error is an Error instance
      const errorObj = error instanceof Error ? error : new Error(String(error));
      callback(errorObj);
    });
  }

  /**
   * Mount a file tree to the WebContainer
   */
  async mount(tree: Record<string, any>): Promise<void> {
    const container = await this.ensureReady();
    await container.mount(tree);
  }

  /**
   * Check if WebContainer is ready
   */
  isContainerReady(): boolean {
    return this.isReady;
  }
}

// Export singleton instance
export const webContainerManager = WebContainerManager.getInstance();
