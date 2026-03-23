/**
 * Publish Project API Route
 * 
 * Next.js 14 App Router API route for publishing encrypted project payloads to GitHub.
 * Stores encrypted project data as JSON files in a GitHub repository.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Request body structure for publishing a project
 */
export interface PublishRequest {
  projectId?: string;
  pathHint?: string;
  encryptedPayload: {
    v: number;
    iv: string;
    data: string;
  };
  message?: string;
}

/**
 * Response structure for successful publish
 */
export interface PublishResponse {
  path: string;
  branch: string;
  commitUrl: string | null;
  rawUrl: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
}

/**
 * POST handler for publishing projects to GitHub
 */
export async function POST(request: NextRequest): Promise<NextResponse<PublishResponse | ErrorResponse>> {
  try {
    // Parse request body
    const body: PublishRequest = await request.json();

    // Validate request body
    if (!body.encryptedPayload) {
      return NextResponse.json(
        { error: 'Missing encryptedPayload in request body' },
        { status: 400 }
      );
    }

    if (!body.encryptedPayload.v || !body.encryptedPayload.iv || !body.encryptedPayload.data) {
      return NextResponse.json(
        { error: 'Invalid encryptedPayload structure. Must contain v, iv, and data fields' },
        { status: 400 }
      );
    }

    // Validate environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    const githubBranch = process.env.GITHUB_BRANCH || 'main';

    if (!githubToken || !githubOwner || !githubRepo) {
      console.error('Missing required environment variables:', {
        hasToken: !!githubToken,
        hasOwner: !!githubOwner,
        hasRepo: !!githubRepo
      });
      
      return NextResponse.json(
        { error: 'Server configuration error: Missing GitHub credentials. Please configure GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables.' },
        { status: 500 }
      );
    }

    // Sanitize and construct file path
    const projectId = sanitizePath(body.projectId || body.pathHint || generateProjectId());
    const filePath = `projects/${projectId}.json`;

    // Convert encrypted payload to base64 for GitHub API
    const payloadJson = JSON.stringify(body.encryptedPayload);
    const payloadBase64 = Buffer.from(payloadJson).toString('base64');

    // Commit message
    const commitMessage = body.message || `DUB5 publish ${projectId}`;

    // Check if file exists to get SHA for update
    let existingSha: string | null = null;
    try {
      const checkResponse = await fetch(
        `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}?ref=${githubBranch}`,
        {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Alov-Aether-Fusion'
          }
        }
      );

      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        existingSha = existingFile.sha;
        console.log(`File exists, will update with SHA: ${existingSha}`);
      }
    } catch (error) {
      // File doesn't exist, will create new
      console.log('File does not exist, will create new');
    }

    // Create or update file in GitHub
    const createUpdateResponse = await fetch(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Alov-Aether-Fusion'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: payloadBase64,
          branch: githubBranch,
          ...(existingSha && { sha: existingSha })
        })
      }
    );

    if (!createUpdateResponse.ok) {
      const errorText = await createUpdateResponse.text();
      console.error('GitHub API error:', errorText);
      
      return NextResponse.json(
        { error: `GitHub API error: ${createUpdateResponse.status} ${createUpdateResponse.statusText}` },
        { status: createUpdateResponse.status }
      );
    }

    const result = await createUpdateResponse.json();

    // Construct response URLs
    const rawUrl = `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/${githubBranch}/${filePath}`;
    const commitUrl = result.commit?.html_url || null;

    const response: PublishResponse = {
      path: filePath,
      branch: githubBranch,
      commitUrl,
      rawUrl
    };

    console.log('Project published successfully:', response);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Publish project error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to publish project: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Sanitize path to prevent directory traversal attacks
 */
function sanitizePath(input: string): string {
  // Remove any path traversal attempts
  let sanitized = input.replace(/\.\./g, '');
  
  // Remove leading/trailing slashes
  sanitized = sanitized.replace(/^\/+|\/+$/g, '');
  
  // Remove any remaining slashes (no subdirectories)
  sanitized = sanitized.replace(/\//g, '-');
  
  // Remove any non-alphanumeric characters except hyphens and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9\-_]/g, '-');
  
  // Ensure it's not empty
  if (!sanitized) {
    sanitized = generateProjectId();
  }
  
  return sanitized;
}

/**
 * Generate a random project ID
 */
function generateProjectId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `project-${timestamp}-${random}`;
}
