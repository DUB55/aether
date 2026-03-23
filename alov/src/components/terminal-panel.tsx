/**
 * Terminal Panel Component
 * 
 * Premium terminal interface with xterm.js
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useTerminalManager } from '@/hooks/use-terminal-manager';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Terminal as TerminalIcon, X, Trash2, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'xterm/css/xterm.css';

interface TerminalPanelProps {
  terminalId?: string;
  className?: string;
}

export function TerminalPanel({ terminalId = 'main', className = '' }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { 
    initTerminal, 
    clear, 
    backgroundProcesses, 
    killBackgroundProcess,
    executeNpmScript 
  } = useTerminalManager(terminalId);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showProcesses, setShowProcesses] = useState(false);

  useEffect(() => {
    if (terminalRef.current && !isInitialized) {
      initTerminal(terminalRef.current, {
        theme: {
          background: '#00000000', // Transparent
          foreground: '#f8fafc',
          cursor: '#ffffff',
          selection: 'rgba(255, 255, 255, 0.2)',
        },
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Monaco, "Courier New", monospace',
        cursorBlink: true
      });
      setIsInitialized(true);
    }
  }, [initTerminal, isInitialized]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex flex-col h-full glass rounded-xl overflow-hidden shadow-2xl shadow-black/40', className)}>
        {/* Premium Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground/80">Terminal</span>
            </div>
            {backgroundProcesses.length > 0 && (
              <div className="flex items-center gap-2 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-medium text-green-400">
                  {backgroundProcesses.length} active
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {backgroundProcesses.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProcesses(!showProcesses)}
                    className={cn(
                      "h-7 px-2 text-xs font-medium transition-colors rounded-lg",
                      showProcesses 
                        ? "bg-white/10 text-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    Processes
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="glass border-white/10">
                  <p>View background processes</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="glass border-white/10">
                <p>Clear terminal</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Background Processes Panel */}
        {showProcesses && backgroundProcesses.length > 0 && (
          <div className="px-4 py-3 bg-black/20 border-b border-white/5 backdrop-blur-md">
            <div className="space-y-2">
              {backgroundProcesses.map((process) => (
                <div
                  key={process.id}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-mono text-foreground/90 truncate">{process.command}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Started {new Date(process.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => killBackgroundProcess(process.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Square className="w-3 h-3 fill-current" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="glass border-white/10 text-red-200">
                      <p>Stop process</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terminal Container */}
        <div 
          ref={terminalRef} 
          className="flex-1 overflow-hidden p-3 bg-black/40 backdrop-blur-sm"
          style={{ minHeight: '200px' }}
        />

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-t border-white/5 backdrop-blur-sm">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 mr-2">Quick Actions</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => executeNpmScript('dev')}
                className="h-6 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent hover:border-white/5 rounded"
              >
                <Play className="w-2.5 h-2.5 mr-1.5" />
                npm run dev
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="glass border-white/10">
              <p>Start development server</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => executeNpmScript('build')}
                className="h-6 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent hover:border-white/5 rounded"
              >
                <span className="mr-1.5">📦</span>
                npm run build
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="glass border-white/10">
              <p>Build for production</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => executeNpmScript('test')}
                className="h-6 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent hover:border-white/5 rounded"
              >
                <span className="mr-1.5">🧪</span>
                npm test
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="glass border-white/10">
              <p>Run tests</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
