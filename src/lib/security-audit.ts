// Security audit and vulnerability scanning service
// Performs security checks on code and dependencies

export interface SecurityIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  type: string
  file?: string
  line?: number
  message: string
  recommendation: string
  canAutoFix: boolean
}

export interface SecurityAuditResult {
  issues: SecurityIssue[]
  summary: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  score: number
}

export const securityAuditService = {
  // Run security audit on project code
  runAudit: (files: Record<string, string>): SecurityAuditResult => {
    const issues: SecurityIssue[] = []

    // Check each file for security issues
    Object.entries(files).forEach(([filePath, content]) => {
      // Check for hardcoded secrets
      if (content.includes('API_KEY') || content.includes('SECRET') || content.includes('PASSWORD')) {
        if (!content.includes('process.env') && !content.includes('import.meta.env')) {
          issues.push({
            id: `secret-${filePath}`,
            severity: 'critical',
            type: 'hardcoded-secret',
            file: filePath,
            message: 'Potential hardcoded secret detected',
            recommendation: 'Use environment variables for sensitive data',
            canAutoFix: false
          })
        }
      }

      // Check for console.log in production code
      if (content.includes('console.log') || content.includes('console.error') || content.includes('console.warn')) {
        issues.push({
          id: `console-${filePath}`,
          severity: 'low',
          type: 'debug-code',
          file: filePath,
          message: 'Console statements found in code',
          recommendation: 'Remove console statements before production deployment',
          canAutoFix: true
        })
      }

      // Check for eval usage
      if (content.includes('eval(')) {
        issues.push({
          id: `eval-${filePath}`,
          severity: 'critical',
          type: 'dangerous-function',
          file: filePath,
          message: 'Use of eval() detected',
          recommendation: 'Avoid using eval() as it can execute arbitrary code',
          canAutoFix: false
        })
      }

      // Check for innerHTML usage
      if (content.includes('innerHTML') || content.includes('outerHTML')) {
        issues.push({
          id: `innerhtml-${filePath}`,
          severity: 'high',
          type: 'xss-risk',
          file: filePath,
          message: 'Direct HTML manipulation detected',
          recommendation: 'Use textContent or sanitize HTML before insertion',
          canAutoFix: false
        })
      }

      // Check for inline event handlers
      if (content.match(/on\w+=/)) {
        issues.push({
          id: `inline-event-${filePath}`,
          severity: 'medium',
          type: 'xss-risk',
          file: filePath,
          message: 'Inline event handlers detected',
          recommendation: 'Use addEventListener instead of inline event handlers',
          canAutoFix: false
        })
      }

      // Check for http:// URLs (should use https://)
      if (content.includes('http://')) {
        const httpsViolations = content.match(/http:\/\/[^\s"']+/g) || []
        httpsViolations.forEach((url, index) => {
          if (typeof url === 'string' && !url.includes('localhost') && !url.includes('127.0.0.1')) {
            issues.push({
              id: `http-${filePath}-${index}`,
              severity: 'medium',
              type: 'insecure-protocol',
              message: `Insecure HTTP URL detected: ${url}`,
              recommendation: 'Use HTTPS instead of HTTP for secure connections',
              canAutoFix: true
            })
          }
        })
      }

      // Check for missing input validation patterns
      if (content.includes('value={') && !content.includes('validation')) {
        issues.push({
          id: `validation-${filePath}`,
          severity: 'low',
          type: 'input-validation',
          file: filePath,
          message: 'Input fields may lack validation',
          recommendation: 'Add validation to all user input fields',
          canAutoFix: false
        })
      }
    })

    // Calculate summary
    const summary = {
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
      info: issues.filter(i => i.severity === 'info').length
    }

    // Calculate security score (0-100)
    const score = Math.max(0, 100 - (
      summary.critical * 25 +
      summary.high * 15 +
      summary.medium * 5 +
      summary.low * 1
    ))

    return {
      issues,
      summary,
      score
    }
  },

  // Fix auto-fixable issues
  fixIssue: (files: Record<string, string>, issueId: string): Record<string, string> => {
    const updatedFiles = { ...files }

    Object.entries(updatedFiles).forEach(([filePath, content]) => {
      // Remove console statements
      if (issueId.startsWith('console-')) {
        updatedFiles[filePath] = content
          .replace(/console\.log\([^)]*\);?\s*/g, '')
          .replace(/console\.error\([^)]*\);?\s*/g, '')
          .replace(/console\.warn\([^)]*\);?\s*/g, '')
      }

      // Fix http:// to https://
      if (issueId.startsWith('http-')) {
        updatedFiles[filePath] = content.replace(
          /http:\/\/(?!localhost|127\.0\.0\.1)/g,
          'https://'
        )
      }
    })

    return updatedFiles
  },

  // Get security best practices
  getBestPractices: (): string[] => [
    'Always use environment variables for sensitive data (API keys, secrets)',
    'Never use eval() or similar functions that execute arbitrary code',
    'Sanitize all user input before rendering to prevent XSS attacks',
    'Use HTTPS for all network communications',
    'Implement proper authentication and authorization',
    'Validate all user input on both client and server side',
    'Keep dependencies updated to patch known vulnerabilities',
    'Use Content Security Policy (CSP) headers',
    'Implement rate limiting to prevent brute force attacks',
    'Log security events for audit trails',
    'Use parameterized queries to prevent SQL injection',
    'Encrypt sensitive data at rest and in transit',
    'Implement proper session management',
    'Use secure cookie flags (HttpOnly, Secure, SameSite)',
    'Regularly perform security audits and penetration testing'
  ],

  // Check dependency vulnerabilities (simplified)
  checkDependencies: async (packageJson: Record<string, any>): Promise<SecurityIssue[]> => {
    const issues: SecurityIssue[] = []
    const dependencies: Record<string, string> = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    }

    // In production, this would call a vulnerability database API
    // For now, we'll do basic checks
    Object.entries(dependencies).forEach(([name, version]) => {
      // Check for known vulnerable packages (simplified)
      const vulnerablePackages = [
        'lodash<4.17.21',
        'axios<0.21.1',
        'react<16.14.0',
        'moment<2.29.4'
      ]

      vulnerablePackages.forEach(vuln => {
        const [vulnName, vulnVersion] = vuln.split('<')
        if (name === vulnName && version < vulnVersion) {
          issues.push({
            id: `dep-${name}`,
            severity: 'high',
            type: 'vulnerable-dependency',
            message: `Package ${name}@${version} has known vulnerabilities`,
            recommendation: `Update ${name} to version ${vulnVersion} or later`,
            canAutoFix: true
          })
        }
      })
    })

    return issues
  }
}
