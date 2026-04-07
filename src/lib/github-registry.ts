import { CONFIG } from '@/config';

export async function deleteProjectFromGithubRegistry(projectId: string, token: string) {
  const { REPO, PATH, BRANCH } = CONFIG.GITHUB_REGISTRY;
  const [owner, repo] = REPO.split('/');

  try {
    // 1. Get the current file content and SHA
    const contentRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${PATH}?ref=${BRANCH}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!contentRes.ok) {
      if (contentRes.status === 404) {
        console.warn('Registry file not found, skipping GitHub deletion.');
        return;
      }
      throw new Error(`Failed to fetch registry: ${contentRes.statusText}`);
    }

    const contentData = await contentRes.json();
    const currentContent = JSON.parse(atob(contentData.content));
    const sha = contentData.sha;

    // 2. Filter out the project
    if (!Array.isArray(currentContent)) {
      console.warn('Registry content is not an array, skipping GitHub deletion.');
      return;
    }

    const updatedContent = currentContent.filter((p: any) => p.id !== projectId);

    if (updatedContent.length === currentContent.length) {
      console.log('Project not found in registry, skipping GitHub update.');
      return;
    }

    // 3. Update the file on GitHub
    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete project ${projectId} from registry`,
        content: btoa(JSON.stringify(updatedContent, null, 2)),
        sha,
        branch: BRANCH
      })
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update registry: ${updateRes.statusText}`);
    }

    console.log('Project successfully deleted from GitHub registry.');
  } catch (error) {
    console.error('Error deleting project from GitHub registry:', error);
    // We don't throw here to avoid blocking the local/Firebase deletion
  }
}

export async function addProjectToGithubRegistry(project: any, token: string) {
  const { REPO, PATH, BRANCH } = CONFIG.GITHUB_REGISTRY;
  const [owner, repo] = REPO.split('/');

  try {
    // 1. Get the current file content and SHA
    const contentRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${PATH}?ref=${BRANCH}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let currentContent = [];
    let sha = undefined;

    if (contentRes.ok) {
      const contentData = await contentRes.json();
      currentContent = JSON.parse(atob(contentData.content));
      sha = contentData.sha;
    } else if (contentRes.status !== 404) {
      throw new Error(`Failed to fetch registry: ${contentRes.statusText}`);
    }

    // 2. Add or update the project
    if (!Array.isArray(currentContent)) {
      currentContent = [];
    }

    const projectSummary = {
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      authorName: project.authorName,
      updatedAt: project.updatedAt,
      isPublic: project.isPublic
    };

    const index = currentContent.findIndex((p: any) => p.id === project.id);
    if (index >= 0) {
      currentContent[index] = projectSummary;
    } else {
      currentContent.push(projectSummary);
    }

    // 3. Update the file on GitHub
    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update project ${project.id} in registry`,
        content: btoa(JSON.stringify(currentContent, null, 2)),
        sha,
        branch: BRANCH
      })
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update registry: ${updateRes.statusText}`);
    }

    console.log('Project successfully updated in GitHub registry.');
  } catch (error) {
    console.error('Error updating project in GitHub registry:', error);
  }
}

export async function exportProjectToGithub(project: any, token: string, repoName: string) {
  try {
    // 1. Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${token}` }
    });
    if (!userRes.ok) throw new Error('Failed to fetch GitHub user info');
    const userData = await userRes.json();
    const username = userData.login;

    // 2. Check if repo exists, if not create it
    const repoRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
      headers: { 'Authorization': `token ${token}` }
    });

    if (repoRes.status === 404) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName,
          description: project.description || `Aether Project: ${project.name}`,
          private: false,
          auto_init: true
        })
      });
      if (!createRes.ok) throw new Error('Failed to create GitHub repository');
      // Wait a bit for GitHub to initialize the repo
      await new Promise(r => setTimeout(r, 2000));
    }

    // 3. Push files
    for (const [path, content] of Object.entries(project.files as Record<string, string>)) {
      // Get current file SHA if it exists
      const fileRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${path}`, {
        headers: { 'Authorization': `token ${token}` }
      });
      
      let sha = undefined;
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        sha = fileData.sha;
      }

      const pushRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update ${path} via Aether`,
          content: btoa(content),
          sha
        })
      });

      if (!pushRes.ok) {
        console.error(`Failed to push ${path}:`, await pushRes.text());
      }
    }

    return `https://github.com/${username}/${repoName}`;
  } catch (error) {
    console.error('Error exporting project to GitHub:', error);
    throw error;
  }
}
