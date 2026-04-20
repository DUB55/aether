/**
 * Enterprise Features Manager
 * Handles team collaboration, advanced permissions, and enterprise-grade features
 */

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  settings: TeamSettings;
  subscription: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  joinedAt: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface TeamSettings {
  maxMembers: number;
  maxProjects: number;
  allowExternalSharing: boolean;
  requireApprovalForDeploy: boolean;
  customDomains: string[];
  ssoEnabled: boolean;
  auditLogEnabled: boolean;
}

export interface AuditLog {
  id: string;
  teamId: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface EnterpriseConfig {
  enableSSO: boolean;
  enableAuditLogs: boolean;
  enableCustomDomains: boolean;
  enableAdvancedPermissions: boolean;
  enableTeamCollaboration: boolean;
  enableAPIAccess: boolean;
}

export class EnterpriseManager {
  private teams: Map<string, Team> = new Map();
  private auditLogs: Map<string, AuditLog[]> = new Map();
  private config: EnterpriseConfig;

  constructor(config: Partial<EnterpriseConfig> = {}) {
    this.config = {
      enableSSO: false,
      enableAuditLogs: false,
      enableCustomDomains: false,
      enableAdvancedPermissions: false,
      enableTeamCollaboration: true,
      enableAPIAccess: false,
      ...config
    };
  }

  /**
   * Create a new team
   */
  async createTeam(name: string, ownerId: string, subscription: 'free' | 'pro' | 'enterprise' = 'free'): Promise<Team> {
    const team: Team = {
      id: `team-${Date.now()}`,
      name,
      ownerId,
      members: [
        {
          userId: ownerId,
          email: '',
          role: 'owner',
          joinedAt: new Date().toISOString(),
          permissions: this.getDefaultPermissions('owner')
        }
      ],
      settings: this.getDefaultSettings(subscription),
      subscription,
      createdAt: new Date().toISOString()
    };

    this.teams.set(team.id, team);
    this.logAudit(team.id, ownerId, 'TEAM_CREATED', team.id, { name, subscription });

    console.log(`[EnterpriseManager] Created team: ${name} (${team.id})`);
    return team;
  }

  /**
   * Add member to team
   */
  async addMember(teamId: string, member: Omit<TeamMember, 'joinedAt' | 'permissions'>): Promise<TeamMember> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    if (team.members.length >= team.settings.maxMembers) {
      throw new Error('Team member limit reached');
    }

    const newMember: TeamMember = {
      ...member,
      joinedAt: new Date().toISOString(),
      permissions: this.getDefaultPermissions(member.role)
    };

    team.members.push(newMember);
    this.teams.set(teamId, team);

    this.logAudit(teamId, team.ownerId, 'MEMBER_ADDED', teamId, { 
      newMemberId: member.userId, 
      role: member.role 
    });

    console.log(`[EnterpriseManager] Added member to team ${teamId}: ${member.email}`);
    return newMember;
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId: string, userId: string): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    if (userId === team.ownerId) {
      throw new Error('Cannot remove team owner');
    }

    team.members = team.members.filter(m => m.userId !== userId);
    this.teams.set(teamId, team);

    this.logAudit(teamId, team.ownerId, 'MEMBER_REMOVED', teamId, { removedUserId: userId });

