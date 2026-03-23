/**
 * Project Loader
 * 
 * Utilities for loading shared projects from GitHub URLs with encryption
 */

import { unpackEncryptedShare, EncryptedPayload, ProjectPayload } from '../crypto/share-crypto';

/**
 * Parse URL parameters for project loading
 */
export interface ProjectLoadParams {
  src: string | null;  // GitHub raw URL
  key: string | null;  // Encryption key from hash
}

/**
 * Parse URL parameters for loading a shared project
 * 
 * @param url - The URL to parse (defaults to current window location)
 * @returns Object containing src and key parameters
 */
export function parseProjectLoadParams(url?: string): ProjectLoadParams {
  const urlObj = url ? new URL(url) : new URL(window.location.href);
  
  // Get src from query parameters
  const src = urlObj.searchParams.get('src');
  
  // Get key from hash fragment
  const hash = urlObj.hash.substring(1); // Remove leading #
  const hashParams = new URLSearchParams(hash);
  const key = hashParams.get('key');
  
  return { src, key };
}

/**
 * Load a project from a GitHub URL with encryption
 * 
 * @param src - GitHub raw URL containing the encrypted payload
 * @param key - Base64url-encoded encryption key
 * @returns Promise resolving to the project payload with files
 * @throws Error if loading or decryption fails
 */
export async function loadProjectFromGitHub(
  src: string,
  key: string
): Promise<ProjectPayload> {
  // Validate parameters
  if (!src) {
    throw new Error('Missing source URL (src parameter)');
  }
  
  if (!key) {
    throw new Error('Missing encryption key (key parameter in URL hash)');
  }
  
  try {
    // Fetch encrypted payload from GitHub
    const response = await fetch(src);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
    }
    
    const encryptedPayload: EncryptedPayload = await response.json();
    
    // Validate payload structure
    if (!encryptedPayload.v || !encryptedPayload.iv || !encryptedPayload.data) {
      throw new Error('Invalid encrypted payload structure');
    }
    
    // Decrypt and decompress the payload
    const projectPayload = await unpackEncryptedShare(encryptedPayload, key);
    
    // Validate project payload
    if (!projectPayload.v || !projectPayload.files) {
      throw new Error('Invalid project payload structure');
    }
    
    return projectPayload;
    
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with more context
      if (error.message.includes('fetch')) {
        throw new Error(`Unable to access project URL. The project may have been deleted or the URL is incorrect.`);
      } else if (error.message.includes('decrypt') || error.message.includes('key')) {
        throw new Error(`Invalid or missing encryption key. The project cannot be decrypted.`);
      } else {
        throw error;
      }
    }
    throw new Error('Unknown error occurred while loading project');
  }
}

/**
 * Load project from current URL if parameters are present
 * 
 * @returns Promise resolving to project payload, or null if no project in URL
 */
export async function loadProjectFromCurrentUrl(): Promise<ProjectPayload | null> {
  const params = parseProjectLoadParams();
  
  if (!params.src || !params.key) {
    return null;
  }
  
  return await loadProjectFromGitHub(params.src, params.key);
}

/**
 * Check if current URL contains a shared project
 */
export function hasSharedProject(url?: string): boolean {
  const params = parseProjectLoadParams(url);
  return !!(params.src && params.key);
}
