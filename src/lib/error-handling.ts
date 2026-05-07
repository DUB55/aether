import { toast } from 'sonner'

export interface ErrorContext {
  operation: string
  projectId?: string
  userId?: string
  timestamp: string
  additionalData?: Record<string, any>
}

export interface SyncError extends Error {
  context: ErrorContext
  recoverable: boolean
  suggestions: string[]
}

export interface ErrorReport {
  id: string
  error: SyncError
  resolved: boolean
  resolution?: string
  reportedAt: string
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorReports: Map<string, ErrorReport> = new Map()
  private errorCallbacks: Array<(error: SyncError) => void> = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle sync-related errors with user-friendly feedback
   */
  handleSyncError(error: Error, context: ErrorContext): void {
    const syncError: SyncError = {
      ...error,
      name: error.name,
      message: error.message,
      context,
      recoverable: this.isRecoverable(error),
      suggestions: this.generateSuggestions(error, context)
    }

    console.error('[ErrorHandler] Sync error:', syncError)

    // Show user-friendly toast
    this.showErrorToast(syncError)

    // Log error report
    this.logError(syncError)

    // Notify callbacks
    this.errorCallbacks.forEach(callback => callback(syncError))
  }

  /**
   * Handle file system errors
   */
  handleFileError(error: Error, operation: string, filePath?: string): void {
    const context: ErrorContext = {
      operation,
      timestamp: new Date().toISOString(),
      additionalData: { filePath }
    }

    const syncError: SyncError = {
      ...error,
      name: error.name,
      message: error.message,
      context,
      recoverable: this.isFileErrorRecoverable(error),
      suggestions: this.generateFileSuggestions(error, filePath)
    }

    console.error('[ErrorHandler] File error:', syncError)
    this.showErrorToast(syncError)
    this.logError(syncError)
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: Error, operation: string): void {
    const context: ErrorContext = {
      operation,
      timestamp: new Date().toISOString()
    }

    const syncError: SyncError = {
      ...error,
      name: error.name,
      message: error.message,
      context,
      recoverable: true,
      suggestions: [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the issue persists'
      ]
    }

    console.error('[ErrorHandler] Network error:', syncError)
    this.showErrorToast(syncError)
    this.logError(syncError)
  }

