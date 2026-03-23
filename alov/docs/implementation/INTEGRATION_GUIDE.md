# Aether Platform - Integration Guide

## Quick Start

### 1. Use the Workspace Component

The easiest way to use all features is through the `AetherWorkspace` component:

```typescript
import { AetherWorkspace } from '@/components/aether-workspace';

export default function EditorPage() {
  return (
    <AetherWorkspace 
      projectId="my-project"
      initialFiles={{
        'src/App.tsx': '// Your code here',
        'package.json': '{ "name": "my-app" }'
      }}
    />
  );
}
```

This gives you:
- ✅ WebContainer initialization
- ✅ Dependency management
- ✅ Live preview
- ✅ Auto-fix
- ✅ Git integration
- ✅ Status monitoring

### 2. Individual Component Usage

If you need more control, use components individually:

#### WebContainer

```typescript
import { useWebContainerManager } from '@/hooks/use-webcontainer-manager';

function MyComponent() {
  const { isReady, writeFile, readFile, exec } = useWebContainerManager();

  const createFile = async () => {
    await writeFile('src/App.tsx', 'export default function App() {}');
  };

  const runCommand = async () => {
    const result = await exec('npm', ['install']);
    console.log(result.stdout);
  };

  return (
    <div>
      {isReady ? 'Ready!' : 'Loading...'}
      <button onClick={createFile}>Create File</button>
      <button onClick={runCommand}>Run Command</button>
    </div>
  );
}
```

#### Dependencies

```typescript
import { useDependencyManager } from '@/hooks/use-dependency-manager';

function DependencyPanel() {
  const { 
    isInstalling, 
    installLogs, 
    install, 
    detectDependencies 
  } = useDependencyManager();

  const installPackages = async () => {
    const result = await install(['react', 'react-dom']);
    if (result.success) {
      console.log('Installed:', result.installedPackages);
    }
  };

  return (
    <div>
      {isInstalling && <div>Installing...</div>}
      {installLogs.map((log, i) => <div key={i}>{log}</div>)}
      <button onClick={installPackages}>Install React</button>
    </div>
  );
}
```

#### Preview

```typescript
import { PreviewFrame } from '@/components/preview-frame';
import { previewSystem } from '@/lib/preview/system';

function PreviewPanel() {
  const startServer = async () => {
    await previewSystem.startDevServer();
  };

  const setMobile = () => {
    previewSystem.setDevicePreset('mobile');
  };

  return (
    <div>
      <button onClick={startServer}>Start Server</button>
      <button onClick={setMobile}>Mobile View</button>
      <PreviewFrame />
    </div>
  );
}
```

#### Error Fixing

```typescript
import { fixerAgent } from '@/lib/fixer/agent';

function ErrorFixPanel() {
  const [autoFix, setAutoFix] = useState(true);

  useEffect(() => {
    if (autoFix) {
      fixerAgent.startMonitoring();
    } else {
      fixerAgent.stopMonitoring();
    }
  }, [autoFix]);

  const handleError = async (error) => {
    const result = await fixerAgent.handleError({
      type: 'build',
      message: error.message,
      file: error.file,
      line: error.line,
      column: error.column,
      stack: error.stack
    });

    if (result.success) {
      console.log('Fixed!', result.fix);
    }
  };

  const stats = fixerAgent.getFixStats();

  return (
    <div>
      <button onClick={() => setAutoFix(!autoFix)}>
        Auto-Fix: {autoFix ? 'ON' : 'OFF'}
      </button>
      <div>Success Rate: {stats.successRate}%</div>
      <div>Fixed: {stats.fixedErrors}/{stats.totalErrors}</div>
    </div>
  );
}
```

#### Version Control

```typescript
import { versionControl } from '@/lib/git/version-control';

function GitPanel() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const initGit = async () => {
    await versionControl.init();
    await updateStatus();
  };

  const updateStatus = async () => {
    const s = await versionControl.getStatus();
    setStatus(s);
  };

  const commit = async () => {
    await versionControl.commit('My commit', status.modified);
    await updateStatus();
    await loadHistory();
  };

  const loadHistory = async () => {
    const h = await versionControl.getHistory(10);
    setHistory(h);
  };

  return (
    <div>
      <button onClick={initGit}>Init Git</button>
      <button onClick={commit}>Commit Changes</button>
      
      {status && (
        <div>
          <div>Branch: {status.branch}</div>
          <div>Modified: {status.modified.length}</div>
          <div>Added: {status.added.length}</div>
        </div>
      )}

      <div>
        {history.map(commit => (
          <div key={commit.hash}>
            {commit.message} - {commit.author}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Component Generation

```typescript
import { enhancedBuilderAgent } from '@/lib/builder/enhanced-agent';

