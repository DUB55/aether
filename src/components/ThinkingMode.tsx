"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Brain, Lightbulb, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface ThinkingModeProps {
  onThinkingEnabled?: (enabled: boolean) => void
  className?: string
}

export function ThinkingMode({ onThinkingEnabled, className }: ThinkingModeProps) {
  const [enabled, setEnabled] = useState(false)
  const [reasoningSteps, setReasoningSteps] = useState<string[]>([])

  const toggleThinking = (checked: boolean) => {
    setEnabled(checked)
    if (onThinkingEnabled) {
      onThinkingEnabled(checked)
    }
    
    if (checked) {
      toast.success('Reasoning/Thinking mode enabled')
      // Simulate showing reasoning steps
      setReasoningSteps([
        'Analyzing request...',
        'Identifying key requirements...',
        'Considering multiple approaches...',
        'Evaluating trade-offs...',
        'Selecting optimal solution...'
      ])
    } else {
      setReasoningSteps([])
      toast.info('Reasoning/Thinking mode disabled')
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Reasoning/Thinking Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Switch
                checked={enabled}
                onCheckedChange={toggleThinking}
              />
              <span className="text-sm font-medium">Enable Thinking Mode</span>
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, AI will show its reasoning process before executing
            </p>
          </div>
        </div>

        {enabled && reasoningSteps.length > 0 && (
          <div className="space-y-3 mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Reasoning Process
            </h4>
            <div className="space-y-2">
              {reasoningSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
