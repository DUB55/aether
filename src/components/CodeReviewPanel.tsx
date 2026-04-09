"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, XCircle, Info, Zap, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { codeReviewService, type CodeReviewResult } from '@/lib/code-review-service'

interface CodeReviewPanelProps {
  projectFiles: Record<string, string>
  className?: string
}

export function CodeReviewPanel({ projectFiles, className }: CodeReviewPanelProps) {
  const [review, setReview] = useState<CodeReviewResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'info'>('all')

  const runReview = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      const result = codeReviewService.runReview(projectFiles)
      setReview(result)
      setIsAnalyzing(false)
      toast.success('Code review complete!')
    }, 1000)
  }

  const fixIssue = (issueId: string) => {
    if (!review) return
    const fixedFiles = codeReviewService.fixIssue(projectFiles, review.issues.find(i => i.id === issueId)!)
    toast.success('Issue auto-fixed!')
    // In a real implementation, this would update the project files
  }

  const filteredIssues = review?.issues.filter(issue => 
    selectedSeverity === 'all' || issue.severity === selectedSeverity
  ) || []

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />
      case 'low': return <Info className="w-4 h-4 text-blue-500" />
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              AI Code Review
            </CardTitle>
            <Button 
              onClick={runReview} 
              disabled={isAnalyzing || Object.keys(projectFiles).length === 0}
              size="sm"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Review'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {review && (
            <>
              {/* Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Code Quality Score</span>
                  <span className="font-bold">{review.score}/100</span>
                </div>
                <Progress value={review.score} className="h-2" />
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{review.summary}</p>
              </div>

              {/* Category Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Security</div>
                  <div className="font-bold">{review.categories.security}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Performance</div>
                  <div className="font-bold">{review.categories.performance}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Maintainability</div>
                  <div className="font-bold">{review.categories.maintainability}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Bugs</div>
                  <div className="font-bold">{review.categories.bugs}</div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map(severity => (
                  <Button
                    key={severity}
                    variant={selectedSeverity === severity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSeverity(severity)}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    {severity !== 'all' && ` (${review.issues.filter(i => i.severity === severity).length})`}
                  </Button>
                ))}
              </div>

              {/* Issues */}
              {filteredIssues.length > 0 ? (
                <div className="space-y-3">
                  {filteredIssues.map(issue => (
                    <div key={issue.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(issue.severity)}
                          <Badge className={getSeverityColor(issue.severity)} variant="outline">
                            {issue.severity}
                          </Badge>
                          <Badge variant="outline">{issue.category}</Badge>
                        </div>
                        {issue.autoFixable && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fixIssue(issue.id)}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Auto Fix
                          </Button>
                        )}
                      </div>
                      <h4 className="font-medium">{issue.title}</h4>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">File:</span> {issue.file}
                        <span className="mx-2">•</span>
                        <span className="font-medium">Line:</span> {issue.line}
                      </div>
                      <div className="p-2 bg-muted rounded text-sm">
                        <span className="font-medium">Suggestion:</span> {issue.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No issues found for the selected severity filter.
                </div>
              )}
            </>
          )}

          {!review && !isAnalyzing && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run Review" to analyze your code for security vulnerabilities, performance issues, and best practices.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
