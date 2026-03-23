/**
 * React hook for GitHub Deployment
 * 
 * Provides easy access to GitHub deployment functionality with React state management
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  GitHubDeploymentManager, 
  DeploymentConfig, 
  DeploymentResult, 
  DeploymentStatus,
  DeploymentProgress
} from '../lib/deployment/github-deployment-manager';

export function useGitHubDeployment() {
  const [manager] = useState(() => GitHubDeploymentManager.getInstance());
  const [status, setStatus] = useState<DeploymentStatus>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Subscribe to progress updates
  useEffect(() => {
    const unsubscribe = manager.onProgress((progress: DeploymentProgress) => {
      setStatus(progress.status);
      setLogs(manager.getLogs());
      
      // Update deploying state
      setIsDeploying(
        progress.status === 'collecting' || 
        progress.status === 'encrypting' || 
        progress.status === 'uploading'
      );
    });

    return unsubscribe;
  }, [manager]);

  /**
   * Deploy to GitHub
   */
  const deployToGitHub = useCallback(async (config: DeploymentConfig): Promise<DeploymentResult> => {
    setShareUrl(null);
    setIsDeploying(true);
    
    try {
      const result = await manager.deployProject(config);
      
      if (result.success && result.shareUrl) {
        setShareUrl(result.shareUrl);
      }
      
      return result;
    } finally {
      setIsDeploying(false);
    }
  }, [manager]);

  /**
   * Clear deployment state
   */
  const clearDeployment = useCallback(() => {
    setShareUrl(null);
    setLogs([]);
    setStatus('idle');
  }, []);

  return {
    status,
    logs,
    shareUrl,
    isDeploying,
    deployToGitHub,
    clearDeployment
  };
}
