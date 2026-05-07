import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateInfo {
  version: string;
  body: string;
  date: string;
  signature: string;
  url: string;
}

export function AppUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for updates on component mount
  useEffect(() => {
    checkForUpdates();
    
    // Set up periodic update checks (every 30 minutes)
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    // Only run in Tauri environment
    if (typeof window === 'undefined' || !('__TAURI__' in window)) {
      return;
    }

    try {
      setIsChecking(true);
      setError(null);

      // Import Tauri API dynamically
      const { check } = await import('@tauri-apps/plugin-updater');
      const { invoke } = await import('@tauri-apps/api/core');

      const update = await check();
      
      if (update) {
        setUpdateAvailable(true);
        setUpdateInfo({
          version: update.version || 'Unknown',
          body: update.body || 'New update available',
          date: update.date || new Date().toISOString(),
          signature: update.signature || '',
          url: update.downloadUrl || '',
        });
        toast.success(`Update available: v${update.version}`);
      } else {
        setUpdateAvailable(false);
        setUpdateInfo(null);
      }
    } catch (err) {
      console.error('Update check failed:', err);
      setError('Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  const installUpdate = async () => {
    if (!updateInfo) return;

    try {
      setIsInstalling(true);
      setError(null);

      // Import Tauri API dynamically
      const { install } = await import('@tauri-apps/plugin-updater');

      await install();
      toast.success('Update installed! Restarting application...');
      
      // The app will restart automatically after installation
    } catch (err) {
      console.error('Update installation failed:', err);
      setError('Failed to install update');
      setIsInstalling(false);
      toast.error('Failed to install update');
    }
  };

  // Don't render in non-Tauri environment
  if (typeof window === 'undefined' || !('__TAURI__' in window)) {
    return null;
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 text-sm font-medium">Update Error</p>
            <p className="text-red-300 text-xs mt-1">{error}</p>
            <button
              onClick={checkForUpdates}
              disabled={isChecking}
              className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              {isChecking ? 'Checking...' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3 max-w-xs">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">Up to date</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-sm">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-blue-400 text-sm font-medium">
              Update Available
            </p>
            <p className="text-blue-300 text-xs mt-1">
              Version {updateInfo?.version}
            </p>
            <p className="text-slate-400 text-xs mt-2 line-clamp-2">
              {updateInfo?.body}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={installUpdate}
            disabled={isInstalling}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            {isInstalling ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                Install Update
              </>
            )}
          </button>
          
          <button
            onClick={checkForUpdates}
            disabled={isChecking}
            className="text-blue-400 hover:text-blue-300 text-xs font-medium py-2 px-3 transition-colors disabled:opacity-50"
          >
            {isChecking ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
