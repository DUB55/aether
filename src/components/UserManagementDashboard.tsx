"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Ban,
  Shield,
  Mail,
  Calendar,
  Activity,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  displayName?: string
  createdAt: number
  lastActive: number
  status: 'active' | 'suspended' | 'pending'
  emailVerified: boolean
  role: 'user' | 'admin' | 'owner'
}

interface UserManagementDashboardProps {
  className?: string
}

export function UserManagementDashboard({ className }: UserManagementDashboardProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    // Mock data for now (would be from Firebase/Supabase in production)
    const mockUsers: User[] = [
      {
        id: 'user_1',
        email: 'admin@aether.dev',
        displayName: 'Admin User',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        lastActive: Date.now() - 1 * 60 * 60 * 1000,
        status: 'active',
        emailVerified: true,
        role: 'admin'
      },
      {
        id: 'user_2',
        email: 'user1@example.com',
        displayName: 'John Doe',
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        lastActive: Date.now() - 2 * 24 * 60 * 60 * 1000,
        status: 'active',
        emailVerified: true,
        role: 'user'
      },
      {
        id: 'user_3',
        email: 'user2@example.com',
        displayName: 'Jane Smith',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        lastActive: Date.now() - 5 * 60 * 60 * 1000,
        status: 'active',
        emailVerified: false,
        role: 'user'
      },
      {
        id: 'user_4',
        email: 'suspended@example.com',
        displayName: 'Suspended User',
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        lastActive: Date.now() - 10 * 24 * 60 * 60 * 1000,
        status: 'suspended',
        emailVerified: true,
        role: 'user'
      }
    ]
    setUsers(mockUsers)
  }

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'suspended' as const } : u
    ))
    toast.success('User suspended')
  }

  const handleActivateUser = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'active' as const } : u
    ))
    toast.success('User activated')
  }

  const handleResendVerification = (userId: string) => {
    toast.success('Verification email sent')
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    }
    return styles[role as keyof typeof styles] || styles.user
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </div>
            <Badge variant="outline">
              {users.length} total users
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* User List */}
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.displayName || 'Unknown'}</span>
                          <Badge className={getRoleBadge(user.role)} variant="secondary">
                            {user.role}
                          </Badge>
                          <Badge className={getStatusBadge(user.status)} variant="secondary">
                            {user.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {formatDate(user.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Last active {formatDate(user.lastActive)}
                          </div>
                          <div className="flex items-center gap-1">
                            {user.emailVerified ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-yellow-600" />
                                Unverified
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!user.emailVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendVerification(user.id)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Resend
                        </Button>
                      )}
                      {user.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspendUser(user.id)}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivateUser(user.id)}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.status === 'suspended').length}
              </div>
              <div className="text-sm text-muted-foreground">Suspended</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.emailVerified).length}
              </div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
