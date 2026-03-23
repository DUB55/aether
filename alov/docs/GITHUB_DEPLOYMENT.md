# GitHub Deployment System

## Overview

The Alov-Aether Fusion project has successfully integrated a GitHub-based deployment system that replaces the previous OAuth-based deployment mechanisms (Vercel and Netlify). This new system provides a simpler, more secure way to deploy and share projects using encrypted JSON payloads stored in GitHub repositories.

## Key Features

### 1. Client-Side Encryption
- **AES-GCM-256 encryption** for all project data
- **Random IV generation** for each encryption operation
- **Deflate-raw compression** to minimize payload size
- **Base64url encoding** for URL-safe transmission

### 2. GitHub Storage
- Projects stored as encrypted JSON files in a GitHub repository
- No OAuth setup required - uses GitHub Personal Access Tokens
- Automatic file creation and updates via GitHub API
- Version control through Git commits

### 3. Secure Sharing
- Shareable URLs with encryption keys in hash fragments
- Keys never sent to server (client-side only)
- Anyone with the URL can view and edit the project
- No server-side storage of project data

## Architecture

### Components

1. **Share Crypto Module** (`src/lib/crypto/share-crypto.ts`)
   - Base64url encoding/decoding
   - Compression/decompression utilities
   - AES-GCM encryption/decryption
   - Project packaging and unpacking

2. **API Route** (`src/app/api/publish-project/route.ts`)
   - Next.js 14 App Router API endpoint
   - Environment variable validation
   - Path sanitization for security
   - GitHub API integration

3. **Deployment Manager** (`src/lib/deployment/github-deployment-manager.ts`)
   - Singleton pattern for state management
   - File collection from WebContainer
   - Progress tracking and logging
   - Error handling

4. **Project Loader** (`src/lib/deployment/project-loader.ts`)
   - URL parameter parsing
   - Project loading from GitHub URLs
   - Decryption and decompression
   - Error handling for invalid URLs/keys

5. **React Hooks**
   - `useGitHubDeployment` - Deployment state management
   - `useDeploymentManager` - Updated to use GitHub deployment

6. **UI Components**
   - `GitHubDeploymentPanel` - Complete deployment interface
   - Progress indicators
   - Shareable URL display
   - Deployment logs viewer

## Setup Instructions

### 1. Environment Configuration

Create or update your `.env.local` file with the following variables:

```bash
# GitHub Personal Access Token
# Get from: https://github.com/settings/tokens
# Required scopes: repo (Full control of private repositories)
GITHUB_TOKEN=ghp_your_token_here

# GitHub repository details
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
GITHUB_BRANCH=main
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (public or private)
3. Use the repository name in `GITHUB_REPO`
4. Use your username/org in `GITHUB_OWNER`

### 3. Generate Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Alov Deployment")
4. Select scope: **repo** (Full control of private repositories)
5. Click "Generate token"
6. Copy the token immediately and add to `.env.local`

## Usage

### Deploying a Project

```typescript
import { useGitHubDeployment } from '@/hooks/use-github-deployment';

function MyComponent() {
  const { deployToGitHub, status, shareUrl } = useGitHubDeployment();

  const handleDeploy = async () => {
    const result = await deployToGitHub({
      projectId: 'my-project',
      projectName: 'My Awesome Project',
      files: [
        { name: 'index.html', content: '<!DOCTYPE html>...' },
        { name: 'style.css', content: 'body { ... }' }
      ]
    });

    if (result.success) {
      console.log('Share URL:', result.shareUrl);
    }
  };

  return (
    <button onClick={handleDeploy}>
      Deploy to GitHub
    </button>
  );
}
```

### Loading a Shared Project

```typescript
import { loadProjectFromGitHub } from '@/lib/deployment/project-loader';

async function loadProject() {
  try {
    const project = await loadProjectFromGitHub(
      'https://raw.githubusercontent.com/user/repo/main/projects/my-project.json',
      'base64url-encoded-key'
    );
    
    console.log('Project files:', project.files);
  } catch (error) {
    console.error('Failed to load project:', error);
  }
}
```

### Using the UI Component

```typescript
import { GitHubDeploymentPanel } from '@/components/github-deployment-panel';

function EditorPage() {
  return (
    <GitHubDeploymentPanel
      projectId="my-project-id"
      projectName="My Project"
      files={projectFiles}
    />
  );
}
```

## Security Features

### 1. Path Sanitization
- Removes directory traversal attempts (`..`)
- Strips leading/trailing slashes
- Replaces slashes with hyphens (no subdirectories)
- Removes non-alphanumeric characters

### 2. Encryption Key Management
- Keys generated using `crypto.subtle.generateKey()`
- 256-bit AES-GCM encryption
- Keys only in URL hash fragments (never sent to server)
- Random IV for each encryption operation

### 3. Environment Variable Protection
- GitHub token stored server-side only
- Never exposed to client-side code
- Validated before each API request

### 4. Input Validation
- Request body structure validation
- Encrypted payload field validation
- GitHub API response validation

## Data Flow

### Deployment Flow

```
1. User clicks "Deploy to GitHub"
   ↓
