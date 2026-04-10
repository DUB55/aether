// SCIM (System for Cross-domain Identity Management) service
// Handles automated user provisioning for enterprise teams
// Now uses Firebase Firestore for persistent storage

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface SCIMUser {
  id: string
  userName: string
  name: {
    givenName: string
    familyName: string
  }
  email: string
  active: boolean
  displayName?: string
  groups?: string[]
  workspaceId?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface SCIMGroup {
  id: string
  displayName: string
  members: string[]
  workspaceId: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface SCIMConfig {
  enabled: boolean
  bearerToken: string
  endpointUrl: string
  workspaceId: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

const SCIM_CONFIGS_COLLECTION = 'scim_configs';
const SCIM_USERS_COLLECTION = 'scim_users';
const SCIM_GROUPS_COLLECTION = 'scim_groups';

export const scimService = {
  // Configure SCIM for workspace
  configureSCIM: async (workspaceId: string, config: SCIMConfig): Promise<boolean> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const configRef = doc(db, SCIM_CONFIGS_COLLECTION, workspaceId);
    await setDoc(configRef, {
      ...config,
      workspaceId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return true;
  },

  // Get SCIM configuration
  getSCIMConfig: async (workspaceId: string): Promise<SCIMConfig | null> => {
    const configRef = doc(db, SCIM_CONFIGS_COLLECTION, workspaceId);
    const configDoc = await getDoc(configRef);
    
    if (configDoc.exists()) {
      return configDoc.data() as SCIMConfig;
    }
    return null;
  },

  // Create user via SCIM
  createUser: async (workspaceId: string, user: Omit<SCIMUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<SCIMUser> => {
    const userId = `scim_user_${Date.now()}`;
    const now = Timestamp.now();
    
    const newUser: SCIMUser = {
      ...user,
      id: userId,
      workspaceId,
      createdAt: now,
      updatedAt: now
    };

    const userRef = doc(db, SCIM_USERS_COLLECTION, userId);
    await setDoc(userRef, newUser);

    return newUser;
  },

  // Get all users
  getUsers: async (workspaceId: string): Promise<SCIMUser[]> => {
    const q = query(collection(db, SCIM_USERS_COLLECTION), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as SCIMUser);
  },

  // Update user
  updateUser: async (workspaceId: string, userId: string, updates: Partial<SCIMUser>): Promise<SCIMUser | null> => {
    const userRef = doc(db, SCIM_USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return null;

    await updateDoc(userRef, { ...updates, updatedAt: Timestamp.now() });
    
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.data() as SCIMUser;
  },

  // Deactivate user
  deactivateUser: async (workspaceId: string, userId: string): Promise<boolean> => {
    const user = await scimService.updateUser(workspaceId, userId, { active: false });
    return user !== null;
  },

  // Create group
  createGroup: async (workspaceId: string, group: Omit<SCIMGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<SCIMGroup> => {
    const groupId = `scim_group_${Date.now()}`;
    const now = Timestamp.now();
    
    const newGroup: SCIMGroup = {
      ...group,
      id: groupId,
      workspaceId,
      createdAt: now,
      updatedAt: now
    };

    const groupRef = doc(db, SCIM_GROUPS_COLLECTION, groupId);
    await setDoc(groupRef, newGroup);

    return newGroup;
  },

  // Get all groups
  getGroups: async (workspaceId: string): Promise<SCIMGroup[]> => {
    const q = query(collection(db, SCIM_GROUPS_COLLECTION), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as SCIMGroup);
  },

  // Add user to group
  addUserToGroup: async (workspaceId: string, groupId: string, userId: string): Promise<boolean> => {
    const groupRef = doc(db, SCIM_GROUPS_COLLECTION, groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) return false;

    const group = groupDoc.data() as SCIMGroup;
    
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await updateDoc(groupRef, { members: group.members, updatedAt: Timestamp.now() });
    }

    return true;
  },

  // Remove user from group
  removeUserFromGroup: async (workspaceId: string, groupId: string, userId: string): Promise<boolean> => {
    const groupRef = doc(db, SCIM_GROUPS_COLLECTION, groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) return false;

    const group = groupDoc.data() as SCIMGroup;
    group.members = group.members.filter(id => id !== userId);
    
    await updateDoc(groupRef, { members: group.members, updatedAt: Timestamp.now() });

    return true;
  },

  // Sync with identity provider
  syncWithProvider: async (workspaceId: string): Promise<{ success: boolean; synced: number }> => {
    // In production, this would call the SCIM endpoint of the identity provider
    // For now, we'll simulate a sync
    const users = await scimService.getUsers(workspaceId);
    
    return {
      success: true,
      synced: users.length
    };
  }
}
