// Project export/import service
// Handles exporting and importing projects as archives

export interface ProjectExportOptions {
  includeFiles: boolean
  includeSnapshots: boolean
  includeSettings: boolean
  includeMessages: boolean
  format: 'json' | 'zip'
}

export interface ProjectImportOptions {
  overwrite: boolean
  importFiles: boolean
  importSnapshots: boolean
  importSettings: boolean
  importMessages: boolean
}

export interface ProjectExportData {
  version: string
  exportedAt: string
  projectId: string
  projectName: string
  files?: Record<string, string>
  snapshots?: Array<{
    id: string
    note?: string
    files: Record<string, string>
    createdAt: string
  }>
  settings?: Record<string, any>
  messages?: Array<{
    role: string
    content: string
    timestamp: number
  }>
  metadata?: {
    framework?: string
    language?: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
}

export const projectExportService = {
  // Export project data
  exportProject: async (projectId: string, projectData: any, options: ProjectExportOptions = {
    includeFiles: true,
    includeSnapshots: false,
    includeSettings: true,
    includeMessages: true,
    format: 'json'
  }): Promise<{ success: boolean; data?: ProjectExportData; error?: string }> => {
    try {
      const exportData: ProjectExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        projectId,
        projectName: projectData.name || 'Untitled Project'
      };

      if (options.includeFiles && projectData.files) {
        exportData.files = projectData.files;
      }

      if (options.includeSnapshots && projectData.snapshots) {
        exportData.snapshots = projectData.snapshots;
      }

      if (options.includeSettings && projectData.settings) {
        exportData.settings = projectData.settings;
      }

      if (options.includeMessages && projectData.messages) {
        exportData.messages = projectData.messages;
      }

      exportData.metadata = {
        framework: projectData.framework,
        language: projectData.language,
        dependencies: projectData.dependencies,
        devDependencies: projectData.devDependencies
      };

      if (options.format === 'json') {
        return {
          success: true,
          data: exportData
        };
      }

      // ZIP format would require JSZip library - simplified for now
      return {
        success: false,
        error: 'ZIP format requires JSZip library (not implemented)'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export project'
      };
    }
  },

  // Import project data
  importProject: async (
    exportData: ProjectExportData,
    options: ProjectImportOptions = {
      overwrite: false,
      importFiles: true,
      importSnapshots: false,
      importSettings: true,
      importMessages: true
    }
  ): Promise<{ success: boolean; projectData?: any; error?: string }> => {
    try {
      const projectData: any = {
        id: exportData.projectId,
        name: exportData.projectName,
        lastModified: Date.now(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      if (options.importFiles && exportData.files) {
        projectData.files = exportData.files;
      }

      if (options.importSnapshots && exportData.snapshots) {
        projectData.snapshots = exportData.snapshots;
      }

      if (options.importSettings && exportData.settings) {
        projectData.settings = exportData.settings;
      }

      if (options.importMessages && exportData.messages) {
        projectData.messages = exportData.messages;
      }

      if (exportData.metadata) {
        projectData.framework = exportData.metadata.framework;
        projectData.language = exportData.metadata.language;
        projectData.dependencies = exportData.metadata.dependencies;
        projectData.devDependencies = exportData.metadata.devDependencies;
      }

      return {
        success: true,
        projectData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import project'
      };
    }
  },

  // Download project as JSON file
  downloadAsJSON: (exportData: ProjectExportData, filename?: string): void => {
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${exportData.projectName.replace(/[^a-z0-9]/gi, '_')}_export.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Read project from JSON file
  readFromJSON: (file: File): Promise<{ success: boolean; data?: ProjectExportData; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve({
            success: true,
            data
          });
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse JSON file'
          });
        }
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };
      reader.readAsText(file);
    });
  },

  // Validate export data
  validateExportData: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.version) {
      errors.push('Missing version');
    }

    if (!data.projectId) {
      errors.push('Missing projectId');
    }

    if (!data.projectName) {
      errors.push('Missing projectName');
    }

    if (!data.exportedAt) {
      errors.push('Missing exportedAt');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Get export format options
  getExportFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'json', label: 'JSON', description: 'Human-readable JSON format' },
      { value: 'zip', label: 'ZIP', description: 'Compressed archive (requires JSZip)' }
    ];
  },

  // Get export options summary
  getExportSummary(options: ProjectExportOptions): string {
    const parts: string[] = [];
    if (options.includeFiles) parts.push('files');
    if (options.includeSnapshots) parts.push('snapshots');
    if (options.includeSettings) parts.push('settings');
    if (options.includeMessages) parts.push('messages');
    return parts.join(', ') || 'nothing';
  }
};