2. Collect project files from WebContainer
   ↓
3. Package files into JSON structure
   ↓
4. Compress with deflate-raw
   ↓
5. Generate random AES-GCM key
   ↓
6. Encrypt compressed data
   ↓
7. Send to /api/publish-project
   ↓
8. API validates and sanitizes
   ↓
9. Check if file exists in GitHub
   ↓
10. Create or update file via GitHub API
    ↓
11. Return raw URL and commit URL
    ↓
12. Generate shareable URL with key in hash
    ↓
13. Display to user
```

### Loading Flow

```
1. User opens shareable URL
   ↓
2. Parse src (GitHub URL) and key (hash)
   ↓
3. Fetch encrypted payload from GitHub
   ↓
4. Validate payload structure
   ↓
5. Decrypt using key from URL hash
   ↓
6. Decompress data
   ↓
7. Parse JSON to get project files
   ↓
8. Load files into editor
```

## API Reference

### POST /api/publish-project

**Request Body:**
```typescript
{
  projectId?: string;
  pathHint?: string;
  encryptedPayload: {
    v: number;
    iv: string;
    data: string;
  };
  message?: string;
}
```

**Response (Success):**
```typescript
{
  path: string;
  branch: string;
  commitUrl: string | null;
  rawUrl: string;
}
```

**Response (Error):**
```typescript
{
  error: string;
}
```

## Troubleshooting

### Deployment Fails with "Missing GitHub credentials"

**Solution:** Ensure all environment variables are set in `.env.local`:
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`

### "Failed to fetch project" Error

**Possible causes:**
1. GitHub URL is incorrect
2. Repository is private and token doesn't have access
3. File was deleted from repository

**Solution:** Verify the URL and check repository permissions.

### "Invalid or missing encryption key"

**Possible causes:**
1. URL hash doesn't contain the key parameter
2. Key was corrupted during copy/paste

**Solution:** Ensure the full URL including the hash fragment is copied.

### GitHub API Rate Limiting

**Solution:** 
- Use authenticated requests (token in environment)
- Authenticated requests have higher rate limits (5000/hour)
- Consider implementing caching for frequently accessed projects

## Migration from OAuth System

### Removed Components

1. **OAuth Authentication:**
   - Vercel OAuth flow removed
   - Netlify OAuth flow removed
   - OAuth callback routes deleted
   - IndexedDB token storage removed

2. **Environment Variables:**
   - `NEXT_PUBLIC_VERCEL_CLIENT_ID` removed
   - `NEXT_PUBLIC_NETLIFY_CLIENT_ID` removed

3. **Code Files:**
   - `/api/auth/vercel/callback/route.ts` deleted
   - `/api/auth/netlify/callback/route.ts` deleted

### Updated Components

1. **Deployment Manager:**
   - Replaced with `GitHubDeploymentManager`
   - Removed OAuth methods
   - Added encryption and GitHub integration

2. **Deployment Hook:**
   - Updated `useDeploymentManager` to use GitHub deployment
   - Removed OAuth authentication state
   - Added deployment progress tracking

3. **UI Components:**
   - Removed Vercel/Netlify authentication buttons
   - Added GitHub deployment panel
   - Updated deployment status displays

## Benefits Over OAuth System

1. **Simpler Setup:**
   - No OAuth app registration required
   - Single GitHub token for authentication
   - No callback URL configuration

2. **Better Security:**
   - Client-side encryption
   - Keys never sent to server
   - No token storage in browser

3. **More Control:**
   - Direct GitHub API access
   - Version control through Git
   - Easy backup and migration

4. **Cost Effective:**
   - No deployment platform costs
   - Uses GitHub's free tier
   - Unlimited projects (within GitHub limits)

## Future Enhancements

### Potential Improvements

1. **Project Versioning:**
   - Store multiple versions of projects
   - Allow rollback to previous versions
   - Version comparison and diff viewing

2. **Collaboration:**
   - Multiple users editing same project
   - Real-time synchronization
   - Conflict resolution

3. **Advanced Encryption:**
   - Password-protected projects
   - Multiple encryption keys
   - Key rotation

4. **Performance:**
   - Caching layer for frequently accessed projects
   - Lazy loading of large projects
   - Incremental updates

5. **Analytics:**
   - Track project views
   - Monitor deployment success rates
   - Usage statistics

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check GitHub repository issues
4. Contact the development team

## License

This deployment system is part of the Alov project and follows the same license terms.