    console.log(`[EnterpriseManager] Removed member from team ${teamId}: ${userId}`);
  }

  /**
   * Update member role
   */
  async updateMemberRole(teamId: string, userId: string, newRole: TeamMember['role']): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const member = team.members.find(m => m.userId === userId);
    if (!member) {
      throw new Error(`Member ${userId} not found in team`);
    }

    if (userId === team.ownerId && newRole !== 'owner') {
      throw new Error('Cannot change owner role');
    }

    member.role = newRole;
    member.permissions = this.getDefaultPermissions(newRole);
    this.teams.set(teamId, team);

    this.logAudit(teamId, team.ownerId, 'MEMBER_ROLE_UPDATED', teamId, { 
      userId, 
      newRole 
    });

    console.log(`[EnterpriseManager] Updated member role in team ${teamId}: ${userId} -> ${newRole}`);
  }

  /**
   * Check permission
   */
  hasPermission(teamId: string, userId: string, resource: string, action: string): boolean {
    const team = this.teams.get(teamId);
    if (!team) {
      return false;
    }

    const member = team.members.find(m => m.userId === userId);
    if (!member) {
      return false;
    }

    // Owner has all permissions
    if (member.role === 'owner') {
      return true;
    }

    const permission = member.permissions.find(p => p.resource === resource);
    if (!permission) {
      return false;
    }

    return permission.actions.includes(action);
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: TeamMember['role']): Permission[] {
    const permissionMap: Record<TeamMember['role'], Permission[]> = {
      owner: [
        { resource: 'all', actions: ['*'] }
      ],
      admin: [
        { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'members', actions: ['read', 'update'] },
        { resource: 'settings', actions: ['read', 'update'] },
        { resource: 'deploy', actions: ['create', 'read'] }
      ],
      developer: [
        { resource: 'projects', actions: ['create', 'read', 'update'] },
        { resource: 'settings', actions: ['read'] },
        { resource: 'deploy', actions: ['create', 'read'] }
      ],
      viewer: [
        { resource: 'projects', actions: ['read'] },
        { resource: 'settings', actions: ['read'] }
      ]
    };

    return permissionMap[role] || [];
  }

  /**
   * Get default settings for subscription
   */
  private getDefaultSettings(subscription: Team['subscription']): TeamSettings {
    const settingsMap: Record<Team['subscription'], TeamSettings> = {
      free: {
        maxMembers: 3,
        maxProjects: 5,
        allowExternalSharing: false,
        requireApprovalForDeploy: false,
        customDomains: [],
        ssoEnabled: false,
        auditLogEnabled: false
      },
      pro: {
        maxMembers: 10,
        maxProjects: 25,
        allowExternalSharing: true,
        requireApprovalForDeploy: false,
        customDomains: [],
        ssoEnabled: false,
        auditLogEnabled: true
      },
      enterprise: {
        maxMembers: -1, // Unlimited
        maxProjects: -1, // Unlimited
        allowExternalSharing: true,
        requireApprovalForDeploy: true,
        customDomains: [],
        ssoEnabled: true,
        auditLogEnabled: true
      }
    };

    return settingsMap[subscription];
  }

  /**
   * Log audit event
   */
  private logAudit(teamId: string, userId: string, action: string, resource: string, metadata: Record<string, any> = {}): void {
    if (!this.config.enableAuditLogs) {
      return;
    }

    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      teamId,
      userId,
      action,
      resource,
      timestamp: new Date().toISOString(),
      metadata
    };

    if (!this.auditLogs.has(teamId)) {
      this.auditLogs.set(teamId, []);
    }

    this.auditLogs.get(teamId)!.push(log);
    console.log(`[EnterpriseManager] Audit log: ${action} by ${userId} on ${resource}`);
  }

  /**
   * Get audit logs for team
   */
  getAuditLogs(teamId: string, limit: number = 100): AuditLog[] {
    const logs = this.auditLogs.get(teamId) || [];
    return logs.slice(-limit);
  }

  /**
   * Get team by ID
   */
  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  /**
   * Get teams by owner
   */
  getTeamsByOwner(ownerId: string): Team[] {
    return Array.from(this.teams.values()).filter(t => t.ownerId === ownerId);
  }

  /**
   * Get teams by member
   */
  getTeamsByMember(userId: string): Team[] {
    return Array.from(this.teams.values()).filter(t => 
      t.members.some(m => m.userId === userId)
    );
  }

  /**
   * Update team settings
   */
  async updateTeamSettings(teamId: string, settings: Partial<TeamSettings>): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    team.settings = { ...team.settings, ...settings };
    this.teams.set(teamId, team);

    this.logAudit(teamId, team.ownerId, 'SETTINGS_UPDATED', teamId, { settings });

    console.log(`[EnterpriseManager] Updated settings for team ${teamId}`);
  }

  /**
   * Add custom domain
   */
  async addCustomDomain(teamId: string, domain: string): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    if (!this.config.enableCustomDomains) {
      throw new Error('Custom domains are not enabled');
    }

    if (team.subscription !== 'enterprise') {
      throw new Error('Custom domains require enterprise subscription');
    }

    team.settings.customDomains.push(domain);
    this.teams.set(teamId, team);

    this.logAudit(teamId, team.ownerId, 'CUSTOM_DOMAIN_ADDED', teamId, { domain });

    console.log(`[EnterpriseManager] Added custom domain to team ${teamId}: ${domain}`);
  }

  /**
   * Remove custom domain
   */
  async removeCustomDomain(teamId: string, domain: string): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    team.settings.customDomains = team.settings.customDomains.filter(d => d !== domain);
    this.teams.set(teamId, team);

    this.logAudit(teamId, team.ownerId, 'CUSTOM_DOMAIN_REMOVED', teamId, { domain });

    console.log(`[EnterpriseManager] Removed custom domain from team ${teamId}: ${domain}`);
  }

  /**
   * Upgrade team subscription
   */
  async upgradeSubscription(teamId: string, newSubscription: Team['subscription']): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const subscriptionOrder: Array<Team['subscription']> = ['free', 'pro', 'enterprise'];
    const currentIndex = subscriptionOrder.indexOf(team.subscription);
    const newIndex = subscriptionOrder.indexOf(newSubscription);

    if (newIndex <= currentIndex) {
      throw new Error('Can only upgrade to higher tier');
    }

    team.subscription = newSubscription;
    team.settings = this.getDefaultSettings(newSubscription);
    this.teams.set(teamId, team);

    this.logAudit(teamId, team.ownerId, 'SUBSCRIPTION_UPGRADED', teamId, { 
      from: team.subscription, 
      to: newSubscription 
    });

    console.log(`[EnterpriseManager] Upgraded team ${teamId} to ${newSubscription}`);
  }

  /**
   * Get all teams
   */
  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  /**
   * Delete team
   */
  async deleteTeam(teamId: string): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    this.teams.delete(teamId);
    this.auditLogs.delete(teamId);

    console.log(`[EnterpriseManager] Deleted team ${teamId}`);
  }
}

// Global enterprise manager instance
export const enterpriseManager = new EnterpriseManager();
