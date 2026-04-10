// Audit logging service
// Tracks important actions for security and compliance

import { db, auth } from './firebase';
import { doc, setDoc, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export type AuditAction = 
  | 'user.created'
  | 'user.deleted'
  | 'user.updated'
  | 'user.login'
  | 'user.logout'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'project.exported'
  | 'project.imported'
  | 'deployment.started'
  | 'deployment.succeeded'
  | 'deployment.failed'
  | 'secret.created'
  | 'secret.updated'
  | 'secret.deleted'
  | 'secret.accessed'
  | 'api_key.created'
  | 'api_key.updated'
  | 'api_key.deleted'
  | 'webhook.created'
  | 'webhook.updated'
  | 'webhook.deleted'
  | 'webhook.triggered'
  | 'workspace.created'
  | 'workspace.updated'
  | 'workspace.deleted'
  | 'settings.updated'
  | 'permission.granted'
  | 'permission.revoked';

export interface AuditLog {
  id: string
  action: AuditAction
  userId: string
  userEmail?: string
  targetId?: string
  targetType?: 'user' | 'project' | 'workspace' | 'secret' | 'api_key' | 'webhook' | 'deployment' | 'settings'
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  timestamp: Timestamp
}

const AUDIT_LOGS_COLLECTION = 'audit_logs';

export const auditService = {
  // Log an audit event
  log: async (action: AuditAction, metadata?: Record<string, any>, targetId?: string, targetType?: AuditLog['targetType']): Promise<void> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return;
    }

    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      action,
      userId,
      userEmail: auth.currentUser?.email,
      targetId,
      targetType,
      metadata,
      timestamp: Timestamp.now()
    };

    try {
      await setDoc(doc(db, AUDIT_LOGS_COLLECTION, auditLog.id), auditLog);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  },

  // Get audit logs for a user
  getUserAuditLogs: async (userId: string, limitCount: number = 100): Promise<AuditLog[]> => {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AuditLog);
  },

  // Get audit logs for a specific target
  getTargetAuditLogs: async (targetId: string, limitCount: number = 100): Promise<AuditLog[]> => {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      where('targetId', '==', targetId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AuditLog);
  },

  // Get audit logs by action type
  getAuditLogsByAction: async (action: AuditAction, limitCount: number = 100): Promise<AuditLog[]> => {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      where('action', '==', action),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AuditLog);
  },

  // Get audit logs by time range
  getAuditLogsByTimeRange: async (startTime: Timestamp, endTime: Timestamp, limitCount: number = 100): Promise<AuditLog[]> => {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      where('timestamp', '>=', startTime),
      where('timestamp', '<=', endTime),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AuditLog);
  },

  // Get all audit logs (admin only)
  getAllAuditLogs: async (limitCount: number = 100): Promise<AuditLog[]> => {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AuditLog);
  },

  // Generate audit report
  generateReport: async (startTime: Timestamp, endTime: Timestamp): Promise<{
    totalLogs: number
    actionCounts: Record<string, number>
    userCounts: Record<string, number>
    targetCounts: Record<string, number>
  }> => {
    const logs = await auditService.getAuditLogsByTimeRange(startTime, endTime, 1000);

    const actionCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const targetCounts: Record<string, number> = {};

    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      userCounts[log.userEmail || log.userId] = (userCounts[log.userEmail || log.userId] || 0) + 1;
      if (log.targetType) {
        targetCounts[log.targetType] = (targetCounts[log.targetType] || 0) + 1;
      }
    });

    return {
      totalLogs: logs.length,
      actionCounts,
      userCounts,
      targetCounts
    };
  },

  // Get available actions
  getAvailableActions(): Array<{ value: string; label: string; category: string }> {
    return [
      { value: 'user.created', label: 'User Created', category: 'User' },
      { value: 'user.deleted', label: 'User Deleted', category: 'User' },
      { value: 'user.updated', label: 'User Updated', category: 'User' },
      { value: 'user.login', label: 'User Login', category: 'User' },
      { value: 'user.logout', label: 'User Logout', category: 'User' },
      { value: 'project.created', label: 'Project Created', category: 'Project' },
      { value: 'project.updated', label: 'Project Updated', category: 'Project' },
      { value: 'project.deleted', label: 'Project Deleted', category: 'Project' },
      { value: 'project.exported', label: 'Project Exported', category: 'Project' },
      { value: 'project.imported', label: 'Project Imported', category: 'Project' },
      { value: 'deployment.started', label: 'Deployment Started', category: 'Deployment' },
      { value: 'deployment.succeeded', label: 'Deployment Succeeded', category: 'Deployment' },
      { value: 'deployment.failed', label: 'Deployment Failed', category: 'Deployment' },
      { value: 'secret.created', label: 'Secret Created', category: 'Secret' },
      { value: 'secret.updated', label: 'Secret Updated', category: 'Secret' },
      { value: 'secret.deleted', label: 'Secret Deleted', category: 'Secret' },
      { value: 'secret.accessed', label: 'Secret Accessed', category: 'Secret' },
      { value: 'api_key.created', label: 'API Key Created', category: 'API Key' },
      { value: 'api_key.updated', label: 'API Key Updated', category: 'API Key' },
      { value: 'api_key.deleted', label: 'API Key Deleted', category: 'API Key' },
      { value: 'webhook.created', label: 'Webhook Created', category: 'Webhook' },
      { value: 'webhook.updated', label: 'Webhook Updated', category: 'Webhook' },
      { value: 'webhook.deleted', label: 'Webhook Deleted', category: 'Webhook' },
      { value: 'webhook.triggered', label: 'Webhook Triggered', category: 'Webhook' },
      { value: 'workspace.created', label: 'Workspace Created', category: 'Workspace' },
      { value: 'workspace.updated', label: 'Workspace Updated', category: 'Workspace' },
      { value: 'workspace.deleted', label: 'Workspace Deleted', category: 'Workspace' },
      { value: 'settings.updated', label: 'Settings Updated', category: 'Settings' },
      { value: 'permission.granted', label: 'Permission Granted', category: 'Permission' },
      { value: 'permission.revoked', label: 'Permission Revoked', category: 'Permission' }
    ];
  },

  // Delete old audit logs (cleanup)
  deleteOldLogs: async (olderThanDays: number = 90): Promise<number> => {
    const cutoffDate = Timestamp.fromDate(new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000));
    
    // Note: Firestore doesn't support delete by query directly
    // This would need to be implemented with a cloud function or batched deletes
    // For now, this is a placeholder for the functionality
    console.log(`Would delete audit logs older than ${olderThanDays} days`);
    return 0;
  }
};
