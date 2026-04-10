// Team controls and centralized billing service
// Manages team billing and controls
// Now uses Firebase Firestore for persistent storage

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface BillingAccount {
  id: string
  workspaceId: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'past_due' | 'cancelled'
  createdAt: Timestamp
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate?: Timestamp
}

export interface UsageLimit {
  resource: string
  limit: number
  used: number
  unit: string
}

const BILLING_ACCOUNTS_COLLECTION = 'billing_accounts';
const USAGE_DATA_COLLECTION = 'usage_data';
const TEAM_CONTROLS_COLLECTION = 'team_controls';

export const billingService = {
  // Create billing account
  createBillingAccount: async (workspaceId: string, name: string, email: string): Promise<BillingAccount> => {
    const accountId = `billing_${Date.now()}`;
    const now = Timestamp.now();
    
    const account: BillingAccount = {
      id: accountId,
      workspaceId,
      name,
      email,
      plan: 'free',
      status: 'active',
      createdAt: now,
      billingCycle: 'monthly'
    }

    const accountRef = doc(db, BILLING_ACCOUNTS_COLLECTION, accountId);
    await setDoc(accountRef, account);

    return account;
  },

  // Get billing account
  getBillingAccount: async (workspaceId: string): Promise<BillingAccount | null> => {
    const q = query(collection(db, BILLING_ACCOUNTS_COLLECTION), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as BillingAccount;
    }
    
    return null;
  },

  // Update plan
  updatePlan: async (workspaceId: string, plan: 'free' | 'pro' | 'enterprise'): Promise<BillingAccount | null> => {
    const q = query(collection(db, BILLING_ACCOUNTS_COLLECTION), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;

    const accountRef = querySnapshot.docs[0].ref;
    await updateDoc(accountRef, { plan });
    
    const updatedDoc = await getDoc(accountRef);
    return updatedDoc.data() as BillingAccount;
  },

  // Get usage limits for plan
  getUsageLimits: (plan: string): UsageLimit[] => {
    const limits = {
      free: [
        { resource: 'Projects', limit: 10, used: 0, unit: 'projects' },
        { resource: 'Team members', limit: 5, used: 0, unit: 'members' },
        { resource: 'API calls/month', limit: 1000, used: 0, unit: 'calls' },
        { resource: 'Storage', limit: 1, used: 0, unit: 'GB' },
        { resource: 'Bandwidth', limit: 10, used: 0, unit: 'GB' }
      ],
      pro: [
        { resource: 'Projects', limit: 100, used: 0, unit: 'projects' },
        { resource: 'Team members', limit: 50, used: 0, unit: 'members' },
        { resource: 'API calls/month', limit: 100000, used: 0, unit: 'calls' },
        { resource: 'Storage', limit: 50, used: 0, unit: 'GB' },
        { resource: 'Bandwidth', limit: 500, used: 0, unit: 'GB' }
      ],
      enterprise: [
        { resource: 'Projects', limit: -1, used: 0, unit: 'projects' },
        { resource: 'Team members', limit: -1, used: 0, unit: 'members' },
        { resource: 'API calls/month', limit: -1, used: 0, unit: 'calls' },
        { resource: 'Storage', limit: -1, used: 0, unit: 'GB' },
        { resource: 'Bandwidth', limit: -1, used: 0, unit: 'GB' }
      ]
    }

    return limits[plan as keyof typeof limits] || limits.free;
  },

  // Update usage
  updateUsage: async (workspaceId: string, resource: string, amount: number): Promise<void> => {
    const usageRef = doc(db, USAGE_DATA_COLLECTION, workspaceId);
    const usageDoc = await getDoc(usageRef);
    
    const currentData = usageDoc.exists() ? usageDoc.data() : {};
    const currentUsage = (currentData as any)[resource] || 0;
    
    await setDoc(usageRef, {
      ...currentData,
      [resource]: currentUsage + amount,
      updatedAt: Timestamp.now()
    }, { merge: true });
  },

  // Get current usage
  getCurrentUsage: async (workspaceId: string): Promise<Record<string, number>> => {
    const usageRef = doc(db, USAGE_DATA_COLLECTION, workspaceId);
    const usageDoc = await getDoc(usageRef);
    
    if (usageDoc.exists()) {
      const data = usageDoc.data();
      const { updatedAt, ...usage } = data as any;
      return usage;
    }
    
    return {};
  },

  // Check if limit exceeded
  checkLimitExceeded: async (workspaceId: string, resource: string): Promise<boolean> => {
    const account = await billingService.getBillingAccount(workspaceId);
    if (!account) return false;

    const limits = billingService.getUsageLimits(account.plan);
    const limit = limits.find(l => l.resource === resource);
    if (!limit) return false;

    const currentUsage = await billingService.getCurrentUsage(workspaceId);
    const used = currentUsage[resource] || 0;

    return limit.limit !== -1 && used >= limit.limit;
  },

  // Get billing history
  getBillingHistory: async (workspaceId: string): Promise<Array<{
    id: string
    date: Timestamp
    amount: number
    status: 'paid' | 'pending' | 'failed'
    description: string
  }>> => {
    // In production, this would fetch from payment processor
    return [
      {
        id: 'inv_001',
        date: new Timestamp(Date.now() / 1000 - 30 * 24 * 60 * 60, 0),
        amount: 0,
        status: 'paid',
        description: 'Free tier usage'
      }
    ];
  },

  // Get team controls
  getTeamControls: async (workspaceId: string): Promise<{
    allowMemberInvite: boolean
    requireApproval: boolean
    maxMembers: number
    allowProjectCreation: boolean
    allowDeployment: boolean
  }> => {
    const account = await billingService.getBillingAccount(workspaceId);
    const plan = account?.plan || 'free';

    // Check if custom controls exist
    const controlsRef = doc(db, TEAM_CONTROLS_COLLECTION, workspaceId);
    const controlsDoc = await getDoc(controlsRef);
    
    if (controlsDoc.exists()) {
      return controlsDoc.data() as any;
    }

    return {
      allowMemberInvite: plan !== 'free',
      requireApproval: plan === 'enterprise',
      maxMembers: plan === 'free' ? 5 : plan === 'pro' ? 50 : -1,
      allowProjectCreation: true,
      allowDeployment: true
    };
  },

  // Update team controls
  updateTeamControls: async (workspaceId: string, controls: Partial<{
    allowMemberInvite: boolean
    requireApproval: boolean
    allowProjectCreation: boolean
    allowDeployment: boolean
  }>): Promise<void> => {
    const controlsRef = doc(db, TEAM_CONTROLS_COLLECTION, workspaceId);
    const controlsDoc = await getDoc(controlsRef);
    
    const currentControls = controlsDoc.exists() ? controlsDoc.data() : {};
    
    await setDoc(controlsRef, {
      ...currentControls,
      ...controls,
      updatedAt: Timestamp.now()
    }, { merge: true });
  }
}
