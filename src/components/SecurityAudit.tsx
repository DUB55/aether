"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Wrench,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'
import { securityAuditService, SecurityAuditResult, SecurityIssue } from '@/lib/security-audit'

interface SecurityAuditProps {
  projectFiles: Record<string, string>
  onFixIssue?: (issueId: string) => void
  className?: string
}

export function SecurityAudit({ projectFiles, onFixIssue, className }: SecurityAuditProps) {
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'info'>('all')

  const runAudit = () => {
    setIsRunning(true)
    setTimeout(() => {
      const result = securityAuditService.runAudit(projectFiles)
      setAuditResult(result)
      setIsRunning(false)
      toast.success('Security audit completed')
    }, 1000)
  }

  const handleFixIssue = (issue: SecurityIssue) => {
    if (!issue.canAutoFix) {
      toast.error('This issue cannot be auto-fixed. Manual intervention required.')
      return
    }

    const fixedFiles = securityAuditService.fixIssue(projectFiles, issue.id)
    if (onFixIssue) {
      onFixIssue(issue.id)
    }
    
    // Re-run audit after fix
    const result = securityAuditService.runAudit(fixedFiles)
    setAuditResult(result)
    toast.success('Issue fixed successfully')
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      info: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[severity as keyof typeof colors] || colors.info
  }

  const getSeverityIcon = (severity: string) => {
    const icons = {
      critical: <XCircle className="w-4 h-4" />,
      high: <AlertTriangle className="w-4 h-4" />,
      medium: <AlertTriangle className="w-4 h-4" />,
      low: <AlertTriangle className="w-4 h-4" />,
      info: <Lightbulb className="w-4 h-4" />
    }
    return icons[severity as keyof typeof icons] || icons.info
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const filteredIssues = auditResult?.issues.filter(issue => 
    selectedSeverity === 'all' || issue.severity === selectedSeverity
  ) || []

  const bestPractices = securityAuditService.getBestPractices()

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Audit
            </div>
            <Button onClick={runAudit} disabled={isRunning} size="sm">
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Audit
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!auditResult ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Run a security audit to check for vulnerabilities</p>
            </div>
          ) : (
            <>
              {/* Security Score */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Security Score</span>
                  <span className={`text-3xl font-bold ${getScoreColor(auditResult.score)}`}>
                    {auditResult.score}/100
                  </span>
                </div>
                <Progress value={auditResult.score} className="h-2" />
                <div className="mt-2 text-xs text-muted-foreground">
                  {auditResult.score >= 80 ? 'Excellent security posture' :
                   auditResult.score >= 60 ? 'Good security posture' :
                   auditResult.score >= 40 ? 'Moderate security risks' :
                   'Critical security issues detected'}
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">{auditResult.summary.critical}</div>
                  <div className="text-xs text-muted-foreground">Critical</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="text-lg font-bold text-orange-600">{auditResult.summary.high}</div>
                  <div className="text-xs text-muted-foreground">High</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">{auditResult.summary.medium}</div>
                  <div className="text-xs text-muted-foreground">Medium</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">{auditResult.summary.low}</div>
                  <div className="text-xs text-muted-foreground">Low</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-600">{auditResult.summary.info}</div>
                  <div className="text-xs text-muted-foreground">Info</div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as any)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">All Issues</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="info">Info</option>
                </select>
              </div>

              {/* Issues List */}
              {filteredIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
                  <p>No security issues found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredIssues.map((issue) => (
                    <div key={issue.id} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getSeverityColor(issue.severity)} variant="secondary">
                                {issue.severity}
                              </Badge>
                              <span className="font-medium">{issue.type}</span>
                            </div>
                            <p className="text-sm">{issue.message}</p>
                            {issue.file && (
                              <p className="text-xs mt-1 font-mono">{issue.file}</p>
                            )}
                            <p className="text-sm mt-2 text-muted-foreground">
                              <strong>Recommendation:</strong> {issue.recommendation}
                            </p>
                          </div>
                        </div>
                        {issue.canAutoFix && (
                          <Button
                            size="sm"
                            onClick={() => handleFixIssue(issue)}
                            variant="outline"
                          >
                            <Wrench className="w-4 h-4 mr-1" />
                            Auto-Fix
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {bestPractices.map((practice, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
