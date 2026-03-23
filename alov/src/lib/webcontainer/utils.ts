/**
 * WebContainer utility functions
 */

import { FileSystemTree } from './types';

/**
 * Convert a flat file structure to WebContainer FileSystemTree format
 */
export function filesToFileSystemTree(files: Record<string, string>): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const [path, content] of Object.entries(files)) {
    const parts = path.split('/');
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        // It's a file
        current[part] = {
          file: {
            contents: content
          }
        };
      } else {
        // It's a directory
        if (!current[part]) {
          current[part] = {
            directory: {}
          };
        }
        current = current[part].directory!;
      }
    }
  }

  return tree;
}

/**
 * Convert WebContainer FileSystemTree to flat file structure
 */
export function fileSystemTreeToFiles(tree: FileSystemTree, prefix: string = ''): Record<string, string> {
  const files: Record<string, string> = {};

  for (const [name, node] of Object.entries(tree)) {
    const path = prefix ? `${prefix}/${name}` : name;

    if (node.file) {
      files[path] = node.file.contents;
    } else if (node.directory) {
      Object.assign(files, fileSystemTreeToFiles(node.directory, path));
    }
  }

  return files;
}

/**
 * Create a basic package.json structure
 */
export function createPackageJson(name: string, dependencies: Record<string, string> = {}): string {
  return JSON.stringify({
    name,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies,
    devDependencies: {
      vite: '^5.0.0',
      '@vitejs/plugin-react': '^4.2.0',
      typescript: '^5.3.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0'
    }
  }, null, 2);
}

/**
 * Create a basic Vite config
 */
export function createViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
  },
  optimizeDeps: {
    exclude: []
  }
})
`;
}

/**
 * Create a basic tsconfig.json
 */
export function createTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ['src']
  }, null, 2);
}

/**
 * Create a basic index.html
 */
export function createIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aether App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

/**
 * Parse npm install output for progress
 */
export function parseNpmOutput(output: string): { status: string; percent: number } {
  if (output.includes('added') || output.includes('up to date')) {
    return { status: 'Installation complete', percent: 100 };
  }
  if (output.includes('downloading')) {
    return { status: 'Downloading packages...', percent: 50 };
  }
  if (output.includes('resolving')) {
    return { status: 'Resolving dependencies...', percent: 25 };
  }
  return { status: 'Installing...', percent: 10 };
}

/**
 * Extract error information from terminal output
 */
export function extractError(output: string): { message: string; file?: string; line?: number } | null {
  // TypeScript error pattern
  const tsError = output.match(/(.+\.tsx?)\((\d+),(\d+)\): error TS\d+: (.+)/);
  if (tsError) {
    return {
      message: tsError[4],
      file: tsError[1],
      line: parseInt(tsError[2])
    };
  }

  // Vite error pattern
  const viteError = output.match(/(.+\.tsx?):(\d+):(\d+): (.+)/);
  if (viteError) {
    return {
      message: viteError[4],
      file: viteError[1],
      line: parseInt(viteError[2])
    };
  }

  // Generic error
  if (output.includes('Error:')) {
    const match = output.match(/Error: (.+)/);
    if (match) {
      return { message: match[1] };
    }
  }

  return null;
}
