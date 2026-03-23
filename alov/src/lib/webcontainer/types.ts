/**
 * WebContainer type definitions
 */

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

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ServerReadyEvent {
  port: number;
  url: string;
}

export interface FileSystemTree {
  [key: string]: {
    file?: {
      contents: string;
    };
    directory?: FileSystemTree;
  };
}

export interface WebContainerConfig {
  coep?: 'credentialless' | 'require-corp';
  workdirName?: string;
}

export type WebContainerEventType = 'server-ready' | 'error' | 'port';

export interface WebContainerEventMap {
  'server-ready': ServerReadyEvent;
  'error': Error;
  'port': { port: number; url: string };
}
