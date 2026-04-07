import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  onTerminalReady?: (terminal: XTerm) => void;
  className?: string;
}

export function Terminal({ onTerminalReady, className = "" }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#00000000', // Transparent
        foreground: '#ffffff',
        cursor: '#ffffff',
        selectionBackground: '#ffffff33',
      },
      fontSize: 13,
      fontFamily: 'JetBrains Mono, monospace',
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    
    let resizeTimer: number;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      
      cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        if (terminalRef.current && terminalRef.current.offsetWidth > 0 && term && term.element) {
          try {
            const dims = fitAddon.proposeDimensions();
            if (dims) {
              term.resize(dims.cols, dims.rows);
            }
          } catch (e) {
            // Ignore fit errors during rapid resizing
          }
        }
      });
    });
    resizeObserver.observe(terminalRef.current);

    xtermRef.current = term;

    if (onTerminalReady) {
      onTerminalReady(term);
    }

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  return (
    <div 
      ref={terminalRef} 
      className={`w-full h-full min-h-[150px] bg-black/40 backdrop-blur-md border-t border-white/10 p-2 ${className}`}
    />
  );
}
