// Email verification service
// Handles email verification for user signups
// Now uses Firebase Firestore for persistent storage

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

export interface EmailVerificationRequest {
  email: string
  userId: string
}

export interface EmailVerificationResult {
  success: boolean
  message: string
  verificationCode?: string
}

interface VerificationRequestData {
  email: string
  code: string
  createdAt: Timestamp
  expiresAt: Timestamp
  verified: boolean
  verifiedAt?: Timestamp
}

interface UserVerificationData {
  email: string
  verified: boolean
  verifiedAt: Timestamp
}

const VERIFICATION_REQUESTS_COLLECTION = 'verification_requests';
const USER_VERIFICATIONS_COLLECTION = 'user_verifications';

export const emailVerificationService = {
  // Send verification email
  sendVerificationEmail: async (email: string, userId: string): Promise<EmailVerificationResult> => {
    try {
      // Generate verification code
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const now = Timestamp.now();
      const expiresAt = new Timestamp(now.seconds + 24 * 60 * 60, 0); // 24 hours
      
      // Store verification request in Firebase Firestore
      const verificationRef = doc(db, VERIFICATION_REQUESTS_COLLECTION, userId);
      await setDoc(verificationRef, {
        email,
        code: verificationCode,
        createdAt: now,
        expiresAt,
        verified: false
      });
      
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
      const verificationRef = doc(db, VERIFICATION_REQUESTS_COLLECTION, userId);
      const verificationDoc = await getDoc(verificationRef);
      
      if (!verificationDoc.exists()) {
        return {
          success: false,
          message: 'Verification request not found'
        }
      }
      
      const request = verificationDoc.data() as VerificationRequestData;
      const now = Timestamp.now();
      
      // Check if expired
      if (now.toMillis() > request.expiresAt.toMillis()) {
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
      await updateDoc(verificationRef, {
        verified: true,
        verifiedAt: now
      });
      
      // Update user verification status
      const userVerificationRef = doc(db, USER_VERIFICATIONS_COLLECTION, userId);
      await setDoc(userVerificationRef, {
        email: request.email,
        verified: true,
        verifiedAt: now
      });
      
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
  isEmailVerified: async (userId: string): Promise<boolean> => {
    const userVerificationRef = doc(db, USER_VERIFICATIONS_COLLECTION, userId);
    const userVerificationDoc = await getDoc(userVerificationRef);
    
    if (userVerificationDoc.exists()) {
      const verification = userVerificationDoc.data() as UserVerificationData;
      return verification.verified;
    }
    
    return false;
  },

  // Resend verification email
  resendVerificationEmail: async (userId: string): Promise<EmailVerificationResult> => {
    try {
      const verificationRef = doc(db, VERIFICATION_REQUESTS_COLLECTION, userId);
      const verificationDoc = await getDoc(verificationRef);
      
      if (!verificationDoc.exists()) {
        return {
          success: false,
          message: 'No verification request found'
        }
      }
      
      const request = verificationDoc.data() as VerificationRequestData;
      
      // Generate new code
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const now = Timestamp.now();
      const expiresAt = new Timestamp(now.seconds + 24 * 60 * 60, 0);
      
      await updateDoc(verificationRef, {
        code: newCode,
        createdAt: now,
        expiresAt
      });
      
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
  getVerificationStatus: async (userId: string) => {
    const userVerificationRef = doc(db, USER_VERIFICATIONS_COLLECTION, userId);
    const userVerificationDoc = await getDoc(userVerificationRef);
    
    if (userVerificationDoc.exists()) {
      const verification = userVerificationDoc.data() as UserVerificationData;
      return {
        verified: verification.verified,
        email: verification.email,
        verifiedAt: verification.verifiedAt
      };
    }
    
    return {
      verified: false,
      email: null,
      verifiedAt: null
    };
  }
}
