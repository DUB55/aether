import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  AlertTriangle,
  Info,
  Terminal,
  FileText,
  FolderOpen
} from 'lucide-react';
import { AITools, AIToolCall, AIToolResult } from '@/lib/ai-tools';
import { TauriCommands, isTauriApp } from '@/lib/tauri-commands';
import { cn } from '@/lib/utils';

interface PlanStep {
  id: string;
  type: 'tool_call' | 'explanation' | 'confirmation';
  content: string;
  toolCall?: AIToolCall;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: AIToolResult;
  error?: string;
}

interface PlanExecuteModeProps {
  aiResponse: string;
  onPlanComplete?: (results: AIToolResult[]) => void;
  className?: string;
}

export function PlanExecuteMode({ aiResponse, onPlanComplete, className }: PlanExecuteModeProps) {
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executionResults, setExecutionResults] = useState<AIToolResult[]>([]);

  useEffect(() => {
    parsePlanFromResponse();
  }, [aiResponse]);

  const parsePlanFromResponse = () => {
    const steps: PlanStep[] = [];
    const toolCalls = AITools.parseToolCallsFromText(aiResponse);
    
    // Add explanation step
    steps.push({
      id: 'explanation',
      type: 'explanation',
      content: extractPlanExplanation(aiResponse),
      status: 'pending'
    });

    // Add tool call steps
    toolCalls.forEach((toolCall, index) => {
      steps.push({
        id: `tool-${index}`,
        type: 'tool_call',
        content: generateStepDescription(toolCall),
        toolCall,
        status: 'pending'
      });
    });

    // Add confirmation step
    steps.push({
      id: 'confirmation',
      type: 'confirmation',
      content: 'Plan execution completed. Review the results above.',
      status: 'pending'
    });

    setPlan(steps);
  };

  const extractPlanExplanation = (response: string): string => {
    // Look for plan explanation in the AI response
    const planPatterns = [
      /plan[:\s]*([\s\S]*?)(?=\n\n|\n#|```|$)/i,
      /i plan to[:\s]*([\s\S]*?)(?=\n\n|\n#|```|$)/i,
      /here's my plan[:\s]*([\s\S]*?)(?=\n\n|\n#|```|$)/i
    ];

    for (const pattern of planPatterns) {
      const match = response.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'I will execute the following actions to complete your request:';
  };

  const generateStepDescription = (toolCall: AIToolCall): string => {
    switch (toolCall.type) {
      case 'write_file':
        return `Write file: ${toolCall.params.path}`;
      case 'read_file':
        return `Read file: ${toolCall.params.path}`;
      case 'manage_dir':
        return `${toolCall.params.action.charAt(0).toUpperCase() + toolCall.params.action.slice(1)} directory: ${toolCall.params.path}`;
      case 'execute_command':
        return `Execute command: ${toolCall.params.command}`;
      case 'get_current_dir':
        return 'Get current directory';
      case 'set_current_dir':
        return `Change directory to: ${toolCall.params.path}`;
      default:
        return `Execute tool: ${toolCall.type}`;
    }
  };

  const executePlan = async () => {
    if (!isTauriApp()) {
      alert('Plan execution is only available in the desktop app');
      return;
    }

    setIsExecuting(true);
    const results: AIToolResult[] = [];

    for (let i = 0; i < plan.length; i++) {
      const step = plan[i];
      setCurrentStepIndex(i);

      // Update step status to executing
      setPlan(prev => prev.map((s, index) => 
        index === i ? { ...s, status: 'executing' } : s
      ));

      if (step.type === 'explanation') {
        // Explanation step - just mark as completed
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPlan(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'completed' } : s
        ));
      } else if (step.type === 'tool_call' && step.toolCall) {
        try {
          // Execute the tool call
          const result = await AITools.executeToolCall(step.toolCall);
          results.push(result);

          setPlan(prev => prev.map((s, index) => 
            index === i ? { 
              ...s, 
              status: result.success ? 'completed' : 'failed',
              result,
              error: result.success ? undefined : result.error
            } : s
          ));

          // Also send to terminal if available
          if (window.executeAIToolCall) {
            window.executeAIToolCall(step.toolCall);
          }

        } catch (error) {
          const errorResult: AIToolResult = {
            success: false,
            tool_call: step.toolCall,
            result: null,
            error: `Tool execution failed: ${error}`
          };
          results.push(errorResult);

          setPlan(prev => prev.map((s, index) => 
            index === i ? { 
              ...s, 
              status: 'failed',
              error: `Tool execution failed: ${error}`
            } : s
          ));
        }
      } else if (step.type === 'confirmation') {
        setPlan(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'completed' } : s
        ));
      }

      // Small delay between steps for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setExecutionResults(results);
    setIsExecuting(false);
    onPlanComplete?.(results);
  };

  const pauseExecution = () => {
    setIsExecuting(false);
  };

  const resetPlan = () => {
    setPlan(prev => prev.map(step => ({ ...step, status: 'pending' })));
    setCurrentStepIndex(0);
    setExecutionResults([]);
  };

  const getStepIcon = (step: PlanStep) => {
    switch (step.type) {
      case 'explanation':
        return <Info className="w-4 h-4" />;
      case 'tool_call':
        if (step.toolCall) {
          switch (step.toolCall.type) {
            case 'write_file':
            case 'read_file':
              return <FileText className="w-4 h-4" />;
            case 'manage_dir':
              return <FolderOpen className="w-4 h-4" />;
            case 'execute_command':
              return <Terminal className="w-4 h-4" />;
            default:
              return <Zap className="w-4 h-4" />;
          }
        }
        return <Zap className="w-4 h-4" />;
      case 'confirmation':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStepStatusIcon = (status: PlanStep['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'executing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const hasToolCalls = plan.some(step => step.type === 'tool_call');

  if (!hasToolCalls) {
    return null; // Don't show Plan & Execute mode if no tool calls
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Plan & Execute Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isExecuting ? (
            <Button onClick={executePlan} disabled={plan.length === 0}>
              <Play className="w-4 h-4 mr-2" />
              Execute Plan
            </Button>
          ) : (
            <Button onClick={pauseExecution} variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button onClick={resetPlan} variant="outline">
            Reset
          </Button>
          <div className="ml-auto text-sm text-muted-foreground">
            {currentStepIndex + 1} / {plan.length} steps
          </div>
        </div>

        {/* Plan Steps */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {plan.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "p-3 border rounded-lg transition-all duration-200",
                  step.status === 'executing' && "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
                  step.status === 'completed' && "border-green-500 bg-green-50 dark:bg-green-950/20",
                  step.status === 'failed' && "border-red-500 bg-red-50 dark:bg-red-950/20",
                  step.status === 'pending' && "border-gray-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStepStatusIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStepIcon(step)}
                      <span className="font-medium text-sm">{step.content}</span>
                    </div>
                    
                    {step.type === 'tool_call' && step.toolCall && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {step.toolCall.type}
                        </Badge>
                        {step.toolCall.params.path && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {step.toolCall.params.path}
                          </Badge>
                        )}
                      </div>
                    )}

                    {step.error && (
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Error: {step.error}
                        </div>
                      </div>
                    )}

                    {step.result && step.result.success && (
                      <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {AITools.formatToolResult(step.result)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        {executionResults.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Execution Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {executionResults.filter(r => r.success).length}
                  </div>
                  <div className="text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {executionResults.filter(r => !r.success).length}
                  </div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {executionResults.length}
                  </div>
                  <div className="text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Extend Window interface to include executeAIToolCall
declare global {
  interface Window {
    executeAIToolCall?: (toolCall: any) => void;
  }
}
