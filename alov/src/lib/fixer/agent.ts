/**
 * Fixer Agent with Real-Time Error Detection
 * Automatically detects, analyzes, and fixes errors using DUB5 AI
 */

import { DUB5AIService } from '@/lib/dub5ai';
import { webContainerManager } from '@/lib/webcontainer/manager';
import { EventEmitter } from 'events';

export interface ApplicationError {
  type: 'build' | 'runtime' | 'type' | 'lint';
  message: string;
  file: string;
  line: number;
  column: number;
  stack: string;
  code?: string;
}

export interface CodeContext {
  file: string;
  content: string;
  surroundingLines: string[];
  imports: string[];
  exports: string[];
}

export interface Fix {
  description: string;
  changes: FileChange[];
  confidence: number;
}

export interface FileChange {
  file: string;
  oldContent: string;
  newContent: string;
  diff: string;
}

export interface FixResult {
  success: boolean;
  fix?: Fix;
  attempts: number;
  error?: string;
}

export interface FixStatistics {
  totalErrors: number;
  fixedErrors: number;
  failedFixes: number;
  averageFixTime: number;
  successRate: number;
}

export class FixerAgent extends EventEmitter {
  private static instance: FixerAgent | null = null;
  private isMonitoring = false;
  private statistics: FixStatistics = {
    totalErrors: 0,
    fixedErrors: 0,
    failedFixes: 0,
    averageFixTime: 0,
    successRate: 0
  };
  private fixTimes: number[] = [];

  private constructor() {
    super();
  }

  static getInstance(): FixerAgent {
    if (!FixerAgent.instance) {
      FixerAgent.instance = new FixerAgent();
    }
    return FixerAgent.instance;
  }

  /**
   * Start monitoring for errors
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.emit('monitoring-started');
  }

  /**
   * Stop monitoring for errors
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.emit('monitoring-stopped');
  }

  /**
   * Handle an error and attempt to fix it
   */
  async handleError(error: ApplicationError): Promise<FixResult> {
    if (!this.isMonitoring) {
      return {
        success: false,
        attempts: 0,
        error: 'Monitoring is not active'
      };
    }

    this.statistics.totalErrors++;
    const startTime = Date.now();

    try {
      // Get code context
      const context = await this.getCodeContext(error);

      // Generate fix using DUB5 AI
      const fix = await this.generateFix(error, context);

      if (!fix) {
        this.statistics.failedFixes++;
        return {
          success: false,
          attempts: 1,
          error: 'Failed to generate fix'
        };
      }

      // Apply the fix
      await this.applyFix(fix);

      // Validate the fix
      const isValid = await this.validateFix(fix);

      const fixTime = Date.now() - startTime;
      this.fixTimes.push(fixTime);
      this.updateStatistics();

      if (isValid) {
        this.statistics.fixedErrors++;
        this.emit('fix-applied', { error, fix });
        return {
          success: true,
          fix,
          attempts: 1
        };
      } else {
        this.statistics.failedFixes++;
        return {
          success: false,
          fix,
          attempts: 1,
          error: 'Fix validation failed'
        };
      }
    } catch (err) {
      this.statistics.failedFixes++;
      return {
        success: false,
        attempts: 1,
        error: String(err)
      };
    }
  }

