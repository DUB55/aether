// Workspace service for team collaboration
// Manages shared workspaces, roles, and permissions
// Now uses Firebase Firestore for persistent storage

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot, getDocs, addDoc, Timestamp } from 'firebase/firestore';

export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId: string
  members: WorkspaceMember[]
  projects: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface WorkspaceMember {
  userId: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  joinedAt: Timestamp
}

interface WorkspaceRole {
  name: string
  permissions: Permission[]
}

interface Permission {
  resource: string
  actions: string[]
}

const WORKSPACES_COLLECTION = 'workspaces';

export const workspaceService = {
  // Role definitions
  roles: {
    owner: {
      name: 'Owner',
      permissions: [
        { resource: 'workspace', actions: ['*'] },
        { resource: 'projects', actions: ['*'] },
        { resource: 'members', actions: ['*'] },
        { resource: 'settings', actions: ['*'] },
      ],
    },
    admin: {
      name: 'Admin',
      permissions: [
        { resource: 'workspace', actions: ['read', 'update'] },
        { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'members', actions: ['read', 'invite', 'remove'] },
        { resource: 'settings', actions: ['read', 'update'] },
      ],
    },
    editor: {
      name: 'Editor',
      permissions: [
        { resource: 'workspace', actions: ['read'] },
        { resource: 'projects', actions: ['create', 'read', 'update'] },
        { resource: 'members', actions: ['read'] },
        { resource: 'settings', actions: ['read'] },
      ],
    },
    viewer: {
      name: 'Viewer',
      permissions: [
        { resource: 'workspace', actions: ['read'] },
        { resource: 'projects', actions: ['read'] },
        { resource: 'members', actions: ['read'] },
        { resource: 'settings', actions: ['read'] },
      ],
    },
  },

  // Create workspace
  createWorkspace: async (name: string, ownerId: string, description?: string): Promise<Workspace> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const workspaceId = `workspace_${Date.now()}`;
    const now = Timestamp.now();
    
    const workspace: Workspace = {
      id: workspaceId,
      name,
      description,
      ownerId,
      members: [
        {
          userId: ownerId,
          email: auth.currentUser.email || '',
          role: 'owner',
          joinedAt: now,
        },
      ],
      projects: [],
      createdAt: now,
      updatedAt: now,
    };

    // Store in Firebase Firestore
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    await setDoc(workspaceRef, workspace);

    return workspace;
  },

  // Get all workspaces for a user
  getWorkspaces: async (): Promise<Workspace[]> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const q = query(collection(db, WORKSPACES_COLLECTION), where('ownerId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as Workspace);
  },

  // Get workspace by ID
  getWorkspace: async (id: string): Promise<Workspace | null> => {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, id);
    const workspaceDoc = await getDoc(workspaceRef);
    
    if (workspaceDoc.exists()) {
      return workspaceDoc.data() as Workspace;
    }
    return null;
  },

  // Update workspace
  updateWorkspace: async (id: string, updates: Partial<Workspace>): Promise<Workspace | null> => {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, id);
    const workspaceDoc = await getDoc(workspaceRef);
    
    if (!workspaceDoc.exists()) return null;

    const updatedData = { ...updates, updatedAt: Timestamp.now() };
    await updateDoc(workspaceRef, updatedData);
    
    const updatedDoc = await getDoc(workspaceRef);
    return updatedDoc.data() as Workspace;
  },

  // Delete workspace
  deleteWorkspace: async (id: string): Promise<boolean> => {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, id);
    const workspaceDoc = await getDoc(workspaceRef);
    
    if (!workspaceDoc.exists()) return false;

    await deleteDoc(workspaceRef);
    return true;
  },

  // Add member to workspace
  addMember: async (workspaceId: string, email: string, role: 'admin' | 'editor' | 'viewer'): Promise<boolean> => {
    const workspace = await workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    const member: WorkspaceMember = {
      userId: `user_${Date.now()}`, // In production, this would be the actual user ID
      email,
      role,
      joinedAt: Timestamp.now(),
    }

    workspace.members.push(member)
    await workspaceService.updateWorkspace(workspaceId, workspace)

    return true
  },

  // Remove member from workspace
  removeMember: async (workspaceId: string, userId: string): Promise<boolean> => {
    const workspace = await workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    // Cannot remove owner
    if (userId === workspace.ownerId) return false

    workspace.members = workspace.members.filter(m => m.userId !== userId)
    await workspaceService.updateWorkspace(workspaceId, workspace)

    return true
  },

  // Update member role
  updateMemberRole: async (workspaceId: string, userId: string, newRole: 'admin' | 'editor' | 'viewer'): Promise<boolean> => {
    const workspace = await workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    // Cannot change owner's role
    if (userId === workspace.ownerId) return false

    const member = workspace.members.find(m => m.userId === userId)
    if (!member) return false

    member.role = newRole
    await workspaceService.updateWorkspace(workspaceId, workspace)

    return true
  },

  // Check if user has permission
  hasPermission: (workspace: Workspace, userId: string, resource: string, action: string): boolean => {
    const member = workspace.members.find(m => m.userId === userId)
    if (!member) return false

    const role = workspaceService.roles[member.role]
    if (!role) return false

    // Check if role has wildcard permission
    const wildcardPermission = role.permissions.find(p => p.resource === '*' || p.actions.includes('*'))
    if (wildcardPermission) return true

    // Check specific permission
    const permission = role.permissions.find(p => p.resource === resource)
    if (!permission) return false

    return permission.actions.includes('*') || permission.actions.includes(action)
  },

  // Add project to workspace
  addProject: async (workspaceId: string, projectId: string): Promise<boolean> => {
    const workspace = await workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    if (!workspace.projects.includes(projectId)) {
      workspace.projects.push(projectId)
      await workspaceService.updateWorkspace(workspaceId, workspace)
    }

    return true
  },

  // Remove project from workspace
  removeProject: async (workspaceId: string, projectId: string): Promise<boolean> => {
    const workspace = await workspaceService.getWorkspace(workspaceId)
    if (!workspace) return false

    workspace.projects = workspace.projects.filter(p => p !== projectId)
    await workspaceService.updateWorkspace(workspaceId, workspace)

    return true
  },

  // Subscribe to workspace changes (real-time updates)
  subscribeToWorkspace: (workspaceId: string, callback: (workspace: Workspace | null) => void) => {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    return onSnapshot(workspaceRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as Workspace);
      } else {
        callback(null);
      }
    });
  },

  // Subscribe to user's workspaces (real-time updates)
  subscribeToUserWorkspaces: (userId: string, callback: (workspaces: Workspace[]) => void) => {
    const q = query(collection(db, WORKSPACES_COLLECTION), where('ownerId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const workspaces = snapshot.docs.map(doc => doc.data() as Workspace);
      callback(workspaces);
    });
  },
}
