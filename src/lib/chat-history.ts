import { doc, setDoc, getDoc, updateDoc, collection, query, where, orderBy, getDocs, onSnapshot, Timestamp, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { type ChatHistory, type Message } from '@/types'

export class ChatHistoryService {
  private static instance: ChatHistoryService

  static getInstance(): ChatHistoryService {
    if (!ChatHistoryService.instance) {
      ChatHistoryService.instance = new ChatHistoryService()
    }
    return ChatHistoryService.instance
  }

  /**
   * Save chat history for a project
   */
  async saveChatHistory(
    projectId: string,
    userId: string,
    messages: Message[]
  ): Promise<void> {
    try {
      const chatHistoryRef = doc(db, 'users', userId, 'chatHistory', projectId)
      
      const chatHistory: ChatHistory = {
        id: projectId,
        projectId,
        userId,
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessageAt: messages.length > 0 
          ? messages[messages.length - 1].timestamp || new Date().toISOString()
          : new Date().toISOString()
      }

      await setDoc(chatHistoryRef, chatHistory)
      console.log('[ChatHistoryService] Chat history saved for project:', projectId)
    } catch (error) {
      console.error('[ChatHistoryService] Failed to save chat history:', error)
      throw error
    }
  }

  /**
   * Load chat history for a project
   */
  async loadChatHistory(projectId: string, userId: string): Promise<ChatHistory | null> {
    try {
      const chatHistoryRef = doc(db, 'users', userId, 'chatHistory', projectId)
      const chatHistoryDoc = await getDoc(chatHistoryRef)

      if (chatHistoryDoc.exists()) {
        const data = chatHistoryDoc.data()
        return {
          ...data,
          id: chatHistoryDoc.id
        } as ChatHistory
      }

      return null
    } catch (error) {
      console.error('[ChatHistoryService] Failed to load chat history:', error)
      return null
    }
  }

  /**
   * Add a new message to chat history
   */
  async addMessage(
    projectId: string,
    userId: string,
    message: Message
  ): Promise<void> {
    try {
      const chatHistoryRef = doc(db, 'users', userId, 'chatHistory', projectId)
      const chatHistoryDoc = await getDoc(chatHistoryRef)

      if (chatHistoryDoc.exists()) {
        // Update existing chat history
        const existingData = chatHistoryDoc.data() as ChatHistory
        const updatedMessages = [...existingData.messages, message]

        await updateDoc(chatHistoryRef, {
          messages: updatedMessages,
          updatedAt: new Date().toISOString(),
          lastMessageAt: message.timestamp || new Date().toISOString()
        })
      } else {
        // Create new chat history
        await this.saveChatHistory(projectId, userId, [message])
      }

      console.log('[ChatHistoryService] Message added to chat history:', projectId)
    } catch (error) {
      console.error('[ChatHistoryService] Failed to add message:', error)
      throw error
    }
  }

  /**
   * Get all chat histories for a user
   */
  async getUserChatHistories(userId: string): Promise<ChatHistory[]> {
    try {
      const chatHistoriesRef = collection(db, 'users', userId, 'chatHistory')
      const q = query(chatHistoriesRef, orderBy('lastMessageAt', 'desc'))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ChatHistory[]
    } catch (error) {
      console.error('[ChatHistoryService] Failed to get user chat histories:', error)
      return []
    }
  }

  /**
   * Delete chat history for a project
   */
  async deleteChatHistory(projectId: string, userId: string): Promise<void> {
    try {
      const chatHistoryRef = doc(db, 'users', userId, 'chatHistory', projectId)
      await deleteDoc(chatHistoryRef)
      console.log('[ChatHistoryService] Chat history deleted for project:', projectId)
    } catch (error) {
      console.error('[ChatHistoryService] Failed to delete chat history:', error)
      throw error
    }
  }

  /**
   * Subscribe to real-time chat history updates
   */
  subscribeToChatHistory(
    projectId: string,
    userId: string,
    callback: (chatHistory: ChatHistory | null) => void
  ): () => void {
    const chatHistoryRef = doc(db, 'users', userId, 'chatHistory', projectId)

    const unsubscribe = onSnapshot(chatHistoryRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        callback({
          ...data,
          id: doc.id
        } as ChatHistory)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('[ChatHistoryService] Real-time subscription error:', error)
    })

    return unsubscribe
  }

  /**
   * Search chat histories by message content
   */
  async searchChatHistories(
    userId: string,
    searchTerm: string
  ): Promise<ChatHistory[]> {
    try {
      const allHistories = await this.getUserChatHistories(userId)
      
      return allHistories.filter(history => 
        history.messages.some(message =>
          message.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } catch (error) {
      console.error('[ChatHistoryService] Failed to search chat histories:', error)
      return []
    }
  }

  /**
   * Get chat statistics for a user
   */
  async getChatStatistics(userId: string): Promise<{
    totalProjects: number
    totalMessages: number
    lastActivity: string | null
  }> {
    try {
      const histories = await this.getUserChatHistories(userId)
      
      const totalMessages = histories.reduce(
        (total, history) => total + history.messages.length,
        0
      )

      const lastActivity = histories.length > 0 
        ? histories[0].lastMessageAt 
        : null

      return {
        totalProjects: histories.length,
        totalMessages,
        lastActivity
      }
    } catch (error) {
      console.error('[ChatHistoryService] Failed to get chat statistics:', error)
      return {
        totalProjects: 0,
        totalMessages: 0,
        lastActivity: null
      }
    }
  }

  /**
   * Export chat history for a project
   */
  async exportChatHistory(
    projectId: string,
    userId: string,
    format: 'json' | 'txt' = 'json'
  ): Promise<string> {
    try {
      const chatHistory = await this.loadChatHistory(projectId, userId)
      
      if (!chatHistory) {
        throw new Error('Chat history not found')
      }

      if (format === 'json') {
        return JSON.stringify(chatHistory, null, 2)
      } else {
        // TXT format
        let output = `Chat History for Project: ${projectId}\n`
        output += `Created: ${chatHistory.createdAt}\n`
        output += `Last Updated: ${chatHistory.updatedAt}\n`
        output += `Total Messages: ${chatHistory.messages.length}\n\n`

        chatHistory.messages.forEach((message, index) => {
          output += `[${index + 1}] ${message.role.toUpperCase()}\n`
          output += `${message.content}\n`
          if (message.image) {
            output += `[Image: ${message.image}]\n`
          }
          output += '\n---\n\n'
        })

        return output
      }
    } catch (error) {
      console.error('[ChatHistoryService] Failed to export chat history:', error)
      throw error
    }
  }
}

// Export singleton instance
export const chatHistoryService = ChatHistoryService.getInstance()
