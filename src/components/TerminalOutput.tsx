import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Terminal, 
  Send, 
  Copy, 
  Trash2, 
  Download,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { TauriCommands, isTauriApp } from '@/lib/tauri-commands';
import { AITools } from '@/lib/ai-tools';
import { cn } from '@/lib/utils';

interface TerminalEntry {
  id: string;
  timestamp: Date;
  type: 'command' | 'output' | 'error' | 'success' | 'info';
  content: string;
  command?: string;
  exitCode?: number;
}

interface TerminalOutputProps {
  className?: string;
  maxEntries?: number;
}

export function TerminalOutput({ className, maxEntries = 100 }: TerminalOutputProps) {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addEntry = (type: TerminalEntry['type'], content: string, command?: string, exitCode?: number) => {
    const newEntry: TerminalEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      type,
      content,
      command,
      exitCode
    };

    setEntries(prev => {
      const updated = [...prev, newEntry];
      // Keep only the last maxEntries
      if (updated.length > maxEntries) {
        return updated.slice(-maxEntries);
      }
      return updated;
    });
  };

  const executeCommand = async () => {
    if (!command.trim() || isExecuting) return;

    const commandToExecute = command.trim();
    setCommand('');
    setIsExecuting(true);

    // Add command entry
    addEntry('command', `$ ${commandToExecute}`, commandToExecute);

    try {
      if (isTauriApp()) {
        const result = await TauriCommands.executeCommand(commandToExecute);
        
        if (result.stdout) {
          addEntry('output', result.stdout, commandToExecute, result.exit_code);
        }
        
        if (result.stderr) {
          addEntry('error', result.stderr, commandToExecute, result.exit_code);
        }

        if (result.success) {
          addEntry('success', `Command completed successfully (exit code: ${result.exit_code})`, commandToExecute, result.exit_code);
        } else {
          addEntry('error', `Command failed (exit code: ${result.exit_code})`, commandToExecute, result.exit_code);
        }
      } else {
        addEntry('info', 'Command execution is only available in the desktop app', commandToExecute);
      }
    } catch (error) {
      addEntry('error', `Failed to execute command: ${error}`, commandToExecute);
    } finally {
      setIsExecuting(false);
      inputRef.current?.focus();
    }
  };

  const executeAIToolCall = async (toolCall: any) => {
    addEntry('info', `🤖 AI Tool Call: ${toolCall.type}`, JSON.stringify(toolCall.params, null, 2));

    try {
      const result = await AITools.executeToolCall(toolCall);
      
      if (result.success) {
        addEntry('success', AITools.formatToolResult(result));
      } else {
        addEntry('error', result.error || 'Tool execution failed');
      }
    } catch (error) {
      addEntry('error', `AI tool execution failed: ${error}`);
    }
  };

  const clearTerminal = () => {
    setEntries([]);
  };

  const copyToClipboard = () => {
    const content = entries.map(entry => {
      const timestamp = entry.timestamp.toLocaleTimeString();
      const prefix = entry.type === 'command' ? '$ ' : '';
      return `[${timestamp}] ${prefix}${entry.content}`;
    }).join('\n');
    
    navigator.clipboard.writeText(content);
  };

  const downloadLog = () => {
    const content = entries.map(entry => {
      const timestamp = entry.timestamp.toISOString();
      const prefix = entry.type === 'command' ? '$ ' : '';
      return `[${timestamp}] ${prefix}${entry.content}`;
    }).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-log-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEntryIcon = (type: TerminalEntry['type']) => {
    switch (type) {
      case 'command':
        return <ChevronRight className="w-4 h-4 text-blue-500" />;
      case 'output':
        return <Info className="w-4 h-4 text-muted-foreground" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'info':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Terminal className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEntryClassName = (type: TerminalEntry['type']) => {
    switch (type) {
      case 'command':
        return 'text-blue-500 font-mono';
      case 'error':
        return 'text-red-500';
      case 'success':
        return 'text-green-500';
      case 'info':
        return 'text-yellow-500';
      default:
        return 'text-foreground';
    }
  };

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [entries]);

  // Expose method to execute AI tool calls
  useEffect(() => {
    (window as any).executeAIToolCall = executeAIToolCall;
    return () => {
      delete (window as any).executeAIToolCall;
    };
  }, []);

  return (
    <div className={cn("flex flex-col h-full bg-black text-green-400 font-mono text-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-green-400"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadLog}
            className="text-gray-400 hover:text-green-400"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTerminal}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Output */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        <div className="space-y-1">
          {entries.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {isTauriApp() 
                ? "Ready to execute commands. Type a command below and press Enter."
                : "Terminal is only available in the desktop app."
              }
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="flex gap-2 items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {getEntryIcon(entry.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("break-words", getEntryClassName(entry.type))}>
                    {entry.content}
                  </div>
                  {entry.exitCode !== undefined && (
                    <div className="text-xs text-gray-500 mt-1">
                      Exit code: {entry.exitCode}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {entry.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      {isTauriApp() && (
        <div className="p-3 border-t border-gray-700">
          <div className="flex gap-2">
            <span className="text-green-400">$</span>
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executeCommand();
                }
              }}
              placeholder="Enter command..."
              className="flex-1 bg-transparent border-none text-green-400 placeholder-gray-500 focus:outline-none focus:ring-0"
              disabled={isExecuting}
            />
            <Button
              onClick={executeCommand}
              disabled={!command.trim() || isExecuting}
              size="sm"
              className="text-green-400 hover:text-green-300"
            >
              {isExecuting ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Extend Window interface to include executeAIToolCall
declare global {
  interface Window {
    executeAIToolCall?: (toolCall: any) => void;
  }
}
