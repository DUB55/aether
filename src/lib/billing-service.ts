// Team controls and centralized billing service
// Manages team billing and controls

export interface BillingAccount {
  id: string
  workspaceId: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'past_due' | 'cancelled'
  createdAt: number
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate?: number
}

export interface UsageLimit {
  resource: string
  limit: number
  used: number
  unit: string
}

export const billingService = {
  // Create billing account
  createBillingAccount: (workspaceId: string, name: string, email: string): BillingAccount => {
    const account: BillingAccount = {
      id: `billing_${Date.now()}`,
      workspaceId,
      name,
      email,
      plan: 'free',
      status: 'active',
      createdAt: Date.now(),
      billingCycle: 'monthly'
    }

    const accounts = JSON.parse(localStorage.getItem('aether_billing_accounts') || '{}')
    accounts[workspaceId] = account
    localStorage.setItem('aether_billing_accounts', JSON.stringify(accounts))

    return account
  },

  // Get billing account
  getBillingAccount: (workspaceId: string): BillingAccount | null => {
    const accounts = JSON.parse(localStorage.getItem('aether_billing_accounts') || '{}')
    return accounts[workspaceId] || null
  },

  // Update plan
  updatePlan: (workspaceId: string, plan: 'free' | 'pro' | 'enterprise'): BillingAccount | null => {
    const accounts = JSON.parse(localStorage.getItem('aether_billing_accounts') || '{}')
    const account = accounts[workspaceId]
    
    if (!account) return null

    account.plan = plan
    accounts[workspaceId] = account
    localStorage.setItem('aether_billing_accounts', JSON.stringify(accounts))

    return account
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

    return limits[plan as keyof typeof limits] || limits.free
  },

  // Update usage
  updateUsage: (workspaceId: string, resource: string, amount: number): void => {
    const usageData = JSON.parse(localStorage.getItem('aether_usage_data') || '{}')
    if (!usageData[workspaceId]) {
      usageData[workspaceId] = {}
    }
    usageData[workspaceId][resource] = (usageData[workspaceId][resource] || 0) + amount
    localStorage.setItem('aether_usage_data', JSON.stringify(usageData))
  },

  // Get current usage
  getCurrentUsage: (workspaceId: string): Record<string, number> => {
    const usageData = JSON.parse(localStorage.getItem('aether_usage_data') || '{}')
    return usageData[workspaceId] || {}
  },

  // Check if limit exceeded
  checkLimitExceeded: (workspaceId: string, resource: string): boolean => {
    const account = billingService.getBillingAccount(workspaceId)
    if (!account) return false

    const limits = billingService.getUsageLimits(account.plan)
    const limit = limits.find(l => l.resource === resource)
    if (!limit) return false

    const currentUsage = billingService.getCurrentUsage(workspaceId)
    const used = currentUsage[resource] || 0

    return limit.limit !== -1 && used >= limit.limit
  },

  // Get billing history
  getBillingHistory: (workspaceId: string): Array<{
    id: string
    date: number
    amount: number
    status: 'paid' | 'pending' | 'failed'
    description: string
  }> => {
    // In production, this would fetch from payment processor
    return [
      {
        id: 'inv_001',
        date: Date.now() - 30 * 24 * 60 * 60 * 1000,
        amount: 0,
        status: 'paid',
        description: 'Free tier usage'
      }
    ]
  },

  // Get team controls
  getTeamControls: (workspaceId: string): {
    allowMemberInvite: boolean
    requireApproval: boolean
    maxMembers: number
    allowProjectCreation: boolean
    allowDeployment: boolean
  } => {
    const account = billingService.getBillingAccount(workspaceId)
    const plan = account?.plan || 'free'

    return {
      allowMemberInvite: plan !== 'free',
      requireApproval: plan === 'enterprise',
      maxMembers: plan === 'free' ? 5 : plan === 'pro' ? 50 : -1,
      allowProjectCreation: true,
      allowDeployment: true
    }
  },

  // Update team controls
  updateTeamControls: (workspaceId: string, controls: Partial<{
    allowMemberInvite: boolean
    requireApproval: boolean
    allowProjectCreation: boolean
    allowDeployment: boolean
  }>): void => {
    const teamControls = JSON.parse(localStorage.getItem('aether_team_controls') || '{}')
    teamControls[workspaceId] = {
      ...teamControls[workspaceId],
      ...controls
    }
    localStorage.setItem('aether_team_controls', JSON.stringify(teamControls))
  }
}
