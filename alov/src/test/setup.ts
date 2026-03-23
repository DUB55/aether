/**
 * Vitest setup file
 * 
 * Configures testing environment and global utilities
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IndexedDB
const indexedDB = {
  open: () => ({
    result: {
      objectStoreNames: {
        contains: () => false
      },
      createObjectStore: () => ({})
    },
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null
  })
};

global.indexedDB = indexedDB as any;

// Mock WebContainer API
(global as any).WebContainer = {
  boot: async () => ({
    mount: async () => {},
    fs: {
      readFile: async () => '',
      writeFile: async () => {},
      rm: async () => {},
      readdir: async () => []
    },
    spawn: async () => ({
      output: {
        pipeTo: () => {}
      },
      input: {
        getWriter: () => ({
          write: async () => {},
          releaseLock: () => {}
        })
      },
      exit: Promise.resolve(0),
      kill: () => {}
    }),
    on: () => {}
  })
} as any;
