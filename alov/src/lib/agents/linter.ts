
export interface LintError {
  line: number
  message: string
  severity: 'error' | 'warning'
}

export class LinterAgent {
  static lint(content: string, filePath: string): LintError[] {
    const errors: LintError[] = []
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      const lineNumber = index + 1
      
      // Check for class vs className in JSX/TSX
      if ((filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) && line.includes('class=') && !line.includes('className=')) {
        // Simple heuristic, might have false positives in non-JSX
        if (/<[a-zA-Z]/.test(line)) {
           errors.push({
             line: lineNumber,
             message: 'Use "className" instead of "class" in JSX',
             severity: 'error'
           })
        }
      }

      // Check for for vs htmlFor
      if ((filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) && line.includes('for=') && !line.includes('htmlFor=') && /<label/i.test(line)) {
         errors.push({
           line: lineNumber,
           message: 'Use "htmlFor" instead of "for" in label elements',
           severity: 'error'
         })
      }

      // Check for console.log (warning)
      if (line.includes('console.log(')) {
        errors.push({
          line: lineNumber,
          message: 'Console log statement detected',
          severity: 'warning'
        })
      }
      
      // Check for unclosed div (very basic check)
      // This is hard to do line-by-line, so we skip complex syntax checks
    })

    // Basic bracket matching
    const openBraces = (content.match(/\{/g) || []).length
    const closeBraces = (content.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push({
        line: 0,
        message: `Mismatched braces: ${openBraces} opened, ${closeBraces} closed`,
        severity: 'error'
      })
    }

    return errors
  }
}
