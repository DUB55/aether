// GitHub integration for Aether AI
// Provides export/import functionality for GitHub repositories

interface GitHubExportOptions {
  repository: string
  description?: string
  isPrivate?: boolean
  autoInit?: boolean
}

interface GitHubImportOptions {
  repository: string
  branch?: string
}

export const githubService = {
  // Export project to GitHub repository
  exportToGitHub: async (
    projectFiles: Record<string, string>,
    options: GitHubExportOptions,
    accessToken: string
  ) => {
    try {
      const { repository, description = 'Exported from Aether AI', isPrivate = false, autoInit = true } = options
      
      // Create repository
      const createRepoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          name: repository.split('/')[1] || repository,
          description,
          private: isPrivate,
          auto_init: autoInit,
        }),
      })

      if (!createRepoResponse.ok) {
        const error = await createRepoResponse.json()
        throw new Error(error.message || 'Failed to create repository')
      }

      const repoData = await createRepoResponse.json()

      // Upload files to repository
      const uploadPromises = Object.entries(projectFiles).map(([path, content]) => {
        return githubService.uploadFile(
          repoData.owner.login,
          repoData.name,
          path,
          content,
          accessToken
        )
      })

      await Promise.all(uploadPromises)

      return {
        success: true,
        repositoryUrl: repoData.html_url,
        cloneUrl: repoData.clone_url,
      }
    } catch (error: any) {
      console.error('GitHub export error:', error)
      throw error
    }
  },

  // Upload file to GitHub repository
  uploadFile: async (
    owner: string,
    repo: string,
    path: string,
    content: string,
    accessToken: string
  ) => {
    try {
      // Get current file (if exists) to get SHA
      let sha: string | undefined
      try {
        const getFileResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        )
        if (getFileResponse.ok) {
          const fileData = await getFileResponse.json()
          sha = fileData.sha
        }
      } catch (e) {
        // File doesn't exist, that's okay
      }

      // Upload file
      const contentBase64 = btoa(content)
      const uploadResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            message: `Update ${path}`,
            content: contentBase64,
            sha,
          }),
        }
      )

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.message || `Failed to upload ${path}`)
      }

      return await uploadResponse.json()
    } catch (error: any) {
      console.error('File upload error:', error)
      throw error
    }
  },

  // Import GitHub repository into project
  importFromGitHub: async (
    options: GitHubImportOptions,
    accessToken: string
  ) => {
    try {
      const { repository, branch = 'main' } = options
      const [owner, repo] = repository.split('/')

      if (!owner || !repo) {
        throw new Error('Invalid repository format. Use "owner/repo" format.')
      }

      // Get repository contents
      const contentsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      )

      if (!contentsResponse.ok) {
        const error = await contentsResponse.json()
        throw new Error(error.message || 'Failed to fetch repository contents')
      }

      const contents = await contentsResponse.json()

      // Recursively fetch all files
      const files: Record<string, string> = {}
      
      const fetchFile = async (item: any, path: string = '') => {
        if (item.type === 'file') {
          const fileResponse = await fetch(item.url, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          })

          if (fileResponse.ok) {
            const fileData = await fileResponse.json()
            const content = atob(fileData.content)
            files[`${path}${item.name}`] = content
          }
        } else if (item.type === 'dir') {
          const dirContentsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${branch}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          )

          if (dirContentsResponse.ok) {
            const dirContents = await dirContentsResponse.json()
            await Promise.all(
              dirContents.map((child: any) => fetchFile(child, `${path}${item.name}/`))
            )
          }
        }
      }

      await Promise.all(contents.map((item: any) => fetchFile(item)))

      return {
        success: true,
        files,
        repositoryUrl: `https://github.com/${owner}/${repo}`,
      }
    } catch (error: any) {
      console.error('GitHub import error:', error)
      throw error
    }
  },

  // Get user repositories
  getUserRepositories: async (accessToken: string) => {
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch repositories')
      }

      return await response.json()
    } catch (error: any) {
      console.error('Get repositories error:', error)
      throw error
    }
  },

  // Validate GitHub access token
  validateToken: async (accessToken: string) => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        return false
      }

      const userData = await response.json()
      return {
        valid: true,
        username: userData.login,
        avatar: userData.avatar_url,
      }
    } catch (error) {
      return { valid: false }
    }
  },
}
