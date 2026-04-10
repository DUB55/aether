// Vercel deployment service
// Handles deployment of projects to Vercel

export interface VercelConfig {
  accessToken: string
  teamId?: string
}

export interface DeploymentConfig {
  projectId: string
  projectName: string
  framework: 'nextjs' | 'react' | 'vue' | 'svelte' | 'nuxt' | 'astro' | 'other'
  buildCommand?: string
  outputDirectory?: string
  installCommand?: string
  environmentVariables?: Record<string, string>
}

export interface Deployment {
  id: string
  url: string
  state: 'queued' | 'building' | 'ready' | 'error'
  createdAt: string
  updatedAt: string
}

export interface DeploymentResult {
  success: boolean
  deployment?: Deployment
  error?: string
}

const VERCEL_CONFIG_STORAGE_KEY = 'aether_vercel_config';

export const vercelDeploymentService = {
  // Save Vercel configuration
  saveConfig: (config: VercelConfig): void => {
    localStorage.setItem(VERCEL_CONFIG_STORAGE_KEY, JSON.stringify(config));
  },

  // Get Vercel configuration
  getConfig: (): VercelConfig | null => {
    const stored = localStorage.getItem(VERCEL_CONFIG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Clear Vercel configuration
  clearConfig: (): void => {
    localStorage.removeItem(VERCEL_CONFIG_STORAGE_KEY);
  },

  // Deploy project to Vercel
  deploy: async (config: DeploymentConfig): Promise<DeploymentResult> => {
    const vercelConfig = vercelDeploymentService.getConfig();
    if (!vercelConfig) {
      return {
        success: false,
        error: 'Vercel configuration not found. Please configure your Vercel access token.'
      };
    }

    try {
      // Create a new project deployment
      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelConfig.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.projectName,
          project: {
            name: config.projectName,
            framework: config.framework
          },
          target: 'production',
          buildCommand: config.buildCommand || 'npm run build',
          outputDirectory: config.outputDirectory || 'dist',
          installCommand: config.installCommand || 'npm install',
          env: config.environmentVariables || {}
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to create deployment'
        };
      }

      return {
        success: true,
        deployment: {
          id: data.id,
          url: data.url,
          state: data.state,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deploy to Vercel'
      };
    }
  },

  // Get deployment status
  getDeploymentStatus: async (deploymentId: string): Promise<DeploymentResult> => {
    const vercelConfig = vercelDeploymentService.getConfig();
    if (!vercelConfig) {
      return {
        success: false,
        error: 'Vercel configuration not found'
      };
    }

    try {
      const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vercelConfig.accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to get deployment status'
        };
      }

      return {
        success: true,
        deployment: {
          id: data.id,
          url: data.url,
          state: data.state,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get deployment status'
      };
    }
  },

  // List deployments for a project
  listDeployments: async (projectName: string): Promise<{ success: boolean; deployments?: Deployment[]; error?: string }> => {
    const vercelConfig = vercelDeploymentService.getConfig();
    if (!vercelConfig) {
      return {
        success: false,
        error: 'Vercel configuration not found'
      };
    }

    try {
      const teamQuery = vercelConfig.teamId ? `?teamId=${vercelConfig.teamId}` : '';
      const response = await fetch(`https://api.vercel.com/v6/projects/${projectName}/deployments${teamQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vercelConfig.accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to list deployments'
        };
      }

      return {
        success: true,
        deployments: data.deployments.map((d: any) => ({
          id: d.id,
          url: d.url,
          state: d.state,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list deployments'
      };
    }
  },

  // Delete deployment
  deleteDeployment: async (deploymentId: string): Promise<{ success: boolean; error?: string }> => {
    const vercelConfig = vercelDeploymentService.getConfig();
    if (!vercelConfig) {
      return {
        success: false,
        error: 'Vercel configuration not found'
      };
    }

    try {
      const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${vercelConfig.accessToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: data.message || 'Failed to delete deployment'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete deployment'
      };
    }
  },

  // Get supported frameworks
  getSupportedFrameworks(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'nextjs', label: 'Next.js', description: 'React framework with SSR and SSG' },
      { value: 'react', label: 'React', description: 'React SPA with Vite or CRA' },
      { value: 'vue', label: 'Vue', description: 'Vue.js SPA with Vite' },
      { value: 'svelte', label: 'Svelte', description: 'Svelte SPA with Vite' },
      { value: 'nuxt', label: 'Nuxt', description: 'Vue framework with SSR' },
      { value: 'astro', label: 'Astro', description: 'Multi-framework with islands' },
      { value: 'other', label: 'Other', description: 'Custom framework configuration' }
    ];
  },

  // Validate Vercel access token
  validateToken: async (accessToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('https://api.vercel.com/v2/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: data.message || 'Invalid access token'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate token'
      };
    }
  }
};
