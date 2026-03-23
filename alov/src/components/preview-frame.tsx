/**
 * Preview Frame Component
 * Displays the live preview of the application with viewport controls
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { previewSystem, DevicePreset, ViewportDimensions } from '@/lib/preview/system';
import { Monitor, Smartphone, Tablet, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PreviewFrameProps {
  className?: string;
}

export function PreviewFrame({ className }: PreviewFrameProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewport, setViewport] = useState<ViewportDimensions>(previewSystem.getViewport());
  const [currentPreset, setCurrentPreset] = useState<DevicePreset>(previewSystem.getCurrentPreset());
  const [buildError, setBuildError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Listen for server ready
    const handleReady = (url: string) => {
      setPreviewUrl(url);
      setIsLoading(false);
      setBuildError(null);
    };

    // Listen for build errors
    const handleBuildError = (error: any) => {
      setBuildError(`${error.file}:${error.line} - ${error.message}`);
    };

    // Listen for viewport changes
    const handleViewportChange = (newViewport: ViewportDimensions) => {
      setViewport(newViewport);
    };

    // Listen for refresh
    const handleRefresh = () => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    };

    previewSystem.on('ready', handleReady);
    previewSystem.on('build-error', handleBuildError);
    previewSystem.on('viewport-change', handleViewportChange);
    previewSystem.on('refresh', handleRefresh);

    // Listen for runtime errors from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'runtime-error') {
        setRuntimeError(event.data.error.message);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      previewSystem.off('ready', handleReady);
      previewSystem.off('build-error', handleBuildError);
      previewSystem.off('viewport-change', handleViewportChange);
      previewSystem.off('refresh', handleRefresh);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handlePresetChange = (preset: DevicePreset) => {
    previewSystem.setDevicePreset(preset);
    setCurrentPreset(preset);
  };

  const handleRotate = () => {
    previewSystem.rotate();
  };

  const handleRefresh = () => {
    previewSystem.refresh();
    setBuildError(null);
    setRuntimeError(null);
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePresetChange('mobile')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              currentPreset === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePresetChange('tablet')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              currentPreset === 'tablet' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePresetChange('desktop')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              currentPreset === 'desktop' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {viewport.width} × {viewport.height}
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/10 overflow-auto">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Starting preview server...</p>
          </div>
        ) : buildError ? (
          <div className="max-w-2xl w-full p-6 bg-destructive/10 border border-destructive rounded-lg">
            <h3 className="text-lg font-semibold text-destructive mb-2">Build Error</h3>
            <pre className="text-sm text-destructive/80 whitespace-pre-wrap">{buildError}</pre>
          </div>
        ) : runtimeError ? (
          <div className="max-w-2xl w-full p-6 bg-destructive/10 border border-destructive rounded-lg">
            <h3 className="text-lg font-semibold text-destructive mb-2">Runtime Error</h3>
            <pre className="text-sm text-destructive/80 whitespace-pre-wrap">{runtimeError}</pre>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="bg-white rounded-lg shadow-xl border border-border"
            style={{
              width: `${viewport.width}px`,
              height: `${viewport.height}px`,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        )}
      </div>
    </div>
  );
}
