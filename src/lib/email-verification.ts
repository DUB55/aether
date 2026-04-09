// Email verification service
// Handles email verification for user signups

export interface EmailVerificationRequest {
  email: string
  userId: string
}

export interface EmailVerificationResult {
  success: boolean
  message: string
  verificationCode?: string
}

export const emailVerificationService = {
  // Send verification email
  sendVerificationEmail: async (email: string, userId: string): Promise<EmailVerificationResult> => {
    try {
      // Generate verification code
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      // Store verification request (in production, this would be in Firebase/Supabase)
      const verificationRequests = JSON.parse(localStorage.getItem('aether_verification_requests') || '{}')
      verificationRequests[userId] = {
        email,
        code: verificationCode,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        verified: false
      }
      localStorage.setItem('aether_verification_requests', JSON.stringify(verificationRequests))
      
      // In production, this would send an actual email via a service like SendGrid, Resend, or Firebase Auth
      // For now, we'll log the code to console and return it
      console.log(`[Email Verification] Verification code for ${email}: ${verificationCode}`)
      
      return {
        success: true,
        message: 'Verification email sent successfully',
        verificationCode // Only for development/testing
      }
    } catch (error) {
      console.error('Email verification error:', error)
      return {
        success: false,
        message: 'Failed to send verification email'
      }
    }
  },

  // Verify email code
  verifyEmail: async (userId: string, code: string): Promise<EmailVerificationResult> => {
    try {
      const verificationRequests = JSON.parse(localStorage.getItem('aether_verification_requests') || '{}')
      const request = verificationRequests[userId]
      
      if (!request) {
        return {
          success: false,
          message: 'Verification request not found'
        }
      }
      
      // Check if expired
      if (Date.now() > request.expiresAt) {
        return {
          success: false,
          message: 'Verification code has expired'
        }
      }
      
      // Check if already verified
      if (request.verified) {
        return {
          success: true,
          message: 'Email already verified'
        }
      }
      
      // Verify code
      if (request.code !== code.toUpperCase()) {
        return {
          success: false,
          message: 'Invalid verification code'
        }
      }
      
      // Mark as verified
      request.verified = true
      request.verifiedAt = Date.now()
      verificationRequests[userId] = request
      localStorage.setItem('aether_verification_requests', JSON.stringify(verificationRequests))
      
      // Update user verification status (in production, this would update Firebase/Supabase user)
      const userVerifications = JSON.parse(localStorage.getItem('aether_user_verifications') || '{}')
      userVerifications[userId] = {
        email: request.email,
        verified: true,
        verifiedAt: Date.now()
      }
      localStorage.setItem('aether_user_verifications', JSON.stringify(userVerifications))
      
      return {
        success: true,
        message: 'Email verified successfully'
      }
    } catch (error) {
      console.error('Email verification error:', error)
      return {
        success: false,
        message: 'Failed to verify email'
      }
    }
  },

  // Check if email is verified
  isEmailVerified: (userId: string): boolean => {
    const userVerifications = JSON.parse(localStorage.getItem('aether_user_verifications') || '{}')
    return userVerifications[userId]?.verified || false
  },

  // Resend verification email
  resendVerificationEmail: async (userId: string): Promise<EmailVerificationResult> => {
    try {
      const verificationRequests = JSON.parse(localStorage.getItem('aether_verification_requests') || '{}')
      const request = verificationRequests[userId]
      
      if (!request) {
        return {
          success: false,
          message: 'No verification request found'
        }
      }
      
      // Generate new code
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      request.code = newCode
      request.createdAt = Date.now()
      request.expiresAt = Date.now() + 24 * 60 * 60 * 1000
      verificationRequests[userId] = request
      localStorage.setItem('aether_verification_requests', JSON.stringify(verificationRequests))
      
      console.log(`[Email Verification] New verification code for ${request.email}: ${newCode}`)
      
      return {
        success: true,
        message: 'Verification email resent successfully',
        verificationCode: newCode
      }
    } catch (error) {
      console.error('Email verification error:', error)
      return {
        success: false,
        message: 'Failed to resend verification email'
      }
    }
  },

  // Get verification status
  getVerificationStatus: (userId: string) => {
    const userVerifications = JSON.parse(localStorage.getItem('aether_user_verifications') || '{}')
    const verification = userVerifications[userId]
    
    return {
      verified: verification?.verified || false,
      email: verification?.email || null,
      verifiedAt: verification?.verifiedAt || null
    }
  }
}
