/**
 * React hook for WebContainer management
 */

import { useState, useEffect, useCallback } from 'react';
import { webContainerManager, FileNode } from '@/lib/webcontainer/manager';

export interface UseWebContainerReturn {
  isReady: boolean;
  isBooting: boolean;
  error: Error | null;
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  listFiles: (directory?: string) => Promise<FileNode[]>;
  exec: (command: string, args?: string[]) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
  spawn: (command: string, args?: string[]) => Promise<any>;
}

export function useWebContainerManager(): UseWebContainerReturn {
  const [isReady, setIsReady] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initContainer = async () => {
      if (webContainerManager.isContainerReady()) {
        setIsReady(true);
        return;
      }

      setIsBooting(true);
      setError(null);

      try {
        await webContainerManager.initialize();
        setIsReady(true);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to initialize WebContainer:', err);
      } finally {
        setIsBooting(false);
      }
    };

    initContainer();
  }, []);

  const writeFile = useCallback(async (path: string, content: string) => {
    return webContainerManager.writeFile(path, content);
  }, []);

  const readFile = useCallback(async (path: string) => {
    return webContainerManager.readFile(path);
  }, []);

  const deleteFile = useCallback(async (path: string) => {
    return webContainerManager.deleteFile(path);
  }, []);

  const listFiles = useCallback(async (directory?: string) => {
    return webContainerManager.listFiles(directory);
  }, []);

  const exec = useCallback(async (command: string, args: string[] = []) => {
    return webContainerManager.exec(command, args);
  }, []);

  const spawn = useCallback(async (command: string, args: string[] = []) => {
    return webContainerManager.spawn(command, args);
  }, []);

  return {
    isReady,
    isBooting,
    error,
    writeFile,
    readFile,
    deleteFile,
    listFiles,
    exec,
    spawn
  };
}
