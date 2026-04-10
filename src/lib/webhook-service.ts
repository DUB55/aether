// Webhook service
// Manages webhooks for project events and integrations

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface Webhook {
  id: string
  name: string
  url: string
  events: Array<'project.created' | 'project.updated' | 'project.deleted' | 'deployment.started' | 'deployment.succeeded' | 'deployment.failed'>
  secret?: string
  projectId?: string
  workspaceId?: string
  userId: string
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  lastTriggered?: Timestamp
  headers?: Record<string, string>
}

export interface WebhookTriggerResult {
  success: boolean
  statusCode?: number
  response?: string
  error?: string
}

const WEBHOOKS_COLLECTION = 'webhooks';

export const webhookService = {
  // Create a webhook
  createWebhook: async (webhook: Omit<Webhook, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Webhook> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const newWebhook: Webhook = {
      id: crypto.randomUUID(),
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      projectId: webhook.projectId,
      workspaceId: webhook.workspaceId,
      userId,
      active: webhook.active,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      headers: webhook.headers
    };

    await setDoc(doc(db, WEBHOOKS_COLLECTION, newWebhook.id), newWebhook);
    return newWebhook;
  },

  // Get a webhook
  getWebhook: async (id: string): Promise<Webhook | null> => {
    const docRef = doc(db, WEBHOOKS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as Webhook;
  },

  // Update a webhook
  updateWebhook: async (id: string, updates: Partial<Omit<Webhook, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    await updateDoc(doc(db, WEBHOOKS_COLLECTION, id), updateData);
  },

  // Delete a webhook
  deleteWebhook: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, WEBHOOKS_COLLECTION, id));
  },

  // Get all webhooks for a user
  getUserWebhooks: async (userId?: string): Promise<Webhook[]> => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    const q = query(collection(db, WEBHOOKS_COLLECTION), where('userId', '==', uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as Webhook);
  },

  // Get webhooks for a specific project
  getProjectWebhooks: async (projectId: string): Promise<Webhook[]> => {
    const q = query(collection(db, WEBHOOKS_COLLECTION), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as Webhook);
  },

  // Get webhooks for a specific workspace
  getWorkspaceWebhooks: async (workspaceId: string): Promise<Webhook[]> => {
    const q = query(collection(db, WEBHOOKS_COLLECTION), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as Webhook);
  },

  // Get active webhooks for a specific event
  getWebhooksForEvent: async (event: string, projectId?: string): Promise<Webhook[]> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    let q;
    if (projectId) {
      q = query(
        collection(db, WEBHOOKS_COLLECTION),
        where('userId', '==', userId),
        where('projectId', '==', projectId),
        where('active', '==', true)
      );
    } else {
      q = query(
        collection(db, WEBHOOKS_COLLECTION),
        where('userId', '==', userId),
        where('active', '==', true)
      );
    }

    const querySnapshot = await getDocs(q);
    const webhooks = querySnapshot.docs.map(doc => doc.data() as Webhook);

    // Filter by event
    return webhooks.filter(webhook => webhook.events.includes(event as Webhook['events'][0]));
  },

  // Trigger a webhook
  triggerWebhook: async (webhook: Webhook, payload: Record<string, any>): Promise<WebhookTriggerResult> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...webhook.headers
      };

      // Add signature if secret is provided
      if (webhook.secret) {
        const signature = await webhookService.generateSignature(payload, webhook.secret);
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: webhook.events[0] as string,
          timestamp: new Date().toISOString(),
          payload
        })
      });

      // Update last triggered timestamp
      await webhookService.updateWebhook(webhook.id, {
        lastTriggered: Timestamp.now()
      });

      return {
        success: response.ok,
        statusCode: response.status,
        response: await response.text()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger webhook'
      };
    }
  },

  // Trigger all webhooks for an event
  triggerEvent: async (event: string, payload: Record<string, any>, projectId?: string): Promise<Array<{ webhookId: string; result: WebhookTriggerResult }>> => {
    const webhooks = await webhookService.getWebhooksForEvent(event, projectId);

    const results = await Promise.all(
      webhooks.map(async (webhook) => {
        const result = await webhookService.triggerWebhook(webhook, payload);
        return {
          webhookId: webhook.id,
          result
        };
      })
    );

    return results;
  },

  // Generate HMAC signature for webhook
  generateSignature: async (payload: Record<string, any>, secret: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const key = encoder.encode(secret);

    const signature = await window.crypto.subtle.sign(
      'HMAC',
      await window.crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      data
    );

    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `sha256=${signatureHex}`;
  },

  // Verify webhook signature
  verifySignature: async (payload: Record<string, any>, signature: string, secret: string): Promise<boolean> => {
    const expectedSignature = await webhookService.generateSignature(payload, secret);
    return signature === expectedSignature;
  },

  // Validate webhook URL
  validateUrl: (url: string): { valid: boolean; error?: string } => {
    try {
      const parsed = new URL(url);
      
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid URL'
      };
    }
  },

  // Get available events
  getAvailableEvents(): { value: string; label: string; description: string }[] {
    return [
      { value: 'project.created', label: 'Project Created', description: 'Triggered when a new project is created' },
      { value: 'project.updated', label: 'Project Updated', description: 'Triggered when a project is updated' },
      { value: 'project.deleted', label: 'Project Deleted', description: 'Triggered when a project is deleted' },
      { value: 'deployment.started', label: 'Deployment Started', description: 'Triggered when a deployment starts' },
      { value: 'deployment.succeeded', label: 'Deployment Succeeded', description: 'Triggered when a deployment succeeds' },
      { value: 'deployment.failed', label: 'Deployment Failed', description: 'Triggered when a deployment fails' }
    ];
  },

  // Test webhook
  testWebhook: async (url: string, secret?: string): Promise<WebhookTriggerResult> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const payload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        payload: {
          message: 'Webhook test from Aether AI'
        }
      };

      if (secret) {
        const signature = await webhookService.generateSignature(payload, secret);
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      return {
        success: response.ok,
        statusCode: response.status,
        response: await response.text()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test webhook'
      };
    }
  }
};
