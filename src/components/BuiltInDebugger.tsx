"use client"

import React, { useState, useEffect } from 'react'
import { Bug, Play, Pause, SkipForward, StepForward, StepBack, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Breakpoint {
  id: string
  file: string
  line: number
  enabled: boolean
  condition?: string
}

interface BuiltInDebuggerProps {
  files: Record<string, string>
  onBreakpointToggle?: (file: string, line: number) => void
}

export function BuiltInDebugger({ files, onBreakpointToggle }: BuiltInDebuggerProps) {
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [currentLine, setCurrentLine] = useState<number | null>(null)
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [callStack, setCallStack] = useState<Array<{ file: string; line: number; function: string }>>([])
  const [variables, setVariables] = useState<Record<string, any>>({})

  const toggleBreakpoint = (file: string, line: number) => {
    const existingIndex = breakpoints.findIndex(bp => bp.file === file && bp.line === line)
    
    if (existingIndex >= 0) {
      setBreakpoints(prev => prev.filter((_, i) => i !== existingIndex))
    } else {
      setBreakpoints(prev => [...prev, {
        id: `${file}-${line}`,
        file,
        line,
        enabled: true
      }])
    }
    
    onBreakpointToggle?.(file, line)
  }

  const removeBreakpoint = (id: string) => {
    setBreakpoints(prev => prev.filter(bp => bp.id !== id))
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const stepOver = () => {
    // Simulate stepping over
    if (currentLine !== null) {
      setCurrentLine(prev => prev ? prev + 1 : null)
    }
  }

  const stepInto = () => {
    // Simulate stepping into
    setCurrentLine(prev => prev ? prev + 1 : null)
  }

  const stepOut = () => {
    // Simulate stepping out
    setCurrentLine(prev => prev ? prev - 1 : null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Built-in Debugger
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPaused ? "default" : "outline"}
            onClick={togglePause}
            className="gap-2"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Debug Controls */}
      <div className="flex items-center justify-center gap-2 p-3 bg-[var(--bg2)] rounded-lg border border-[var(--bdr)]">
        <Button size="icon" variant="ghost" onClick={stepOver} disabled={!isPaused} title="Step Over">
          <SkipForward className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={stepInto} disabled={!isPaused} title="Step Into">
          <StepForward className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={stepOut} disabled={!isPaused} title="Step Out">
          <StepBack className="w-4 h-4" />
        </Button>
      </div>

      {/* Breakpoints */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          Breakpoints
          <span className="text-xs text-[var(--t3)]">({breakpoints.length})</span>
        </h4>
        {breakpoints.length > 0 ? (
          <div className="space-y-2">
            {breakpoints.map(bp => (
              <div
                key={bp.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg2)] border border-[var(--bdr)]"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    bp.enabled ? "bg-red-500" : "bg-[var(--t3)]"
                  )} />
                  <div>
                    <p className="text-sm font-medium">{bp.file}</p>
                    <p className="text-xs text-[var(--t3)]">Line {bp.line}</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => removeBreakpoint(bp.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--t3)] text-center py-4">No breakpoints set</p>
        )}
      </div>

      {/* Call Stack */}
      <div>
        <h4 className="font-medium mb-3">Call Stack</h4>
        {callStack.length > 0 ? (
          <div className="space-y-1">
            {callStack.map((frame, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg2)] border border-[var(--bdr)] text-sm"
              >
                <span className="text-[var(--t3)]">{index}.</span>
                <span className="font-medium">{frame.function}</span>
                <span className="text-[var(--t3)]">{frame.file}:{frame.line}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--t3)] text-center py-4">No call stack</p>
        )}
      </div>

      {/* Variables */}
      <div>
        <h4 className="font-medium mb-3">Variables</h4>
        {Object.keys(variables).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(variables).map(([name, value]) => (
              <div
                key={name}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg2)] border border-[var(--bdr)] text-sm"
              >
                <span className="font-medium">{name}</span>
                <span className="text-[var(--t3)] font-mono">{JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--t3)] text-center py-4">No variables in scope</p>
        )}
      </div>

      {/* Current Execution */}
      {currentLine && currentFile && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm font-medium mb-1">Current Execution</p>
          <p className="text-sm text-[var(--t2)]">{currentFile}:{currentLine}</p>
        </div>
      )}
    </div>
  )
}
