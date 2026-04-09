// SSO (Single Sign-On) service
// Supports OAuth 2.0 and SAML for enterprise authentication

export interface SSOProvider {
  id: string
  name: string
  type: 'oauth2' | 'saml'
  icon: string
  enabled: boolean
  config: {
    clientId?: string
    clientSecret?: string
    redirectUri?: string
    metadataUrl?: string
    issuer?: string
  }
}

export interface SSOConnection {
  id: string
  providerId: string
  workspaceId: string
  enabled: boolean
  createdAt: number
}

export const ssoService = {
  // Available SSO providers
  providers: {
    google: {
      id: 'google',
      name: 'Google Workspace',
      type: 'oauth2' as const,
      icon: '🔵',
      enabled: false,
      config: {}
    },
    microsoft: {
      id: 'microsoft',
      name: 'Microsoft Azure AD',
      type: 'oauth2' as const,
      icon: '🔷',
      enabled: false,
      config: {}
    },
    okta: {
      id: 'okta',
      name: 'Okta',
      type: 'saml' as const,
      icon: '🟢',
      enabled: false,
      config: {}
    },
    auth0: {
      id: 'auth0',
      name: 'Auth0',
      type: 'oauth2' as const,
      icon: '⚫',
      enabled: false,
      config: {}
    },
    github: {
      id: 'github',
      name: 'GitHub',
      type: 'oauth2' as const,
      icon: '🐙',
      enabled: false,
      config: {}
    }
  },

  // Configure SSO provider
  configureProvider: (providerId: string, config: Record<string, string>): SSOProvider => {
    const provider = ssoService.providers[providerId as keyof typeof ssoService.providers]
    if (!provider) {
      throw new Error('Invalid provider')
    }

    const updatedProvider: SSOProvider = {
      ...provider,
      enabled: true,
      config: {
        ...provider.config,
        ...config
      }
    }

    // Store configuration (in production, this would be in Firebase/Supabase)
    const ssoConfigs = JSON.parse(localStorage.getItem('aether_sso_configs') || '{}')
    ssoConfigs[providerId] = updatedProvider
    localStorage.setItem('aether_sso_configs', JSON.stringify(ssoConfigs))

    return updatedProvider
  },

  // Get configured providers
  getConfiguredProviders: (): SSOProvider[] => {
    const ssoConfigs = JSON.parse(localStorage.getItem('aether_sso_configs') || '{}')
    return Object.values(ssoConfigs)
  },

  // Enable SSO for workspace
  enableSSOForWorkspace: (workspaceId: string, providerId: string): SSOConnection => {
    const connection: SSOConnection = {
      id: `sso_${Date.now()}`,
      providerId,
      workspaceId,
      enabled: true,
      createdAt: Date.now()
    }

    // Store connection (in production, this would be in Firebase/Supabase)
    const ssoConnections = JSON.parse(localStorage.getItem('aether_sso_connections') || '{}')
    ssoConnections[workspaceId] = connection
    localStorage.setItem('aether_sso_connections', JSON.stringify(ssoConnections))

    return connection
  },

  // Disable SSO for workspace
  disableSSOForWorkspace: (workspaceId: string): boolean => {
    const ssoConnections = JSON.parse(localStorage.getItem('aether_sso_connections') || '{}')
    delete ssoConnections[workspaceId]
    localStorage.setItem('aether_sso_connections', JSON.stringify(ssoConnections))
    return true
  },

  // Get SSO connection for workspace
  getWorkspaceSSOConnection: (workspaceId: string): SSOConnection | null => {
    const ssoConnections = JSON.parse(localStorage.getItem('aether_sso_connections') || '{}')
    return ssoConnections[workspaceId] || null
  },

  // Initiate SSO login
  initiateLogin: (providerId: string): string => {
    const provider = ssoService.providers[providerId as keyof typeof ssoService.providers]
    if (!provider || !provider.enabled) {
      throw new Error('Provider not configured')
    }

    // In production, this would redirect to the provider's OAuth/SAML endpoint
    // For now, we'll return a mock authorization URL
    const state = Math.random().toString(36).substring(7)
    return `https://${provider.id}.oauth.com/authorize?state=${state}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}`
  },

  // Handle SSO callback
  handleCallback: (code: string, state: string): { success: boolean; userId?: string } => {
    // In production, this would exchange the code for an access token
    // and fetch user information from the provider
    // For now, we'll simulate a successful callback
    return {
      success: true,
      userId: `sso_user_${Date.now()}`
    }
  },

  // Remove provider configuration
  removeProvider: (providerId: string): boolean => {
    const ssoConfigs = JSON.parse(localStorage.getItem('aether_sso_configs') || '{}')
    delete ssoConfigs[providerId]
    localStorage.setItem('aether_sso_configs', JSON.stringify(ssoConfigs))
    return true
  }
}
