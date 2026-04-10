// File Manager Component
// Manages file uploads, downloads, and organization using Firebase Storage

import { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, File as FileIcon, Folder, Search, Grid, List, MoreVertical, X } from 'lucide-react';
import { fileUploadService } from '../lib/file-upload-service';

export interface FileItem {
  name: string;
  fullPath: string;
  size: number;
  type: string;
  timeCreated: number;
  updated?: number;
}

export default function FileManager({ projectId, workspaceId }: { projectId?: string; workspaceId?: string }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [projectId, workspaceId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const path = projectId ? `projects/${projectId}` : workspaceId ? `workspaces/${workspaceId}` : 'uploads';
      const filePaths = await fileUploadService.listFiles(path);
      
      // Convert file paths to FileItem objects
      const fileItems: FileItem[] = filePaths.map(path => {
        const name = path.split('/').pop() || path;
        return {
          name,
          fullPath: path,
          size: 0, // Would need to get metadata for actual size
          type: fileUploadService.getMimeType(name.split('.').pop() || ''),
          timeCreated: Date.now()
        };
      });
      
      setFiles(fileItems);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (fileList: FileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const path = projectId ? `projects/${projectId}` : workspaceId ? `workspaces/${workspaceId}` : 'uploads';
      
      for (let i = 0; i < files.length; i++) {
        await fileUploadService.uploadFile(files[i], { path });
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      await loadFiles();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const url = await fileUploadService.getDownloadURL(file.fullPath);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;
    try {
      await fileUploadService.deleteFile(file.fullPath);
      await loadFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };

  const handleMultipleDelete = async () => {
    if (!confirm('Are you sure you want to delete all files? This action cannot be undone.')) return;
    try {
      // Delete files individually since deleteFolder doesn't exist
      for (const file of files) {
        await fileUploadService.deleteFile(file.fullPath);
      }
      await loadFiles();
    } catch (error) {
      console.error('Failed to delete files:', error);
      alert('Failed to delete files');
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('code') || type.includes('json') || type.includes('text')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="p-6 text-center">Loading files...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Folder className="w-6 h-6" />
          File Manager
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
          {files.length > 0 && (
            <button
              onClick={handleMultipleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No files found</p>
          <p className="text-sm text-gray-400 mt-2">Upload files to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.fullPath}
              className="relative p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedFile(file)}
            >
              <div className="text-4xl mb-2">{getFileIcon(file.type)}</div>
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Download"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file);
                  }}
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Size</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.fullPath} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm flex items-center gap-2">
                    <span className="text-xl">{getFileIcon(file.type)}</span>
                    <span className="truncate">{file.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{file.type}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Upload Files</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploading ? (
                <div className="text-center py-8">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uploading... {Math.round(uploadProgress)}%</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Drag and drop files here, or click to select
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Select Files
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Detail Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">File Details</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-4xl mb-4">
                  {getFileIcon(selectedFile.type)}
                  <span className="text-xl font-medium">{selectedFile.name}</span>
                </div>
                <div>
                  <span className="font-semibold">Size:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{formatFileSize(selectedFile.size)}</span>
                </div>
                <div>
                  <span className="font-semibold">Type:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedFile.type}</span>
                </div>
                <div>
                  <span className="font-semibold">Path:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400 break-all">{selectedFile.fullPath}</span>
                </div>
                <div>
                  <span className="font-semibold">Created:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(selectedFile.timeCreated).toLocaleString()}</span>
                </div>
                {selectedFile.updated && (
                  <div>
                    <span className="font-semibold">Updated:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{new Date(selectedFile.updated).toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    handleDownload(selectedFile);
                    setSelectedFile(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedFile);
                    setSelectedFile(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
