/**
 * Enhanced Builder Agent with Component Library Intelligence
 * Generates code with awareness of popular component libraries using dual AI backends
 */

import { getAIServiceManager } from '@/lib/ai/ai-service-manager';
import { webContainerManager } from '@/lib/webcontainer/manager';

export type ComponentLibrary = 'shadcn' | 'radix' | 'mui' | 'chakra' | 'none';

export interface ComponentSpec {
  name: string;
  description: string;
  props: PropDefinition[];
  library: ComponentLibrary;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface GeneratedCode {
  files: Record<string, string>;
  dependencies: string[];
  instructions: string;
}

export class EnhancedBuilderAgent {
  private static instance: EnhancedBuilderAgent | null = null;
  private currentLibrary: ComponentLibrary = 'shadcn';

  private constructor() {}

  static getInstance(): EnhancedBuilderAgent {
    if (!EnhancedBuilderAgent.instance) {
      EnhancedBuilderAgent.instance = new EnhancedBuilderAgent();
    }
    return EnhancedBuilderAgent.instance;
  }

  /**
   * Set the component library to use
   */
  setComponentLibrary(library: ComponentLibrary): void {
    this.currentLibrary = library;
  }

  /**
   * Get the current component library
   */
  getCurrentLibrary(): ComponentLibrary {
    return this.currentLibrary;
  }

  /**
   * Generate a component using the current AI backend
   */
  async generateComponent(spec: ComponentSpec): Promise<GeneratedCode> {
    const prompt = this.buildComponentPrompt(spec);

    try {
      // Use AI Service Manager instead of direct DUB5AIService
      const aiServiceManager = getAIServiceManager();
      const response = await aiServiceManager.streamRequest({
        messages: [{ role: 'user', content: prompt }]
      });

      return this.parseGeneratedCode(response);
    } catch (error) {
      console.error('[Builder] Component generation failed:', error);
      throw error;
    }
  }

  /**
   * Build prompt for component generation
   */
  private buildComponentPrompt(spec: ComponentSpec): string {
    const propsStr = spec.props
      .map(p => `- ${p.name}: ${p.type}${p.required ? ' (required)' : ' (optional)'} - ${p.description}`)
      .join('\n');

    const systemPrompt = this.getLibrarySystemPrompt(spec.library);

    return `${systemPrompt}

Create a React component with the following specifications:

COMPONENT NAME: ${spec.name}
DESCRIPTION: ${spec.description}
LIBRARY: ${spec.library}

PROPS:
${propsStr}

Requirements:
1. Use TypeScript with proper type definitions
2. Follow ${spec.library} component patterns
3. Include proper imports
4. Add JSDoc comments
5. Implement accessibility features
6. Use modern React patterns (hooks, functional components)
7. Include error handling where appropriate

Return the complete component code with all necessary imports.`;
  }

  /**
   * Get system prompt for specific library
   */
  private getLibrarySystemPrompt(library: ComponentLibrary): string {
    const basePrompt = `You are an expert React developer specializing in component development.
Generate clean, type-safe, accessible code following best practices.

IMPORTANT: Return code in this format:
FILE: [filename]
\`\`\`typescript
[code]
\`\`\`

DEPENDENCIES: [comma-separated list]

INSTRUCTIONS: [setup instructions]`;

    const libraryPrompts: Record<ComponentLibrary, string> = {
      shadcn: `${basePrompt}

SHADCN/UI GUIDELINES:
- Use components from @/components/ui
- Follow shadcn/ui naming conventions
- Use Tailwind CSS for styling
- Implement proper variant patterns
- Use class-variance-authority for variants
- Include proper TypeScript types`,

      radix: `${basePrompt}

RADIX UI GUIDELINES:
- Use Radix UI primitives (@radix-ui/react-*)
- Implement proper accessibility
- Use compound components pattern
- Handle keyboard navigation
- Implement proper ARIA attributes`,

      mui: `${basePrompt}

MATERIAL-UI GUIDELINES:
- Use @mui/material components
- Follow Material Design principles
- Use sx prop for styling
- Implement proper theming
- Use Material icons`,

      chakra: `${basePrompt}

CHAKRA UI GUIDELINES:
- Use @chakra-ui/react components
- Follow Chakra design system
- Use style props
- Implement proper theming
- Use Chakra icons`,

      none: basePrompt
    };

    return libraryPrompts[library];
  }

