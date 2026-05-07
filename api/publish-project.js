// API endpoint for publishing projects to GitHub
// Uses server-side GitHub token for authentication

export default async function handler(req, res) {
  console.log('[PUBLISH-API] Request received:', {
    method: req.method,
    body: req.body ? 'has body' : 'no body',
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'POST') {
    console.log('[PUBLISH-API] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, pathHint, encryptedPayload, message } = req.body;

  console.log('[PUBLISH-API] Request data:', {
    projectId: projectId || 'missing',
    pathHint: pathHint || 'missing',
    message: message || 'missing',
    hasEncryptedPayload: !!encryptedPayload,
    payloadSize: encryptedPayload ? encryptedPayload.length : 0
  });

  if (!projectId || !pathHint || !encryptedPayload || !message) {
    console.log('[PUBLISH-API] Missing required fields:', {
      hasProjectId: !!projectId,
      hasPathHint: !!pathHint,
      hasEncryptedPayload: !!encryptedPayload,
      hasMessage: !!message
    });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get GitHub token from environment variables
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('[PUBLISH-API] GITHUB_TOKEN not found in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  console.log('[PUBLISH-API] GitHub token found:', githubToken ? 'YES' : 'NO');

  try {
    const { REPO, BRANCH } = process.env.GITHUB_REGISTRY 
      ? JSON.parse(process.env.GITHUB_REGISTRY)
      : { REPO: 'DUB55/aether-projects', BRANCH: 'main' };

    const [owner, repo] = REPO.split('/');

    console.log('[PUBLISH-API] Target repository:', {
      owner,
      repo,
      branch: BRANCH,
      path: pathHint
    });

    // Step 1: Check if file exists to get SHA
    console.log('[PUBLISH-API] Step 1: Checking if file exists...');
    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${pathHint}?ref=${BRANCH}`;
    
    const fileRes = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let sha = null;
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
      console.log('[PUBLISH-API] File exists, SHA:', sha);
    } else if (fileRes.status === 404) {
      console.log('[PUBLISH-API] File does not exist, will create new');
    } else {
      const errorText = await fileRes.text();
      console.error('[PUBLISH-API] Error checking file:', {
        status: fileRes.status,
        statusText: fileRes.statusText,
        error: errorText
      });
      throw new Error(`Failed to check file existence: ${fileRes.status} ${fileRes.statusText}`);
    }

    // Step 2: Create or update file
    console.log('[PUBLISH-API] Step 2: Creating/updating file...');
    const updateFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${pathHint}`;
    
    const updateBody = {
      message,
      content: encryptedPayload,
      branch: BRANCH
    };

    if (sha) {
      updateBody.sha = sha;
    }

    const updateRes = await fetch(updateFileUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateBody)
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error('[PUBLISH-API] Error updating file:', {
        status: updateRes.status,
        statusText: updateRes.statusText,
        error: errorText
      });
      throw new Error(`Failed to update file: ${updateRes.status} ${updateRes.statusText}`);
    }

    const updateData = await updateRes.json();
    console.log('[PUBLISH-API] File updated successfully:', {
      sha: updateData.commit.sha,
      downloadUrl: updateData.content.download_url
    });

    // Step 3: Update community registry if it's a publish action
    if (message.includes('publish')) {
      console.log('[PUBLISH-API] Step 3: Updating community registry...');
      
      try {
        const registryPath = 'projects.json';
        const registryUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${registryPath}?ref=${BRANCH}`;
        
        // Get current registry
        const registryRes = await fetch(registryUrl, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        let currentRegistry = [];
        let registrySha = null;

        if (registryRes.ok) {
          const registryData = await registryRes.json();
          currentRegistry = JSON.parse(atob(registryData.content));
          registrySha = registryData.sha;
          console.log('[PUBLISH-API] Registry loaded, entries:', currentRegistry.length);
        } else if (registryRes.status === 404) {
          console.log('[PUBLISH-API] Registry not found, will create new');
        } else {
          console.warn('[PUBLISH-API] Warning: Could not load registry:', registryRes.status);
        }

        // Note: We can't add to registry without decrypted project data
        // This would need to be handled differently or the client needs to send metadata
        console.log('[PUBLISH-API] Registry update skipped - need metadata from client');

      } catch (registryError) {
        console.error('[PUBLISH-API] Error updating registry:', registryError);
        // Don't fail the whole operation if registry update fails
      }
    }

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${BRANCH}/${pathHint}`;
    
    console.log('[PUBLISH-API] Success! Returning:', {
      rawUrl,
      projectId
    });

    return res.status(200).json({ 
      rawUrl,
      projectId,
      success: true
    });

  } catch (error) {
    console.error('[PUBLISH-API] Unhandled error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({ 
      error: error.message || 'Failed to publish project',
      timestamp: new Date().toISOString()
    });
  }
}
