import { invoke } from '@tauri-apps/api/core';

export interface FileOperationResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exit_code: number;
}

export interface DirectoryItem {
  name: string;
  path: string;
  is_file: boolean;
  size?: number;
}

export class TauriCommands {
  static async writeFile(path: string, content: string): Promise<FileOperationResult> {
    try {
      return await invoke('write_file', { path, content });
    } catch (error) {
      return {
        success: false,
        message: `Failed to write file: ${error}`,
        data: null
      };
    }
  }

  static async readFile(path: string): Promise<FileOperationResult> {
    try {
      return await invoke('read_file', { path });
    } catch (error) {
      return {
        success: false,
        message: `Failed to read file: ${error}`,
        data: null
      };
    }
  }

  static async manageDirectory(action: 'create' | 'delete' | 'list', path: string): Promise<FileOperationResult> {
    try {
      return await invoke('manage_directory', { action, path });
    } catch (error) {
      return {
        success: false,
        message: `Failed to manage directory: ${error}`,
        data: null
      };
    }
  }

  static async executeCommand(command: string, args?: string[]): Promise<CommandResult> {
    try {
      return await invoke('execute_command', { command, args });
    } catch (error) {
      return {
        success: false,
        stdout: '',
        stderr: `Failed to execute command: ${error}`,
        exit_code: -1
      };
    }
  }

  static async getCurrentDirectory(): Promise<FileOperationResult> {
    try {
      return await invoke('get_current_directory');
    } catch (error) {
      return {
        success: false,
        message: `Failed to get current directory: ${error}`,
        data: null
      };
    }
  }

  static async setCurrentDirectory(path: string): Promise<FileOperationResult> {
    try {
      return await invoke('set_current_directory', { path });
    } catch (error) {
      return {
        success: false,
        message: `Failed to set current directory: ${error}`,
        data: null
      };
    }
  }
}

export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}
