// Webhook Manager Component
// Manages webhooks for projects and workspaces

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Play, Copy, Check, X, ExternalLink, Clock } from 'lucide-react';
import { webhookService, Webhook } from '../lib/webhook-service';

export default function WebhookManager({ projectId, workspaceId }: { projectId?: string; workspaceId?: string }) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, [projectId, workspaceId]);

  const availableEvents = webhookService.getAvailableEvents();

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      let hooks: Webhook[] = [];
      if (projectId) {
        hooks = await webhookService.getProjectWebhooks(projectId);
      } else if (workspaceId) {
        hooks = await webhookService.getWorkspaceWebhooks(workspaceId);
      } else {
        hooks = await webhookService.getUserWebhooks();
      }
      setWebhooks(hooks);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (webhookData: Omit<Webhook, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await webhookService.createWebhook(webhookData);
      await loadWebhooks();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const handleUpdate = async (webhookData: Partial<Webhook>) => {
    if (!selectedWebhook) return;
    try {
      await webhookService.updateWebhook(selectedWebhook.id, webhookData);
      await loadWebhooks();
      setShowEditModal(false);
      setSelectedWebhook(null);
    } catch (error) {
      console.error('Failed to update webhook:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await webhookService.deleteWebhook(id);
      await loadWebhooks();
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const handleToggleActive = async (webhook: Webhook) => {
    try {
      await webhookService.updateWebhook(webhook.id, { active: !webhook.active });
      await loadWebhooks();
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
    }
  };

  const handleTest = async (webhook: Webhook) => {
    setTestingWebhook(webhook.id);
    try {
      const result = await webhookService.testWebhook(webhook.id);
      alert(result.success ? 'Webhook test successful!' : `Webhook test failed: ${result.error}`);
    } catch (error) {
      console.error('Failed to test webhook:', error);
      alert('Webhook test failed');
    } finally {
      setTestingWebhook(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading webhooks...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Webhooks</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {webhooks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <ExternalLink className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No webhooks configured</p>
          <p className="text-sm text-gray-400 mt-2">Add webhooks to receive notifications about events</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <div
              key={webhook.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{webhook.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      webhook.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {webhook.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{webhook.url}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {webhook.events.map(event => (
                      <span
                        key={event}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  {webhook.lastTriggered && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Last triggered: {new Date(webhook.lastTriggered.seconds * 1000).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(webhook)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title={webhook.active ? 'Deactivate' : 'Activate'}
                  >
                    {webhook.active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleTest(webhook)}
                    disabled={testingWebhook === webhook.id}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                    title="Test webhook"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      setShowEditModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(webhook.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <WebhookModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          availableEvents={webhookService.getAvailableEvents()}
          projectId={projectId}
          workspaceId={workspaceId}
        />
      )}

      {showEditModal && selectedWebhook && (
        <WebhookModal
          webhook={selectedWebhook}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWebhook(null);
          }}
          onSubmit={handleUpdate}
          availableEvents={webhookService.getAvailableEvents()}
          projectId={projectId}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}

function WebhookModal({
  webhook,
  onClose,
  onSubmit,
  availableEvents,
  projectId,
  workspaceId
}: {
  webhook?: Webhook;
  onClose: () => void;
  onSubmit: (data: any) => void;
  availableEvents: { value: string; label: string; description: string }[];
  projectId?: string;
  workspaceId?: string;
}) {
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    events: webhook?.events || [],
    secret: webhook?.secret || '',
    active: webhook?.active ?? true,
    headers: webhook?.headers || {}
  });
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set(webhook?.events || []));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      events: Array.from(selectedEvents),
      projectId,
      workspaceId
    });
  };

  const toggleEvent = (event: string) => {
    const newSet = new Set(selectedEvents);
    if (newSet.has(event)) {
      newSet.delete(event);
    } else {
      newSet.add(event);
    }
    setSelectedEvents(newSet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">
            {webhook ? 'Edit Webhook' : 'Create Webhook'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                required
                placeholder="https://example.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Events</label>
              <div className="flex flex-wrap gap-2">
                {availableEvents.map((event) => {
                  const eventValue = event.value;
                  const eventLabel = event.label;
                  return (
                    <button
                      key={eventValue}
                      type="button"
                      onClick={() => toggleEvent(eventValue)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        selectedEvents.has(eventValue)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {eventLabel}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Secret (optional)</label>
              <input
                type="text"
                value={formData.secret}
                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Webhook secret for signature verification"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="active" className="text-sm">Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {webhook ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
