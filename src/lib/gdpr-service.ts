// GDPR compliance service
// Handles data consent, data deletion requests, and privacy compliance

export interface ConsentRecord {
  id: string
  userId: string
  consentType: 'analytics' | 'marketing' | 'essential'
  granted: boolean
  timestamp: number
  ipAddress?: string
}

export interface DataDeletionRequest {
  id: string
  userId: string
  email: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: number
  completedAt?: number
  reason?: string
}

export const gdprService = {
  // Record user consent
  recordConsent: (userId: string, consentType: 'analytics' | 'marketing' | 'essential', granted: boolean): ConsentRecord => {
    const record: ConsentRecord = {
      id: `consent_${Date.now()}`,
      userId,
      consentType,
      granted,
      timestamp: Date.now(),
      ipAddress: '192.168.1.1' // In production, capture actual IP
    }

    const consents = JSON.parse(localStorage.getItem('aether_gdpr_consents') || '[]')
    consents.push(record)
    localStorage.setItem('aether_gdpr_consents', JSON.stringify(consents))

    return record
  },

  // Get user consent status
  getConsentStatus: (userId: string): Record<string, boolean> => {
    const consents = JSON.parse(localStorage.getItem('aether_gdpr_consents') || '[]')
    const userConsents = consents.filter((c: ConsentRecord) => c.userId === userId)
    
    return {
      analytics: userConsents.find((c: ConsentRecord) => c.consentType === 'analytics')?.granted || false,
      marketing: userConsents.find((c: ConsentRecord) => c.consentType === 'marketing')?.granted || false,
      essential: true // Essential cookies are always required
    }
  },

  // Update user consent
  updateConsent: (userId: string, consents: { analytics?: boolean; marketing?: boolean }): void => {
    if (consents.analytics !== undefined) {
      gdprService.recordConsent(userId, 'analytics', consents.analytics)
    }
    if (consents.marketing !== undefined) {
      gdprService.recordConsent(userId, 'marketing', consents.marketing)
    }
  },

  // Request data deletion
  requestDeletion: (userId: string, email: string, reason?: string): DataDeletionRequest => {
    const request: DataDeletionRequest = {
      id: `deletion_${Date.now()}`,
      userId,
      email,
      status: 'pending',
      requestedAt: Date.now(),
      reason
    }

    const requests = JSON.parse(localStorage.getItem('aether_gdpr_deletions') || '[]')
    requests.push(request)
    localStorage.setItem('aether_gdpr_deletions', JSON.stringify(requests))

    return request
  },

  // Get deletion requests
  getDeletionRequests: (): DataDeletionRequest[] => {
    return JSON.parse(localStorage.getItem('aether_gdpr_deletions') || '[]')
  },

  // Process deletion request
  processDeletion: (requestId: string): boolean => {
    const requests = JSON.parse(localStorage.getItem('aether_gdpr_deletions') || '[]')
    const index = requests.findIndex((r: DataDeletionRequest) => r.id === requestId)
    
    if (index === -1) return false

    requests[index].status = 'processing'
    localStorage.setItem('aether_gdpr_deletions', JSON.stringify(requests))

    // Simulate deletion process
    setTimeout(() => {
      requests[index].status = 'completed'
      requests[index].completedAt = Date.now()
      localStorage.setItem('aether_gdpr_deletions', JSON.stringify(requests))
    }, 5000)

    return true
  },

  // Export user data (right to data portability)
  exportUserData: (userId: string): Record<string, any> => {
    // In production, this would gather all user data from Firebase/Supabase
    return {
      userId,
      exportDate: new Date().toISOString(),
      profile: {
        email: 'user@example.com',
        displayName: 'User Name',
        createdAt: new Date().toISOString()
      },
      projects: [],
      settings: {},
      consents: gdprService.getConsentStatus(userId)
    }
  },

  // Check if user can be deleted (has no active subscriptions, etc.)
  canDeleteUser: (userId: string): { canDelete: boolean; reason?: string } => {
    // In production, check for active subscriptions, pending transactions, etc.
    return { canDelete: true }
  },

  // Generate privacy policy summary
  getPrivacySummary: () => {
    return {
      dataCollection: ['Email', 'Usage data', 'Project data', 'Analytics data'],
      dataUsage: ['Account management', 'Service improvement', 'Analytics', 'Communication'],
      dataRetention: 'Data is retained for 30 days after account deletion',
      dataSharing: 'Data is not shared with third parties except as required by law',
      userRights: [
        'Right to access personal data',
        'Right to rectification',
        'Right to erasure',
        'Right to data portability',
        'Right to object',
        'Right to restrict processing'
      ],
      contactEmail: 'privacy@aether.dev'
    }
  }
}
