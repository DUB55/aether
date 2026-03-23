/**
 * WebContainerManager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebContainerManager } from './manager';

describe('WebContainerManager', () => {
  let manager: WebContainerManager;

  beforeEach(() => {
    manager = WebContainerManager.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = WebContainerManager.getInstance();
      const instance2 = WebContainerManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Boot Process', () => {
    it('should initialize WebContainer', async () => {
      const container = await manager.boot();
      expect(container).toBeDefined();
    });

    it('should set isReady to true after boot', async () => {
      await manager.boot();
      expect(manager.isReady()).toBe(true);
    });
  });

  describe('File Operations', () => {
    beforeEach(async () => {
      await manager.boot();
    });

    it('should write and read files', async () => {
      const content = 'test content';
      await manager.writeFile('test.txt', content);
      const readContent = await manager.readFile('test.txt');
      expect(readContent).toBe(content);
    });

    it('should delete files', async () => {
      await manager.writeFile('delete-me.txt', 'content');
      await manager.deleteFile('delete-me.txt');
      
      // Reading deleted file should throw
      await expect(manager.readFile('delete-me.txt')).rejects.toThrow();
    });

    it('should list files in directory', async () => {
      await manager.writeFile('file1.txt', 'content1');
      await manager.writeFile('file2.txt', 'content2');
      
      const files = await manager.listFiles('/');
      expect(files).toContain('file1.txt');
      expect(files).toContain('file2.txt');
    });
  });

  describe('Process Management', () => {
    beforeEach(async () => {
      await manager.boot();
    });

    it('should spawn processes', async () => {
      const process = await manager.spawn('echo "test"');
      expect(process).toBeDefined();
      expect(process.output).toBeDefined();
    });

    it('should execute commands', async () => {
      const result = await manager.exec('echo "hello"');
      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when accessing container before boot', async () => {
      const newManager = Object.create(WebContainerManager.prototype);
      await expect(newManager.readFile('test.txt')).rejects.toThrow();
    });

    it('should handle invalid file paths', async () => {
      await manager.boot();
      await expect(manager.readFile('')).rejects.toThrow();
    });
  });
});
