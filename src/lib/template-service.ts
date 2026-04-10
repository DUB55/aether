// Template system for Aether AI
// Provides project templates for quick start

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: 'web' | 'mobile' | 'api' | 'fullstack' | 'other'
  framework: string
  language: string
  files: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
  icon?: string
}

export const templateService = {
  // Get all available templates
  getTemplates: (): ProjectTemplate[] => {
    return [
      {
        id: 'nextjs-starter',
        name: 'Next.js Starter',
        description: 'A modern Next.js application with TypeScript and Tailwind CSS',
        category: 'web',
        framework: 'nextjs',
        language: 'typescript',
        files: {
          'package.json': JSON.stringify({
            name: 'nextjs-app',
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
              lint: 'next lint'
            },
            dependencies: {
              next: 'latest',
              react: 'latest',
              'react-dom': 'latest'
            },
            devDependencies: {
              typescript: 'latest',
              '@types/node': 'latest',
              '@types/react': 'latest',
              '@types/react-dom': 'latest',
              tailwindcss: 'latest',
              autoprefixer: 'latest',
              postcss: 'latest'
            }
          }, null, 2),
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              target: 'ES2020',
              lib: ['dom', 'dom.iterable', 'esnext'],
              allowJs: true,
              skipLibCheck: true,
              strict: true,
              noEmit: true,
              esModuleInterop: true,
              module: 'esnext',
              moduleResolution: 'bundler',
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: 'preserve',
              incremental: true,
              plugins: [{ name: 'next' }]
            },
            include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
            exclude: ['node_modules']
          }, null, 2),
          'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`,
          'app/page.tsx': `export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Welcome to Next.js</h1>
      <p className="mt-4 text-gray-600">Get started by editing app/page.tsx</p>
    </main>
  )
}`,
          'app/layout.tsx': `import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
          'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,
          'tailwind.config.ts': `import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config`,
          'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
        }
      },
      {
        id: 'react-vite-starter',
        name: 'React + Vite',
        description: 'A modern React application using Vite for fast development',
        category: 'web',
        framework: 'react',
        language: 'typescript',
        files: {
          'package.json': JSON.stringify({
            name: 'react-vite-app',
            version: '0.1.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc && vite build',
              lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
              preview: 'vite preview'
            },
            dependencies: {
              react: 'latest',
              'react-dom': 'latest'
            },
            devDependencies: {
              typescript: 'latest',
              vite: 'latest',
              '@types/react': 'latest',
              '@types/react-dom': 'latest'
            }
          }, null, 2),
          'tsconfig.json': JSON.stringify({
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
            include: ['src'],
            references: [{ path: './tsconfig.node.json' }]
          }, null, 2),
          'tsconfig.node.json': JSON.stringify({
            compilerOptions: {
              composite: true,
              skipLibCheck: true,
              module: 'ESNext',
              moduleResolution: 'bundler',
              allowSyntheticDefaultImports: true
            },
            include: ['vite.config.ts']
          }, null, 2),
          'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
          'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
          'src/App.tsx': `function App() {
  return (
    <div className="App">
      <h1>Welcome to React + Vite</h1>
    </div>
  )
}

export default App`,
          'src/index.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}`,
          'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
        }
      },
      {
        id: 'vue-vite-starter',
        name: 'Vue 3 + Vite',
        description: 'A modern Vue 3 application using Vite',
        category: 'web',
        framework: 'vue',
        language: 'typescript',
        files: {
          'package.json': JSON.stringify({
            name: 'vue-vite-app',
            version: '0.1.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'vue-tsc && vite build',
              preview: 'vite preview'
            },
            dependencies: {
              vue: 'latest'
            },
            devDependencies: {
              typescript: 'latest',
              vite: 'latest',
              'vue-tsc': 'latest',
              '@vitejs/plugin-vue': 'latest'
            }
          }, null, 2),
          'vite.config.ts': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`,
          'src/main.ts': `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')`,
          'src/App.vue': `<script setup lang="ts">
</script>

<template>
  <h1>Welcome to Vue 3 + Vite</h1>
</template>

<style scoped>
</style>`,
          'src/style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`,
          'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue 3 + Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`
        }
      },
      {
        id: 'node-api-starter',
        name: 'Node.js API',
        description: 'A RESTful API using Express with TypeScript',
        category: 'api',
        framework: 'express',
        language: 'typescript',
        files: {
          'package.json': JSON.stringify({
            name: 'node-api',
            version: '1.0.0',
            main: 'dist/index.js',
            scripts: {
              dev: 'ts-node src/index.ts',
              build: 'tsc',
              start: 'node dist/index.js',
              test: 'jest'
            },
            dependencies: {
              express: 'latest',
              cors: 'latest'
            },
            devDependencies: {
              typescript: 'latest',
              '@types/express': 'latest',
              '@types/cors': 'latest',
              '@types/node': 'latest',
              'ts-node': 'latest'
            }
          }, null, 2),
          'tsconfig.json': JSON.stringify({
            compilerOptions: {
              target: 'ES2020',
              module: 'commonjs',
              lib: ['ES2020'],
              outDir: './dist',
              rootDir: './src',
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true,
              resolveJsonModule: true
            },
            include: ['src/**/*'],
            exclude: ['node_modules', 'dist']
          }, null, 2),
          'src/index.ts': `import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
        }
      },
      {
        id: 'fullstack-mern',
        name: 'MERN Stack',
        description: 'Full-stack application with MongoDB, Express, React, and Node',
        category: 'fullstack',
        framework: 'mern',
        language: 'typescript',
        files: {
          'server/package.json': JSON.stringify({
            name: 'mern-server',
            version: '1.0.0',
            scripts: {
              start: 'node dist/index.js',
              dev: 'ts-node src/index.ts'
            },
            dependencies: {
              express: 'latest',
              mongoose: 'latest',
              cors: 'latest'
            },
            devDependencies: {
              typescript: 'latest',
              '@types/express': 'latest',
              '@types/node': 'latest',
              'ts-node': 'latest'
            }
          }, null, 2),
          'server/src/index.ts': `import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern');

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
          'client/package.json': JSON.stringify({
            name: 'mern-client',
            version: '0.1.0',
            scripts: {
              dev: 'vite',
              build: 'vite build'
            },
            dependencies: {
              react: 'latest',
              'react-dom': 'latest',
              axios: 'latest'
            },
            devDependencies: {
              vite: 'latest',
              typescript: 'latest'
            }
          }, null, 2),
          'client/src/App.tsx': `import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/data')
      .then(response => setData(response.data));
  }, []);

  return (
    <div>
      <h1>MERN Stack App</h1>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default App;`
        }
      }
    ];
  },

  // Get template by ID
  getTemplateById: (id: string): ProjectTemplate | null => {
    const templates = templateService.getTemplates();
    return templates.find(t => t.id === id) || null;
  },

  // Get templates by category
  getTemplatesByCategory: (category: ProjectTemplate['category']): ProjectTemplate[] => {
    const templates = templateService.getTemplates();
    return templates.filter(t => t.category === category);
  },

  // Get templates by framework
  getTemplatesByFramework: (framework: string): ProjectTemplate[] => {
    const templates = templateService.getTemplates();
    return templates.filter(t => t.framework === framework);
  },

  // Create a new template
  createTemplate: (template: Omit<ProjectTemplate, 'id'>): ProjectTemplate => {
    const newTemplate: ProjectTemplate = {
      ...template,
      id: `template_${Date.now()}`
    };
    return newTemplate;
  },

  // Get template categories
  getCategories(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'web', label: 'Web Application', description: 'Frontend web applications' },
      { value: 'mobile', label: 'Mobile Application', description: 'Mobile apps (React Native, Flutter)' },
      { value: 'api', label: 'API', description: 'REST or GraphQL APIs' },
      { value: 'fullstack', label: 'Full Stack', description: 'Complete full-stack applications' },
      { value: 'other', label: 'Other', description: 'Other project types' }
    ];
  }
};
