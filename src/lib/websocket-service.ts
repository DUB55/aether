// WebSocket service for real-time collaboration
// Handles real-time sync between multiple users editing the same project

export interface CollaborationUser {
  id: string
  name: string
  email: string
  color: string
  cursor: { file: string; line: number; column: number } | null
  joinedAt: number
}

export interface CollaborationMessage {
  type: 'cursor_update' | 'file_change' | 'user_join' | 'user_leave' | 'chat'
  userId: string
  projectId: string
  data: any
  timestamp: number
}

export const websocketService = {
  // Store active connections
  connections: new Map<string, WebSocket>(),

  // Store active users per project
  projectUsers: new Map<string, CollaborationUser[]>(),

  // Connect to WebSocket server
  connect: (projectId: string, userId: string): WebSocket | null => {
    try {
      // In production, connect to actual WebSocket server
      // For now, we'll simulate with a mock connection
      const ws = new WebSocket(`ws://localhost:3001/collab/${projectId}?userId=${userId}`)
      
      ws.onopen = () => {
        console.log('[WebSocket] Connected to collaboration server')
        websocketService.connections.set(projectId, ws)
      }

      ws.onmessage = (event) => {
        const message: CollaborationMessage = JSON.parse(event.data)
        websocketService.handleMessage(message)
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
      }

      ws.onclose = () => {
        console.log('[WebSocket] Connection closed')
        websocketService.connections.delete(projectId)
      }

      return ws
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error)
      return null
    }
  },

  // Disconnect from WebSocket server
  disconnect: (projectId: string) => {
    const ws = websocketService.connections.get(projectId)
    if (ws) {
      ws.close()
      websocketService.connections.delete(projectId)
    }
  },

  // Send message to server
  sendMessage: (projectId: string, message: CollaborationMessage) => {
    const ws = websocketService.connections.get(projectId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  },

  // Update cursor position
  updateCursor: (projectId: string, userId: string, cursor: { file: string; line: number; column: number }) => {
    const message: CollaborationMessage = {
      type: 'cursor_update',
      userId,
      projectId,
      data: { cursor },
      timestamp: Date.now()
    }
    websocketService.sendMessage(projectId, message)
  },

  // Broadcast file change
  broadcastFileChange: (projectId: string, userId: string, file: string, content: string) => {
    const message: CollaborationMessage = {
      type: 'file_change',
      userId,
      projectId,
      data: { file, content },
      timestamp: Date.now()
    }
    websocketService.sendMessage(projectId, message)
  },

  // Handle incoming messages
  handleMessage: (message: CollaborationMessage) => {
    switch (message.type) {
      case 'user_join':
        websocketService.handleUserJoin(message)
        break
      case 'user_leave':
        websocketService.handleUserLeave(message)
        break
      case 'cursor_update':
        websocketService.handleCursorUpdate(message)
        break
      case 'file_change':
        websocketService.handleFileChange(message)
        break
      case 'chat':
        websocketService.handleChat(message)
        break
    }
  },

  // Handle user joining
  handleUserJoin: (message: CollaborationMessage) => {
    const users = websocketService.projectUsers.get(message.projectId) || []
    const newUser: CollaborationUser = {
      id: message.userId,
      name: message.data.name,
      email: message.data.email,
      color: message.data.color,
      cursor: null,
      joinedAt: message.timestamp
    }
    websocketService.projectUsers.set(message.projectId, [...users, newUser])
    
    // Dispatch custom event for UI to update
    window.dispatchEvent(new CustomEvent('collaboration:user_join', { detail: newUser }))
  },

  // Handle user leaving
  handleUserLeave: (message: CollaborationMessage) => {
    const users = websocketService.projectUsers.get(message.projectId) || []
    const filtered = users.filter(u => u.id !== message.userId)
    websocketService.projectUsers.set(message.projectId, filtered)
    
    // Dispatch custom event for UI to update
    window.dispatchEvent(new CustomEvent('collaboration:user_leave', { detail: { userId: message.userId } }))
  },

  // Handle cursor update
  handleCursorUpdate: (message: CollaborationMessage) => {
    const users = websocketService.projectUsers.get(message.projectId) || []
    const updated = users.map(u => 
      u.id === message.userId 
        ? { ...u, cursor: message.data.cursor }
        : u
    )
    websocketService.projectUsers.set(message.projectId, updated)
    
    // Dispatch custom event for UI to update
    window.dispatchEvent(new CustomEvent('collaboration:cursor_update', { 
      detail: { userId: message.userId, cursor: message.data.cursor } 
    }))
  },

  // Handle file change
  handleFileChange: (message: CollaborationMessage) => {
    // Dispatch custom event for UI to update
    window.dispatchEvent(new CustomEvent('collaboration:file_change', { 
      detail: { 
        userId: message.userId, 
        file: message.data.file, 
        content: message.data.content 
      } 
    }))
  },

  // Handle chat message
  handleChat: (message: CollaborationMessage) => {
    // Dispatch custom event for UI to update
    window.dispatchEvent(new CustomEvent('collaboration:chat', { 
      detail: { 
        userId: message.userId, 
        message: message.data.message 
      } 
    }))
  },

  // Get active users for a project
  getActiveUsers: (projectId: string): CollaborationUser[] => {
    return websocketService.projectUsers.get(projectId) || []
  },

  // Check if connected
  isConnected: (projectId: string): boolean => {
    const ws = websocketService.connections.get(projectId)
    return ws?.readyState === WebSocket.OPEN
  }
}
