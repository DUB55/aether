// File upload service
// Handles file uploads to Firebase Storage

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { auth } from './firebase';

export interface FileUploadOptions {
  path: string
  metadata?: {
    contentType?: string
    customMetadata?: Record<string, string>
  }
}

export interface UploadedFile {
  name: string
  url: string
  path: string
  size: number
  contentType?: string
  uploadedAt: Date
}

export const fileUploadService = {
  // Upload a file
  uploadFile: async (file: File, options: FileUploadOptions): Promise<UploadedFile> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const storage = getStorage();
    const fileName = `${Date.now()}-${file.name}`;
    const fullPath = `${userId}/${options.path}/${fileName}`;
    const storageRef = ref(storage, fullPath);

    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        originalName: file.name,
        size: file.size.toString(),
        ...options.metadata?.customMetadata
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const url = await getDownloadURL(snapshot.ref);

    return {
      name: file.name,
      url,
      path: fullPath,
      size: file.size,
      contentType: file.type,
      uploadedAt: new Date()
    };
  },

  // Upload multiple files
  uploadMultipleFiles: async (files: File[], options: FileUploadOptions): Promise<UploadedFile[]> => {
    const uploads = files.map(file => fileUploadService.uploadFile(file, options));
    return Promise.all(uploads);
  },

  // Get download URL for a file
  getDownloadURL: async (path: string): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  },

  // Delete a file
  deleteFile: async (path: string): Promise<void> => {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },

  // List files in a directory
  listFiles: async (path: string): Promise<string[]> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const storage = getStorage();
    const storageRef = ref(storage, `${userId}/${path}`);
    const result = await listAll(storageRef);
    
    return result.items.map(item => item.fullPath);
  },

  // Validate file type
  validateFileType: (file: File, allowedTypes: string[]): { valid: boolean; error?: string } => {
    if (allowedTypes.length === 0) {
      return { valid: true };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  },

  // Validate file size
  validateFileSize: (file: File, maxSizeInMB: number): { valid: boolean; error?: string } => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (file.size > maxSizeInBytes) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSizeInMB}MB`
      };
    }

    return { valid: true };
  },

  // Get file extension
  getFileExtension: (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Get allowed file types by category
  getAllowedFileTypes: (category: 'image' | 'document' | 'audio' | 'video' | 'all'): string[] => {
    const types: Record<string, string[]> = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/webm', 'video/ogg']
    };

    return types[category] || types.all;
  },

  // Get MIME type from file extension
  getMimeType: (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'mp4': 'video/mp4',
      'webm': 'video/webm'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
};
