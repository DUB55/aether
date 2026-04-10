// Notification service
// Manages in-app notifications for users

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'deployment'
  | 'invitation'
  | 'mention'
  | 'system';

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  projectId?: string
  workspaceId?: string
  createdAt: Timestamp
  expiresAt?: Timestamp
}

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  // Create a notification
  createNotification: async (notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>): Promise<Notification> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const newNotification: Notification = {
      id: crypto.randomUUID(),
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: false,
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      projectId: notification.projectId,
      workspaceId: notification.workspaceId,
      createdAt: Timestamp.now(),
      expiresAt: notification.expiresAt
    };

    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, newNotification.id), newNotification);
    return newNotification;
  },

  // Get a notification
  getNotification: async (id: string): Promise<Notification | null> => {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as Notification;
  },

  // Update a notification
  updateNotification: async (id: string, updates: Partial<Omit<Notification, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, id), updates);
  },

  // Delete a notification
  deleteNotification: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, id));
  },

  // Get all notifications for a user
  getUserNotifications: async (userId?: string, limitCount: number = 50): Promise<Notification[]> => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Notification);
  },

  // Get unread notifications for a user
  getUnreadNotifications: async (userId?: string): Promise<Notification[]> => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Notification);
  },

  // Get unread notification count
  getUnreadCount: async (userId?: string): Promise<number> => {
    const unread = await notificationService.getUnreadNotifications(userId);
    return unread.length;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    await notificationService.updateNotification(id, { read: true });
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId?: string): Promise<void> => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    const unread = await notificationService.getUnreadNotifications(uid);
    const promises = unread.map(notification => 
      notificationService.markAsRead(notification.id)
    );
    await Promise.all(promises);
  },

  // Delete all notifications for a user
  deleteAllNotifications: async (userId?: string): Promise<void> => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    const notifications = await notificationService.getUserNotifications(uid, 1000);
    const promises = notifications.map(notification => 
      notificationService.deleteNotification(notification.id)
    );
    await Promise.all(promises);
  },

  // Delete read notifications for a user
  deleteReadNotifications: async (userId?: string): Promise<void> => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    const notifications = await notificationService.getUserNotifications(uid, 1000);
    const readNotifications = notifications.filter(n => n.read);
    const promises = readNotifications.map(notification => 
      notificationService.deleteNotification(notification.id)
    );
    await Promise.all(promises);
  },

  // Get notifications by type
  getNotificationsByType: async (type: NotificationType, userId?: string): Promise<Notification[]> => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', uid),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Notification);
  },

  // Get notifications for a project
  getProjectNotifications: async (projectId: string): Promise<Notification[]> => {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Notification);
  },

  // Get notifications for a workspace
  getWorkspaceNotifications: async (workspaceId: string): Promise<Notification[]> => {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('workspaceId', '==', workspaceId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Notification);
  },

  // Clean up expired notifications
  cleanupExpiredNotifications: async (): Promise<number> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const notifications = await notificationService.getUserNotifications(userId, 1000);
    const now = Timestamp.now();
    const expired = notifications.filter(n => n.expiresAt && n.expiresAt < now);
    
    const promises = expired.map(notification => 
      notificationService.deleteNotification(notification.id)
    );
    await Promise.all(promises);
    
    return expired.length;
  },

  // Get available notification types
  getNotificationTypes(): Array<{ value: string; label: string; icon: string }> {
    return [
      { value: 'info', label: 'Info', icon: 'ℹ️' },
      { value: 'success', label: 'Success', icon: '✅' },
      { value: 'warning', label: 'Warning', icon: '⚠️' },
      { value: 'error', label: 'Error', icon: '❌' },
      { value: 'deployment', label: 'Deployment', icon: '🚀' },
      { value: 'invitation', label: 'Invitation', icon: '📨' },
      { value: 'mention', label: 'Mention', icon: '@' },
      { value: 'system', label: 'System', icon: '⚙️' }
    ];
  }
};