  /**
   * Parse generated code from AI response
   */
  private parseGeneratedCode(response: string): GeneratedCode {
    const files: Record<string, string> = {};
    const dependencies: string[] = [];
    let instructions = '';

    // Extract files
    const fileMatches = response.matchAll(/FILE:\s*(.+?)\n```[\w]*\n([\s\S]*?)```/g);
    for (const match of fileMatches) {
      const filename = match[1].trim();
      const code = match[2].trim();
      files[filename] = code;
    }

    // Extract dependencies
    const depsMatch = response.match(/DEPENDENCIES:\s*(.+)/);
    if (depsMatch) {
      dependencies.push(...depsMatch[1].split(',').map(d => d.trim()).filter(Boolean));
    }

    // Extract instructions
    const instructMatch = response.match(/INSTRUCTIONS:\s*([\s\S]*?)(?=\n\n|$)/);
    if (instructMatch) {
      instructions = instructMatch[1].trim();
    }

    return { files, dependencies, instructions };
  }

  /**
   * Generate imports for a component library
   */
  async generateImports(library: ComponentLibrary, components: string[]): Promise<string> {
    const importMap: Record<ComponentLibrary, (components: string[]) => string> = {
      shadcn: (comps) => comps.map(c => `import { ${c} } from '@/components/ui/${c.toLowerCase()}'`).join('\n'),
      radix: (comps) => comps.map(c => `import * as ${c} from '@radix-ui/react-${c.toLowerCase()}'`).join('\n'),
      mui: (comps) => `import { ${comps.join(', ')} } from '@mui/material'`,
      chakra: (comps) => `import { ${comps.join(', ')} } from '@chakra-ui/react'`,
      none: () => ''
    };

    return importMap[library](components);
  }

  /**
   * Generate configuration files for a library
   */
  async generateLibraryConfig(library: ComponentLibrary): Promise<Record<string, string>> {
    const configs: Record<ComponentLibrary, Record<string, string>> = {
      shadcn: {
        'components.json': JSON.stringify({
          $schema: 'https://ui.shadcn.com/schema.json',
          style: 'default',
          rsc: false,
          tsx: true,
          tailwind: {
            config: 'tailwind.config.ts',
            css: 'src/app/globals.css',
            baseColor: 'slate',
            cssVariables: true
          },
          aliases: {
            components: '@/components',
            utils: '@/lib/utils'
          }
        }, null, 2)
      },
      radix: {},
      mui: {
        'theme.ts': `import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});`
      },
      chakra: {
        'theme.ts': `import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#f7fafc',
      500: '#1a202c',
      900: '#171923',
    },
  },
});`
      },
      none: {}
    };

    return configs[library];
  }

  /**
   * Detect which component library is being used in a project
   */
  async detectComponentLibrary(): Promise<ComponentLibrary> {
    try {
      const packageJson = await webContainerManager.readFile('package.json');
      const pkg = JSON.parse(packageJson);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['@radix-ui/react-slot'] || deps['class-variance-authority']) {
        return 'shadcn';
      }
      if (Object.keys(deps).some(d => d.startsWith('@radix-ui/'))) {
        return 'radix';
      }
      if (deps['@mui/material']) {
        return 'mui';
      }
      if (deps['@chakra-ui/react']) {
        return 'chakra';
      }

      return 'none';
    } catch (error) {
      return 'none';
    }
  }

  /**
   * Ensure library consistency across the project
   */
  async ensureLibraryConsistency(library: ComponentLibrary): Promise<void> {
    // Update package.json with required dependencies
    const requiredDeps: Record<ComponentLibrary, Record<string, string>> = {
      shadcn: {
        '@radix-ui/react-slot': '^1.0.0',
        'class-variance-authority': '^0.7.0',
        'clsx': '^2.0.0',
        'tailwind-merge': '^2.0.0'
      },
      radix: {},
      mui: {
        '@mui/material': '^5.14.0',
        '@emotion/react': '^11.11.0',
        '@emotion/styled': '^11.11.0'
      },
      chakra: {
        '@chakra-ui/react': '^2.8.0',
        '@emotion/react': '^11.11.0',
        '@emotion/styled': '^11.11.0',
        'framer-motion': '^10.16.0'
      },
      none: {}
    };

    const deps = requiredDeps[library];
    if (Object.keys(deps).length > 0) {
      try {
        const packageJson = await webContainerManager.readFile('package.json');
        const pkg = JSON.parse(packageJson);
        pkg.dependencies = { ...pkg.dependencies, ...deps };
        await webContainerManager.writeFile('package.json', JSON.stringify(pkg, null, 2));
      } catch (error) {
        console.error('[Builder] Failed to update dependencies:', error);
      }
    }
  }
}

export const enhancedBuilderAgent = EnhancedBuilderAgent.getInstance();