function ComponentGenerator() {
  const [library, setLibrary] = useState('shadcn');

  const generateComponent = async () => {
    enhancedBuilderAgent.setComponentLibrary(library);

    const code = await enhancedBuilderAgent.generateComponent({
      name: 'Button',
      description: 'A reusable button component',
      props: [
        { name: 'onClick', type: '() => void', required: true, description: 'Click handler' },
        { name: 'children', type: 'ReactNode', required: true, description: 'Button content' },
        { name: 'variant', type: 'string', required: false, description: 'Button style' }
      ],
      library
    });

    console.log('Generated:', code.files);
    console.log('Dependencies:', code.dependencies);
    console.log('Instructions:', code.instructions);
  };

  return (
    <div>
      <select value={library} onChange={(e) => setLibrary(e.target.value)}>
        <option value="shadcn">Shadcn/ui</option>
        <option value="radix">Radix UI</option>
        <option value="mui">Material-UI</option>
        <option value="chakra">Chakra UI</option>
      </select>
      <button onClick={generateComponent}>Generate Component</button>
    </div>
  );
}
```

## Advanced Usage

### Custom Project Initialization

```typescript
import { webContainerManager } from '@/lib/webcontainer/manager';
import { dependencyManager } from '@/lib/dependencies/manager';
import { versionControl } from '@/lib/git/version-control';
import { previewSystem } from '@/lib/preview/system';

async function initializeCustomProject() {
  // 1. Boot WebContainer
  await webContainerManager.initialize();

  // 2. Create project structure
  const files = {
    'package.json': JSON.stringify({
      name: 'my-app',
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      }
    }, null, 2),
    'src/App.tsx': 'export default function App() { return <div>Hello</div> }',
    'index.html': '<!DOCTYPE html><html>...</html>'
  };

  for (const [path, content] of Object.entries(files)) {
    await webContainerManager.writeFile(path, content);
  }

  // 3. Install dependencies
  await dependencyManager.installAll((log) => {
    console.log('Install:', log);
  });

  // 4. Initialize Git
  await versionControl.init();
  await versionControl.commit('Initial commit', Object.keys(files));

  // 5. Start preview
  await previewSystem.startDevServer();

  console.log('Project initialized!');
}
```

### AI Code Generation with DUB5

```typescript
import { DUB5AIService } from '@/lib/dub5ai';

async function generateCodeWithAI(prompt: string) {
  const systemPrompt = `You are an expert React developer.
Generate clean, type-safe code following best practices.

Return code in this format:
FILE: [filename]
\`\`\`typescript
[code]
\`\`\``;

  const response = await DUB5AIService.streamRequest({
    messages: [{ role: 'user', content: prompt }],
    systemPrompt,
    onChunk: (chunk) => {
      console.log('Streaming:', chunk);
    }
  });

  // Parse response and extract files
  const fileMatches = response.matchAll(/FILE:\s*(.+?)\n```[\w]*\n([\s\S]*?)```/g);
  const files = {};
  
  for (const match of fileMatches) {
    files[match[1].trim()] = match[2].trim();
  }

  return files;
}

// Usage
const files = await generateCodeWithAI('Create a todo list component');
for (const [path, content] of Object.entries(files)) {
  await webContainerManager.writeFile(path, content);
}
```

### Error Monitoring and Auto-Fix

```typescript
import { previewSystem } from '@/lib/preview/system';
import { fixerAgent } from '@/lib/fixer/agent';

function setupAutoFix() {
  // Start monitoring
  fixerAgent.startMonitoring();

  // Listen for build errors
  previewSystem.on('build-error', async (error) => {
    console.log('Error detected:', error.message);

    // Attempt to fix
    const result = await fixerAgent.handleError({
      type: 'build',
      message: error.message,
      file: error.file,
      line: error.line,
      column: error.column,
      stack: error.stack
    });

    if (result.success) {
      console.log('Fixed successfully!');
      console.log('Fix description:', result.fix.description);
      console.log('Confidence:', result.fix.confidence);
    } else {
      console.log('Fix failed:', result.error);
    }
  });

  // Listen for runtime errors
  window.addEventListener('message', async (event) => {
    if (event.data.type === 'runtime-error') {
      const error = event.data.error;
      await fixerAgent.handleError({
        type: 'runtime',
        message: error.message,
        file: '',
        line: 0,
        column: 0,
        stack: error.stack
      });
    }
  });
}
```

### Git Workflow

```typescript
import { versionControl } from '@/lib/git/version-control';

async function gitWorkflow() {
  // Initialize
  await versionControl.init();

  // Make changes and commit
  await versionControl.commit('Add new feature', ['src/Feature.tsx']);

  // Create feature branch
  await versionControl.createBranch('feature/new-feature');
  await versionControl.switchBranch('feature/new-feature');

  // Make more changes
  await versionControl.commit('Implement feature', ['src/Feature.tsx']);

  // Merge back to main
  await versionControl.switchBranch('main');
  const result = await versionControl.mergeBranch('feature/new-feature', 'main');

  if (result.success) {
    console.log('Merged successfully!');
  } else {
    console.log('Conflicts:', result.conflicts);
  }

  // Push to GitHub
  await versionControl.addRemote('origin', 'https://github.com/user/repo.git');
  await versionControl.push('origin', 'main');

  // View history
  const history = await versionControl.getHistory(10);
  history.forEach(commit => {
    console.log(`${commit.hash.slice(0, 7)} - ${commit.message}`);
  });
}
```

## Event Handling

### WebContainer Events

```typescript
webContainerManager.onServerReady((port, url) => {
  console.log(`Server ready at ${url}`);
});

