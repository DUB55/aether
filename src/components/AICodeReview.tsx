"use client"

import React, { useState, useEffect } from 'react'
import { FileText, CheckCircle, AlertTriangle, Info, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReviewIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  file: string
  line: number
  message: string
  suggestion: string
  code?: string
}

interface ReviewSummary {
  totalIssues: number
  critical: number
  high: number
  medium: number
  low: number
  score: number
}

interface AICodeReviewProps {
  files: Record<string, string>
  onApplyFix?: (file: string, line: number, suggestion: string) => void
}

export function AICodeReview({ files, onApplyFix }: AICodeReviewProps) {
  const [isReviewing, setIsReviewing] = useState(false)
  const [issues, setIssues] = useState<ReviewIssue[]>([])
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())

  const runReview = async () => {
    setIsReviewing(true)
    setIssues([])
    setSummary(null)

    // Simulate AI code review
    await new Promise(resolve => setTimeout(resolve, 2000))

    const detectedIssues: ReviewIssue[] = []
    let critical = 0
    let high = 0
    let medium = 0
    let low = 0

    Object.entries(files).forEach(([fileName, content]) => {
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // Detect various code quality issues

        // Security issues
        if (line.includes('eval(')) {
          detectedIssues.push({
            id: `${fileName}-${index}-eval`,
            severity: 'critical',
            category: 'Security',
            file: fileName,
            line: index + 1,
            message: 'Use of eval() function detected',
            suggestion: 'Avoid using eval() as it can execute arbitrary code. Consider using alternative approaches like JSON.parse() for parsing data.',
            code: line.trim()
          })
          critical++
        }

        if (line.includes('innerHTML') && !line.includes('//')) {
          detectedIssues.push({
            id: `${fileName}-${index}-innerhtml`,
            severity: 'high',
            category: 'Security',
            file: fileName,
            line: index + 1,
            message: 'Direct innerHTML assignment can lead to XSS vulnerabilities',
            suggestion: 'Use textContent or sanitize the HTML before setting innerHTML. Consider using a sanitization library like DOMPurify.',
            code: line.trim()
          })
          high++
        }

        // Code quality issues
        if (line.length > 100) {
          detectedIssues.push({
            id: `${fileName}-${index}-longline`,
            severity: 'medium',
            category: 'Code Style',
            file: fileName,
            line: index + 1,
            message: 'Line exceeds 100 characters',
            suggestion: 'Break long lines into multiple lines for better readability.',
            code: line.trim().substring(0, 80) + '...'
          })
          medium++
        }

        if (line.includes('TODO') || line.includes('FIXME')) {
          detectedIssues.push({
            id: `${fileName}-${index}-todo`,
            severity: 'low',
            category: 'Maintenance',
            file: fileName,
            line: index + 1,
            message: 'Unresolved TODO or FIXME comment',
            suggestion: 'Address the TODO or remove the comment if no longer relevant.',
            code: line.trim()
          })
          low++
        }

        // Performance issues
        if (line.includes('document.getElementById') && line.includes('querySelector')) {
          detectedIssues.push({
            id: `${fileName}-${index}-dom`,
            severity: 'medium',
            category: 'Performance',
            file: fileName,
            line: index + 1,
            message: 'Multiple DOM queries in same statement',
            suggestion: 'Cache DOM element references to avoid repeated queries.',
            code: line.trim()
          })
          medium++
        }

        // Best practices
        if (line.includes('var ') && !line.includes('//')) {
          detectedIssues.push({
            id: `${fileName}-${index}-var`,
            severity: 'medium',
            category: 'Best Practices',
            file: fileName,
            line: index + 1,
            message: 'Use of var keyword',
            suggestion: 'Replace var with const or let for better scoping and to avoid hoisting issues.',
            code: line.trim()
          })
          medium++
        }

        if (line.includes('any') && line.includes(':')) {
          detectedIssues.push({
            id: `${fileName}-${index}-any`,
            severity: 'low',
            category: 'Type Safety',
            file: fileName,
            line: index + 1,
            message: 'Use of any type',
            suggestion: 'Use specific types for better type safety and IDE support.',
            code: line.trim()
          })
          low++
        }
      })
    })

    // Calculate score (0-100)
    const total = critical + high + medium + low
    const score = Math.max(0, 100 - (critical * 25) - (high * 15) - (medium * 5) - (low * 2))

    setSummary({
      totalIssues: total,
      critical,
      high,
      medium,
      low,
      score
    })
    setIssues(detectedIssues)
    setIsReviewing(false)
  }

  const toggleExpand = (issueId: string) => {
    setExpandedIssues(prev => {
      const next = new Set(prev)
      if (next.has(issueId)) {
        next.delete(issueId)
      } else {
        next.add(issueId)
      }
      return next
    })
  }

  const getSeverityColor = (severity: ReviewIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'low':
        return 'bg-blue-500 text-white'
    }
  }

  const getSeverityIcon = (severity: ReviewIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const applyFix = (issue: ReviewIssue) => {
    onApplyFix?.(issue.file, issue.line, issue.suggestion)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Code Review
        </h3>
        <Button
          onClick={runReview}
          disabled={isReviewing}
          className="gap-2"
        >
          {isReviewing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Reviewing...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Run Review
            </>
          )}
        </Button>
      </div>

      {summary && (
        <div className="p-4 rounded-xl bg-[var(--bg2)] border border-[var(--bdr)]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{summary.score}</p>
              <p className="text-xs text-[var(--t3)]">Code Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{summary.critical}</p>
              <p className="text-xs text-[var(--t3)]">Critical</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{summary.high}</p>
              <p className="text-xs text-[var(--t3)]">High</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{summary.medium}</p>
              <p className="text-xs text-[var(--t3)]">Medium</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{summary.low}</p>
              <p className="text-xs text-[var(--t3)]">Low</p>
            </div>
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {issues.map(issue => (
            <div
              key={issue.id}
              className="p-4 rounded-xl bg-[var(--bg2)] border border-[var(--bdr)]"
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(issue.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      getSeverityColor(issue.severity)
                    )}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-[var(--t3)]">{issue.category}</span>
                    <span className="text-xs text-[var(--t3)]">{issue.file}:{issue.line}</span>
                  </div>
                  <p className="text-sm font-medium mb-2">{issue.message}</p>
                  
                  <button
                    onClick={() => toggleExpand(issue.id)}
                    className="flex items-center gap-1 text-xs text-primary mb-2"
                  >
                    {expandedIssues.has(issue.id) ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Show details
                      </>
                    )}
                  </button>

                  {expandedIssues.has(issue.id) && (
                    <div className="space-y-2">
                      <p className="text-sm text-[var(--t2)]">{issue.suggestion}</p>
                      {issue.code && (
                        <div className="p-2 rounded bg-[var(--bg3)] font-mono text-xs text-[var(--t3)]">
                          {issue.code}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyFix(issue)}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Apply Fix
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {issues.length === 0 && !isReviewing && (
        <div className="text-center py-8 text-[var(--t3)]">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No code review results. Click "Run Review" to analyze your code.</p>
        </div>
      )}
    </div>
  )
}
