import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { enterpriseManager, Team, TeamMember } from '@/lib/enterprise'
import { Users, UserPlus, Settings, Shield, Crown, UserCheck, UserX, History, Globe, Lock, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface TeamManagementDashboardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
}

export function TeamManagementDashboard({ open, onOpenChange, userId }: TeamManagementDashboardProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('developer')
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  useEffect(() => {
    if (open && userId) {
      loadTeams()
    }
  }, [open, userId])

  const loadTeams = () => {
    const userTeams = userId ? enterpriseManager.getTeamsByOwner(userId) : enterpriseManager.getAllTeams()
    setTeams(userTeams)
    if (userTeams.length > 0) {
      setSelectedTeam(userTeams[0])
      loadAuditLogs(userTeams[0].id)
    }
  }

  const loadAuditLogs = (teamId: string) => {
    const logs = enterpriseManager.getAuditLogs(teamId, 50)
    setAuditLogs(logs)
  }

  const handleCreateTeam = async () => {
    try {
      const team = await enterpriseManager.createTeam(newTeamName, userId || 'temp', 'free')
      toast.success('Team created successfully!')
      setShowCreateTeam(false)
      setNewTeamName('')
      loadTeams()
    } catch (error) {
      toast.error('Failed to create team')
      console.error(error)
    }
  }

  const handleAddMember = async () => {
    if (!selectedTeam) return

    try {
      await enterpriseManager.addMember(selectedTeam.id, {
        userId: `user-${Date.now()}`,
        email: newMemberEmail,
        role: newMemberRole
      })
      toast.success('Member added successfully!')
      setShowAddMember(false)
      setNewMemberEmail('')
      setNewMemberRole('developer')
      loadTeams()
      loadAuditLogs(selectedTeam.id)
    } catch (error) {
      toast.error('Failed to add member')
      console.error(error)
    }
  }

  const handleRemoveMember = async (memberUserId: string) => {
    if (!selectedTeam) return

    try {
      await enterpriseManager.removeMember(selectedTeam.id, memberUserId)
      toast.success('Member removed successfully!')
      loadTeams()
      loadAuditLogs(selectedTeam.id)
    } catch (error) {
      toast.error('Failed to remove member')
      console.error(error)
    }
  }

  const handleUpdateRole = async (memberUserId: string, newRole: TeamMember['role']) => {
    if (!selectedTeam) return

    try {
      await enterpriseManager.updateMemberRole(selectedTeam.id, memberUserId, newRole)
      toast.success('Member role updated!')
      loadTeams()
      loadAuditLogs(selectedTeam.id)
    } catch (error) {
      toast.error('Failed to update member role')
      console.error(error)
    }
  }

  const handleUpgradeSubscription = async (tier: Team['subscription']) => {
    if (!selectedTeam) return

    try {
      await enterpriseManager.upgradeSubscription(selectedTeam.id, tier)
      toast.success('Subscription upgraded!')
      loadTeams()
      loadAuditLogs(selectedTeam.id)
    } catch (error) {
      toast.error('Failed to upgrade subscription')
      console.error(error)
    }
  }

  const getRoleIcon = (role: TeamMember['role']) => {
    const icons = {
      owner: Crown,
      admin: Shield,
      developer: UserCheck,
      viewer: Users
    }
    return icons[role] || Users
  }

  const getRoleColor = (role: TeamMember['role']) => {
    const colors = {
      owner: 'bg-yellow-500',
      admin: 'bg-purple-500',
      developer: 'bg-blue-500',
      viewer: 'bg-gray-500'
    }
    return colors[role] || 'bg-gray-500'
  }

  const getSubscriptionColor = (subscription: Team['subscription']) => {
    const colors = {
      free: 'bg-gray-500',
      pro: 'bg-blue-500',
      enterprise: 'bg-purple-500'
    }
    return colors[subscription] || 'bg-gray-500'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Management
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Teams</h3>
              <Button onClick={() => setShowCreateTeam(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>

            {showCreateTeam && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Create New Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      placeholder="My Company Team"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateTeam} disabled={!newTeamName.trim()}>
                      Create Team
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTeam?.id === team.id ? 'border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedTeam(team)
                    loadAuditLogs(team.id)
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>
                          {team.members.length} members • {team.subscription}
                        </CardDescription>
                      </div>
                      <Badge className={getSubscriptionColor(team.subscription)}>
                        {team.subscription}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Members</span>
                        <span className="font-medium">
                          {team.members.length}/{team.settings.maxMembers === -1 ? '∞' : team.settings.maxMembers}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Projects</span>
                        <span className="font-medium">
                          {team.settings.maxProjects === -1 ? '∞' : team.settings.maxProjects}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            {!selectedTeam ? (
              <p className="text-center text-gray-500 py-8">Select a team to manage members</p>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{selectedTeam.name} Members</h3>
                  <Button onClick={() => setShowAddMember(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                {showAddMember && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Add Team Member</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="member-email">Email</Label>
                        <Input
                          id="member-email"
                          type="email"
                          placeholder="member@example.com"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-role">Role</Label>
                        <select
                          id="member-role"
                          className="w-full px-3 py-2 border rounded-md"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value as TeamMember['role'])}
                        >
                          <option value="developer">Developer</option>
                          <option value="admin">Admin</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddMember} disabled={!newMemberEmail.trim()}>
                          Add Member
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddMember(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  {selectedTeam.members.map((member) => (
                    <Card key={member.userId}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {React.createElement(getRoleIcon(member.role), {
                              className: 'w-5 h-5'
                            })}
                            <div>
                              <p className="font-medium">{member.email || member.userId}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                                <span className="text-xs text-gray-500">
                                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.role !== 'owner' && (
                              <>
                                <select
                                  className="px-2 py-1 border rounded text-sm"
                                  value={member.role}
                                  onChange={(e) => handleUpdateRole(member.userId, e.target.value as TeamMember['role'])}
                                >
                                  <option value="admin">Admin</option>
                                  <option value="developer">Developer</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.userId)}
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {!selectedTeam ? (
              <p className="text-center text-gray-500 py-8">Select a team to manage settings</p>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{selectedTeam.name} Settings</h3>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Plan: {selectedTeam.subscription}</p>
                        <p className="text-sm text-gray-500">
                          {selectedTeam.subscription === 'free' && '3 members, 5 projects'}
                          {selectedTeam.subscription === 'pro' && '10 members, 25 projects, audit logs'}
                          {selectedTeam.subscription === 'enterprise' && 'Unlimited everything, SSO, custom domains'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {selectedTeam.subscription === 'free' && (
                          <Button onClick={() => handleUpgradeSubscription('pro')}>
                            Upgrade to Pro
                          </Button>
                        )}
                        {selectedTeam.subscription === 'pro' && (
                          <Button onClick={() => handleUpgradeSubscription('enterprise')}>
                            Upgrade to Enterprise
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Custom Domains
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-500">
                      {selectedTeam.subscription === 'enterprise'
                        ? 'Add custom domains for your team projects'
                        : 'Custom domains require Enterprise subscription'}
                    </p>
                    {selectedTeam.settings.customDomains.length > 0 && (
                      <div className="space-y-2">
                        {selectedTeam.settings.customDomains.map((domain) => (
                          <div key={domain} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-sm">{domain}</span>
                            <Button variant="ghost" size="sm">
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SSO Enabled</p>
                        <p className="text-sm text-gray-500">Single sign-on for team members</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${selectedTeam.settings.ssoEnabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {selectedTeam.settings.ssoEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Audit Logging</p>
                        <p className="text-sm text-gray-500">Track all team activities</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${selectedTeam.settings.auditLogEnabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {selectedTeam.settings.auditLogEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            {!selectedTeam ? (
              <p className="text-center text-gray-500 py-8">Select a team to view audit logs</p>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{selectedTeam.name} Audit Log</h3>
                  <Button variant="outline" onClick={() => loadAuditLogs(selectedTeam.id)}>
                    <History className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {auditLogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No audit logs available</p>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <Card key={log.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{log.action}</p>
                              <p className="text-sm text-gray-500">
                                {log.userId} • {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline">{log.resource}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
