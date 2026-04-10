// Secrets management service
// Securely stores and manages API keys and secrets
// Now uses Firebase Firestore for persistent storage

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface Secret {
  id: string
  name: string
  value: string
  type: 'api_key' | 'token' | 'password' | 'certificate'
  environment: 'development' | 'staging' | 'production'
  projectId?: string
  createdAt: Timestamp
  lastAccessed: Timestamp
  description?: string
}

const SECRETS_COLLECTION = 'secrets';

export const secretsService = {
  // Store a secret
  storeSecret: async (secret: Omit<Secret, 'id' | 'createdAt' | 'lastAccessed'>): Promise<Secret> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const secretId = `secret_${Date.now()}`;
    const now = Timestamp.now();
    
    const newSecret: Secret = {
      ...secret,
      id: secretId,
      createdAt: now,
      lastAccessed: now
    }

    // Store in Firebase Firestore
    const secretRef = doc(db, SECRETS_COLLECTION, secretId);
    await setDoc(secretRef, {
      ...newSecret,
      userId: auth.currentUser.uid
    });

    return newSecret;
  },

  // Get all secrets for a project
  getSecrets: async (projectId?: string): Promise<Secret[]> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    let q = query(collection(db, SECRETS_COLLECTION), where('userId', '==', auth.currentUser.uid));
    
    if (projectId) {
      q = query(collection(db, SECRETS_COLLECTION), where('userId', '==', auth.currentUser.uid), where('projectId', '==', projectId));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Secret);
  },

  // Get a specific secret
  getSecret: async (secretId: string): Promise<Secret | null> => {
    const secretRef = doc(db, SECRETS_COLLECTION, secretId);
    const secretDoc = await getDoc(secretRef);
    
    if (secretDoc.exists()) {
      const secret = secretDoc.data() as Secret;
      
      // Update last accessed time
      await updateDoc(secretRef, { lastAccessed: Timestamp.now() });
      
      return secret;
    }
    
    return null;
  },

  // Update a secret
  updateSecret: async (secretId: string, updates: Partial<Secret>): Promise<Secret | null> => {
    const secretRef = doc(db, SECRETS_COLLECTION, secretId);
    const secretDoc = await getDoc(secretRef);
    
    if (!secretDoc.exists()) return null;

    await updateDoc(secretRef, updates);
    
    const updatedDoc = await getDoc(secretRef);
    return updatedDoc.data() as Secret;
  },

  // Delete a secret
  deleteSecret: async (secretId: string): Promise<boolean> => {
    const secretRef = doc(db, SECRETS_COLLECTION, secretId);
    const secretDoc = await getDoc(secretRef);
    
    if (!secretDoc.exists()) return false;

    await deleteDoc(secretRef);
    return true;
  },

  // Rotate secret (generate new value)
  rotateSecret: async (secretId: string): Promise<Secret | null> => {
    const secret = await secretsService.getSecret(secretId);
    if (!secret) return null;

    // Generate new secret value based on type
    let newValue = '';
    switch (secret.type) {
      case 'api_key':
        newValue = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        break;
      case 'token':
        newValue = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        break;
      case 'password':
        newValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        break;
      default:
        newValue = Math.random().toString(36).substring(2);
    }

    return await secretsService.updateSecret(secretId, { value: newValue });
  },

  // Validate secret format
  validateSecret: (type: string, value: string): { valid: boolean; error?: string } => {
    if (!value || value.trim().length === 0) {
      return { valid: false, error: 'Secret value cannot be empty' };
    }

    switch (type) {
      case 'api_key':
        if (value.length < 16) {
          return { valid: false, error: 'API key must be at least 16 characters' };
        }
        break;
      case 'token':
        if (value.length < 20) {
          return { valid: false, error: 'Token must be at least 20 characters' };
        }
        break;
      case 'password':
        if (value.length < 8) {
          return { valid: false, error: 'Password must be at least 8 characters' };
        }
        break;
    }

    return { valid: true };
  },

  // Get secret usage statistics
  getUsageStats: async () => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const q = query(collection(db, SECRETS_COLLECTION), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const secrets = querySnapshot.docs.map(doc => doc.data() as Secret);
    
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
    };
  }
}
