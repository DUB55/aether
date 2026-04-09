// AI code review service
// Provides automated code review and suggestions

export interface CodeReviewIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: 'security' | 'performance' | 'maintainability' | 'best-practices' | 'bugs'
  title: string
  description: string
  file: string
  line: number
  suggestion: string
  autoFixable: boolean
}

export interface CodeReviewResult {
  issues: CodeReviewIssue[]
  score: number
  summary: string
  categories: {
    security: number
    performance: number
    maintainability: number
    bestPractices: number
    bugs: number
  }
}

export const codeReviewService = {
  // Run code review on project files
  runReview: (files: Record<string, string>): CodeReviewResult => {
    const issues: CodeReviewIssue[] = []
    let securityCount = 0
    let performanceCount = 0
    let maintainabilityCount = 0
    let bestPracticesCount = 0
    let bugsCount = 0

    Object.entries(files).forEach(([fileName, content]) => {
      // Security checks
      if (content.includes('eval(')) {
        issues.push({
          id: `security_${fileName}_eval`,
          severity: 'critical',
          category: 'security',
          title: 'Use of eval() detected',
          description: 'Using eval() can execute arbitrary code and is a security risk',
          file: fileName,
          line: content.indexOf('eval('),
          suggestion: 'Replace eval() with safer alternatives like JSON.parse() or object property access',
          autoFixable: false
        })
        securityCount++
      }

      if (content.includes('innerHTML')) {
        issues.push({
          id: `security_${fileName}_innerhtml`,
          severity: 'high',
          category: 'security',
          title: 'Use of innerHTML detected',
          description: 'Setting innerHTML can lead to XSS vulnerabilities',
          file: fileName,
          line: content.indexOf('innerHTML'),
          suggestion: 'Use textContent or create elements with createElement instead',
          autoFixable: false
        })
        securityCount++
      }

      // Performance checks
      if (content.match(/document\.getElementById\(/g)?.length > 5) {
        issues.push({
          id: `performance_${fileName}_dom`,
          severity: 'medium',
          category: 'performance',
          title: 'Excessive DOM queries',
          description: 'Multiple DOM queries can cause performance issues',
          file: fileName,
          line: content.indexOf('document.getElementById'),
          suggestion: 'Cache DOM elements in variables to avoid repeated queries',
          autoFixable: true
        })
        performanceCount++
      }

      if (content.includes('useEffect(() => {') && !content.includes('[]')) {
        issues.push({
          id: `performance_${fileName}_useeffect`,
          severity: 'medium',
          category: 'performance',
          title: 'useEffect without dependencies',
          description: 'useEffect without dependency array may cause infinite loops',
          file: fileName,
          line: content.indexOf('useEffect'),
          suggestion: 'Add a dependency array to useEffect to control when it runs',
          autoFixable: true
        })
        performanceCount++
      }

      // Maintainability checks
      if (content.split('\n').length > 300) {
        issues.push({
          id: `maintainability_${fileName}_length`,
          severity: 'medium',
          category: 'maintainability',
          title: 'File too long',
          description: 'Large files are harder to maintain and understand',
          file: fileName,
          line: 1,
          suggestion: 'Consider splitting this file into smaller, focused components',
          autoFixable: false
        })
        maintainabilityCount++
      }

      // Best practices checks
      if (!content.includes('export') && fileName.endsWith('.tsx')) {
        issues.push({
          id: `bestpractice_${fileName}_export`,
          severity: 'low',
          category: 'best-practices',
          title: 'Missing export statement',
          description: 'Components should be exported for better tree-shaking',
          file: fileName,
          line: 1,
          suggestion: 'Add export default or export named to the component',
          autoFixable: true
        })
        bestPracticesCount++
      }

      // Bug checks
      if (content.includes('==') && !content.includes('===')) {
        issues.push({
          id: `bug_${fileName}_equality`,
          severity: 'medium',
          category: 'bugs',
          title: 'Loose equality operator',
          description: 'Using == can cause unexpected type coercion',
          file: fileName,
          line: content.indexOf('=='),
          suggestion: 'Use === for strict equality comparison',
          autoFixable: true
        })
        bugsCount++
      }

      if (content.includes('var ')) {
        issues.push({
          id: `bug_${fileName}_var`,
          severity: 'low',
          category: 'best-practices',
          title: 'Use of var',
          description: 'var has function scope and can lead to bugs',
          file: fileName,
          line: content.indexOf('var '),
          suggestion: 'Use const or let instead of var',
          autoFixable: true
        })
        bestPracticesCount++
      }
    })

    // Calculate score (0-100)
    const totalIssues = issues.length
    const criticalIssues = issues.filter(i => i.severity === 'critical').length
    const highIssues = issues.filter(i => i.severity === 'high').length
    const score = Math.max(0, 100 - (criticalIssues * 20) - (highIssues * 10) - (totalIssues * 2))

    // Generate summary
    let summary = `Found ${totalIssues} issues across ${Object.keys(files).length} files. `
    if (criticalIssues > 0) {
      summary += `${criticalIssues} critical issues require immediate attention. `
    }
    if (highIssues > 0) {
      summary += `${highIssues} high-priority issues should be addressed. `
    }
    if (score > 80) {
      summary += 'Overall code quality is good.'
    } else if (score > 60) {
      summary += 'Code quality needs improvement.'
    } else {
      summary += 'Code quality requires significant attention.'
    }

    return {
      issues,
      score,
      summary,
      categories: {
        security: securityCount,
        performance: performanceCount,
        maintainability: maintainabilityCount,
        bestPractices: bestPracticesCount,
        bugs: bugsCount
      }
    }
  },

  // Fix an issue automatically
  fixIssue: (files: Record<string, string>, issue: CodeReviewIssue): Record<string, string> => {
    if (!issue.autoFixable) {
      return files
    }

    const fileContent = files[issue.file]
    if (!fileContent) {
      return files
    }

    let newContent = fileContent

    switch (issue.category) {
      case 'best-practices':
        if (issue.title.includes('export')) {
          newContent = 'export default ' + newContent
        } else if (issue.title.includes('var')) {
          newContent = newContent.replace(/var /g, 'let ')
        }
        break
      case 'bugs':
        if (issue.title.includes('equality')) {
          newContent = newContent.replace(/==/g, '===')
        }
        break
      case 'performance':
        if (issue.title.includes('useEffect')) {
          newContent = newContent.replace(
            /useEffect\(\(\) => \{/g,
            'useEffect(() => {'
          )
        }
        break
    }

    return {
      ...files,
      [issue.file]: newContent
    }
  },

  // Get code review suggestions using AI
  getAISuggestions: async (
    code: string,
    context: string
  ): Promise<string[]> => {
    // In production, this would call an AI API to get suggestions
    // For now, return common suggestions
    return [
      'Consider adding error handling for async operations',
      'Extract repeated logic into reusable functions',
      'Add TypeScript types for better type safety',
      'Consider using useMemo/useCallback to optimize performance',
      'Add JSDoc comments for better documentation'
    ]
  }
}
