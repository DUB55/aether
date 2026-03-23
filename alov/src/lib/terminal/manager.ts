/**
 * Terminal Manager
 * 
 * Manages terminal instances with xterm.js integration for WebContainer shell access
 */

import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebContainerManager, WebContainerProcessWrapper } from '../webcontainer/manager';

export interface TerminalConfig {
  theme?: {
    background?: string;
    foreground?: string;
    cursor?: string;
    selection?: string;
  };
  fontSize?: number;
  fontFamily?: string;
  cursorBlink?: boolean;
}

export interface BackgroundProcess {
  id: string;
  command: string;
  process: WebContainerProcessWrapper;
  startTime: number;
}

/**
 * TerminalManager handles terminal instances and shell integration
 */
export class TerminalManager {
  private static instance: TerminalManager;
  private webContainer: WebContainerManager;
  private terminals: Map<string, Terminal> = new Map();
  private fitAddons: Map<string, FitAddon> = new Map();
  private shellProcesses: Map<string, WebContainerProcessWrapper> = new Map();
  private backgroundProcesses: Map<string, BackgroundProcess> = new Map();
  private commandHistory: string[] = [];
  private historyIndex: number = -1;

  private constructor() {
    this.webContainer = WebContainerManager.getInstance();
  }

  static getInstance(): TerminalManager {
    if (!TerminalManager.instance) {
      TerminalManager.instance = new TerminalManager();
    }
    return TerminalManager.instance;
  }

  /**
   * Create a new terminal instance
   */
  createTerminal(id: string, element: HTMLElement, config?: TerminalConfig): Terminal {
    // Create terminal with configuration
    const terminal = new Terminal({
      cursorBlink: config?.cursorBlink ?? true,
      fontSize: config?.fontSize ?? 14,
      fontFamily: config?.fontFamily ?? 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: config?.theme?.background ?? '#1e1e1e',
        foreground: config?.theme?.foreground ?? '#d4d4d4',
        cursor: config?.theme?.cursor ?? '#ffffff'
      },
      allowProposedApi: true
    });

    // Add fit addon for responsive sizing
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Add web links addon for clickable URLs
    const webLinksAddon = new WebLinksAddon();
    terminal.loadAddon(webLinksAddon);

    // Open terminal in element
    terminal.open(element);
    fitAddon.fit();

    // Store terminal and addon
    this.terminals.set(id, terminal);
    this.fitAddons.set(id, fitAddon);

    // Start shell process
    this.startShell(id, terminal);

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(element);

