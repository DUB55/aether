// Team collaboration service
// Manages team members, roles, permissions, and collaboration features

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, addDoc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest';

export interface TeamMember {
  id: string
  userId: string
  userEmail: string
  userName: string
  role: TeamRole
  workspaceId: string
  joinedAt: Timestamp
  lastActiveAt?: Timestamp
}

export interface TeamInvite {
  id: string
  email: string
  workspaceId: string
  invitedBy: string
  role: TeamRole
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: Timestamp
  expiresAt: Timestamp
}

export interface TeamPermission {
  resource: string
  actions: string[]
}

const TEAM_MEMBERS_COLLECTION = 'team_members';
const TEAM_INVITES_COLLECTION = 'team_invites';

export const teamCollaborationService = {
  // Role permissions
  getRolePermissions: (role: TeamRole): TeamPermission[] => {
    const permissions: Record<TeamRole, TeamPermission[]> = {
      owner: [
        { resource: '*', actions: ['*'] }
      ],
      admin: [
        { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'team', actions: ['invite', 'remove', 'update_roles'] },
        { resource: 'settings', actions: ['read', 'update'] }
      ],
      editor: [
        { resource: 'projects', actions: ['create', 'read', 'update'] },
        { resource: 'team', actions: ['read'] }
      ],
      viewer: [
        { resource: 'projects', actions: ['read'] },
        { resource: 'team', actions: ['read'] }
      ],
      guest: [
        { resource: 'projects', actions: ['read'] }
      ]
    };

    return permissions[role] || permissions.guest;
  },

  // Check if a role has permission for an action
  hasPermission: (role: TeamRole, resource: string, action: string): boolean => {
    const permissions = teamCollaborationService.getRolePermissions(role);
    
    for (const perm of permissions) {
      if (perm.resource === '*' || perm.resource === resource) {
        return perm.actions.includes('*') || perm.actions.includes(action);
      }
    }
    
    return false;
  },

  // Add a team member
  addMember: async (member: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember> => {
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      userId: member.userId,
      userEmail: member.userEmail,
      userName: member.userName,
      role: member.role,
      workspaceId: member.workspaceId,
      joinedAt: Timestamp.now(),
      lastActiveAt: Timestamp.now()
    };

    await setDoc(doc(db, TEAM_MEMBERS_COLLECTION, newMember.id), newMember);
    return newMember;
  },

  // Get a team member
  getMember: async (id: string): Promise<TeamMember | null> => {
    const docRef = doc(db, TEAM_MEMBERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as TeamMember;
  },

  // Update a team member
  updateMember: async (id: string, updates: Partial<Omit<TeamMember, 'id' | 'userId' | 'joinedAt'>>): Promise<void> => {
    await updateDoc(doc(db, TEAM_MEMBERS_COLLECTION, id), {
      ...updates,
      lastActiveAt: Timestamp.now()
    });
  },

  // Remove a team member
  removeMember: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, TEAM_MEMBERS_COLLECTION, id));
  },

  // Get all members of a workspace
  getWorkspaceMembers: async (workspaceId: string): Promise<TeamMember[]> => {
    const q = query(
      collection(db, TEAM_MEMBERS_COLLECTION),
      where('workspaceId', '==', workspaceId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TeamMember);
  },

  // Get members by role
  getMembersByRole: async (workspaceId: string, role: TeamRole): Promise<TeamMember[]> => {
    const q = query(
      collection(db, TEAM_MEMBERS_COLLECTION),
      where('workspaceId', '==', workspaceId),
      where('role', '==', role)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TeamMember);
  },

  // Get member by user ID
  getMemberByUserId: async (userId: string, workspaceId: string): Promise<TeamMember | null> => {
    const q = query(
      collection(db, TEAM_MEMBERS_COLLECTION),
      where('userId', '==', userId),
      where('workspaceId', '==', workspaceId)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as TeamMember;
  },

  // Update member role
  updateMemberRole: async (memberId: string, newRole: TeamRole): Promise<void> => {
    await teamCollaborationService.updateMember(memberId, { role: newRole });
  },

  // Create a team invite
  createInvite: async (invite: Omit<TeamInvite, 'id' | 'createdAt' | 'status'>): Promise<TeamInvite> => {
    const newInvite: TeamInvite = {
      id: crypto.randomUUID(),
      email: invite.email,
      workspaceId: invite.workspaceId,
      invitedBy: invite.invitedBy,
      role: invite.role,
      status: 'pending',
      createdAt: Timestamp.now(),
      expiresAt: invite.expiresAt
    };

    await setDoc(doc(db, TEAM_INVITES_COLLECTION, newInvite.id), newInvite);
    return newInvite;
  },

  // Get an invite
  getInvite: async (id: string): Promise<TeamInvite | null> => {
    const docRef = doc(db, TEAM_INVITES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as TeamInvite;
  },

  // Get invites by email
  getInvitesByEmail: async (email: string): Promise<TeamInvite[]> => {
    const q = query(
      collection(db, TEAM_INVITES_COLLECTION),
      where('email', '==', email),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TeamInvite);
  },

  // Get invites for a workspace
  getWorkspaceInvites: async (workspaceId: string): Promise<TeamInvite[]> => {
    const q = query(
      collection(db, TEAM_INVITES_COLLECTION),
      where('workspaceId', '==', workspaceId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TeamInvite);
  },

  // Accept an invite
  acceptInvite: async (inviteId: string): Promise<void> => {
    await updateDoc(doc(db, TEAM_INVITES_COLLECTION, inviteId), {
      status: 'accepted'
    });
  },

  // Decline an invite
  declineInvite: async (inviteId: string): Promise<void> => {
    await updateDoc(doc(db, TEAM_INVITES_COLLECTION, inviteId), {
      status: 'declined'
    });
  },

  // Delete an invite
  deleteInvite: async (inviteId: string): Promise<void> => {
    await deleteDoc(doc(db, TEAM_INVITES_COLLECTION, inviteId));
  },

  // Clean up expired invites
  cleanupExpiredInvites: async (): Promise<number> => {
    const now = Timestamp.now();
    const q = query(
      collection(db, TEAM_INVITES_COLLECTION),
      where('expiresAt', '<', now),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const promises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(promises);
    
    return querySnapshot.size;
  },

  // Get available roles
  getAvailableRoles(): Array<{ value: TeamRole; label: string; description: string }> {
    return [
      { value: 'owner', label: 'Owner', description: 'Full access to all resources and settings' },
      { value: 'admin', label: 'Admin', description: 'Can manage projects, team members, and settings' },
      { value: 'editor', label: 'Editor', description: 'Can create and edit projects' },
      { value: 'viewer', label: 'Viewer', description: 'Can only view projects and team' },
      { value: 'guest', label: 'Guest', description: 'Limited read-only access' }
    ];
  },

  // Get role hierarchy (higher role can manage lower roles)
  getRoleHierarchy(): Record<TeamRole, number> {
    return {
      owner: 5,
      admin: 4,
      editor: 3,
      viewer: 2,
      guest: 1
    };
  },

  // Check if a role can manage another role
  canManageRole: (managerRole: TeamRole, targetRole: TeamRole): boolean => {
    const hierarchy = teamCollaborationService.getRoleHierarchy();
    return hierarchy[managerRole] > hierarchy[targetRole];
  },

  // Update member last active time
  updateLastActive: async (memberId: string): Promise<void> => {
    await updateDoc(doc(db, TEAM_MEMBERS_COLLECTION, memberId), {
      lastActiveAt: Timestamp.now()
    });
  }
};
