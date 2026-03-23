/**
 * React hook for TerminalManager
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { TerminalManager, TerminalConfig, BackgroundProcess } from '../lib/terminal/manager';
import type { Terminal } from 'xterm';

export function useTerminalManager(terminalId: string = 'main') {
  const [manager] = useState(() => TerminalManager.getInstance());
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [backgroundProcesses, setBackgroundProcesses] = useState<BackgroundProcess[]>([]);
  const elementRef = useRef<HTMLElement | null>(null);

  /**
   * Initialize terminal
   */
  const initTerminal = useCallback((element: HTMLElement, config?: TerminalConfig) => {
    elementRef.current = element;
    const term = manager.createTerminal(terminalId, element, config);
    setTerminal(term);
    return term;
  }, [manager, terminalId]);

  /**
   * Execute command
   */
  const executeCommand = useCallback(async (command: string) => {
    await manager.executeCommand(terminalId, command);
  }, [manager, terminalId]);

  /**
   * Execute npm script
   */
  const executeNpmScript = useCallback(async (scriptName: string) => {
    await manager.executeNpmScript(terminalId, scriptName);
  }, [manager, terminalId]);

  /**
   * Start background process
   */
  const startBackgroundProcess = useCallback(async (command: string) => {
    const processId = await manager.startBackgroundProcess(command);
    setBackgroundProcesses(manager.listBackgroundProcesses());
    return processId;
  }, [manager]);

  /**
   * Kill background process
   */
  const killBackgroundProcess = useCallback(async (processId: string) => {
    await manager.killBackgroundProcess(processId);
    setBackgroundProcesses(manager.listBackgroundProcesses());
  }, [manager]);

  /**
   * Clear terminal
   */
  const clear = useCallback(() => {
    manager.clearTerminal(terminalId);
  }, [manager, terminalId]);

  /**
   * Write to terminal
   */
  const write = useCallback((text: string) => {
    manager.writeToTerminal(terminalId, text);
  }, [manager, terminalId]);

  /**
   * Resize terminal
   */
  const resize = useCallback(() => {
    manager.resizeTerminal(terminalId);
  }, [manager, terminalId]);

  /**
   * Get command history
   */
  const getHistory = useCallback(() => {
    return manager.getCommandHistory();
  }, [manager]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      manager.disposeTerminal(terminalId);
    };
  }, [manager, terminalId]);

  return {
    terminal,
    initTerminal,
    executeCommand,
    executeNpmScript,
    startBackgroundProcess,
    killBackgroundProcess,
    backgroundProcesses,
    clear,
    write,
    resize,
    getHistory
  };
}
