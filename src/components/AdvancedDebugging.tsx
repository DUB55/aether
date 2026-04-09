"use client"

import React, { useState, useEffect } from 'react'
import { Bug, AlertTriangle, CheckCircle, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DebugIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  file: string
  line: number
  message: string
  suggestion?: string
  fixed?: boolean
}

interface AdvancedDebuggingProps {
  files: Record<string, string>
  onFix: (file: string, content: string) => void
}

export function AdvancedDebugging({ files, onFix }: AdvancedDebuggingProps) {
  const [issues, setIssues] = useState<DebugIssue[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<DebugIssue | null>(null)

  const analyzeCode = async () => {
    setIsAnalyzing(true)
    const detectedIssues: DebugIssue[] = []

    // Simulate AI-powered error detection
    Object.entries(files).forEach(([fileName, content]) => {
      const lines = content.split('\n')
      
      lines.forEach((line, index) => {
        // Detect common issues
        if (line.includes('console.log') && !line.includes('//')) {
          detectedIssues.push({
            id: `${fileName}-${index}`,
            type: 'warning',
            file: fileName,
            line: index + 1,
            message: 'Console.log statement found in production code',
            suggestion: 'Remove or comment out console.log statements'
          })
        }

        if (line.includes('TODO') || line.includes('FIXME')) {
          detectedIssues.push({
            id: `${fileName}-${index}-todo`,
            type: 'info',
            file: fileName,
            line: index + 1,
            message: 'Unresolved TODO/FIXME comment',
            suggestion: 'Address the TODO or remove the comment'
          })
        }

        if (line.includes('var ') && !line.includes('//')) {
          detectedIssues.push({
            id: `${fileName}-${index}-var`,
            type: 'warning',
            file: fileName,
            line: index + 1,
            message: 'Use of var keyword',
            suggestion: 'Replace var with const or let for better scoping'
          })
        }

        if (line.includes('any') && line.includes(':')) {
          detectedIssues.push({
            id: `${fileName}-${index}-any`,
            type: 'warning',
            file: fileName,
            line: index + 1,
            message: 'Use of any type',
            suggestion: 'Use specific types for better type safety'
          })
        }
      })
    })

    setIssues(detectedIssues)
    setIsAnalyzing(false)
  }

  const fixIssue = (issue: DebugIssue) => {
    // Simulate AI-powered fix
    const fileContent = files[issue.file]
    const lines = fileContent.split('\n')
    const lineIndex = issue.line - 1
    
    if (lineIndex >= 0 && lineIndex < lines.length) {
      let fixedLine = lines[lineIndex]
      
      // Apply fixes based on issue type
      if (issue.message.includes('console.log')) {
        fixedLine = `// ${fixedLine.trim()}`
      } else if (issue.message.includes('var ')) {
        fixedLine = fixedLine.replace('var ', 'const ')
      }
      
      lines[lineIndex] = fixedLine
      const newContent = lines.join('\n')
      onFix(issue.file, newContent)
      
      setIssues(prev => prev.map(i => 
        i.id === issue.id ? { ...i, fixed: true } : i
      ))
    }
  }

  const getIssueIcon = (type: DebugIssue['type']) => {
    switch (type) {
      case 'error':
        return <Bug className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <Zap className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Advanced Debugging</h3>
        <Button
          onClick={analyzeCode}
          disabled={isAnalyzing}
          className="gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Analyze Code
            </>
          )}
        </Button>
      </div>

      {issues.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {issues.map(issue => (
            <div
              key={issue.id}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all",
                issue.fixed ? "bg-green-500/10 border-green-500/20 opacity-50" : "bg-[var(--bg2)] border-[var(--bdr)]",
                selectedIssue?.id === issue.id && "border-primary"
              )}
              onClick={() => setSelectedIssue(issue)}
            >
              <div className="flex items-start gap-3">
                {getIssueIcon(issue.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{issue.file}</span>
                    <span className="text-xs text-[var(--t3)]">Line {issue.line}</span>
                    {issue.fixed && <CheckCircle className="w-3 h-3 text-green-500" />}
                  </div>
                  <p className="text-sm text-[var(--t2)]">{issue.message}</p>
                  {issue.suggestion && (
                    <p className="text-xs text-[var(--t3)] mt-1">{issue.suggestion}</p>
                  )}
                </div>
                {!issue.fixed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      fixIssue(issue)
                    }}
                  >
                    Fix
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {issues.length === 0 && !isAnalyzing && (
        <div className="text-center py-8 text-[var(--t3)]">
          <Bug className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No issues detected. Click "Analyze Code" to scan your files.</p>
        </div>
      )}
    </div>
  )
}
