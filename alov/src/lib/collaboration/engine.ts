/**
 * Collaboration Engine
 * 
 * Enables real-time collaborative editing using WebRTC and operational transformation
 */

import Peer, { DataConnection } from 'peerjs';

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
}

export interface TextOperation {
  type: 'insert' | 'delete';
  position: number;
  content?: string;
  length?: number;
  timestamp: number;
  userId: string;
}

export interface FileChange {
  path: string;
  operation: TextOperation;
}

export interface CollaborationMessage {
  type: 'file-change' | 'cursor-update' | 'selection-update' | 'user-joined' | 'user-left';
  data: any;
  userId: string;
  timestamp: number;
}

/**
 * CollaborationEngine manages real-time collaboration sessions
 */
export class CollaborationEngine {
  private static instance: CollaborationEngine;
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private collaborators: Map<string, Collaborator> = new Map();
  private sessionId: string | null = null;
  private userId: string;
  private userName: string;
  private userColor: string;
  private messageCallbacks: ((message: CollaborationMessage) => void)[] = [];
  private operationQueue: TextOperation[] = [];
  private isProcessingQueue = false;

  private constructor() {
    this.userId = this.generateUserId();
    this.userName = 'User ' + this.userId.slice(0, 4);
    this.userColor = this.generateRandomColor();
  }

  static getInstance(): CollaborationEngine {
    if (!CollaborationEngine.instance) {
      CollaborationEngine.instance = new CollaborationEngine();
    }
    return CollaborationEngine.instance;
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate random color for user
   */
  private generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Create a new collaboration session
   */
  async createSession(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Generate unique session ID
        this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create peer with session ID
        this.peer = new Peer(this.sessionId, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        this.peer.on('open', (id) => {
          console.log('Session created:', id);
          this.setupPeerListeners();
          resolve(id);
        });

        this.peer.on('error', (error) => {
          console.error('Peer error:', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Join an existing collaboration session
   */
  async joinSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.sessionId = sessionId;
        
        // Create peer with unique user ID
        this.peer = new Peer(this.userId, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        this.peer.on('open', () => {
          console.log('Connected to peer network');
          this.setupPeerListeners();
          
          // Connect to session host
          const conn = this.peer!.connect(sessionId);
          this.setupConnection(conn);
          
          conn.on('open', () => {
            // Send join message
            this.sendMessage({
              type: 'user-joined',
              data: {
                id: this.userId,
                name: this.userName,
                color: this.userColor
              },
              userId: this.userId,
              timestamp: Date.now()
            });
            resolve();
          });
        });

        this.peer.on('error', (error) => {
          console.error('Peer error:', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup peer event listeners
   */
  private setupPeerListeners(): void {
    if (!this.peer) return;

    this.peer.on('connection', (conn) => {
      console.log('New peer connected:', conn.peer);
      this.setupConnection(conn);
    });

    this.peer.on('disconnected', () => {
      console.log('Disconnected from peer network');
      // Attempt to reconnect
      this.peer?.reconnect();
    });
  }

  /**
   * Setup connection event listeners
   */
  private setupConnection(conn: DataConnection): void {
    this.connections.set(conn.peer, conn);

    conn.on('data', (data) => {
      this.handleMessage(data as CollaborationMessage);
    });

    conn.on('close', () => {
      console.log('Connection closed:', conn.peer);
      this.connections.delete(conn.peer);
      this.collaborators.delete(conn.peer);
      
      // Notify about user leaving
      this.notifyMessage({
        type: 'user-left',
        data: { id: conn.peer },
        userId: conn.peer,
        timestamp: Date.now()
      });
    });

    conn.on('error', (error) => {
      console.error('Connection error:', error);
    });
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: CollaborationMessage): void {
    switch (message.type) {
      case 'user-joined':
        this.collaborators.set(message.userId, message.data);
        break;
      
      case 'user-left':
        this.collaborators.delete(message.data.id);
        break;
      
      case 'file-change':
        this.operationQueue.push(message.data.operation);
        this.processOperationQueue();
        break;
      
      case 'cursor-update':
        const collaborator = this.collaborators.get(message.userId);
        if (collaborator) {
          collaborator.cursor = message.data;
        }
        break;
      
      case 'selection-update':
        const collab = this.collaborators.get(message.userId);
        if (collab) {
          collab.selection = message.data;
        }
        break;
    }

    this.notifyMessage(message);
  }

  /**
   * Process operation queue with operational transformation
   */
  private async processOperationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.operationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift()!;
      
      // Apply operational transformation
      const transformedOp = this.transformOperation(operation);
      
      // Apply operation (this would be handled by the editor)
      this.notifyMessage({
        type: 'file-change',
        data: { operation: transformedOp },
        userId: operation.userId,
        timestamp: operation.timestamp
      });

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessingQueue = false;
  }

  /**
   * Transform operation using operational transformation algorithm
   */
  private transformOperation(operation: TextOperation): TextOperation {
    // Simple OT implementation
    // In a production system, this would be more sophisticated
    
    // For now, just return the operation as-is
    // A full OT implementation would handle concurrent operations
    return operation;
  }

  /**
   * Send file change to all collaborators
   */
  sendFileChange(path: string, operation: TextOperation): void {
    const message: CollaborationMessage = {
      type: 'file-change',
      data: { path, operation },
      userId: this.userId,
      timestamp: Date.now()
    };

    this.sendMessage(message);
  }

  /**
   * Send cursor position update
   */
  sendCursorUpdate(position: CursorPosition): void {
    const message: CollaborationMessage = {
      type: 'cursor-update',
      data: position,
      userId: this.userId,
      timestamp: Date.now()
    };

    this.sendMessage(message);
  }

  /**
   * Send selection update
   */
  sendSelectionUpdate(selection: SelectionRange): void {
    const message: CollaborationMessage = {
      type: 'selection-update',
      data: selection,
      userId: this.userId,
      timestamp: Date.now()
    };

    this.sendMessage(message);
  }

  /**
   * Send message to all connections
   */
  private sendMessage(message: CollaborationMessage): void {
    const data = JSON.stringify(message);
    
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(data);
      }
    });
  }

  /**
   * Notify message callbacks
   */
  private notifyMessage(message: CollaborationMessage): void {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  /**
   * Subscribe to collaboration messages
   */
  onMessage(callback: (message: CollaborationMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current collaborators
   */
  getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values());
  }

  /**
   * Get current user info
   */
  getCurrentUser(): Collaborator {
    return {
      id: this.userId,
      name: this.userName,
      color: this.userColor
    };
  }

  /**
   * Get session URL for sharing
   */
  getSessionUrl(): string | null {
    if (!this.sessionId) return null;
    return `${window.location.origin}?session=${this.sessionId}`;
  }

  /**
   * Leave session and cleanup
   */
  leaveSession(): void {
    // Send leave message
    this.sendMessage({
      type: 'user-left',
      data: { id: this.userId },
      userId: this.userId,
      timestamp: Date.now()
    });

    // Close all connections
    this.connections.forEach(conn => conn.close());
    this.connections.clear();

    // Destroy peer
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    // Clear state
    this.collaborators.clear();
    this.sessionId = null;
    this.operationQueue = [];
  }

  /**
   * Check if in active session
   */
  isInSession(): boolean {
    return this.sessionId !== null && this.peer !== null;
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }
}
