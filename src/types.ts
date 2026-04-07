export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
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
