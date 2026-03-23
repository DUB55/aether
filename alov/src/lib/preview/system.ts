/**
 * Preview System with Live Bundling
 * Provides live preview of applications with real bundling, HMR, and error overlays
 */

import { webContainerManager } from '@/lib/webcontainer/manager';
import { EventEmitter } from 'events';

export interface PreviewServer {
  url: string;
  port: number;
  status: 'starting' | 'ready' | 'error';
}

export type DevicePreset = 'mobile' | 'tablet' | 'desktop' | 'custom';

export interface BuildError {
  message: string;
  file: string;
  line: number;
  column: number;
  stack: string;
}

export interface RuntimeError {
  message: string;
  stack: string;
  componentStack?: string;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

const DEVICE_PRESETS: Record<DevicePreset, ViewportDimensions> = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  custom: { width: 800, height: 600 }
};

export class PreviewSystem extends EventEmitter {
  private static instance: PreviewSystem | null = null;
  private server: PreviewServer | null = null;
  private devProcess: any = null;
  private viewport: ViewportDimensions = DEVICE_PRESETS.desktop;
  private currentPreset: DevicePreset = 'desktop';

  private constructor() {
    super();
  }

  static getInstance(): PreviewSystem {
    if (!PreviewSystem.instance) {
      PreviewSystem.instance = new PreviewSystem();
    }
    return PreviewSystem.instance;
  }

  /**
   * Start the development server
   */
  async startDevServer(entry: string = 'src/main.tsx'): Promise<PreviewServer> {
    if (this.server && this.server.status === 'ready') {
      return this.server;
    }

    this.server = {
      url: '',
      port: 0,
      status: 'starting'
    };

    this.emit('status-change', 'starting');

    try {
      // Listen for server-ready event
      webContainerManager.onServerReady((port, url) => {
        if (this.server) {
          this.server.url = url;
          this.server.port = port;
          this.server.status = 'ready';
          this.emit('ready', url);
          this.emit('status-change', 'ready');
        }
      });

      // Start Vite dev server
      this.devProcess = await webContainerManager.spawn('npm', ['run', 'dev']);

      // Monitor output for errors
      const reader = this.devProcess.output.getReader();
      const decoder = new TextDecoder();

      this.monitorOutput(reader, decoder);

      return this.server;
    } catch (error) {
      if (this.server) {
        this.server.status = 'error';
      }
      this.emit('error', error);
      this.emit('status-change', 'error');
      throw error;
    }
  }

  /**
   * Monitor dev server output for errors and status
   */
  private async monitorOutput(reader: ReadableStreamDefaultReader<Uint8Array>, decoder: TextDecoder) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        
        // Check for build errors
        if (text.includes('error') || text.includes('Error')) {
          const error = this.parseBuildError(text);
          if (error) {
            this.emit('build-error', error);
          }
        }

        // Check for server ready
        if (text.includes('Local:') || text.includes('ready in')) {
          console.log('[Preview] Dev server ready');
        }
      }
    } catch (error) {
      console.error('[Preview] Output monitoring error:', error);
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse build error from output
   */
  private parseBuildError(output: string): BuildError | null {
    // Vite error pattern
    const viteError = output.match(/(.+\.tsx?):(\d+):(\d+): (.+)/);
    if (viteError) {
      return {
        message: viteError[4],
        file: viteError[1],
        line: parseInt(viteError[2]),
        column: parseInt(viteError[3]),
        stack: output
      };
    }

    // Generic error
    if (output.includes('Error:')) {
      const match = output.match(/Error: (.+)/);
      if (match) {
        return {
          message: match[1],
          file: '',
          line: 0,
          column: 0,
          stack: output
        };
      }
    }

    return null;
  }

  /**
   * Stop the development server
   */
  async stopDevServer(): Promise<void> {
    if (this.devProcess) {
      this.devProcess.kill();
      this.devProcess = null;
    }
    this.server = null;
    this.emit('status-change', 'stopped');
  }

  /**
   * Restart the development server
   */
  async restartDevServer(): Promise<void> {
    await this.stopDevServer();
    await this.startDevServer();
  }

  /**
   * Set viewport dimensions
   */
  setViewport(width: number, height: number): void {
    this.viewport = { width, height };
    this.currentPreset = 'custom';
    this.emit('viewport-change', this.viewport);
  }

  /**
   * Set device preset
   */
  setDevicePreset(preset: DevicePreset): void {
    this.currentPreset = preset;
    this.viewport = DEVICE_PRESETS[preset];
    this.emit('viewport-change', this.viewport);
  }

  /**
   * Rotate viewport (swap width and height)
   */
  rotate(): void {
    this.viewport = {
      width: this.viewport.height,
      height: this.viewport.width
    };
    this.emit('viewport-change', this.viewport);
  }

  /**
   * Refresh the preview
   */
  refresh(): void {
    this.emit('refresh');
  }

  /**
   * Get current viewport dimensions
   */
  getViewport(): ViewportDimensions {
    return { ...this.viewport };
  }

  /**
   * Get current device preset
   */
  getCurrentPreset(): DevicePreset {
    return this.currentPreset;
  }

  /**
   * Get server status
   */
  getServerStatus(): PreviewServer | null {
    return this.server;
  }

  /**
   * Inject error overlay script into preview
   */
  getErrorOverlayScript(): string {
    return `
      <script>
        window.addEventListener('error', (event) => {
          window.parent.postMessage({
            type: 'runtime-error',
            error: {
              message: event.message,
              stack: event.error?.stack,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno
            }
          }, '*');
        });

        window.addEventListener('unhandledrejection', (event) => {
          window.parent.postMessage({
            type: 'runtime-error',
            error: {
              message: event.reason?.message || String(event.reason),
              stack: event.reason?.stack
            }
          }, '*');
        });
      </script>
    `;
  }
}

export const previewSystem = PreviewSystem.getInstance();
