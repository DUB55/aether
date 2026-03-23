# Aether Platform - Usage Examples

Complete examples showing how to use all features of the Aether platform.

## Table of Contents
1. [Basic Setup](#basic-setup)
2. [WebContainer & File Operations](#webcontainer--file-operations)
3. [Dependency Management](#dependency-management)
4. [Live Preview](#live-preview)
5. [AI Error Fixing](#ai-error-fixing)
6. [Version Control](#version-control)
7. [Deployment](#deployment)
8. [Terminal](#terminal)
9. [Collaboration](#collaboration)
10. [Complete Workflow](#complete-workflow)

## Basic Setup

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Run Tests
```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

## WebContainer & File Operations

### Initialize WebContainer
```typescript
import { useWebContainerManager } from '@/hooks/use-webcontainer-manager';

function MyComponent() {
  const { boot, isReady, writeFile, readFile } = useWebContainerManager();

  useEffect(() => {
    async function init() {
      await boot();
      console.log('WebContainer ready!');
    }
    init();
  }, []);

  return <div>WebContainer Status: {isReady ? 'Ready' : 'Booting...'}</div>;
}
```

### Write Files
```typescript
// Write a single file
await writeFile('src/App.tsx', `
  import React from 'react';
  
  export default function App() {
    return <div>Hello World</div>;
  }
`);

// Write multiple files
const files = {
  'src/index.tsx': indexCode,
  'src/App.tsx': appCode,
  'src/styles.css': cssCode
};

for (const [path, content] of Object.entries(files)) {
  await writeFile(path, content);
}
```

### Read Files
```typescript
const content = await readFile('src/App.tsx');
console.log(content);
```

### List Files
```typescript
const files = await listFiles('src');
console.log('Files in src:', files);
```

## Dependency Management

### Auto-detect and Install
```typescript
import { useDependencyManager } from '@/hooks/use-dependency-manager';

function DependencyPanel() {
  const { detectAndInstall, isInstalling, logs } = useDependencyManager();

  const handleInstall = async () => {
    const code = `
      import React from 'react';
      import axios from 'axios';
      import { Button } from '@radix-ui/react-button';
    `;
    
    await detectAndInstall(code);
  };

  return (
    <div>
      <button onClick={handleInstall}>Install Dependencies</button>
      {isInstalling && <div>Installing...</div>}
      <pre>{logs.join('\n')}</pre>
    </div>
  );
}
```

### Manual Installation
```typescript
const { installPackages } = useDependencyManager();

await installPackages(['react', 'react-dom', 'axios']);
```

### Check Installation Status
```typescript
const { isInstalling, logs } = useDependencyManager();

console.log('Installing:', isInstalling);
console.log('Logs:', logs);
```

## Live Preview

### Start Preview Server
```typescript
import { PreviewFrame } from '@/components/preview-frame';

function PreviewPanel() {
  return (
    <div className="h-screen">
      <PreviewFrame 
        projectId="my-project"
        defaultViewport="desktop"
      />
    </div>
  );
}
```

### Control Preview Programmatically
```typescript
import { previewSystem } from '@/lib/preview/system';

// Start server
await previewSystem.startServer();

// Restart server
await previewSystem.restartServer();

// Stop server
await previewSystem.stopServer();

// Get preview URL
const url = previewSystem.getPreviewUrl();
```

### Monitor Errors
```typescript
previewSystem.onError((error) => {
  console.error('Preview error:', error);
});
```

## AI Error Fixing

### Enable Auto-fix
```typescript
import { fixerAgent } from '@/lib/fixer/agent';

// Enable auto-fix
fixerAgent.setAutoFix(true);

// Monitor errors
fixerAgent.onError((error) => {
  console.log('Error detected:', error);
});

// Monitor fixes
fixerAgent.onFix((fix) => {
  console.log('Fix applied:', fix);
});
```

### Manual Fix Generation
```typescript
const error = {
  type: 'build',
  message: 'Cannot find module "react"',
  file: 'src/App.tsx',
  line: 1
};

const fix = await fixerAgent.generateFix(error);
if (fix) {
  await fixerAgent.applyFix(fix);
}
```

### Get Fix Statistics
```typescript
const stats = fixerAgent.getStatistics();
console.log('Success rate:', stats.successRate);
console.log('Average time:', stats.averageTime);
```

## Version Control

### Initialize Git
```typescript
import { versionControl } from '@/lib/git/version-control';

await versionControl.init();
```

### Commit Changes
```typescript
await versionControl.commit('Initial commit');
```

### Branch Operations
```typescript
// Create branch
await versionControl.createBranch('feature/new-feature');

// Switch branch
await versionControl.switchBranch('feature/new-feature');

// List branches
const branches = await versionControl.listBranches();

// Merge branch
await versionControl.mergeBranch('feature/new-feature', 'main');
```

### View History
```typescript
const history = await versionControl.getHistory();
history.forEach(commit => {
  console.log(`${commit.oid}: ${commit.message}`);
});
```

### Time Travel
```typescript
// Checkout specific commit
await versionControl.checkout('abc123');

// Revert to previous version
await versionControl.revert('abc123');
```

### Remote Operations
```typescript
// Push to GitHub
await versionControl.push('origin', 'main');

// Pull from GitHub
await versionControl.pull('origin', 'main');
```

## Deployment

### Deploy to Vercel
```typescript
import { useDeploymentManager } from '@/hooks/use-deployment-manager';

function DeployPanel() {
  const { 
    deploy, 
    authenticateVercel, 
    isVercelAuthenticated,
    status,
    logs 
  } = useDeploymentManager();

  const handleDeploy = async () => {
    // Authenticate if needed
    if (!isVercelAuthenticated) {
      await authenticateVercel();
    }

    // Deploy
    const result = await deploy({
      platform: 'vercel',
      projectName: 'my-app',
      envVars: {
        API_KEY: 'your-api-key'
      }
    });

    if (result.success) {
      console.log('Deployed to:', result.url);
    }
  };

  return (
    <div>
      <button onClick={handleDeploy}>Deploy to Vercel</button>
      <div>Status: {status}</div>
      <pre>{logs.join('\n')}</pre>
    </div>
  );
}
```

### Deploy to Netlify
```typescript
const { deploy, authenticateNetlify } = useDeploymentManager();

await authenticateNetlify();

const result = await deploy({
  platform: 'netlify',
  projectName: 'my-app',
  buildCommand: 'npm run build',
  outputDirectory: 'dist'
});
```

## Terminal

### Basic Terminal
```typescript
import { TerminalPanel } from '@/components/terminal-panel';

function App() {
  return (
    <div className="h-screen">
      <TerminalPanel terminalId="main" />
    </div>
  );
}
```

### Execute Commands
```typescript
import { useTerminalManager } from '@/hooks/use-terminal-manager';

function CommandRunner() {
  const { executeCommand, executeNpmScript } = useTerminalManager();

  return (
    <div>
      <button onClick={() => executeCommand('ls -la')}>
        List Files
      </button>
      <button onClick={() => executeNpmScript('dev')}>
        Run Dev Server
      </button>
    </div>
  );
}
```

### Background Processes
```typescript
const { 
  startBackgroundProcess, 
  killBackgroundProcess,
  backgroundProcesses 
} = useTerminalManager();

// Start background process
const processId = await startBackgroundProcess('npm run dev');

// List processes
console.log('Running:', backgroundProcesses);

// Kill process
await killBackgroundProcess(processId);
```

## Collaboration

### Create Session
```typescript
import { useCollaboration } from '@/hooks/use-collaboration';

function CollabPanel() {
  const { 
    createSession, 
    sessionUrl, 
    collaborators,
    isInSession 
  } = useCollaboration();

  const handleCreate = async () => {
    await createSession();
    console.log('Share this URL:', sessionUrl);
  };

  return (
    <div>
      <button onClick={handleCreate}>Start Collaboration</button>
      {isInSession && (
        <div>
          <p>Session URL: {sessionUrl}</p>
          <p>Collaborators: {collaborators.length}</p>
        </div>
      )}
    </div>
  );
}
```

### Join Session
```typescript
const { joinSession } = useCollaboration();

// Get session ID from URL
const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session');

if (sessionId) {
  await joinSession(sessionId);
}
```

### Send Updates
```typescript
const { sendFileChange, sendCursorUpdate } = useCollaboration();

// Send file change
sendFileChange('src/App.tsx', {
  type: 'insert',
  position: 100,
  content: 'new code',
  timestamp: Date.now(),
  userId: 'user-123'
});

// Send cursor position
sendCursorUpdate({ line: 10, column: 5 });
```

### Monitor Collaborators
```typescript
const { collaborators, onMessage } = useCollaboration();

// Display collaborators
collaborators.forEach(collab => {
  console.log(`${collab.name} (${collab.color})`);
});

// Listen for messages
onMessage((message) => {
  if (message.type === 'user-joined') {
    console.log('User joined:', message.data.name);
  }
});
```

## Complete Workflow

Here's a complete example showing how to use all features together:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useWebContainerManager } from '@/hooks/use-webcontainer-manager';
import { useDependencyManager } from '@/hooks/use-dependency-manager';
import { useDeploymentManager } from '@/hooks/use-deployment-manager';
import { useCollaboration } from '@/hooks/use-collaboration';
import { PreviewFrame } from '@/components/preview-frame';
import { TerminalPanel } from '@/components/terminal-panel';
import { versionControl } from '@/lib/git/version-control';
import { fixerAgent } from '@/lib/fixer/agent';

export default function CompleteWorkflow() {
  const [status, setStatus] = useState('Initializing...');
  
  // Hooks
  const webContainer = useWebContainerManager();
  const dependencies = useDependencyManager();
  const deployment = useDeploymentManager();
  const collaboration = useCollaboration();

  useEffect(() => {
    initializeProject();
  }, []);

  async function initializeProject() {
    try {
      // 1. Boot WebContainer
      setStatus('Booting WebContainer...');
      await webContainer.boot();

      // 2. Create project files
      setStatus('Creating files...');
      await webContainer.writeFile('package.json', JSON.stringify({
        name: 'my-app',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build'
        }
      }, null, 2));

      await webContainer.writeFile('src/App.tsx', `
        import React from 'react';
        import { Button } from '@radix-ui/react-button';
        
        export default function App() {
          return (
            <div>
              <h1>Hello Aether!</h1>
              <Button>Click me</Button>
            </div>
          );
        }
      `);

      // 3. Install dependencies
      setStatus('Installing dependencies...');
      await dependencies.detectAndInstall(
        await webContainer.readFile('src/App.tsx')
      );

      // 4. Initialize Git
      setStatus('Initializing Git...');
      await versionControl.init();
      await versionControl.commit('Initial commit');

      // 5. Enable auto-fix
      setStatus('Enabling auto-fix...');
      fixerAgent.setAutoFix(true);

      // 6. Start preview
      setStatus('Starting preview...');
      // Preview will start automatically via PreviewFrame component

      // 7. Create collaboration session (optional)
      // await collaboration.createSession();

      setStatus('Ready!');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  }

  async function handleDeploy() {
    if (!deployment.isVercelAuthenticated) {
      await deployment.authenticateVercel();
    }

    const result = await deployment.deploy({
      platform: 'vercel',
      projectName: 'my-app'
    });

    if (result.success) {
      alert(`Deployed to: ${result.url}`);
    }
  }

  async function handleCommit() {
    await versionControl.commit('Update code');
    alert('Changes committed!');
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Aether Workspace</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{status}</span>
          <button 
            onClick={handleCommit}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Commit
          </button>
          <button 
            onClick={handleDeploy}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Deploy
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left: Editor (you would add Monaco here) */}
        <div className="w-1/2 border-r">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Editor</h2>
            {/* Monaco Editor would go here */}
          </div>
        </div>

        {/* Right: Preview & Terminal */}
        <div className="w-1/2 flex flex-col">
          {/* Preview */}
          <div className="h-2/3 border-b">
            <PreviewFrame projectId="my-app" />
          </div>

          {/* Terminal */}
          <div className="h-1/3">
            <TerminalPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Testing

### Run Tests
```bash
# Watch mode
npm test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# UI mode
npm run test:ui
```

### Write Tests
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Always Boot WebContainer First
```typescript
await webContainer.boot();
// Then do other operations
```

### 2. Handle Errors Gracefully
```typescript
try {
  await webContainer.writeFile('file.txt', content);
} catch (error) {
  console.error('Failed to write file:', error);
}
```

### 3. Use Auto-fix for Development
```typescript
fixerAgent.setAutoFix(true);
```

### 4. Commit Regularly
```typescript
await versionControl.commit('Descriptive message');
```

### 5. Monitor Installation Progress
```typescript
const { logs } = useDependencyManager();
console.log(logs.join('\n'));
```

## Troubleshooting

### WebContainer Won't Boot
- Check browser compatibility (needs SharedArrayBuffer)
- Ensure HTTPS or localhost
- Check browser console for errors

### Dependencies Won't Install
- Check internet connection
- Verify package names are correct
- Check npm registry is accessible

### Preview Not Loading
- Ensure dev server is running
- Check for build errors
- Verify port is not blocked

### Deployment Fails
- Verify authentication tokens
- Check build succeeds locally
- Review deployment logs

---

For more information, see:
- [Implementation Progress](./IMPLEMENTATION_PROGRESS.md)
- [Build Summary](./BUILD_SUMMARY.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Features Complete](./FEATURES_COMPLETE.md)
