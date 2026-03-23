/**
 * Dependency Manager
 * Handles npm package installation, resolution, and caching within the WebContainer
 */

import { webContainerManager } from '@/lib/webcontainer/manager';

export interface InstallResult {
  success: boolean;
  installedPackages: string[];
  errors: string[];
  logs: string[];
  duration: number;
}

export interface PackageCache {
  name: string;
  version: string;
  files: any;
  timestamp: number;
}

export class DependencyManager {
  private static instance: DependencyManager | null = null;
  private installingPackages = new Set<string>();

  private constructor() {}

  static getInstance(): DependencyManager {
    if (!DependencyManager.instance) {
      DependencyManager.instance = new DependencyManager();
    }
    return DependencyManager.instance;
  }

  /**
   * Detect dependencies from code using regex and AST parsing
   */
  async detectDependencies(code: string): Promise<string[]> {
    const dependencies = new Set<string>();

    // ES6 imports: import ... from 'package'
    const es6ImportRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = es6ImportRegex.exec(code)) !== null) {
      const pkg = match[1];
      if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
        // Extract package name (handle scoped packages)
        const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
        dependencies.add(pkgName);
      }
    }

    // CommonJS require: require('package')
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(code)) !== null) {
      const pkg = match[1];
      if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
        const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
        dependencies.add(pkgName);
      }
    }

    // Dynamic imports: import('package')
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = dynamicImportRegex.exec(code)) !== null) {
      const pkg = match[1];
      if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
        const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
        dependencies.add(pkgName);
      }
    }

    // Filter out built-in Node.js modules
    const builtinModules = new Set([
      'fs', 'path', 'http', 'https', 'crypto', 'os', 'util', 'events',
      'stream', 'buffer', 'url', 'querystring', 'assert', 'child_process'
    ]);

    return Array.from(dependencies).filter(dep => !builtinModules.has(dep));
  }

  /**
   * Install specific packages
   */
  async install(packages: string[], onProgress?: (log: string) => void): Promise<InstallResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    const errors: string[] = [];
    const installedPackages: string[] = [];

    // Check if already installing
    for (const pkg of packages) {
      if (this.installingPackages.has(pkg)) {
        return {
          success: false,
          installedPackages: [],
          errors: [`Package ${pkg} is already being installed`],
          logs,
          duration: 0
        };
      }
    }

    // Mark as installing
    packages.forEach(pkg => this.installingPackages.add(pkg));

    try {
      // Update package.json
      await this.updatePackageJson(
        packages.reduce((acc, pkg) => {
          acc[pkg] = 'latest';
          return acc;
        }, {} as Record<string, string>)
      );

      // Run npm install
      const process = await webContainerManager.spawn('npm', ['install']);
      
      const reader = process.output.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            logs.push(value);
            
            if (onProgress) {
              onProgress(value);
            }
          }

          // Check for errors
          if (value && (value.toLowerCase().includes('error') || value.toLowerCase().includes('failed'))) {
            errors.push(value);
          }

          // Track installed packages
          if (value) {
            const addedMatch = value.match(/added (\d+) package/);
            if (addedMatch) {
              installedPackages.push(...packages);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      const exitCode = await process.exit;
      const duration = Date.now() - startTime;

      return {
        success: exitCode === 0 && errors.length === 0,
        installedPackages: exitCode === 0 ? packages : [],
        errors,
        logs,
        duration
      };
    } catch (error) {
      errors.push(String(error));
      return {
        success: false,
        installedPackages: [],
        errors,
        logs,
        duration: Date.now() - startTime
      };
    } finally {
      // Remove from installing set
      packages.forEach(pkg => this.installingPackages.delete(pkg));
    }
  }

  /**
   * Install all dependencies from package.json
   */
  async installAll(onProgress?: (log: string) => void): Promise<InstallResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    const errors: string[] = [];

    try {
      const process = await webContainerManager.spawn('npm', ['install']);
      
      const reader = process.output.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            logs.push(value);
            
            if (onProgress) {
              onProgress(value);
            }

            if (value.toLowerCase().includes('error') || value.toLowerCase().includes('failed')) {
              errors.push(value);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      const exitCode = await process.exit;
      const duration = Date.now() - startTime;

      return {
        success: exitCode === 0 && errors.length === 0,
        installedPackages: [],
        errors,
        logs,
        duration
      };
    } catch (error) {
      errors.push(String(error));
      return {
        success: false,
        installedPackages: [],
        errors,
        logs,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Uninstall packages
   */
  async uninstall(packages: string[]): Promise<void> {
    await webContainerManager.exec('npm', ['uninstall', ...packages]);
  }

  /**
   * Update package.json with new dependencies
   */
  async updatePackageJson(dependencies: Record<string, string>): Promise<void> {
    try {
      // Read existing package.json
      const content = await webContainerManager.readFile('package.json');
      const packageJson = JSON.parse(content);

      // Merge dependencies
      packageJson.dependencies = {
        ...packageJson.dependencies,
        ...dependencies
      };

      // Write back
      await webContainerManager.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    } catch (error) {
      console.error('Failed to update package.json:', error);
      throw error;
    }
  }

  /**
   * Get installed packages from package.json
   */
  async getInstalledPackages(): Promise<Record<string, string>> {
    try {
      const content = await webContainerManager.readFile('package.json');
      const packageJson = JSON.parse(content);
      return packageJson.dependencies || {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Get cached package from IndexedDB
   */
  async getCachedPackage(name: string, version: string): Promise<PackageCache | null> {
    try {
      const db = await this.openCacheDB();
      const transaction = db.transaction(['packages'], 'readonly');
      const store = transaction.objectStore('packages');
      const key = `${name}@${version}`;
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get cached package:', error);
      return null;
    }
  }

  /**
   * Cache package in IndexedDB
   */
  async cachePackage(name: string, version: string, files: any): Promise<void> {
    try {
      const db = await this.openCacheDB();
      const transaction = db.transaction(['packages'], 'readwrite');
      const store = transaction.objectStore('packages');
      
      const cache: PackageCache = {
        name,
        version,
        files,
        timestamp: Date.now()
      };

      const key = `${name}@${version}`;
      
      return new Promise((resolve, reject) => {
        const request = store.put(cache, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to cache package:', error);
    }
  }

  /**
   * Open IndexedDB for package caching
   */
  private async openCacheDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('aether-package-cache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('packages')) {
          db.createObjectStore('packages');
        }
      };
    });
  }

  /**
   * Clean expired cache entries (older than 7 days)
   */
  async cleanExpiredCache(): Promise<void> {
    try {
      const db = await this.openCacheDB();
      const transaction = db.transaction(['packages'], 'readwrite');
      const store = transaction.objectStore('packages');
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const cache = cursor.value as PackageCache;
          if (cache.timestamp < sevenDaysAgo) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    } catch (error) {
      console.error('Failed to clean cache:', error);
    }
  }
}

export const dependencyManager = DependencyManager.getInstance();
