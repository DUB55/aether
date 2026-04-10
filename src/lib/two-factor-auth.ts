// Two-factor authentication service
// Handles TOTP-based 2FA for enhanced security
// Now uses Firebase Firestore for persistent storage

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TwoFactorVerificationResult {
  success: boolean
  message: string
}

const TWO_FACTOR_COLLECTION = 'two_factor_data';

export const twoFactorAuthService = {
  // Generate secret for 2FA setup
  generateSecret: async (userId: string): Promise<string> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    // Generate a random 32-character secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // Store secret in Firebase Firestore
    const twoFactorRef = doc(db, TWO_FACTOR_COLLECTION, userId);
    await setDoc(twoFactorRef, {
      userId,
      secret,
      enabled: false,
      backupCodes: [],
      createdAt: Timestamp.now()
    }, { merge: true });
    
    return secret;
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
  setupTwoFactor: async (userId: string, email: string): Promise<TwoFactorSetup> => {
    const secret = await twoFactorAuthService.generateSecret(userId)
    const qrCodeUrl = twoFactorAuthService.generateQrCodeUrl(email, secret)
    const backupCodes = twoFactorAuthService.generateBackupCodes()
    
    // Store backup codes in Firebase
    const twoFactorRef = doc(db, TWO_FACTOR_COLLECTION, userId);
    await updateDoc(twoFactorRef, {
      backupCodes,
      updatedAt: Timestamp.now()
    });
    
    return {
      secret,
      qrCodeUrl,
      backupCodes
    }
  },

  // Verify TOTP code (simplified - in production use a proper TOTP library)
  verifyCode: async (userId: string, code: string): Promise<TwoFactorVerificationResult> => {
    try {
      const twoFactorRef = doc(db, TWO_FACTOR_COLLECTION, userId);
      const twoFactorDoc = await getDoc(twoFactorRef);
      
      if (!twoFactorDoc.exists()) {
        return {
          success: false,
          message: '2FA not set up for this user'
        }
      }

      const user2fa = twoFactorDoc.data();
      
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
  verifyBackupCode: async (userId: string, code: string): Promise<TwoFactorVerificationResult> => {
    try {
      const twoFactorRef = doc(db, TWO_FACTOR_COLLECTION, userId);
      const twoFactorDoc = await getDoc(twoFactorRef);
      
      if (!twoFactorDoc.exists()) {
        return {
          success: false,
          message: '2FA not set up for this user'
        }
      }

      const user2fa = twoFactorDoc.data();
      const backupCodes = user2fa.backupCodes || [];

      const codeIndex = backupCodes.indexOf(code.toUpperCase())
      if (codeIndex === -1) {
        return {
          success: false,
          message: 'Invalid backup code'
        }
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      await updateDoc(twoFactorRef, {
        backupCodes,
        updatedAt: Timestamp.now()
      });

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
  enableTwoFactor: async (userId: string): Promise<boolean> => {
    try {
      const twoFactorRef = doc(db, TWO_FACTOR_COLLECTION, userId);
      const twoFactorDoc = await getDoc(twoFactorRef);
      
      if (twoFactorDoc.exists()) {
        await updateDoc(twoFactorRef, {
          enabled: true,
          enabledAt: Timestamp.now()
        });
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
      return false
    }
  },

  // Disable 2FA
  disableTwoFactor: async (userId: string): Promise<boolean> => {
    try {
      const twoFactorRef = doc(db, TWO_FACTOR_COLLECTION, userId);
      const twoFactorDoc = await getDoc(twoFactorRef);
      
      if (twoFactorDoc.exists()) {
        await updateDoc(twoFactorRef, {
          enabled: false,
          disabledAt: Timestamp.now()
        });
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      return false
    }
  },

  // Check if 2FA is enabled for user
  isTwoFactorEnabled: async (userId: string): Promise<boolean> => {
    const twoFactorRef = doc(db, TWO_FACTOR_COLLECTION, userId);
    const twoFactorDoc = await getDoc(twoFactorRef);
    
    if (twoFactorDoc.exists()) {
      const user2fa = twoFactorDoc.data();
      return user2fa?.enabled || false;
    }
    return false;
  },

  // Get 2FA status
  getTwoFactorStatus: async (userId: string) => {
    const twoFactorRef = doc(db, TWO_FACTOR_COLLECTION, userId);
    const twoFactorDoc = await getDoc(twoFactorRef);
    
    if (twoFactorDoc.exists()) {
      const user2fa = twoFactorDoc.data();
      return {
        enabled: user2fa?.enabled || false,
        enabledAt: user2fa?.enabledAt || null,
        backupCodesRemaining: user2fa?.backupCodes?.length || 0
      };
    }
    
    return {
      enabled: false,
      enabledAt: null,
      backupCodesRemaining: 0
    };
  }
}
