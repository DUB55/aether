/**
 * React hook for dependency management
 */

import { useState, useCallback } from 'react';
import { dependencyManager, InstallResult } from '@/lib/dependencies/manager';

export interface UseDependencyManagerReturn {
  isInstalling: boolean;
  installLogs: string[];
  detectDependencies: (code: string) => Promise<string[]>;
  install: (packages: string[]) => Promise<InstallResult>;
  installAll: () => Promise<InstallResult>;
  uninstall: (packages: string[]) => Promise<void>;
  getInstalledPackages: () => Promise<Record<string, string>>;
}

export function useDependencyManager(): UseDependencyManagerReturn {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installLogs, setInstallLogs] = useState<string[]>([]);

  const detectDependencies = useCallback(async (code: string) => {
    return dependencyManager.detectDependencies(code);
  }, []);

  const install = useCallback(async (packages: string[]) => {
    setIsInstalling(true);
    setInstallLogs([]);

    try {
      const result = await dependencyManager.install(packages, (log) => {
        setInstallLogs(prev => [...prev, log]);
      });
      return result;
    } finally {
      setIsInstalling(false);
    }
  }, []);

  const installAll = useCallback(async () => {
    setIsInstalling(true);
    setInstallLogs([]);

    try {
      const result = await dependencyManager.installAll((log) => {
        setInstallLogs(prev => [...prev, log]);
      });
      return result;
    } finally {
      setIsInstalling(false);
    }
  }, []);

  const uninstall = useCallback(async (packages: string[]) => {
    return dependencyManager.uninstall(packages);
  }, []);

  const getInstalledPackages = useCallback(async () => {
    return dependencyManager.getInstalledPackages();
  }, []);

  return {
    isInstalling,
    installLogs,
    detectDependencies,
    install,
    installAll,
    uninstall,
    getInstalledPackages
  };
}
