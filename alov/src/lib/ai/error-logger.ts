import { AIBackendType, ChromeExtensionService } from './types';

export interface ErrorLog {
  timestamp: string;
  errorType: 'connection' | 'timeout' | 'configuration' | 'backend' | 'service-switch';
  backend: AIBackendType;
  service?: ChromeExtensionService;
  message: string;
  stack?: string;
  userAgent: string;
  resolved: boolean;
  id: string;
}

/**
 * Error Logger for AI Service issues
 */
export class AIErrorLogger {
  private static readonly STORAGE_KEY = 'aether-ai-error-logs';
  private static readonly MAX_LOGS = 50;

  /**
   * Log an error
   */
  static logError(
    errorType: ErrorLog['errorType'],
    backend: AIBackendType,
    message: string,
    error?: Error,
    service?: ChromeExtensionService
  ): string {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      errorType,
      backend,
      service,
      message,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      resolved: false
    };

    try {
      const logs = this.getLogs();
      logs.unshift(errorLog);
      
      // Keep only the most recent logs
      const trimmedLogs = logs.slice(0, this.MAX_LOGS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedLogs));
      
      console.error('[AI Error Logger]', errorLog);
      
      return errorLog.id;
    } catch (storageError) {
      console.error('[AI Error Logger] Failed to store error log:', storageError);
      return errorLog.id;
    }
  }

  /**
   * Mark an error as resolved
   */
  static resolveError(errorId: string): void {
    try {
      const logs = this.getLogs();
      const errorIndex = logs.findIndex(log => log.id === errorId);
      
      if (errorIndex !== -1) {
        logs[errorIndex].resolved = true;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
      }
    } catch (error) {
      console.error('[AI Error Logger] Failed to resolve error:', error);
    }
  }

  /**
   * Get all error logs
   */
  static getLogs(): ErrorLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      
      const logs = JSON.parse(stored) as ErrorLog[];
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      console.error('[AI Error Logger] Failed to retrieve logs:', error);
      return [];
    }
  }

  /**
   * Get recent unresolved errors
   */
  static getRecentUnresolvedErrors(hours: number = 24): ErrorLog[] {
    const logs = this.getLogs();
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return logs.filter(log => 
      !log.resolved && 
      new Date(log.timestamp) > cutoff
    );
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): {
    total: number;
    unresolved: number;
    byType: Record<string, number>;
    byBackend: Record<string, number>;
  } {
    const logs = this.getLogs();
    
    const stats = {
      total: logs.length,
      unresolved: logs.filter(log => !log.resolved).length,
      byType: {} as Record<string, number>,
      byBackend: {} as Record<string, number>
    };

    logs.forEach(log => {
      stats.byType[log.errorType] = (stats.byType[log.errorType] || 0) + 1;
      stats.byBackend[log.backend] = (stats.byBackend[log.backend] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear old logs
   */
  static clearOldLogs(days: number = 7): void {
    try {
      const logs = this.getLogs();
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const recentLogs = logs.filter(log => 
        new Date(log.timestamp) > cutoff
      );
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentLogs));
    } catch (error) {
      console.error('[AI Error Logger] Failed to clear old logs:', error);
    }
  }

  /**
   * Clear all logs
   */
  static clearAllLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('[AI Error Logger] Failed to clear all logs:', error);
    }
  }

  /**
   * Export logs for debugging
   */
  static exportLogs(): string {
    const logs = this.getLogs();
    const stats = this.getErrorStats();
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      stats,
      logs
    }, null, 2);
  }

  private static generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}