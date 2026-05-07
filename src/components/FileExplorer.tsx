import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Home, 
  Search,
  Plus,
  FolderOpen,
  FileText,
  Image,
  Code,
  Music,
  Video,
  Archive
} from 'lucide-react';
import { TauriCommands, isTauriApp } from '@/lib/tauri-commands';
import { cn } from '@/lib/utils';

interface FileNode {
  name: string;
  path: string;
  is_file: boolean;
  size?: number;
  children?: FileNode[];
  isExpanded?: boolean;
}

interface FileExplorerProps {
  onFileSelect?: (path: string) => void;
  onDirectorySelect?: (path: string) => void;
  className?: string;
}

const FILE_ICONS = {
  // Code files
  '.js': Code,
  '.jsx': Code,
  '.ts': Code,
  '.tsx': Code,
  '.html': Code,
  '.css': Code,
  '.json': Code,
  '.md': FileText,
  '.txt': FileText,
  // Image files
  '.png': Image,
  '.jpg': Image,
  '.jpeg': Image,
  '.gif': Image,
  '.svg': Image,
  '.webp': Image,
  // Audio files
  '.mp3': Music,
  '.wav': Music,
  '.ogg': Music,
  // Video files
  '.mp4': Video,
  '.avi': Video,
  '.mov': Video,
  // Archive files
  '.zip': Archive,
  '.rar': Archive,
  '.7z': Archive,
  '.tar': Archive,
};

export function FileExplorer({ onFileSelect, onDirectorySelect, className }: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (fileName: string, isFile: boolean) => {
    if (!isFile) return Folder;
    
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return FILE_ICONS[ext as keyof typeof FILE_ICONS] || File;
  };

  const loadDirectory = async (path: string) => {
    if (!isTauriApp()) return;

    setIsLoading(true);
    try {
      const result = await TauriCommands.manageDirectory('list', path);
      if (result.success && result.data?.items) {
        const items: FileNode[] = result.data.items
          .map((item: any) => ({
            name: item.name,
            path: item.path,
            is_file: item.is_file,
            size: item.size,
            children: item.is_file ? undefined : []
          }))
          .sort((a, b) => {
            // Directories first, then files
            if (a.is_file !== b.is_file) {
              return a.is_file ? 1 : -1;
            }
            // Then alphabetically
            return a.name.localeCompare(b.name);
          });

        if (path === '/') {
          setFileTree(items);
        } else {
          // Update parent node's children
          updateFileTree(path, items);
        }
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFileTree = (path: string, items: FileNode[]) => {
    setFileTree(prev => {
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === path) {
            return { ...node, children: items };
          }
          if (node.children) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      return updateNode(prev);
    });
  };

  const toggleNode = async (node: FileNode) => {
    if (node.is_file) {
      onFileSelect?.(node.path);
      return;
    }

    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(node.path)) {
      newExpanded.delete(node.path);
    } else {
      newExpanded.add(node.path);
      await loadDirectory(node.path);
    }
    setExpandedNodes(newExpanded);
  };

  const navigateToPath = async (path: string) => {
    setCurrentPath(path);
    await loadDirectory(path);
    onDirectorySelect?.(path);
  };

  const createFolder = async () => {
    if (!isTauriApp()) return;

    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    const newPath = `${currentPath}/${folderName}`.replace(/\/+/g, '/');
    try {
      const result = await TauriCommands.manageDirectory('create', newPath);
      if (result.success) {
        await loadDirectory(currentPath);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const renderFileNode = (node: FileNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.path);
    const Icon = getFileIcon(node.name, node.is_file);
    const isDirectory = !node.is_file;

    return (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1 hover:bg-muted cursor-pointer rounded text-sm",
            "transition-colors duration-150"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => toggleNode(node)}
        >
          {isDirectory && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </div>
          )}
          <Icon className={cn(
            "w-4 h-4 flex-shrink-0",
            isDirectory ? "text-blue-500" : "text-muted-foreground"
          )} />
          <span className="truncate flex-1">{node.name}</span>
          {!isDirectory && node.size && (
            <span className="text-xs text-muted-foreground ml-auto">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>
        {isDirectory && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredTree = fileTree.filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isTauriApp()) {
      loadDirectory(currentPath);
    }
  }, [currentPath]);

  useEffect(() => {
    // Load initial directory
    if (isTauriApp()) {
      loadDirectory('/');
    }
  }, []);

  if (!isTauriApp()) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        <p>File explorer is only available in the desktop app</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">File Explorer</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={createFolder}
            className="flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Folder
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToPath('/')}
            className="p-2"
          >
            <Home className="w-4 h-4" />
          </Button>
          <Input
            value={currentPath}
            onChange={(e) => setCurrentPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigateToPath(currentPath);
              }
            }}
            placeholder="Path"
            className="flex-1 text-sm"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTree.length > 0 ? (
            filteredTree.map(node => renderFileNode(node))
          ) : searchQuery ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No files found matching "{searchQuery}"
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Empty directory
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
