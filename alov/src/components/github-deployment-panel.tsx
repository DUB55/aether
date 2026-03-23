/**
 * GitHub Deployment Panel Component
 * 
 * UI component for deploying projects to GitHub with encryption
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGitHubDeployment } from '@/hooks/use-github-deployment';
import { Rocket, Copy, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface GitHubDeploymentPanelProps {
  projectId: string;
  projectName: string;
  files?: Array<{ name: string; content: string }>;
}

export function GitHubDeploymentPanel({ projectId, projectName, files }: GitHubDeploymentPanelProps) {
  const { status, logs, shareUrl, isDeploying, deployToGitHub } = useGitHubDeployment();
  const [copied, setCopied] = useState(false);

  const handleDeploy = async () => {
    try {
      const result = await deployToGitHub({
        projectId,
        projectName,
        files: files || []
      });

      if (result.success) {
        toast.success('Project deployed successfully!');
      } else {
        toast.error(result.error || 'Deployment failed');
      }
    } catch (error) {
      toast.error('Deployment failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCopyUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'idle':
        return 'text-muted-foreground';
      default:
        return 'text-blue-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'idle':
        return <Rocket className="w-4 h-4" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="flex-1 p-8 bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Deployment & Sharing</h2>
          <p className="text-sm text-muted-foreground">
            Deploy your project to GitHub and share it with encrypted URLs.
          </p>
        </div>

        {/* GitHub Deployment Card */}
        <div className="p-8 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">GitHub Deployment</h3>
              <p className="text-xs text-muted-foreground">
                Secure, encrypted project storage and sharing.
              </p>
            </div>
          </div>

          {/* Status Display */}
          <div className="p-4 bg-background/50 border border-border rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-bold flex items-center gap-2 ${getStatusColor()}`}>
                {getStatusIcon()}
                {status === 'idle' && 'Ready'}
                {status === 'collecting' && 'Collecting files...'}
                {status === 'encrypting' && 'Encrypting...'}
                {status === 'uploading' && 'Uploading...'}
                {status === 'complete' && 'Deployed'}
                {status === 'error' && 'Failed'}
              </span>
            </div>
            {shareUrl && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Share URL</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Deploy Button */}
          <Button
            className="w-full rounded-xl font-bold bg-slate-900 text-white hover:opacity-90"
            onClick={handleDeploy}
            disabled={isDeploying}
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Deploy to GitHub
              </>
            )}
          </Button>

          {/* Share URL Display */}
          {shareUrl && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Deployment Successful!</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Your project is now deployed. Share this URL:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUrl}
                    className="shrink-0"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(shareUrl, '_blank')}
                    className="shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deployment Logs */}
        {logs.length > 0 && (
          <div className="p-8 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass space-y-4">
            <h3 className="font-bold">Deployment Logs</h3>
            <div className="p-4 bg-background/50 border border-border rounded-xl max-h-64 overflow-y-auto">
              <div className="space-y-1 font-mono text-xs">
                {logs.map((log, index) => (
                  <div key={index} className="text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-bold text-blue-600 dark:text-blue-400">
                How GitHub Deployment Works
              </p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Your project files are encrypted with AES-256-GCM encryption</li>
                <li>• The encrypted payload is stored as a JSON file in GitHub</li>
                <li>• The encryption key is included only in the URL hash (never sent to server)</li>
                <li>• Anyone with the share URL can view and edit the project</li>
                <li>• No OAuth setup required - just configure GitHub credentials in .env</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
