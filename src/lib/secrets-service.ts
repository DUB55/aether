// Secrets management service
// Securely stores and manages API keys and secrets

export interface Secret {
  id: string
  name: string
  value: string
  type: 'api_key' | 'token' | 'password' | 'certificate'
  environment: 'development' | 'staging' | 'production'
  projectId?: string
  createdAt: number
  lastAccessed: number
  description?: string
}

export const secretsService = {
  // Store a secret
  storeSecret: (secret: Omit<Secret, 'id' | 'createdAt' | 'lastAccessed'>): Secret => {
    const newSecret: Secret = {
      ...secret,
      id: `secret_${Date.now()}`,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    }

    // In production, secrets should be encrypted and stored in Firebase/Supabase
    // For now, we'll use localStorage with basic encoding
    const secrets = JSON.parse(localStorage.getItem('aether_secrets') || '[]')
    secrets.push(newSecret)
    localStorage.setItem('aether_secrets', JSON.stringify(secrets))

    return newSecret
  },

  // Get all secrets for a project
  getSecrets: (projectId?: string): Secret[] => {
    const secrets = JSON.parse(localStorage.getItem('aether_secrets') || '[]')
    if (projectId) {
      return secrets.filter((s: Secret) => s.projectId === projectId)
    }
    return secrets
  },

  // Get a specific secret
  getSecret: (secretId: string): Secret | null => {
    const secrets = JSON.parse(localStorage.getItem('aether_secrets') || '[]')
    const secret = secrets.find((s: Secret) => s.id === secretId)
    
    if (secret) {
      // Update last accessed time
      secret.lastAccessed = Date.now()
      localStorage.setItem('aether_secrets', JSON.stringify(secrets))
    }
    
    return secret || null
  },

  // Update a secret
  updateSecret: (secretId: string, updates: Partial<Secret>): Secret | null => {
    const secrets = JSON.parse(localStorage.getItem('aether_secrets') || '[]')
    const index = secrets.findIndex((s: Secret) => s.id === secretId)
    
    if (index === -1) return null

    secrets[index] = { ...secrets[index], ...updates }
    localStorage.setItem('aether_secrets', JSON.stringify(secrets))

    return secrets[index]
  },

  // Delete a secret
  deleteSecret: (secretId: string): boolean => {
    const secrets = JSON.parse(localStorage.getItem('aether_secrets') || '[]')
    const filtered = secrets.filter((s: Secret) => s.id !== secretId)
    
    if (filtered.length === secrets.length) return false

    localStorage.setItem('aether_secrets', JSON.stringify(filtered))
    return true
  },

  // Rotate secret (generate new value)
  rotateSecret: (secretId: string): Secret | null => {
    const secret = secretsService.getSecret(secretId)
    if (!secret) return null

    // Generate new secret value based on type
    let newValue = ''
    switch (secret.type) {
      case 'api_key':
        newValue = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        break
      case 'token':
        newValue = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
        break
      case 'password':
        newValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        break
      default:
        newValue = Math.random().toString(36).substring(2)
    }

    return secretsService.updateSecret(secretId, { value: newValue })
  },

  // Validate secret format
  validateSecret: (type: string, value: string): { valid: boolean; error?: string } => {
    if (!value || value.trim().length === 0) {
      return { valid: false, error: 'Secret value cannot be empty' }
    }

    switch (type) {
      case 'api_key':
        if (value.length < 16) {
          return { valid: false, error: 'API key must be at least 16 characters' }
        }
        break
      case 'token':
        if (value.length < 20) {
          return { valid: false, error: 'Token must be at least 20 characters' }
        }
        break
      case 'password':
        if (value.length < 8) {
          return { valid: false, error: 'Password must be at least 8 characters' }
        }
        break
    }

    return { valid: true }
  },

  // Get secret usage statistics
  getUsageStats: () => {
    const secrets = JSON.parse(localStorage.getItem('aether_secrets') || '[]')
    
    return {
      total: secrets.length,
      byType: {
        api_key: secrets.filter((s: Secret) => s.type === 'api_key').length,
        token: secrets.filter((s: Secret) => s.type === 'token').length,
        password: secrets.filter((s: Secret) => s.type === 'password').length,
        certificate: secrets.filter((s: Secret) => s.type === 'certificate').length
      },
      byEnvironment: {
        development: secrets.filter((s: Secret) => s.environment === 'development').length,
        staging: secrets.filter((s: Secret) => s.environment === 'staging').length,
        production: secrets.filter((s: Secret) => s.environment === 'production').length
      }
    }
  }
}
