// Audit Log Viewer Component
// Displays and filters audit logs for security and compliance

import { useState, useEffect } from 'react';
import { Shield, Calendar, Filter, Download, Trash2, Search, User, File, Lock, Settings, Globe, Users, AlertTriangle, X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { auditService, AuditLog, AuditAction } from '../lib/audit-service';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    userId: '',
    action: '',
    targetType: '',
    targetId: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      let filteredLogs: AuditLog[] = [];

      if (filter.targetId) {
        filteredLogs = await auditService.getTargetAuditLogs(filter.targetId);
      } else if (filter.action) {
        filteredLogs = await auditService.getAuditLogsByAction(filter.action as AuditAction);
      } else if (filter.startDate || filter.endDate) {
        const start = filter.startDate ? Timestamp.fromDate(new Date(filter.startDate)) : Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const end = filter.endDate ? Timestamp.fromDate(new Date(filter.endDate)) : Timestamp.now();
        filteredLogs = await auditService.getAuditLogsByTimeRange(start, end);
      } else {
        // Get recent logs (last 30 days)
        const start = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        filteredLogs = await auditService.getAuditLogsByTimeRange(start, Timestamp.now());
      }

      setLogs(filteredLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    loadLogs();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilter({
      userId: '',
      action: '',
      targetType: '',
      targetId: '',
      startDate: '',
      endDate: ''
    });
    loadLogs();
    setShowFilters(false);
  };

  const handleExport = async () => {
    try {
      const startTime = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const endTime = Timestamp.now();
      const report = await auditService.generateReport(startTime, endTime);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    }
  };

  const handleDeleteOldLogs = async () => {
    if (!confirm('Are you sure you want to delete audit logs older than 90 days? This action cannot be undone.')) return;
    try {
      const deleted = await auditService.deleteOldLogs(90);
      alert(`Deleted ${deleted} old audit logs`);
      loadLogs();
    } catch (error) {
      console.error('Failed to delete old logs:', error);
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = {
      'user.created': <User className="w-4 h-4" />,
      'user.deleted': <User className="w-4 h-4" />,
      'user.updated': <User className="w-4 h-4" />,
      'project.created': <File className="w-4 h-4" />,
      'project.deleted': <File className="w-4 h-4" />,
      'project.updated': <File className="w-4 h-4" />,
      'secret.created': <Lock className="w-4 h-4" />,
      'secret.deleted': <Lock className="w-4 h-4" />,
      'secret.updated': <Lock className="w-4 h-4" />,
      'api_key.created': <Lock className="w-4 h-4" />,
      'api_key.deleted': <Lock className="w-4 h-4" />,
      'api_key.updated': <Lock className="w-4 h-4" />,
      'webhook.created': <Globe className="w-4 h-4" />,
      'webhook.deleted': <Globe className="w-4 h-4" />,
      'webhook.updated': <Globe className="w-4 h-4" />,
      'workspace.created': <Users className="w-4 h-4" />,
      'workspace.deleted': <Users className="w-4 h-4" />,
      'workspace.updated': <Users className="w-4 h-4" />,
      'settings.updated': <Settings className="w-4 h-4" />,
      'permission.updated': <Shield className="w-4 h-4" />
    };
    return icons[action] || <AlertTriangle className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
    if (action.includes('deleted')) return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300';
    if (action.includes('updated')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  };

  const availableActions = auditService.getAvailableActions();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Audit Logs
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleDeleteOldLogs}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Old
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input
                type="text"
                value={filter.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                placeholder="Filter by user ID"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Action</label>
              <select
                value={filter.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              >
                <option value="">All actions</option>
                {availableActions.map((action: any) => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Type</label>
              <input
                type="text"
                value={filter.targetType}
                onChange={(e) => handleFilterChange('targetType', e.target.value)}
                placeholder="e.g., project, user"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Target</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm">
                      {new Date(log.timestamp.seconds * 1000).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{log.userId}</td>
                    <td className="px-4 py-3 text-sm">
                      {log.targetType && (
                        <span className="text-gray-500">{log.targetType}: </span>
                      )}
                      {log.targetId || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.ipAddress || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Audit Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">ID:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="font-semibold">Timestamp:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(selectedLog.timestamp.seconds * 1000).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Action:</span>
                  <span className="ml-2">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="font-semibold">User ID:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedLog.userId}</span>
                </div>
                {selectedLog.userEmail && (
                  <div>
                    <span className="font-semibold">User Email:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedLog.userEmail}</span>
                  </div>
                )}
                {selectedLog.targetId && (
                  <div>
                    <span className="font-semibold">Target ID:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedLog.targetId}</span>
                  </div>
                )}
                {selectedLog.targetType && (
                  <div>
                    <span className="font-semibold">Target Type:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedLog.targetType}</span>
                  </div>
                )}
                {selectedLog.ipAddress && (
                  <div>
                    <span className="font-semibold">IP Address:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedLog.ipAddress}</span>
                  </div>
                )}
                {selectedLog.userAgent && (
                  <div>
                    <span className="font-semibold">User Agent:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 break-all">{selectedLog.userAgent}</span>
                  </div>
                )}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <span className="font-semibold">Metadata:</span>
                    <pre className="ml-2 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