  /**
   * Generate a fix using DUB5 AI
   */
  async generateFix(error: ApplicationError, context: CodeContext): Promise<Fix | null> {
    const timeout = 10000; // 10 seconds as per requirements
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const prompt = this.buildFixPrompt(error, context);
      const systemPrompt = `You are an expert code fixer. Analyze errors and provide precise fixes.
IMPORTANT: Return your response in this exact format:
DESCRIPTION: [Brief description of the fix]
CONFIDENCE: [0-100]
FILE: ${context.file}
OLD_CONTENT:
\`\`\`
[original code]
\`\`\`
NEW_CONTENT:
\`\`\`
[fixed code]
\`\`\``;
      
      const response = await DUB5AIService.streamRequest({
        messages: [{ role: 'user', content: `${systemPrompt}\n\n${prompt}` }],
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Parse the AI response
      return this.parseFixResponse(response, context);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Fix generation failed:', err);
      return null;
    }
  }

  /**
   * Build a prompt for fix generation
   */
  private buildFixPrompt(error: ApplicationError, context: CodeContext): string {
    return `Fix this ${error.type} error:

ERROR: ${error.message}
FILE: ${error.file}
LINE: ${error.line}
COLUMN: ${error.column}

CODE CONTEXT:
\`\`\`typescript
${context.content}
\`\`\`

SURROUNDING LINES:
${context.surroundingLines.join('\n')}

IMPORTS:
${context.imports.join('\n')}

EXPORTS:
${context.exports.join('\n')}

Please provide a fix that:
1. Resolves the error completely
2. Maintains code functionality
3. Follows best practices
4. Preserves existing imports and exports`;
  }

  /**
   * Parse AI response into Fix object
   */
  private parseFixResponse(response: string, context: CodeContext): Fix | null {
    try {
      // Extract description
      const descMatch = response.match(/DESCRIPTION:\s*(.+)/);
      const description = descMatch ? descMatch[1].trim() : 'Auto-generated fix';

      // Extract confidence
      const confMatch = response.match(/CONFIDENCE:\s*(\d+)/);
      const confidence = confMatch ? parseInt(confMatch[1]) : 70;

      // Extract old content
      const oldMatch = response.match(/OLD_CONTENT:\s*```[\w]*\n([\s\S]*?)```/);
      const oldContent = oldMatch ? oldMatch[1].trim() : context.content;

      // Extract new content
      const newMatch = response.match(/NEW_CONTENT:\s*```[\w]*\n([\s\S]*?)```/);
      const newContent = newMatch ? newMatch[1].trim() : '';

      if (!newContent) {
        return null;
      }

      // Generate diff
      const diff = this.generateDiff(oldContent, newContent);

      return {
        description,
        confidence,
        changes: [{
          file: context.file,
          oldContent,
          newContent,
          diff
        }]
      };
    } catch (err) {
      console.error('Failed to parse fix response:', err);
      return null;
    }
  }

  /**
   * Generate a simple diff between old and new content
   */
  private generateDiff(oldContent: string, newContent: string): string {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const diff: string[] = [];

    const maxLines = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';

      if (oldLine !== newLine) {
        if (oldLine) diff.push(`- ${oldLine}`);
        if (newLine) diff.push(`+ ${newLine}`);
      }
    }

    return diff.join('\n');
  }

  /**
   * Apply a fix to the codebase
   */
  async applyFix(fix: Fix): Promise<void> {
    for (const change of fix.changes) {
      await webContainerManager.writeFile(change.file, change.newContent);
    }
    this.emit('fix-written', fix);
  }

  /**
   * Validate that a fix resolves the error
   */
  async validateFix(fix: Fix): Promise<boolean> {
    try {
      // Try to build the project
      const result = await webContainerManager.exec('npm', ['run', 'build']);
      return result.exitCode === 0;
    } catch (err) {
      return false;
    }
  }

  /**
   * Get code context for an error
   */
  private async getCodeContext(error: ApplicationError): Promise<CodeContext> {
    try {
      const content = await webContainerManager.readFile(error.file);
      const lines = content.split('\n');

      // Get surrounding lines (5 before and after)
      const startLine = Math.max(0, error.line - 6);
      const endLine = Math.min(lines.length, error.line + 5);
      const surroundingLines = lines.slice(startLine, endLine);

      // Extract imports
      const imports = lines
        .filter(line => line.trim().startsWith('import '))
        .map(line => line.trim());

      // Extract exports
      const exports = lines
        .filter(line => line.trim().startsWith('export '))
        .map(line => line.trim());

      return {
        file: error.file,
        content,
        surroundingLines,
        imports,
        exports
      };
    } catch (err) {
      return {
        file: error.file,
        content: '',
        surroundingLines: [],
        imports: [],
        exports: []
      };
    }
  }

  /**
   * Update statistics
   */
  private updateStatistics(): void {
    if (this.fixTimes.length > 0) {
      const sum = this.fixTimes.reduce((a, b) => a + b, 0);
      this.statistics.averageFixTime = sum / this.fixTimes.length;
    }

    if (this.statistics.totalErrors > 0) {
      this.statistics.successRate = 
        (this.statistics.fixedErrors / this.statistics.totalErrors) * 100;
    }
  }

  /**
   * Get fix statistics
   */
  getFixStats(): FixStatistics {
    return { ...this.statistics };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.statistics = {
      totalErrors: 0,
      fixedErrors: 0,
      failedFixes: 0,
      averageFixTime: 0,
      successRate: 0
    };
    this.fixTimes = [];
  }
}

export const fixerAgent = FixerAgent.getInstance();