webContainerManager.onError((error) => {
  console.error('WebContainer error:', error);
});
```

### Preview Events

```typescript
previewSystem.on('ready', (url) => {
  console.log('Preview ready:', url);
});

previewSystem.on('build-error', (error) => {
  console.error('Build error:', error);
});

previewSystem.on('viewport-change', (viewport) => {
  console.log('Viewport:', viewport);
});

previewSystem.on('status-change', (status) => {
  console.log('Status:', status);
});
```

### Fixer Events

```typescript
fixerAgent.on('monitoring-started', () => {
  console.log('Auto-fix enabled');
});

fixerAgent.on('fix-applied', ({ error, fix }) => {
  console.log('Fix applied:', fix.description);
});

fixerAgent.on('fix-written', (fix) => {
  console.log('Fix written to files');
});
```

## Best Practices

### 1. Always Check WebContainer Ready State

```typescript
const { isReady, isBooting } = useWebContainerManager();

if (isBooting) {
  return <div>Booting WebContainer...</div>;
}

if (!isReady) {
  return <div>WebContainer not ready</div>;
}

// Safe to use WebContainer
```

### 2. Handle Errors Gracefully

```typescript
try {
  await webContainerManager.writeFile('src/App.tsx', code);
} catch (error) {
  console.error('Failed to write file:', error);
  // Show user-friendly error message
}
```

### 3. Stream Progress for Long Operations

```typescript
await dependencyManager.install(packages, (log) => {
  // Update UI with progress
  setInstallLog(prev => [...prev, log]);
});
```

### 4. Clean Up Resources

```typescript
useEffect(() => {
  fixerAgent.startMonitoring();
  
  return () => {
    fixerAgent.stopMonitoring();
  };
}, []);
```

### 5. Use Debouncing for Frequent Updates

```typescript
import { debounce } from 'lodash';

const debouncedSave = debounce(async (content) => {
  await webContainerManager.writeFile('src/App.tsx', content);
}, 500);

// Usage
onChange={(e) => debouncedSave(e.target.value)}
```

## Troubleshooting

### WebContainer Won't Boot

```typescript
// Check browser compatibility
if (!crossOriginIsolated) {
  console.error('WebContainer requires cross-origin isolation');
  // Show error to user
}

// Retry boot
try {
  await webContainerManager.initialize();
} catch (error) {
  console.error('Boot failed:', error);
  // Try again or show error
}
```

### Dependencies Won't Install

```typescript
// Check network connection
if (!navigator.onLine) {
  console.error('No internet connection');
  return;
}

// Retry with exponential backoff
let retries = 3;
while (retries > 0) {
  const result = await dependencyManager.install(packages);
  if (result.success) break;
  retries--;
  await new Promise(r => setTimeout(r, 1000 * (4 - retries)));
}
```

### Preview Not Loading

```typescript
// Check server status
const server = previewSystem.getServerStatus();
if (!server || server.status !== 'ready') {
  console.log('Server not ready, restarting...');
  await previewSystem.restartDevServer();
}
```

## Performance Tips

### 1. Cache Package Installations

```typescript
// Packages are automatically cached in IndexedDB
// Clean expired cache periodically
await dependencyManager.cleanExpiredCache();
```

### 2. Lazy Load Components

```typescript
const PreviewFrame = dynamic(() => import('@/components/preview-frame'), {
  ssr: false,
  loading: () => <div>Loading preview...</div>
});
```

### 3. Debounce File Writes

```typescript
const debouncedWrite = useMemo(
  () => debounce((path, content) => {
    webContainerManager.writeFile(path, content);
  }, 300),
  []
);
```

### 4. Use Web Workers for Heavy Operations

```typescript
// For large file processing, use Web Workers
const worker = new Worker('/worker.js');
worker.postMessage({ type: 'process', data: largeFile });
worker.onmessage = (e) => {
  console.log('Processed:', e.data);
};
```

## Security Considerations

### 1. Sandbox Preview Iframe

```typescript
<iframe
  src={previewUrl}
  sandbox="allow-scripts allow-same-origin allow-forms"
  // Restrict capabilities
/>
```

### 2. Validate User Input

```typescript
function validateFileName(name: string): boolean {
  // Prevent path traversal
  if (name.includes('..')) return false;
  // Prevent absolute paths
  if (name.startsWith('/')) return false;
  return true;
}
```

### 3. Encrypt Sensitive Data

```typescript
// Use Web Crypto API for encryption
async function encryptData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  // ... encryption logic
}
```

---

**Ready to build amazing things!** 🚀
