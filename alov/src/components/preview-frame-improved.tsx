/**
 * Improved Preview Frame Component
 * Premium UI with proper tooltips and better UX
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { previewSystem, DevicePreset, ViewportDimensions } from '@/lib/preview/system';
import { Monitor, Smartphone, Tablet, RotateCcw, Maximize2, Minimize2, RefreshCw, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface PreviewFrameProps {
  className?: string;
  projectId?: string;
  defaultViewport?: DevicePreset;
}

export function PreviewFrame({ className, projectId, defaultViewport = 'desktop' }: PreviewFrameProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewport, setViewport] = useState<ViewportDimensions>(previewSystem.getViewport());
  const [currentPreset, setCurrentPreset] = useState<DevicePreset>(defaultViewport);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Set initial preset
    previewSystem.setDevicePreset(defaultViewport);

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
  }, [defaultViewport]);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex flex-col h-full bg-slate-50 dark:bg-slate-950', className)}>
        {/* Premium Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-1">
            {/* Device Presets */}
            <div className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handlePresetChange('mobile')}
                    className={cn(
                      'p-2.5 rounded-md transition-all duration-200',
                      currentPreset === 'mobile' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Mobile (375×667)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handlePresetChange('tablet')}
                    className={cn(
                      'p-2.5 rounded-md transition-all duration-200',
                      currentPreset === 'tablet' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Tablet (768×1024)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handlePresetChange('desktop')}
                    className={cn(
                      'p-2.5 rounded-md transition-all duration-200',
                      currentPreset === 'desktop' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Desktop (1920×1080)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

            {/* Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleRotate}
                  className="p-2.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Rotate viewport</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleRefresh}
                  className="p-2.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Refresh preview</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleFullscreen}
                  className="p-2.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Viewport Dimensions */}
          <div className="flex items-center gap-2">
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md">
              {viewport.width} × {viewport.height}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 relative overflow-auto bg-slate-100 dark:bg-slate-900 p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading preview...</p>
              </div>
            </div>
          )}

          {/* Error Overlays */}
          {(buildError || runtimeError) && (
            <div className="absolute top-6 left-6 right-6 z-20">
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                      {buildError ? 'Build Error' : 'Runtime Error'}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 font-mono break-all">
                      {buildError || runtimeError}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setBuildError(null);
                      setRuntimeError(null);
                    }}
                    className="p-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Frame */}
          <div 
            className="mx-auto bg-white dark:bg-slate-950 rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: viewport.width,
              height: viewport.height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
