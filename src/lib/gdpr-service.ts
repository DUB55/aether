// GDPR compliance service
// Handles data consent, data deletion requests, and privacy compliance
// Now uses Firebase Firestore for persistent storage

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface ConsentRecord {
  id: string
  userId: string
  consentType: 'analytics' | 'marketing' | 'essential'
  granted: boolean
  timestamp: Timestamp
  ipAddress?: string
}

export interface DataDeletionRequest {
  id: string
  userId: string
  email: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: Timestamp
  completedAt?: Timestamp
  reason?: string
}

const CONSENTS_COLLECTION = 'gdpr_consents';
const DELETION_REQUESTS_COLLECTION = 'gdpr_deletions';

export const gdprService = {
  // Record user consent
  recordConsent: async (userId: string, consentType: 'analytics' | 'marketing' | 'essential', granted: boolean): Promise<ConsentRecord> => {
    const consentId = `consent_${Date.now()}`;
    const now = Timestamp.now();
    
    const record: ConsentRecord = {
      id: consentId,
      userId,
      consentType,
      granted,
      timestamp: now,
      ipAddress: '192.168.1.1' // In production, capture actual IP
    }

    const consentRef = doc(db, CONSENTS_COLLECTION, consentId);
    await setDoc(consentRef, record);

    return record;
  },

  // Get user consent status
  getConsentStatus: async (userId: string): Promise<Record<string, boolean>> => {
    const q = query(collection(db, CONSENTS_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const userConsents = querySnapshot.docs.map(doc => doc.data() as ConsentRecord);
    
    return {
      analytics: userConsents.find((c: ConsentRecord) => c.consentType === 'analytics')?.granted || false,
      marketing: userConsents.find((c: ConsentRecord) => c.consentType === 'marketing')?.granted || false,
      essential: true // Essential cookies are always required
    };
  },

  // Update user consent
  updateConsent: async (userId: string, consents: { analytics?: boolean; marketing?: boolean }): Promise<void> => {
    if (consents.analytics !== undefined) {
      await gdprService.recordConsent(userId, 'analytics', consents.analytics);
    }
    if (consents.marketing !== undefined) {
      await gdprService.recordConsent(userId, 'marketing', consents.marketing);
    }
  },

  // Request data deletion
  requestDeletion: async (userId: string, email: string, reason?: string): Promise<DataDeletionRequest> => {
    const requestId = `deletion_${Date.now()}`;
    const now = Timestamp.now();
    
    const request: DataDeletionRequest = {
      id: requestId,
      userId,
      email,
      status: 'pending',
      requestedAt: now,
      reason
    }

    const requestRef = doc(db, DELETION_REQUESTS_COLLECTION, requestId);
    await setDoc(requestRef, request);

    return request;
  },

  // Get deletion requests
  getDeletionRequests: async (): Promise<DataDeletionRequest[]> => {
    const q = query(collection(db, DELETION_REQUESTS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as DataDeletionRequest);
  },

  // Process deletion request
  processDeletion: async (requestId: string): Promise<boolean> => {
    const requestRef = doc(db, DELETION_REQUESTS_COLLECTION, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) return false;

    await updateDoc(requestRef, { status: 'processing' });

    // Simulate deletion process
    setTimeout(async () => {
      await updateDoc(requestRef, { 
        status: 'completed',
        completedAt: Timestamp.now()
      });
    }, 5000);

    return true;
  },

  // Export user data (right to data portability)
  exportUserData: async (userId: string): Promise<Record<string, any>> => {
    // In production, this would gather all user data from Firebase/Supabase
    const consentStatus = await gdprService.getConsentStatus(userId);
    
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
      consents: consentStatus
    };
  },

  // Check if user can be deleted (has no active subscriptions, etc.)
  canDeleteUser: async (userId: string): Promise<{ canDelete: boolean; reason?: string }> => {
    // In production, check for active subscriptions, pending transactions, etc.
    return { canDelete: true };
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
    };
  }
}
