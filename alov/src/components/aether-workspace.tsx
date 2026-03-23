/**
 * Aether Workspace Component
 * Main workspace integrating all features: WebContainer, Preview, Git, AI
 */

'use client';

import { useState, useEffect } from 'react';
import { PreviewFrame } from './preview-frame';
import { SettingsPanel } from './ai-settings/settings-panel';
import { useWebContainerManager } from '@/hooks/use-webcontainer-manager';
import { useDependencyManager } from '@/hooks/use-dependency-manager';
import { previewSystem } from '@/lib/preview/system';
import { fixerAgent } from '@/lib/fixer/agent';
import { versionControl } from '@/lib/git/version-control';
import { getAIServiceManager } from '@/lib/ai/ai-service-manager';
import { 
  Play, 
  Square, 
  GitBranch, 
  Package, 
  Wrench,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AetherWorkspaceProps {
  projectId: string;
  initialFiles?: Record<string, string>;
}

export function AetherWorkspace({ projectId, initialFiles = {} }: AetherWorkspaceProps) {
  const webContainer = useWebContainerManager();
  const dependencies = useDependencyManager();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [gitInitialized, setGitInitialized] = useState(false);
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [showAISettings, setShowAISettings] = useState(false);
  const [aiBackendType, setAiBackendType] = useState<string | null>(null);

  // Initialize workspace
  useEffect(() => {
    initializeWorkspace();
    initializeAIService();
  }, []);

  // Initialize AI Service
  const initializeAIService = async () => {
    try {
      const aiServiceManager = getAIServiceManager();
      await aiServiceManager.initialize();
      setAiBackendType(aiServiceManager.getCurrentBackendType());
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  };

  // Monitor for errors and auto-fix
  useEffect(() => {
    if (!autoFixEnabled) return;

    const handleBuildError = async (error: any) => {
      setStatusMessage('Error detected, attempting auto-fix...');
      
      const result = await fixerAgent.handleError({
        type: 'build',
        message: error.message,
        file: error.file || '',
        line: error.line || 0,
        column: error.column || 0,
        stack: error.stack || ''
      });

      if (result.success) {
        setStatusMessage('Error fixed successfully!');
        setTimeout(() => setStatusMessage('Ready'), 2000);
      } else {
        setStatusMessage('Auto-fix failed, manual intervention needed');
      }
    };

    previewSystem.on('build-error', handleBuildError);
    fixerAgent.startMonitoring();

    return () => {
      previewSystem.off('build-error', handleBuildError);
      fixerAgent.stopMonitoring();
    };
  }, [autoFixEnabled]);

  /**
   * Initialize the workspace with all components
   */
  const initializeWorkspace = async () => {
    try {
      setStatusMessage('Booting WebContainer...');
      
      // Wait for WebContainer to be ready
      if (!webContainer.isReady) {
        await new Promise(resolve => {
          const checkReady = setInterval(() => {
            if (webContainer.isReady) {
              clearInterval(checkReady);
              resolve(true);
            }
          }, 100);
        });
      }

      setStatusMessage('Setting up project files...');
      
      // Write initial files
      for (const [path, content] of Object.entries(initialFiles)) {
        await webContainer.writeFile(path, content);
      }

      // Create default project structure if empty
      if (Object.keys(initialFiles).length === 0) {
        await createDefaultProject();
      }

      setStatusMessage('Installing dependencies...');
      
      // Install dependencies
      const installResult = await dependencies.installAll();
      
      if (!installResult.success) {
        setStatusMessage('Dependency installation failed');
        return;
      }

      setStatusMessage('Initializing Git repository...');
      
      // Initialize Git
      try {
        await versionControl.init();
        await versionControl.commit('Initial commit', ['package.json']);
        setGitInitialized(true);
      } catch (error) {
        console.warn('Git initialization failed:', error);
      }

      setStatusMessage('Starting development server...');
      
      // Start preview server
      await previewSystem.startDevServer();
      setIsServerRunning(true);

      setStatusMessage('Ready');
      setIsInitialized(true);
    } catch (error) {
      console.error('Workspace initialization failed:', error);
      setStatusMessage(`Initialization failed: ${error}`);
    }
  };

  /**
   * Create a default project structure
   */
  const createDefaultProject = async () => {
    const files = {
      'package.json': JSON.stringify({
        name: 'aether-project',
        version: '0.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          '@vitejs/plugin-react': '^4.2.0',
          typescript: '^5.3.0',
          vite: '^5.0.0'
        }
      }, null, 2),
      'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
  }
})`,
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
          strict: true
        },
        include: ['src']
      }, null, 2),
      'index.html': `<!DOCTYPE html>
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
</html>`,
      'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
      'src/App.tsx': `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Welcome to Aether</h1>
      <p>Your AI-powered development platform</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
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
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}

button:hover {
  background: #f0f0f0;
}`
    };

    for (const [path, content] of Object.entries(files)) {
      await webContainer.writeFile(path, content);
    }
  };

  /**
   * Toggle dev server
   */
  const toggleServer = async () => {
    if (isServerRunning) {
      await previewSystem.stopDevServer();
      setIsServerRunning(false);
      setStatusMessage('Server stopped');
    } else {
      await previewSystem.startDevServer();
      setIsServerRunning(true);
      setStatusMessage('Server started');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {webContainer.isBooting ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : webContainer.isReady ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>

          {gitInitialized && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="w-4 h-4" />
              <span>main</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAISettings(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors bg-muted hover:bg-muted/80"
          >
            <Settings className="w-4 h-4" />
            AI ({aiBackendType === 'chrome-extension' ? 'Extension' : 'DUB5'})
          </button>

          <button
            onClick={() => setAutoFixEnabled(!autoFixEnabled)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              autoFixEnabled 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Wrench className="w-4 h-4" />
            Auto-Fix {autoFixEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={toggleServer}
            disabled={!isInitialized}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              isServerRunning
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
              !isInitialized && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isServerRunning ? (
              <>
                <Square className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isInitialized ? (
          <PreviewFrame />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">{statusMessage}</p>
              {dependencies.isInstalling && (
                <div className="mt-4 max-w-md">
                  <div className="text-sm text-muted-foreground space-y-1">
                    {dependencies.installLogs.slice(-5).map((log, i) => (
                      <div key={i} className="truncate">{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Settings Panel */}
      <SettingsPanel
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
        onSettingsChange={async (settings) => {
          try {
            const aiServiceManager = getAIServiceManager();
            await aiServiceManager.updateSettings(settings);
            setAiBackendType(aiServiceManager.getCurrentBackendType());
          } catch (error) {
            console.error('Failed to update AI settings:', error);
          }
        }}
      />
    </div>
  );
}
