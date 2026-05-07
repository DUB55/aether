export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
  attachments?: string[]; // File names
  timestamp?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: Record<string, string>;
  messages: Message[];
  isPublic: boolean;
  ownerId: string;
  authorName?: string;
  authorPhoto?: string;
  createdAt: string;
  updatedAt: string;
  lastModified: number;
  notes?: string;
  // Multi-platform storage fields
  storageMode: 'cloud' | 'hybrid';
  localPath?: string; // Only for hybrid projects
  lastSyncAt?: string;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'local-only' | 'cloud-only';
  localFileHashes?: Record<string, string>; // Track local file versions
  cloudFileHashes?: Record<string, string>; // Track cloud file versions
  settings?: {
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    supabaseProjectRef?: string;
    githubRepo?: string;
    githubToken?: string;
    aiProvider?: "dub5" | "gemini" | "openai" | "anthropic";
    preferredModel?: string;
    geminiApiKey?: string;
    openaiApiKey?: string;
    anthropicApiKey?: string;
    lastUsedProvider?: string;
    lastUsedModel?: string;
    // Editor settings
    theme?: string;
    fontSize?: number;
    fontFamily?: string;
    lineNumbers?: boolean;
    wordWrap?: boolean;
    minimap?: boolean;
    // Preview settings
    previewDevice?: 'desktop' | 'tablet' | 'mobile';
    previewScale?: number;
    // Accessibility
    highContrast?: boolean;
    reducedMotion?: boolean;
    screenReaderOptimized?: boolean;
    // Collaboration
    isCollaborative?: boolean;
    collaborators?: string[];
    // Sync settings
    autoSync?: boolean;
    syncInterval?: number; // in minutes
    conflictResolution?: 'latest' | 'manual' | 'merge';
  };
}

export interface UserSettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: number;
  theme: 'dark' | 'light' | 'system';
  fontFamily: string;
}

export interface Snapshot {
  id: string;
  projectId: string;
  files: Record<string, string>;
  note: string;
  createdAt: any;
}

// Chat history for cross-platform continuity
export interface ChatHistory {
  id: string;
  projectId: string;
  userId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

// Sync conflict tracking
export interface SyncConflict {
  id: string;
  projectId: string;
  filePath: string;
  conflictType: 'content' | 'deleted' | 'added';
  localVersion?: string;
  cloudVersion?: string;
  localHash?: string;
  cloudHash?: string;
  resolved: boolean;
  resolution?: 'local' | 'cloud' | 'merge';
  createdAt: string;
  localPath?: string;
}

// File change tracking
export interface FileChange {
  filePath: string;
  type: 'added' | 'modified' | 'deleted';
  content?: string;
  hash?: string;
  timestamp: string;
  source: 'local' | 'cloud';
}

// Sync session tracking
export interface SyncSession {
  id: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  status: 'in-progress' | 'completed' | 'failed';
  changes: FileChange[];
  conflicts: SyncConflict[];
  errorMessage?: string;
}
