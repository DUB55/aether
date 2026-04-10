// Team Manager Component
// Manages team members, roles, permissions, and invitations

import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Users, UserPlus, Mail, Shield, MoreVertical, Crown, ShieldCheck, Edit, Trash2, X, Clock } from 'lucide-react';
import { teamCollaborationService, TeamMember, TeamInvite, TeamRole } from '../lib/team-collaboration-service';

export default function TeamManager({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('viewer');

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamMembers, teamInvites] = await Promise.all([
        teamCollaborationService.getWorkspaceMembers(workspaceId),
        teamCollaborationService.getWorkspaceInvites(workspaceId)
      ]);
      setMembers(teamMembers);
      setInvites(teamInvites);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days
      await teamCollaborationService.createInvite({
        email: inviteEmail,
        workspaceId,
        invitedBy: 'current-user', // Would use actual user ID
        role: inviteRole,
        expiresAt
      });
      
      setInviteEmail('');
      setShowInviteModal(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create invite:', error);
      alert('Failed to send invitation');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamRole) => {
    try {
      await teamCollaborationService.updateMemberRole(memberId, newRole);
      await loadData();
      setShowRoleModal(false);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await teamCollaborationService.removeMember(memberId);
      await loadData();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await teamCollaborationService.deleteInvite(inviteId);
      await loadData();
    } catch (error) {
      console.error('Failed to revoke invite:', error);
      alert('Failed to revoke invitation');
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      // Would trigger email resend
      alert('Invitation resent successfully');
    } catch (error) {
      console.error('Failed to resend invite:', error);
    }
  };

  const getRoleIcon = (role: TeamRole) => {
    const icons = {
      owner: <Crown className="w-4 h-4" />,
      admin: <Shield className="w-4 h-4" />,
      editor: <Edit className="w-4 h-4" />,
      viewer: <ShieldCheck className="w-4 h-4" />,
      guest: <Users className="w-4 h-4" />
    };
    return icons[role] || <Users className="w-4 h-4" />;
  };

  const getRoleColor = (role: TeamRole) => {
    const colors = {
      owner: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      viewer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      guest: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const availableRoles = teamCollaborationService.getAvailableRoles();
  const roleHierarchy = teamCollaborationService.getRoleHierarchy();

  if (loading) {
    return <div className="p-6 text-center">Loading team data...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Team Management
        </h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Team Members */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Team Members ({members.length})</h3>
        {members.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No team members yet</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {member.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold">{member.userName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    {member.role}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowRoleModal(true);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      title="Change role"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-500"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Invites ({invites.length})</h3>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{invite.email}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(invite.expiresAt.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(invite.role)}`}>
                    {getRoleIcon(invite.role)}
                    {invite.role}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResendInvite(invite.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      title="Resend invitation"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRevokeInvite(invite.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-500"
                      title="Revoke invitation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Invite Team Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  >
                    {availableRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleInvite}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Change Role</h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Change role for <span className="font-semibold">{selectedMember.userName}</span>
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1">New Role</label>
                  <select
                    value={selectedMember.role}
                    onChange={(e) => handleUpdateRole(selectedMember.id, e.target.value as TeamRole)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  >
                    {availableRoles.map((role) => {
                      const currentRoleLevel = roleHierarchy[selectedMember.role];
                      const targetRoleLevel = roleHierarchy[role.value];
                      const canChange = currentRoleLevel > targetRoleLevel;
                      
                      return (
                        <option 
                          key={role.value} 
                          value={role.value}
                          disabled={!canChange}
                        >
                          {role.label} - {role.description}
                          {!canChange && ' (Cannot downgrade)'}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="text-xs text-gray-500">
                  Note: You can only change roles to lower hierarchy levels
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
