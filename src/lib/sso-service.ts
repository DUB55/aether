// SSO (Single Sign-On) service
// Supports OAuth 2.0 and SAML for enterprise authentication
// Now uses Firebase Firestore for persistent storage

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

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
  createdAt: Timestamp
}

const SSO_CONFIGS_COLLECTION = 'sso_configs';
const SSO_CONNECTIONS_COLLECTION = 'sso_connections';

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
  configureProvider: async (providerId: string, config: Record<string, string>): Promise<SSOProvider> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

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

    // Store configuration in Firebase Firestore
    const configRef = doc(db, SSO_CONFIGS_COLLECTION, providerId);
    await setDoc(configRef, {
      ...updatedProvider,
      userId: auth.currentUser.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return updatedProvider
  },

  // Get configured providers
  getConfiguredProviders: async (): Promise<SSOProvider[]> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const q = query(collection(db, SSO_CONFIGS_COLLECTION), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as SSOProvider);
  },

  // Enable SSO for workspace
  enableSSOForWorkspace: async (workspaceId: string, providerId: string): Promise<SSOConnection> => {
    const connectionId = `sso_${Date.now()}`;
    const connection: SSOConnection = {
      id: connectionId,
      providerId,
      workspaceId,
      enabled: true,
      createdAt: Timestamp.now()
    }

    // Store connection in Firebase Firestore
    const connectionRef = doc(db, SSO_CONNECTIONS_COLLECTION, connectionId);
    await setDoc(connectionRef, connection);

    return connection
  },

  // Disable SSO for workspace
  disableSSOForWorkspace: async (workspaceId: string): Promise<boolean> => {
    const q = query(collection(db, SSO_CONNECTIONS_COLLECTION), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      await deleteDoc(querySnapshot.docs[0].ref);
    }
    
    return true;
  },

  // Get SSO connection for workspace
  getWorkspaceSSOConnection: async (workspaceId: string): Promise<SSOConnection | null> => {
    const q = query(collection(db, SSO_CONNECTIONS_COLLECTION), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as SSOConnection;
    }
    
    return null;
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
  removeProvider: async (providerId: string): Promise<boolean> => {
    const configRef = doc(db, SSO_CONFIGS_COLLECTION, providerId);
    const configDoc = await getDoc(configRef);
    
    if (configDoc.exists()) {
      await deleteDoc(configRef);
    }
    
    return true;
  }
}
