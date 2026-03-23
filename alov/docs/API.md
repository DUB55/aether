# API Documentation

This document describes the API routes and endpoints in the Aether platform.

## Base URL

```
Development: http://localhost:3000
Production: https://yourdomain.com
```

## API Routes

### 1. DUB5 AI Chat

**Endpoint:** `POST /api/dub5`

**Description:** Streams AI responses for code generation.

**Request Body:**
```typescript
{
  input: string              // User prompt
  history: Array<{           // Chat history (last 8 messages)
    role: 'user' | 'assistant'
    content: string
  }>
  personality: string        // AI personality (default: "coder")
  model: string             // Model selection (default: "auto")
  custom_system_prompt?: string  // Optional custom system prompt
  session_id?: string       // Session identifier
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: {"content": "text chunk"}
data: {"content": "more text"}
data: [DONE]
```

**Example:**
```typescript
const response = await fetch('/api/dub5', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: 'Create a button component',
    history: [],
    personality: 'coder',
    model: 'auto'
  })
})

const reader = response.body.getReader()
// Process stream...
```

### 2. Agent Execution

**Endpoint:** `POST /api/agent`

**Description:** Executes AI agent tasks.

**Request Body:**
```typescript
{
  task: string              // Task description
  context?: object          // Additional context
}
```

**Response:**
```typescript
{
  success: boolean
  result?: any
  error?: string
}
```

### 3. Chat API

**Endpoint:** `POST /api/chat`

**Description:** Alternative chat endpoint.

**Request/Response:** Similar to `/api/dub5`

### 4. File Explorer

**Endpoint:** `GET /api/explorer`

**Description:** Lists files in a directory.

**Query Parameters:**
- `path` - Directory path

**Response:**
```typescript
{
  files: Array<{
    name: string
    type: 'file' | 'directory'
    path: string
  }>
}
```

**Endpoint:** `GET /api/explorer/search`

**Description:** Searches for files.

**Query Parameters:**
- `query` - Search query

**Response:**
```typescript
{
  results: Array<{
    name: string
    path: string
    matches: number
  }>
}
```

### 5. Models

**Endpoint:** `GET /api/models`

**Description:** Lists available AI models.

**Response:**
```typescript
{
  models: Array<{
    id: string
    name: string
    description: string
  }>
}
```

### 6. Run Code

**Endpoint:** `POST /api/run`

**Description:** Executes code in a sandbox.

**Request Body:**
```typescript
{
  code: string
  language: string
  files?: Record<string, string>
}
```

**Response:**
```typescript
{
  success: boolean
  output?: string
  error?: string
}
```

### 7. OAuth Callbacks

#### Vercel OAuth

**Endpoint:** `GET /api/auth/vercel/callback`

**Description:** Handles Vercel OAuth callback.

**Query Parameters:**
- `code` - Authorization code
- `state` - State parameter

**Response:** Redirects to editor with token

#### Netlify OAuth

**Endpoint:** `GET /api/auth/netlify/callback`

**Description:** Handles Netlify OAuth callback.

**Query Parameters:**
- `code` - Authorization code
- `state` - State parameter

**Response:** Redirects to editor with token

## Client-Side APIs

### Storage API

**Description:** Browser-based storage for projects.

```typescript
import { storage } from '@/lib/storage'

// Get all projects
const projects = await storage.getProjects()

// Get single project
const project = await storage.getProject(id)

// Save project
await storage.saveProject(project)

// Delete project
await storage.deleteProject(id)
```

### Deployment Manager

**Description:** Manages deployments to Vercel/Netlify.

```typescript
import { DeploymentManager } from '@/lib/deployment/manager'

const manager = DeploymentManager.getInstance()

// Check authentication
const isAuth = manager.isAuthenticated('vercel')

// Authenticate
const success = await manager.authenticateVercel()

// Deploy
const result = await manager.deploy({
  platform: 'vercel',
  projectName: 'my-project',
  envVars: {}
})
```

### WebContainer Manager

**Description:** Manages WebContainer instances.

```typescript
import { WebContainerManager } from '@/lib/webcontainer/manager'

const manager = WebContainerManager.getInstance()

// Boot container
await manager.boot()

// Write file
await manager.writeFile('index.html', '<h1>Hello</h1>')

// Read file
const content = await manager.readFile('index.html')

// Spawn process
const process = await manager.spawn('npm install')
```

## Error Handling

All API endpoints return errors in this format:

```typescript
{
  error: string           // Error message
  code?: string          // Error code
  details?: any          // Additional details
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- DUB5 AI: 60 requests per minute
- Other endpoints: 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1234567890
```

## Authentication

### OAuth Flow

1. User clicks "Deploy to Vercel/Netlify"
2. Redirect to OAuth provider
3. User authorizes application
4. Redirect back to callback URL
5. Exchange code for token
6. Store token in IndexedDB

### Token Storage

Tokens are stored client-side in IndexedDB:

```typescript
// Database: AetherDeployment
// Store: tokens
{
  id: 'oauth',
  data: {
    vercel?: string,
    netlify?: string
  },
  timestamp: number
}
```

## WebSocket Support

Currently not implemented. Future versions may include:
- Real-time collaboration
- Live preview updates
- Terminal streaming

## CORS

CORS is configured to allow requests from:
- `http://localhost:3000` (development)
- Your production domain

## Security

### Best Practices

1. **Never expose tokens** - Keep OAuth tokens secure
2. **Validate inputs** - All user inputs are validated
3. **Rate limiting** - Prevents abuse
4. **HTTPS only** - Use HTTPS in production
5. **Sanitize data** - All data is sanitized before storage

### Headers

Security headers are configured:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Examples

### Complete Chat Flow

```typescript
async function chat(message: string) {
  const response = await fetch('/api/dub5', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: message,
      history: [],
      personality: 'coder',
      model: 'auto'
    })
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return

        try {
          const json = JSON.parse(data)
          console.log(json.content)
        } catch (e) {
          console.error('Parse error:', e)
        }
      }
    }
  }
}
```

### Deploy to Vercel

```typescript
async function deployToVercel(projectName: string) {
  const manager = DeploymentManager.getInstance()

  // Authenticate if needed
  if (!manager.isAuthenticated('vercel')) {
    const success = await manager.authenticateVercel()
    if (!success) {
      throw new Error('Authentication failed')
    }
  }

  // Deploy
  const result = await manager.deploy({
    platform: 'vercel',
    projectName,
    envVars: {}
  })

  if (result.success) {
    console.log('Deployed to:', result.url)
  } else {
    console.error('Deployment failed:', result.error)
  }
}
```

## Support

For API questions or issues:
- Check [docs/guides/](guides/) for examples
- Open an issue on GitHub
- Review [SECURITY.md](../SECURITY.md) for security concerns
