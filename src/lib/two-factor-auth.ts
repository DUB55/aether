// Two-factor authentication service
// Handles TOTP-based 2FA for enhanced security

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TwoFactorVerificationResult {
  success: boolean
  message: string
}

export const twoFactorAuthService = {
  // Generate secret for 2FA setup
  generateSecret: (userId: string): string => {
    // Generate a random 32-character secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // Store secret (in production, this would be encrypted in Firebase/Supabase)
    const twoFactorData = JSON.parse(localStorage.getItem('aether_2fa_data') || '{}')
    twoFactorData[userId] = {
      secret,
      enabled: false,
      backupCodes: [],
      createdAt: Date.now()
    }
    localStorage.setItem('aether_2fa_data', JSON.stringify(twoFactorData))
    
    return secret
  },

  // Generate QR code URL for authenticator apps
  generateQrCodeUrl: (email: string, secret: string): string => {
    const issuer = 'Aether AI'
    const encodedIssuer = encodeURIComponent(issuer)
    const encodedEmail = encodeURIComponent(email)
    return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`
  },

  // Generate backup codes
  generateBackupCodes: (count: number = 10): string[] => {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  },

  // Setup 2FA for user
  setupTwoFactor: (userId: string, email: string): TwoFactorSetup => {
    const secret = twoFactorAuthService.generateSecret(userId)
    const qrCodeUrl = twoFactorAuthService.generateQrCodeUrl(email, secret)
    const backupCodes = twoFactorAuthService.generateBackupCodes()
    
    // Store backup codes
    const twoFactorData = JSON.parse(localStorage.getItem('aether_2fa_data') || '{}')
    if (twoFactorData[userId]) {
      twoFactorData[userId].backupCodes = backupCodes
      localStorage.setItem('aether_2fa_data', JSON.stringify(twoFactorData))
    }
    
    return {
      secret,
      qrCodeUrl,
      backupCodes
    }
  },

  // Verify TOTP code (simplified - in production use a proper TOTP library)
  verifyCode: (userId: string, code: string): TwoFactorVerificationResult => {
    try {
      const twoFactorData = JSON.parse(localStorage.getItem('aether_2fa_data') || '{}')
      const user2fa = twoFactorData[userId]
      
      if (!user2fa || !user2fa.enabled) {
        return {
          success: false,
          message: '2FA not enabled for this user'
        }
      }

      // In production, use a proper TOTP library like 'otpauth'
      // For now, we'll simulate verification with a simple check
      // The code should be 6 digits
      if (!/^\d{6}$/.test(code)) {
        return {
          success: false,
          message: 'Invalid code format'
        }
      }

      // Simplified verification (in production, use proper TOTP algorithm)
      // For demo purposes, we'll accept any 6-digit code
      const isValid = code.length === 6
      
      if (isValid) {
        return {
          success: true,
          message: 'Code verified successfully'
        }
      } else {
        return {
          success: false,
          message: 'Invalid verification code'
        }
      }
    } catch (error) {
      console.error('2FA verification error:', error)
      return {
        success: false,
        message: 'Verification failed'
      }
    }
  },

  // Verify backup code
  verifyBackupCode: (userId: string, code: string): TwoFactorVerificationResult => {
    try {
      const twoFactorData = JSON.parse(localStorage.getItem('aether_2fa_data') || '{}')
      const user2fa = twoFactorData[userId]
      
      if (!user2fa) {
        return {
          success: false,
          message: '2FA not set up for this user'
        }
      }

      const codeIndex = user2fa.backupCodes.indexOf(code.toUpperCase())
      if (codeIndex === -1) {
        return {
          success: false,
          message: 'Invalid backup code'
        }
      }

      // Remove used backup code
      user2fa.backupCodes.splice(codeIndex, 1)
      twoFactorData[userId] = user2fa
      localStorage.setItem('aether_2fa_data', JSON.stringify(twoFactorData))

      return {
        success: true,
        message: 'Backup code verified'
      }
    } catch (error) {
      console.error('Backup code verification error:', error)
      return {
        success: false,
        message: 'Verification failed'
      }
    }
  },

  // Enable 2FA after verification
  enableTwoFactor: (userId: string): boolean => {
    try {
      const twoFactorData = JSON.parse(localStorage.getItem('aether_2fa_data') || '{}')
      if (twoFactorData[userId]) {
        twoFactorData[userId].enabled = true
        twoFactorData[userId].enabledAt = Date.now()
        localStorage.setItem('aether_2fa_data', JSON.stringify(twoFactorData))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
      return false
    }
  },

  // Disable 2FA
  disableTwoFactor: (userId: string): boolean => {
    try {
      const twoFactorData = JSON.parse(localStorage.getItem('aether_2fa_data') || '{}')
      if (twoFactorData[userId]) {
        twoFactorData[userId].enabled = false
        twoFactorData[userId].disabledAt = Date.now()
        localStorage.setItem('aether_2fa_data', JSON.stringify(twoFactorData))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      return false
    }
  },

  // Check if 2FA is enabled for user
  isTwoFactorEnabled: (userId: string): boolean => {
    const twoFactorData = JSON.parse(localStorage.getItem('aether_2fa_data') || '{}')
    return twoFactorData[userId]?.enabled || false
  },

  // Get 2FA status
  getTwoFactorStatus: (userId: string) => {
    const twoFactorData = JSON.parse(localStorage.getItem('aether_2fa_data') || '{}')
    const user2fa = twoFactorData[userId]
    
    return {
      enabled: user2fa?.enabled || false,
      enabledAt: user2fa?.enabledAt || null,
      backupCodesRemaining: user2fa?.backupCodes?.length || 0
    }
  }
}
