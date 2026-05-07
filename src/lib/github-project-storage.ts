import { CONFIG } from '@/config';

export interface GitHubProject {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  authorName?: string;
  authorPhoto?: string;
  isPublic: boolean;
  files: Record<string, string>;
  messages: any[];
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get user's GitHub token from localStorage
 */
function getGitHubToken(): string | null {
  return localStorage.getItem('github_token');
}

/**
 * Get user's GitHub username
 */
export async function getGitHubUsername(): Promise<string> {
  const token = getGitHubToken();
  if (!token) throw new Error('No GitHub token found');

  const res = await fetch('https://api.github.com/user', {
    headers: { 'Authorization': `token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch GitHub user');
  const data = await res.json();
  return data.login;
}

/**
 * Create or update a project in the user's GitHub repo
 */
export async function saveProjectToGitHub(project: GitHubProject): Promise<void> {
  const token = getGitHubToken();
  if (!token) throw new Error('No GitHub token found');

  const username = await getGitHubUsername();
  const repoName = 'aether-projects'; // Fixed repo name for user's projects

  // Ensure repo exists
  await ensureRepoExists(username, repoName, token);

  // Save project as JSON file
  const filePath = `projects/${project.id}.json`;
  await saveFileToGitHub(username, repoName, filePath, JSON.stringify(project, null, 2), token);
}

/**
 * Load all projects from user's GitHub repo
 */
export async function loadProjectsFromGitHub(): Promise<GitHubProject[]> {
  const token = getGitHubToken();
  if (!token) throw new Error('No GitHub token found');

  const username = await getGitHubUsername();
  const repoName = 'aether-projects';

  try {
    // List all files in projects directory
    const res = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/projects`, {
      headers: { 'Authorization': `token ${token}` }
    });

    if (res.status === 404) {
      // Directory doesn't exist, return empty array
      return [];
    }

    if (!res.ok) throw new Error('Failed to list projects');

    const files = await res.json();
    
    // Load each project file
    const projects: GitHubProject[] = [];
    for (const file of files) {
      if (file.name.endsWith('.json')) {
        const fileRes = await fetch(file.url, {
          headers: { 'Authorization': `token ${token}` }
        });
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          const project = JSON.parse(atob(fileData.content));
          projects.push(project);
        }
      }
    }

    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('Error loading projects from GitHub:', error);
    return [];
  }
}

/**
 * Load a specific project from GitHub
 */
export async function loadProjectFromGitHub(projectId: string): Promise<GitHubProject | null> {
  const token = getGitHubToken();
  if (!token) throw new Error('No GitHub token found');

  const username = await getGitHubUsername();
  const repoName = 'aether-projects';
  const filePath = `projects/${projectId}.json`;

  const res = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
    headers: { 'Authorization': `token ${token}` }
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load project');

  const data = await res.json();
  const project = JSON.parse(atob(data.content));
  return project;
}

/**
 * Delete a project from GitHub
 */
export async function deleteProjectFromGitHub(projectId: string): Promise<void> {
  const token = getGitHubToken();
  if (!token) throw new Error('No GitHub token found');

  const username = await getGitHubUsername();
  const repoName = 'aether-projects';
  const filePath = `projects/${projectId}.json`;

  // Get file SHA
  const res = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
    headers: { 'Authorization': `token ${token}` }
  });

  if (res.status === 404) return; // File doesn't exist
  if (!res.ok) throw new Error('Failed to get file');

  const data = await res.json();

  // Delete file
  const deleteRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Delete project ${projectId}`,
      sha: data.sha,
    })
  });

  if (!deleteRes.ok) throw new Error('Failed to delete project');
}

/**
 * Ensure the user's projects repo exists
 */
async function ensureRepoExists(username: string, repoName: string, token: string): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    headers: { 'Authorization': `token ${token}` }
  });

  if (res.status === 404) {
    // Create repo
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description: 'Aether Projects - Stored in GitHub',
        private: false,
        auto_init: true
      })
    });

    if (!createRes.ok) throw new Error('Failed to create repo');
    
    // Wait for repo to be ready
    await new Promise(r => setTimeout(r, 2000));
  }
}

/**
 * Save a file to GitHub
 */
async function saveFileToGitHub(
  username: string,
  repoName: string,
  filePath: string,
  content: string,
  token: string
): Promise<void> {
  // Get current file SHA if it exists
  const res = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
    headers: { 'Authorization': `token ${token}` }
  });

  let sha = undefined;
  if (res.ok) {
    const data = await res.json();
    sha = data.sha;
  }

  // Create or update file
  const updateRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Update ${filePath}`,
      content: btoa(content),
      sha,
    })
  });

  if (!updateRes.ok) throw new Error(`Failed to save ${filePath}`);
}
