# Migration Guide: OAuth to GitHub Deployment

## Overview

This guide helps you migrate from the old OAuth-based deployment system (Vercel/Netlify) to the new GitHub-based deployment system with client-side encryption.

## What Changed?

### Removed Features
- ❌ Vercel OAuth authentication
- ❌ Netlify OAuth authentication
- ❌ OAuth callback routes
- ❌ IndexedDB token storage
- ❌ Platform-specific deployment APIs

### New Features
- ✅ GitHub-based deployment
- ✅ Client-side AES-256-GCM encryption
- ✅ Shareable encrypted URLs
- ✅ Simpler authentication (GitHub token only)
- ✅ Direct GitHub API integration
- ✅ Version control through Git commits

## Migration Steps

### Step 1: Update Environment Variables

**Old `.env.local`:**
```bash
NEXT_PUBLIC_VERCEL_CLIENT_ID=your_vercel_client_id
NEXT_PUBLIC_NETLIFY_CLIENT_ID=your_netlify_client_id
```

**New `.env.local`:**
```bash
GITHUB_TOKEN=ghp_your_github_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
GITHUB_BRANCH=main
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository for storing deployed projects
3. Can be public or private
4. No need to initialize with README

### Step 3: Generate GitHub Personal Access Token

1. Visit https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Alov Deployment"
4. Scopes: Select **repo** (Full control of private repositories)
5. Click "Generate token"
6. Copy the token immediately
7. Add to `.env.local` as `GITHUB_TOKEN`

### Step 4: Update Code References

#### Old Deployment Code:
```typescript
import { useDeploymentManager } from '@/hooks/use-deployment-manager';

function MyComponent() {
  const { 
    authenticateVercel, 
    deploy, 
    isVercelAuthenticated 
  } = useDeploymentManager();

  const handleDeploy = async () => {
    if (!isVercelAuthenticated) {
      await authenticateVercel();
    }
    
    await deploy({
      platform: 'vercel',
      projectName: 'my-project'
    });
  };
}
```

#### New Deployment Code:
```typescript
import { useGitHubDeployment } from '@/hooks/use-github-deployment';

function MyComponent() {
  const { 
    deployToGitHub, 
    shareUrl, 
    status 
  } = useGitHubDeployment();

  const handleDeploy = async () => {
    const result = await deployToGitHub({
      projectId: 'my-project',
      projectName: 'My Project',
      files: projectFiles
    });
    
    if (result.success) {
      console.log('Share URL:', result.shareUrl);
    }
  };
}
```

### Step 5: Update UI Components

#### Old UI:
```tsx
<Button onClick={authenticateVercel}>
  Connect Vercel
</Button>
<Button onClick={handleDeploy}>
  Deploy to Vercel
</Button>
```

#### New UI:
```tsx
import { GitHubDeploymentPanel } from '@/components/github-deployment-panel';

<GitHubDeploymentPanel
  projectId={projectId}
  projectName={projectName}
  files={files}
