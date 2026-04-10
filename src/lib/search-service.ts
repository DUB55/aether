// Search service
// Provides search functionality across projects, files, and other resources

import { db, auth } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export interface SearchResult {
  id: string
  type: 'project' | 'file' | 'workspace' | 'template'
  title: string
  description?: string
  url: string
  metadata?: Record<string, any>
  relevanceScore?: number
}

export interface SearchOptions {
  query: string
  types?: SearchResult['type'][]
  userId?: string
  workspaceId?: string
  limit?: number
}

export const searchService = {
  // Search across all resources
  search: async (options: SearchOptions): Promise<SearchResult[]> => {
    const userId = options.userId || auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const results: SearchResult[] = [];
    const searchLimit = options.limit || 20;
    const searchTerm = options.query;

    // Search projects
    if (!options.types || options.types.includes('project')) {
      const projectResults = await searchService.searchProjects(searchTerm, userId, searchLimit);
      results.push(...projectResults);
    }

    // Search workspaces
    if (!options.types || options.types.includes('workspace')) {
      const workspaceResults = await searchService.searchWorkspaces(searchTerm, userId, searchLimit);
      results.push(...workspaceResults);
    }

    // Search templates
    if (!options.types || options.types.includes('template')) {
      const templateResults = await searchService.searchTemplates(searchTerm, searchLimit);
      results.push(...templateResults);
    }

    // Sort by relevance (simple implementation - prioritize exact matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm.toLowerCase();
      const bExact = b.title.toLowerCase() === searchTerm.toLowerCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return a.title.localeCompare(b.title);
    });

    return sortedResults.slice(0, searchLimit);
  },

  // Search projects
  searchProjects: async (searchTerm: string, userId: string, limitCount: number = 20): Promise<SearchResult[]> => {
    const projectsRef = collection(db, 'projects');
    const searchLower = searchTerm.toLowerCase();

    const q = query(
      projectsRef,
      where('ownerId', '==', userId),
      orderBy('lastModified', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const results: SearchResult[] = [];

    for (const doc of querySnapshot.docs) {
      const project = doc.data() as any;
      const name = project.name || '';
      const description = project.description || '';

      if (name.toLowerCase().includes(searchLower) || description.toLowerCase().includes(searchLower)) {
        results.push({
          id: doc.id,
          type: 'project',
          title: name,
          description,
          url: `/projects/${doc.id}`,
          metadata: {
            framework: project.framework,
            language: project.language,
            lastModified: project.lastModified
          }
        });
      }
    }

    return results;
  },

  // Search workspaces
  searchWorkspaces: async (searchTerm: string, userId: string, limitCount: number = 20): Promise<SearchResult[]> => {
    const workspacesRef = collection(db, 'workspaces');
    const searchLower = searchTerm.toLowerCase();

    const q = query(
      workspacesRef,
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const results: SearchResult[] = [];

    for (const doc of querySnapshot.docs) {
      const workspace = doc.data() as any;
      const name = workspace.name || '';
      const description = workspace.description || '';

      if (name.toLowerCase().includes(searchLower) || description.toLowerCase().includes(searchLower)) {
        results.push({
          id: doc.id,
          type: 'workspace',
          title: name,
          description,
          url: `/workspaces/${doc.id}`,
          metadata: {
            memberCount: workspace.members?.length || 0,
            createdAt: workspace.createdAt
          }
        });
      }
    }

    return results;
  },

  // Search templates
  searchTemplates: async (searchTerm: string, limitCount: number = 20): Promise<SearchResult[]> => {
    const searchLower = searchTerm.toLowerCase();
    
    // Since templates are predefined, we'll use the template service
    const { templateService } = await import('./template-service');
    const templates = templateService.getTemplates();

    const results: SearchResult[] = [];

    for (const template of templates) {
      const name = template.name.toLowerCase();
      const description = template.description.toLowerCase();
      const category = template.category.toLowerCase();

      if (name.includes(searchLower) || description.includes(searchLower) || category.includes(searchLower)) {
        results.push({
          id: template.id,
          type: 'template',
          title: template.name,
          description: template.description,
          url: `/templates/${template.id}`,
          metadata: {
            category: template.category,
            framework: template.framework,
            language: template.language
          }
        });
      }
    }

    return results.slice(0, limitCount);
  },

  // Search within project files
  searchFiles: async (projectId: string, searchTerm: string, limitCount: number = 20): Promise<SearchResult[]> => {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return [];
    }

    const project = projectSnap.data();
    const files = project.files || {};
    const searchLower = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    for (const [filePath, content] of Object.entries(files)) {
      const fileName = filePath.split('/').pop() || '';
      
      if (fileName.toLowerCase().includes(searchLower) || 
          (typeof content === 'string' && content.toLowerCase().includes(searchLower))) {
        results.push({
          id: filePath,
          type: 'file',
          title: fileName,
          description: filePath,
          url: `/projects/${projectId}/files/${encodeURIComponent(filePath)}`,
          metadata: {
            projectId,
            filePath
          }
        });
      }

      if (results.length >= limitCount) {
        break;
      }
    }

    return results;
  },

  // Get search suggestions
  getSuggestions: async (searchTerm: string, userId: string, limitCount: number = 5): Promise<string[]> => {
    const suggestions: Set<string> = new Set();
    const searchLower = searchTerm.toLowerCase();

    // Get project names
    const projectsRef = collection(db, 'projects');
    const projectQ = query(projectsRef, where('ownerId', '==', userId), limit(limitCount));
    const projectSnapshot = await getDocs(projectQ);
    
    projectSnapshot.docs.forEach(doc => {
      const name = (doc.data() as any).name || '';
      if (name.toLowerCase().startsWith(searchLower)) {
        suggestions.add(name);
      }
    });

    // Get workspace names
    const workspacesRef = collection(db, 'workspaces');
    const workspaceQ = query(workspacesRef, where('ownerId', '==', userId), limit(limitCount));
    const workspaceSnapshot = await getDocs(workspaceQ);
    
    workspaceSnapshot.docs.forEach(doc => {
      const name = (doc.data() as any).name || '';
      if (name.toLowerCase().startsWith(searchLower)) {
        suggestions.add(name);
      }
    });

    return Array.from(suggestions).slice(0, limitCount);
  },

  // Get recent searches (stored in localStorage for now)
  getRecentSearches: (): string[] => {
    const stored = localStorage.getItem('aether_recent_searches');
    return stored ? JSON.parse(stored) : [];
  },

  // Save search to recent searches
  saveSearch: (query: string): void => {
    const recent = searchService.getRecentSearches();
    const filtered = recent.filter(s => s.toLowerCase() !== query.toLowerCase());
    filtered.unshift(query);
    const limited = filtered.slice(0, 10);
    localStorage.setItem('aether_recent_searches', JSON.stringify(limited));
  },

  // Clear recent searches
  clearRecentSearches: (): void => {
    localStorage.removeItem('aether_recent_searches');
  }
};
