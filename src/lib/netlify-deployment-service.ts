// Netlify deployment service
// Handles deployment of projects to Netlify

export interface NetlifyConfig {
  accessToken: string
  teamId?: string
  siteId?: string
}

export interface NetlifyDeploymentConfig {
  projectName: string
  framework: 'nextjs' | 'react' | 'vue' | 'svelte' | 'nuxt' | 'astro' | 'other'
  buildCommand?: string
  outputDirectory?: string
  installCommand?: string
  environmentVariables?: Record<string, string>
}

export interface NetlifyDeployment {
  id: string
  url: string
  state: 'queued' | 'building' | 'ready' | 'error'
  createdAt: string
  updatedAt: string
  deployUrl?: string
}

export interface NetlifyDeploymentResult {
  success: boolean
  deployment?: NetlifyDeployment
  error?: string
}

const NETLIFY_CONFIG_STORAGE_KEY = 'aether_netlify_config';

export const netlifyDeploymentService = {
  // Save Netlify configuration
  saveConfig: (config: NetlifyConfig): void => {
    localStorage.setItem(NETLIFY_CONFIG_STORAGE_KEY, JSON.stringify(config));
  },

  // Get Netlify configuration
  getConfig: (): NetlifyConfig | null => {
    const stored = localStorage.getItem(NETLIFY_CONFIG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Clear Netlify configuration
  clearConfig: (): void => {
    localStorage.removeItem(NETLIFY_CONFIG_STORAGE_KEY);
  },

  // Create a new Netlify site
  createSite: async (config: NetlifyDeploymentConfig): Promise<{ success: boolean; siteId?: string; siteUrl?: string; error?: string }> => {
    const netlifyConfig = netlifyDeploymentService.getConfig();
    if (!netlifyConfig) {
      return {
        success: false,
        error: 'Netlify configuration not found. Please configure your Netlify access token.'
      };
    }

    try {
      const response = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${netlifyConfig.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          account_slug: netlifyConfig.teamId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to create Netlify site'
        };
      }

      return {
        success: true,
        siteId: data.id,
        siteUrl: data.url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Netlify site'
      };
    }
  },

  // Deploy project to Netlify
  deploy: async (siteId: string, config: NetlifyDeploymentConfig): Promise<NetlifyDeploymentResult> => {
    const netlifyConfig = netlifyDeploymentService.getConfig();
    if (!netlifyConfig) {
      return {
        success: false,
        error: 'Netlify configuration not found. Please configure your Netlify access token.'
      };
    }

    try {
      // Note: In production, this would need to upload files via the Netlify API
      // For now, this is a simplified implementation
      const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${netlifyConfig.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branch: 'main',
          build_command: config.buildCommand || 'npm run build',
          dir: config.outputDirectory || 'dist',
          functions_dir: 'netlify/functions'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to deploy to Netlify'
        };
      }

      return {
        success: true,
        deployment: {
          id: data.id,
          url: data.url,
          state: data.state,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          deployUrl: data.deploy_url
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deploy to Netlify'
      };
    }
  },

  // Get deployment status
  getDeploymentStatus: async (siteId: string, deployId: string): Promise<NetlifyDeploymentResult> => {
    const netlifyConfig = netlifyDeploymentService.getConfig();
    if (!netlifyConfig) {
      return {
        success: false,
        error: 'Netlify configuration not found'
      };
    }

    try {
      const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys/${deployId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${netlifyConfig.accessToken}`
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
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          deployUrl: data.deploy_url
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get deployment status'
      };
    }
  },

  // List deployments for a site
  listDeployments: async (siteId: string): Promise<{ success: boolean; deployments?: NetlifyDeployment[]; error?: string }> => {
    const netlifyConfig = netlifyDeploymentService.getConfig();
    if (!netlifyConfig) {
      return {
        success: false,
        error: 'Netlify configuration not found'
      };
    }

    try {
      const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${netlifyConfig.accessToken}`
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
        deployments: data.map((d: any) => ({
          id: d.id,
          url: d.url,
          state: d.state,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          deployUrl: d.deploy_url
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list deployments'
      };
    }
  },

  // List user's sites
  listSites: async (): Promise<{ success: boolean; sites?: Array<{ id: string; name: string; url: string }>; error?: string }> => {
    const netlifyConfig = netlifyDeploymentService.getConfig();
    if (!netlifyConfig) {
      return {
        success: false,
        error: 'Netlify configuration not found'
      };
    }

    try {
      const teamQuery = netlifyConfig.teamId ? `?account_slug=${netlifyConfig.teamId}` : '';
      const response = await fetch(`https://api.netlify.com/api/v1/sites${teamQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${netlifyConfig.accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to list sites'
        };
      }

      return {
        success: true,
        sites: data.map((site: any) => ({
          id: site.id,
          name: site.name,
          url: site.url
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list sites'
      };
    }
  },

  // Delete site
  deleteSite: async (siteId: string): Promise<{ success: boolean; error?: string }> => {
    const netlifyConfig = netlifyDeploymentService.getConfig();
    if (!netlifyConfig) {
      return {
        success: false,
        error: 'Netlify configuration not found'
      };
    }

    try {
      const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${netlifyConfig.accessToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: data.message || 'Failed to delete site'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete site'
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

  // Validate Netlify access token
  validateToken: async (accessToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('https://api.netlify.com/api/v1/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Invalid access token'
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
