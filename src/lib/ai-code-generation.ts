// AI-powered code generation service
// Generates code using AI models via the multi-provider service

export interface CodeGenerationRequest {
  prompt: string
  language?: string
  framework?: string
  context?: string
  files?: Array<{ name: string; content: string }>
  temperature?: number
  maxTokens?: number
}

export interface CodeGenerationResult {
  success: boolean
  code?: string
  explanation?: string
  error?: string
  model?: string
  tokensUsed?: number
}

export interface CodeRefinementRequest {
  originalCode: string
  instruction: string
  language?: string
  temperature?: number
}

export interface CodeReviewRequest {
  code: string
  language?: string
  focus?: 'security' | 'performance' | 'readability' | 'all'
}

export interface CodeReviewResult {
  success: boolean
  issues?: Array<{
    severity: 'error' | 'warning' | 'info'
    message: string
    line?: number
    suggestion?: string
  }>
  summary?: string
  error?: string
}

export const aiCodeGenerationService = {
  // Generate code from natural language prompt
  generateCode: async (request: CodeGenerationRequest): Promise<CodeGenerationResult> => {
    try {
      const systemPrompt = `You are an expert software developer. Generate clean, well-structured, and production-ready code based on the user's requirements.

Follow these guidelines:
- Write modern, idiomatic code
- Include helpful comments for complex logic
- Follow best practices for the specified language/framework
- Handle edge cases and errors appropriately
- Use meaningful variable and function names

${request.language ? `Language: ${request.language}` : ''}
${request.framework ? `Framework: ${request.framework}` : ''}

${request.context ? `Context: ${request.context}` : ''}

${request.files ? `Existing files:\n${request.files.map(f => `File: ${f.name}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}` : ''}

Generate only the code without markdown code blocks unless explicitly asked for explanations.`;

      const userPrompt = request.prompt;

      // In production, this would call the actual multi-provider service
      // For now, we'll return a simulated response
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          temperature: request.temperature || 0.7,
          maxTokens: request.maxTokens || 2000
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to generate code'
        };
      }

      const data = await response.json();

      return {
        success: true,
        code: data.code,
        explanation: data.explanation,
        model: data.model,
        tokensUsed: data.tokensUsed
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate code'
      };
    }
  },

  // Refine existing code based on instructions
  refineCode: async (request: CodeRefinementRequest): Promise<CodeGenerationResult> => {
    try {
      const systemPrompt = `You are an expert code reviewer and refactoring specialist. Improve the provided code based on the user's instructions.

Focus on:
- Code quality and readability
- Performance optimization
- Security best practices
- Maintaining the original functionality
- Following language-specific best practices

${request.language ? `Language: ${request.language}` : ''}

Provide the improved code with brief explanations of the changes made.`;

      const userPrompt = `Original code:
\`\`\`
${request.originalCode}
\`\`\`

Instruction: ${request.instruction}`;

      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          temperature: request.temperature || 0.3
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to refine code'
        };
      }

      const data = await response.json();

      return {
        success: true,
        code: data.code,
        explanation: data.explanation,
        model: data.model
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refine code'
      };
    }
  },

  // Review code for issues and improvements
  reviewCode: async (request: CodeReviewRequest): Promise<CodeReviewResult> => {
    try {
      const systemPrompt = `You are an expert code reviewer. Analyze the provided code for potential issues and improvements.

${request.focus ? `Focus area: ${request.focus}` : 'Focus on all aspects: security, performance, and readability'}

For each issue found, provide:
- Severity level (error, warning, or info)
- Clear description of the issue
- Line number if applicable
- Suggested fix or improvement

${request.language ? `Language: ${request.language}` : ''}`;

      const userPrompt = `Code to review:
\`\`\`
${request.code}
\`\`\`

Provide a comprehensive review with actionable feedback.`;

      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to review code'
        };
      }

      const data = await response.json();

      return {
        success: true,
        issues: data.issues,
        summary: data.summary
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to review code'
      };
    }
  },

  // Generate unit tests for code
  generateTests: async (code: string, language: string, testFramework?: string): Promise<CodeGenerationResult> => {
    try {
      const systemPrompt = `You are an expert in test-driven development. Generate comprehensive unit tests for the provided code.

Guidelines:
- Write clear, descriptive test names
- Test both happy paths and edge cases
- Use appropriate assertions
- Include setup and teardown if needed
- Follow the testing framework's best practices

${language ? `Language: ${language}` : ''}
${testFramework ? `Test Framework: ${testFramework}` : ''}`;

      const userPrompt = `Code to test:
\`\`\`
${code}
\`\`\`

Generate comprehensive unit tests that cover all functionality.`;

      const response = await fetch('/api/generate-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to generate tests'
        };
      }

      const data = await response.json();

      return {
        success: true,
        code: data.code,
        explanation: data.explanation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate tests'
      };
    }
  },

  // Generate documentation for code
  generateDocumentation: async (code: string, format: 'javadoc' | 'jsdoc' | 'docstring' | 'markdown'): Promise<CodeGenerationResult> => {
    try {
      const systemPrompt = `You are a technical documentation specialist. Generate clear, comprehensive documentation for the provided code.

Documentation should include:
- Purpose and functionality
- Parameters with types and descriptions
- Return values with types and descriptions
- Examples of usage
- Edge cases and error conditions

Format: ${format}`;

      const userPrompt = `Code to document:
\`\`\`
${code}
\`\`\`

Generate comprehensive documentation.`;

      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to generate documentation'
        };
      }

      const data = await response.json();

      return {
        success: true,
        code: data.documentation,
        explanation: data.explanation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate documentation'
      };
    }
  },

  // Explain code
  explainCode: async (code: string, detailLevel: 'brief' | 'detailed' = 'detailed'): Promise<CodeGenerationResult> => {
    try {
      const detailInstruction = detailLevel === 'brief' 
        ? 'Provide a concise explanation focusing on the main purpose and flow.' 
        : 'Provide a detailed explanation including:\n- Overall purpose and architecture\n- Key functions and their roles\n- Data flow and transformations\n- Important patterns or techniques used\n- Potential edge cases or considerations';

      const systemPrompt = `You are an expert code educator. Explain the provided code in a clear, understandable way.\n\n${detailInstruction}`;

      const userPrompt = `Code to explain:\n\`\`\`\n${code}\n\`\`\`\n\nExplain this code in ${detailLevel} detail.`;

      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to explain code'
        };
      }

      const data = await response.json();

      return {
        success: true,
        explanation: data.explanation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to explain code'
      };
    }
  },

  // Get supported languages
  getSupportedLanguages(): Array<{ value: string; label: string; extensions: string[] }> {
    return [
      { value: 'typescript', label: 'TypeScript', extensions: ['.ts', '.tsx'] },
      { value: 'javascript', label: 'JavaScript', extensions: ['.js', '.jsx'] },
      { value: 'python', label: 'Python', extensions: ['.py'] },
      { value: 'java', label: 'Java', extensions: ['.java'] },
      { value: 'csharp', label: 'C#', extensions: ['.cs'] },
      { value: 'cpp', label: 'C++', extensions: ['.cpp', '.cc', '.cxx'] },
      { value: 'go', label: 'Go', extensions: ['.go'] },
      { value: 'rust', label: 'Rust', extensions: ['.rs'] },
      { value: 'php', label: 'PHP', extensions: ['.php'] },
      { value: 'ruby', label: 'Ruby', extensions: ['.rb'] },
      { value: 'swift', label: 'Swift', extensions: ['.swift'] },
      { value: 'kotlin', label: 'Kotlin', extensions: ['.kt', '.kts'] }
    ];
  },

  // Get supported frameworks
  getSupportedFrameworks(): Array<{ value: string; label: string; language: string }> {
    return [
      { value: 'react', label: 'React', language: 'typescript' },
      { value: 'vue', label: 'Vue', language: 'typescript' },
      { value: 'angular', label: 'Angular', language: 'typescript' },
      { value: 'svelte', label: 'Svelte', language: 'typescript' },
      { value: 'nextjs', label: 'Next.js', language: 'typescript' },
      { value: 'nuxt', label: 'Nuxt', language: 'typescript' },
      { value: 'express', label: 'Express', language: 'typescript' },
      { value: 'fastapi', label: 'FastAPI', language: 'python' },
      { value: 'django', label: 'Django', language: 'python' },
      { value: 'flask', label: 'Flask', language: 'python' }
    ];
  }
};
