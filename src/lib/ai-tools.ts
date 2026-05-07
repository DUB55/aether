import { TauriCommands, isTauriApp } from './tauri-commands';

export interface AIToolCall {
  type: 'write_file' | 'read_file' | 'manage_dir' | 'execute_command' | 'get_current_dir' | 'set_current_dir';
  params: Record<string, any>;
}

export interface AIToolResult {
  success: boolean;
  tool_call: AIToolCall;
  result: any;
  error?: string;
}

export class AITools {
  static async executeToolCall(toolCall: AIToolCall): Promise<AIToolResult> {
    if (!isTauriApp()) {
      return {
        success: false,
        tool_call: toolCall,
        result: null,
        error: 'Tool execution is only available in the desktop app'
      };
    }

    try {
      let result: any;

      switch (toolCall.type) {
        case 'write_file':
          result = await TauriCommands.writeFile(
            toolCall.params.path,
            toolCall.params.content
          );
          break;

        case 'read_file':
          result = await TauriCommands.readFile(toolCall.params.path);
          break;

        case 'manage_dir':
          result = await TauriCommands.manageDirectory(
            toolCall.params.action,
            toolCall.params.path
          );
          break;

        case 'execute_command':
          result = await TauriCommands.executeCommand(
            toolCall.params.command,
            toolCall.params.args
          );
          break;

        case 'get_current_dir':
          result = await TauriCommands.getCurrentDirectory();
          break;

        case 'set_current_dir':
          result = await TauriCommands.setCurrentDirectory(toolCall.params.path);
          break;

        default:
          return {
            success: false,
            tool_call: toolCall,
            result: null,
            error: `Unknown tool type: ${(toolCall as any).type}`
          };
      }

      return {
        success: true,
        tool_call: toolCall,
        result
      };
    } catch (error) {
      return {
        success: false,
        tool_call: toolCall,
        result: null,
        error: `Tool execution failed: ${error}`
      };
    }
  }

  static parseToolCallsFromText(text: string): AIToolCall[] {
    const toolCalls: AIToolCall[] = [];
    
    // Look for JSON blocks that contain tool calls
    const jsonBlockRegex = /```json\s*\n([\s\S]*?)\n```/g;
    let match;

    while ((match = jsonBlockRegex.exec(text)) !== null) {
      try {
        const jsonContent = match[1].trim();
        const parsed = JSON.parse(jsonContent);
        
        if (this.isValidToolCall(parsed)) {
          toolCalls.push(parsed);
        }
      } catch (error) {
        console.warn('Failed to parse tool call from JSON block:', error);
      }
    }

    return toolCalls;
  }

  static isValidToolCall(obj: any): obj is AIToolCall {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.type === 'string' &&
      ['write_file', 'read_file', 'manage_dir', 'execute_command', 'get_current_dir', 'set_current_dir'].includes(obj.type) &&
      obj.params &&
      typeof obj.params === 'object'
    );
  }

  static formatToolResult(result: AIToolResult): string {
    const { tool_call, result: toolResult, error } = result;
    
    if (error) {
      return `❌ Tool execution failed: ${error}`;
    }

    let output = `✅ Successfully executed: ${tool_call.type}\n`;
    
    switch (tool_call.type) {
      case 'write_file':
        output += `File written to: ${toolResult.data?.path || tool_call.params.path}`;
        break;
        
      case 'read_file':
        output += `File read from: ${tool_call.params.path}`;
        if (toolResult.data?.content) {
          output += `\n\nContent preview:\n${toolResult.data.content.substring(0, 500)}${toolResult.data.content.length > 500 ? '...' : ''}`;
        }
        break;
        
      case 'manage_dir':
        output += `Directory action "${tool_call.params.action}" on: ${tool_call.params.path}`;
        if (tool_call.params.action === 'list' && toolResult.data?.items) {
          output += `\n\nItems: ${toolResult.data.items.length} found`;
        }
        break;
        
      case 'execute_command':
        output += `Command: ${tool_call.params.command}`;
        if (toolResult.stdout) {
          output += `\n\nOutput:\n${toolResult.stdout}`;
        }
        if (toolResult.stderr) {
          output += `\n\nErrors:\n${toolResult.stderr}`;
        }
        output += `\nExit code: ${toolResult.exit_code}`;
        break;
        
      case 'get_current_dir':
        output += `Current directory: ${toolResult.data?.path}`;
        break;
        
      case 'set_current_dir':
        output += `Changed to directory: ${toolResult.data?.path || tool_call.params.path}`;
        break;
    }

    return output;
  }
}