/>
```

### Step 6: Remove Old Dependencies

If you have any OAuth-related dependencies in `package.json`, you can remove them:

```bash
# No specific OAuth packages to remove
# The system now uses native fetch and Web Crypto API
```

### Step 7: Test Deployment

1. Start your development server
2. Open a project in the editor
3. Navigate to the Deploy tab
4. Click "Deploy to GitHub"
5. Verify the shareable URL is generated
6. Test loading the project from the shareable URL

## API Changes

### Old API Endpoints (Removed)
- `/api/auth/vercel/callback`
- `/api/auth/netlify/callback`

### New API Endpoints
- `/api/publish-project` - Publish encrypted projects to GitHub

## Hook API Changes

### useDeploymentManager (Updated)

**Old API:**
```typescript
{
  status: DeploymentStatus;
  logs: string[];
  isVercelAuthenticated: boolean;
  isNetlifyAuthenticated: boolean;
  authenticateVercel: () => Promise<boolean>;
  authenticateNetlify: () => Promise<boolean>;
  deploy: (config: DeploymentConfig) => Promise<DeploymentResult>;
  clearTokens: (platform?: DeploymentPlatform) => Promise<void>;
}
```

**New API:**
```typescript
{
  status: DeploymentStatus;
  logs: string[];
  shareUrl: string | null;
  isDeploying: boolean;
  deployToGitHub: (config: DeploymentConfig) => Promise<DeploymentResult>;
  clearDeployment: () => void;
}
```

## Configuration Changes

### DeploymentConfig Interface

**Old:**
```typescript
interface DeploymentConfig {
  platform: 'vercel' | 'netlify';
  projectName: string;
  envVars?: Record<string, string>;
  buildCommand?: string;
  outputDirectory?: string;
}
```

**New:**
```typescript
interface DeploymentConfig {
  projectId: string;
  projectName: string;
  files: Array<{ name: string; content: string }>;
  pathHint?: string;
}
```

### DeploymentResult Interface

**Old:**
```typescript
interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
  logs: string[];
  deploymentId?: string;
}
```

**New:**
```typescript
interface DeploymentResult {
  success: boolean;
  shareUrl?: string;
  rawUrl?: string;
  commitUrl?: string;
  error?: string;
}
```

## Troubleshooting

### "Missing GitHub credentials" Error

**Cause:** Environment variables not set correctly.

**Solution:**
1. Check `.env.local` file exists
2. Verify all required variables are set:
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER`
   - `GITHUB_REPO`
3. Restart development server after updating `.env.local`

### "Failed to authenticate" Error

**Cause:** GitHub token is invalid or expired.

**Solution:**
1. Generate a new GitHub Personal Access Token
2. Ensure the token has `repo` scope
3. Update `GITHUB_TOKEN` in `.env.local`
4. Restart development server

### Deployment Succeeds but URL Doesn't Work

**Cause:** Repository might be private and not accessible.

**Solution:**
1. Make repository public, OR
2. Ensure users have access to the repository, OR
3. Use GitHub token with appropriate permissions

### "Rate limit exceeded" Error

**Cause:** Too many GitHub API requests.

**Solution:**
1. Wait for rate limit to reset (usually 1 hour)
2. Use authenticated requests (token in environment)
3. Authenticated requests have higher limits (5000/hour vs 60/hour)

## Benefits of Migration

### 1. Simpler Setup
- No OAuth app registration
- No callback URL configuration
- Single token for authentication

### 2. Better Security
- Client-side encryption
- Keys never sent to server
- No token storage in browser

### 3. More Control
- Direct GitHub API access
- Version control through Git
- Easy backup and migration

### 4. Cost Savings
- No deployment platform costs
- Uses GitHub's free tier
- Unlimited projects (within GitHub limits)

### 5. Better Privacy
- Projects encrypted before upload
- Only users with URL can access
- No third-party platform access

## Rollback Plan

If you need to rollback to the old system:

1. Restore old environment variables
2. Restore OAuth callback routes from git history
3. Restore old deployment manager code
4. Restart development server

**Note:** We recommend testing the new system thoroughly before removing old code completely.

## Support

If you encounter issues during migration:

1. Check this guide's troubleshooting section
2. Review the [GitHub Deployment documentation](./GITHUB_DEPLOYMENT.md)
3. Check the project's GitHub issues
4. Contact the development team

## Timeline

- **Phase 1 (Current):** Both systems available
- **Phase 2 (Next release):** GitHub deployment recommended
- **Phase 3 (Future):** OAuth system deprecated
- **Phase 4 (Later):** OAuth system removed

## Feedback

We value your feedback on the new deployment system:

- Report bugs via GitHub issues
- Suggest improvements
- Share your migration experience

## Additional Resources

- [GitHub Deployment Documentation](./GITHUB_DEPLOYMENT.md)
- [GitHub Personal Access Tokens Guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Web Crypto API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
