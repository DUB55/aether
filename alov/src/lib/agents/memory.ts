
export interface MemoryEntry {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface ProjectPreferences {
  framework?: 'nextjs' | 'react' | 'vue' | 'svelte'
  language?: 'typescript' | 'javascript' | 'python'
  styling?: 'tailwind' | 'css' | 'scss'
  [key: string]: any
}

export class MemoryManager {
  private static instance: MemoryManager
  private sessions: Map<string, MemoryEntry[]> = new Map()
  private preferences: Map<string, ProjectPreferences> = new Map()

  private constructor() {}

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager()
    }
    return MemoryManager.instance
  }

  // Add an interaction to the session history
  addInteraction(sessionId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>) {
    const history = this.sessions.get(sessionId) || []
    history.push({
      role,
      content,
      timestamp: Date.now(),
      metadata
    })
    // Keep only last 50 interactions
    if (history.length > 50) {
      history.shift()
    }
    this.sessions.set(sessionId, history)
  }

  // Get recent history for context window
  getRecentHistory(sessionId: string, limit: number = 10): MemoryEntry[] {
    const history = this.sessions.get(sessionId) || []
    return history.slice(-limit)
  }

  // Set a project preference
  setPreference(projectId: string, key: string, value: any) {
    const prefs = this.preferences.get(projectId) || {}
    prefs[key] = value
    this.preferences.set(projectId, prefs)
  }

  // Get project preferences
  getPreferences(projectId: string): ProjectPreferences {
    return this.preferences.get(projectId) || {}
  }

  // Clear session memory
  clearSession(sessionId: string) {
    this.sessions.delete(sessionId)
  }
}

export const memoryManager = MemoryManager.getInstance()