    return terminal;
  }

  /**
   * Start shell process and connect to terminal
   */
  private async startShell(id: string, terminal: Terminal): Promise<void> {
    try {
      // Check if WebContainer is ready
      if (!this.webContainer.isContainerReady()) {
        terminal.writeln('Error: WebContainer not ready');
        return;
      }

      // Spawn shell process using WebContainerManager
      const shellProcess = await this.webContainer.spawn('jsh', []);

      this.shellProcesses.set(id, shellProcess);

      // Pipe shell output to terminal
      shellProcess.output.pipeTo(
        new WritableStream({
          write: (data) => {
            terminal.write(data);
          }
        })
      );

      // Create input stream for shell
      const input = shellProcess.input.getWriter();
      let currentLine = '';

      // Handle terminal input
      terminal.onData(async (data) => {
        // Handle special keys
        if (data === '\r') {
          // Enter key
          terminal.write('\r\n');
          
          if (currentLine.trim()) {
            this.commandHistory.push(currentLine);
            this.historyIndex = this.commandHistory.length;
          }
          
          await input.write(currentLine + '\n');
          currentLine = '';
        } else if (data === '\u007F') {
          // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            terminal.write('\b \b');
          }
        } else if (data === '\u001b[A') {
          // Up arrow - previous command
          if (this.historyIndex > 0) {
            this.historyIndex--;
            this.replaceCurrentLine(terminal, currentLine, this.commandHistory[this.historyIndex]);
            currentLine = this.commandHistory[this.historyIndex];
          }
        } else if (data === '\u001b[B') {
          // Down arrow - next command
          if (this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            this.replaceCurrentLine(terminal, currentLine, this.commandHistory[this.historyIndex]);
            currentLine = this.commandHistory[this.historyIndex];
          } else if (this.historyIndex === this.commandHistory.length - 1) {
            this.historyIndex = this.commandHistory.length;
            this.replaceCurrentLine(terminal, currentLine, '');
            currentLine = '';
          }
        } else if (data === '\u0003') {
          // Ctrl+C
          terminal.write('^C\r\n');
          await input.write('\u0003');
          currentLine = '';
        } else {
          // Regular character
          currentLine += data;
          terminal.write(data);
        }
      });

      // Write welcome message
      terminal.writeln('Welcome to Aether Terminal');
      terminal.writeln('Type "help" for available commands\r\n');

    } catch (error) {
      terminal.writeln(`Error starting shell: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Replace current line in terminal
   */
  private replaceCurrentLine(terminal: Terminal, oldLine: string, newLine: string): void {
    // Clear current line
    for (let i = 0; i < oldLine.length; i++) {
      terminal.write('\b \b');
    }
    // Write new line
    terminal.write(newLine);
  }

  /**
   * Execute command in terminal
   */
  async executeCommand(id: string, command: string): Promise<void> {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      throw new Error(`Terminal ${id} not found`);
    }

    terminal.writeln(command);
    
    const shellProcess = this.shellProcesses.get(id);
    if (shellProcess) {
      const input = shellProcess.input.getWriter();
      await input.write(command + '\n');
      input.releaseLock();
    }
  }

  /**
   * Execute npm script from package.json
   */
  async executeNpmScript(id: string, scriptName: string): Promise<void> {
    await this.executeCommand(id, `npm run ${scriptName}`);
  }

  /**
   * Start background process
   */
  async startBackgroundProcess(command: string): Promise<string> {
    const processId = `bg-${Date.now()}`;
    
    try {
      // Parse command into command and args
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      const process = await this.webContainer.spawn(cmd, args);
      
      this.backgroundProcesses.set(processId, {
        id: processId,
        command,
        process,
        startTime: Date.now()
      });

      return processId;
    } catch (error) {
      throw new Error(`Failed to start background process: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List background processes
   */
  listBackgroundProcesses(): BackgroundProcess[] {
    return Array.from(this.backgroundProcesses.values());
  }

  /**
   * Kill background process
   */
  async killBackgroundProcess(processId: string): Promise<void> {
    const bgProcess = this.backgroundProcesses.get(processId);
    if (!bgProcess) {
      throw new Error(`Background process ${processId} not found`);
    }

    bgProcess.process.kill();
    this.backgroundProcesses.delete(processId);
  }

  /**
   * Kill all background processes
   */
  async killAllBackgroundProcesses(): Promise<void> {
    for (const bgProcess of this.backgroundProcesses.values()) {
      bgProcess.process.kill();
    }
    this.backgroundProcesses.clear();
  }

  /**
   * Get terminal instance
   */
  getTerminal(id: string): Terminal | undefined {
    return this.terminals.get(id);
  }

  /**
   * Resize terminal
   */
  resizeTerminal(id: string): void {
    const fitAddon = this.fitAddons.get(id);
    if (fitAddon) {
      fitAddon.fit();
    }
  }

  /**
   * Clear terminal
   */
  clearTerminal(id: string): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.clear();
    }
  }

  /**
   * Write to terminal
   */
  writeToTerminal(id: string, text: string): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.writeln(text);
    }
  }

  /**
   * Dispose terminal
   */
  disposeTerminal(id: string): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.dispose();
      this.terminals.delete(id);
    }

    const shellProcess = this.shellProcesses.get(id);
    if (shellProcess) {
      shellProcess.kill();
      this.shellProcesses.delete(id);
    }

    this.fitAddons.delete(id);
  }

  /**
   * Dispose all terminals
   */
  disposeAll(): void {
    for (const id of this.terminals.keys()) {
      this.disposeTerminal(id);
    }
    this.killAllBackgroundProcesses();
  }

  /**
   * Get command history
   */
  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  /**
   * Clear command history
   */
  clearCommandHistory(): void {
    this.commandHistory = [];
    this.historyIndex = -1;
  }
}
