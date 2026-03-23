# Button Functionality Implementation Plan

## Current Status Analysis

### ✅ Already Functional
1. **Share Button** - Copies current URL to clipboard (line 1024-1029)
2. **File Management** - Create/Delete files and folders work
3. **Tab Navigation** - All tabs (Preview, Code, Settings, Knowledge, History, Deploy) work
4. **Device Preview Toggle** - Desktop/Mobile/Tablet switching works
5. **Refresh Preview** - Works correctly

### ⚠️ Needs Real Implementation (Currently Fake)

#### 1. Publish/Deploy to Vercel Button (Lines 1030-1049)
**Current**: Uses `setTimeout` to simulate deployment
**Needed**: 
- Integrate with DeploymentManager class
- Use OAuth authentication for Vercel
- Real API calls to Vercel deployment API
- Show actual deployment progress

#### 2. Connect Netlify Button
**Current**: No implementation found
**Needed**:
- Add OAuth authentication for Netlify
- Use DeploymentManager for Netlify deployment
- Similar flow to Vercel

#### 3. GitHub Push Button (Lines 1000-1023)
**Current**: Uses `setTimeout` to simulate push
**Needed**:
- Real GitHub API integration
- Use provided token to push code
- Create/update repository
- Show actual push progress

#### 4. Supabase Test Connection (Lines 966-999)
**Current**: Implementation exists but may need improvement
**Status**: Needs verification - appears to have real fetch call

#### 5. Generate Docs Button (Lines 1050-1092)
**Current**: Uses `setTimeout` to simulate generation
**Needed**:
- Use AI to actually generate documentation
- Parse project files
- Create README.md with real content

#### 6. Add Variable Button (Environment Variables)
**Current**: No implementation found in search
**Needed**:
- Add UI for environment variable management
- Store variables securely
- Pass to deployment platforms

### 🔍 Chat Pane Buttons (Need Investigation)
- **Plus Icon** - Likely for new chat or adding context
- **Globe Icon** - Possibly for web search or external resources
- **History Icon** - Likely for chat history

## Implementation Priority

### High Priority (Production Blockers)
1. Deploy to Vercel - Core feature
2. GitHub Push - Core feature
3. Supabase Test - Verify it works correctly

### Medium Priority
4. Connect Netlify - Alternative deployment
5. Generate Docs - Nice to have
6. Add Variable - Important for deployments

### Low Priority
7. Chat pane enhancements - UX improvements

## Technical Approach

### For Vercel/Netlify Deployment:
```typescript
import { DeploymentManager } from '@/lib/deployment/manager'

const handlePublish = async () => {
  setIsPublishing(true)
  const deploymentManager = DeploymentManager.getInstance()
  
  try {
    // Check authentication
    if (!deploymentManager.isAuthenticated('vercel')) {
      const authenticated = await deploymentManager.authenticateVercel()
      if (!authenticated) {
        showError("Failed to authenticate with Vercel")
        return
      }
    }
    
    // Deploy
    const result = await deploymentManager.deploy({
      platform: 'vercel',
      projectName: project.name,
      envVars: project.settings?.envVars || {}
    })
    
    if (result.success) {
      showSuccess(`Deployed successfully! ${result.url}`)
    } else {
      showError(`Deployment failed: ${result.error}`)
    }
  } finally {
    setIsPublishing(false)
  }
}
```

### For GitHub Push:
```typescript
const handlePushToGithub = async () => {
  if (!githubRepo || !githubToken) {
    showError("Please enter both Repository and Token")
    return
  }
  
  setIsGithubPushing(true)
  
  try {
    // Use GitHub API to create/update files
    const files = Object.entries(project.files)
    
    for (const [path, content] of files) {
      await fetch(`https://api.github.com/repos/${githubRepo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update ${path}`,
          content: btoa(content), // Base64 encode
          branch: 'main'
        })
      })
    }
    
    showSuccess("Successfully pushed to GitHub!")
    setGithubStatus('success')
  } catch (err) {
    showError(`Push failed: ${err.message}`)
    setGithubStatus('error')
  } finally {
    setIsGithubPushing(false)
  }
}
```

## Next Steps

1. Verify Supabase test connection works
2. Implement real Vercel deployment
3. Implement real GitHub push
4. Add Netlify deployment
5. Improve documentation generation
6. Add environment variable management
7. Test all functionality end-to-end