  /**
   * Handle conflict errors
   */
  handleConflictError(conflicts: string[], projectId: string): void {
    const context: ErrorContext = {
      operation: 'conflict-resolution',
      projectId,
      timestamp: new Date().toISOString(),
      additionalData: { conflictCount: conflicts.length }
    }

    const error = new Error(`${conflicts.length} sync conflicts detected`)
    const syncError: SyncError = {
      ...error,
      name: 'SyncConflictError',
      message: error.message,
      context,
      recoverable: true,
      suggestions: [
        'Review and resolve conflicts manually',
        'Choose which version to keep for each conflict',
        'Use auto-merge for simple conflicts'
      ]
    }

    console.error('[ErrorHandler] Conflict error:', syncError)
    this.showErrorToast(syncError)
    this.logError(syncError)
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(error: Error): boolean {
    const recoverableErrors = [
      'NetworkError',
      'TimeoutError',
      'ConnectionError',
      'FileSystemError'
    ]

    return recoverableErrors.includes(error.name) || 
           error.message.includes('network') ||
           error.message.includes('timeout') ||
           error.message.includes('connection')
  }

  /**
   * Check if file error is recoverable
   */
  private isFileErrorRecoverable(error: Error): boolean {
    const recoverableFileErrors = [
      'ENOENT', // File not found (might be created)
      'EACCES', // Permission denied (might be fixable)
      'EMFILE', // Too many open files (retry might work)
      'ENOSPC'  // No space left (user can free space)
    ]

    return recoverableFileErrors.some(code => error.message.includes(code))
  }

  /**
   * Generate error suggestions
   */
  private generateSuggestions(error: Error, context: ErrorContext): string[] {
    const suggestions: string[] = []

    if (error.message.includes('permission')) {
      suggestions.push('Check file permissions')
      suggestions.push('Run as administrator if necessary')
    }

    if (error.message.includes('network') || error.message.includes('connection')) {
      suggestions.push('Check internet connection')
      suggestions.push('Try again later')
    }

    if (error.message.includes('space') || error.message.includes('disk full')) {
      suggestions.push('Free up disk space')
      suggestions.push('Choose a different location')
    }

    if (context.operation.includes('sync')) {
      suggestions.push('Check if local files are locked')
      suggestions.push('Close any applications using the files')
      suggestions.push('Try manual sync')
    }

    return suggestions
  }

  /**
   * Generate file-specific suggestions
   */
  private generateFileSuggestions(error: Error, filePath?: string): string[] {
    const suggestions: string[] = []

    if (filePath) {
      suggestions.push(`Check file: ${filePath}`)
      suggestions.push('Ensure file is not open in another application')
    }

    if (error.message.includes('ENOENT')) {
      suggestions.push('File will be created automatically')
      suggestions.push('Check if parent directory exists')
    }

    if (error.message.includes('EACCES')) {
      suggestions.push('Check file/folder permissions')
      suggestions.push('Try running with elevated privileges')
    }

    return suggestions
  }

  /**
   * Show error toast with appropriate styling
   */
  private showErrorToast(error: SyncError): void {
    const title = this.getErrorTitle(error)
    const description = this.getErrorDescription(error)

    if (error.recoverable) {
      toast.warning(title, {
        description,
        action: {
          label: 'Retry',
          onClick: () => this.retryOperation(error)
        }
      })
    } else {
      toast.error(title, {
        description,
        action: {
          label: 'Details',
          onClick: () => this.showErrorDetails(error)
        }
      })
    }
  }

  /**
   * Get error title for toast
   */
  private getErrorTitle(error: SyncError): string {
    switch (error.name) {
      case 'SyncConflictError':
        return 'Sync Conflicts Detected'
      case 'NetworkError':
        return 'Connection Error'
      case 'FileSystemError':
        return 'File System Error'
      case 'PermissionError':
        return 'Permission Denied'
      default:
        return 'Operation Failed'
    }
  }

  /**
   * Get error description for toast
   */
  private getErrorDescription(error: SyncError): string {
    if (error.suggestions.length > 0) {
      return `${error.message}. ${error.suggestions[0]}`
    }
    return error.message
  }

  /**
   * Log error for debugging
   */
  private logError(error: SyncError): void {
    const report: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      error,
      resolved: false,
      reportedAt: new Date().toISOString()
    }

    this.errorReports.set(report.id, report)

    // In production, you might send this to a logging service
    console.error('[ErrorHandler] Error report:', report)
  }

  /**
   * Retry operation
   */
  private retryOperation(error: SyncError): void {
    console.log('[ErrorHandler] Retrying operation:', error.context.operation)
    
    // This would need to be implemented based on the specific operation
    // For now, just show a message
    toast.info('Retrying operation...', {
      description: 'Attempting to recover from the error'
    })
  }

  /**
   * Show error details
   */
  private showErrorDetails(error: SyncError): void {
    console.log('[ErrorHandler] Showing error details:', error)
    
    // In a real implementation, you might show a modal with detailed error information
    toast.info('Error Details', {
      description: `Operation: ${error.context.operation}\nError: ${error.message}`
    })
  }

  /**
   * Register error callback
   */
  onError(callback: (error: SyncError) => void): void {
    this.errorCallbacks.push(callback)
  }

  /**
   * Remove error callback
   */
  removeErrorCallback(callback: (error: SyncError) => void): void {
    const index = this.errorCallbacks.indexOf(callback)
    if (index > -1) {
      this.errorCallbacks.splice(index, 1)
    }
  }

  /**
   * Get error reports
   */
  getErrorReports(): ErrorReport[] {
    return Array.from(this.errorReports.values())
  }

  /**
   * Clear error reports
   */
  clearErrorReports(): void {
    this.errorReports.clear()
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string, resolution: string): void {
    const report = this.errorReports.get(errorId)
    if (report) {
      report.resolved = true
      report.resolution = resolution
      console.log('[ErrorHandler] Error resolved:', errorId, resolution)
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Utility functions for common error scenarios
export const handleSyncError = (error: Error, context: ErrorContext) => {
  errorHandler.handleSyncError(error, context)
}

export const handleFileError = (error: Error, operation: string, filePath?: string) => {
  errorHandler.handleFileError(error, operation, filePath)
}

export const handleNetworkError = (error: Error, operation: string) => {
  errorHandler.handleNetworkError(error, operation)
}

export const handleConflictError = (conflicts: string[], projectId: string) => {
  errorHandler.handleConflictError(conflicts, projectId)
}
