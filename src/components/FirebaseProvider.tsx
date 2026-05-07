import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, FirebaseUser, googleProvider, handleFirestoreError, OperationType, testConnection } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, Timestamp, deleteDoc, updateDoc, getDocFromServer, getDocs, orderBy } from 'firebase/firestore';
import { type Project } from '@/types';
import { deleteProjectFromGithubRegistry, addProjectToGithubRegistry } from '@/lib/github-registry';
import { storage as indexedDBStorage } from '@/lib/storage';
import { saveProjectToGitHub, loadProjectsFromGitHub, deleteProjectFromGitHub, loadProjectFromGitHub, type GitHubProject } from '@/lib/github-project-storage';
import { chatHistoryService } from '@/lib/chat-history';

interface FirebaseContextType {
  user: FirebaseUser | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthReady: boolean;
  projects: Project[];
  saveProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  saveSnapshot: (projectId: string, files: Record<string, string>, note?: string) => Promise<void>;
  getSnapshots: (projectId: string) => Promise<any[]>;
  restoreSnapshot: (projectId: string, snapshotId: string) => Promise<Record<string, string>>;
  fetchProjectById: (projectId: string, callback: (project: Project) => void) => () => void;
  // Chat history methods
  saveChatHistory: (projectId: string, messages: any[]) => Promise<void>;
  loadChatHistory: (projectId: string) => Promise<any[]>;
  addChatMessage: (projectId: string, message: any) => Promise<void>;
  subscribeToChatHistory: (projectId: string, callback: (messages: any[]) => void) => () => void;
  // Profile picture methods
  updateProfilePicture: (photoURL: string) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    console.log('[FirebaseProvider] Setting up auth state listener');
    
    // Suppress Firebase connection errors in console
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && (
        message.includes('ERR_BLOCKED_BY_CLIENT') ||
        message.includes('firestore.googleapis.com') ||
        message.includes('Firebase')
      )) {
        return; // Suppress Firebase connection errors
      }
      originalConsoleError.apply(console, args);
    };
    
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[FirebaseProvider] Auth state changed - firebaseUser:', firebaseUser ? 'authenticated' : 'null');
      if (firebaseUser) {
        console.log('[FirebaseProvider] User authenticated - uid:', firebaseUser.uid, 'email:', firebaseUser.email);
      }
      setUser(firebaseUser);
      setIsAuthReady(true);
      console.log('[FirebaseProvider] isAuthReady set to true');

      if (firebaseUser) {
        // Sync user profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            console.log('[FirebaseProvider] Creating new user profile');
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'user'
            });
          } else {
            console.log('[FirebaseProvider] User profile already exists');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }
      } else {
        console.log('[FirebaseProvider] User signed out - clearing projects');
        setProjects([]);
      }
    });

    return () => {
      console.log('[FirebaseProvider] Cleaning up auth state listener');
      console.error = originalConsoleError; // Restore original console.error
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && isAuthReady) {
      // Load projects from GitHub instead of Firebase
      loadProjectsFromGitHub()
        .then(projectsData => {
          console.log('[FirebaseProvider] Loaded projects from GitHub:', projectsData.length);
          setProjects(projectsData as Project[]);
        })
        .catch(error => {
          console.error('[FirebaseProvider] Error loading projects from GitHub:', error);
          setProjects([]);
        });
    }
  }, [user, isAuthReady]);

  const signIn = async () => {
    // Check for debug mode (for testing purposes)
    const isDebugMode = localStorage.getItem('aether_debug_mode') === 'true';
    
    if (isDebugMode) {
      console.log('[FirebaseProvider] Debug mode enabled - creating mock user');
      const mockUser = {
        uid: 'debug-user-' + Math.random().toString(36).substring(7),
        email: 'debug@example.com',
        displayName: 'Debug User',
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        providerData: [],
        tenantId: null,
        refreshToken: 'mock-token',
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      };
      setUser(mockUser as any);
      return;
    }
    
    // Force popup authentication only - no redirect fallback
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle network errors
      if (error.code === 'auth/network-request-failed' || error.message.includes('network-request-failed')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      // For popup blocked errors, provide clear guidance but don't redirect
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        throw new Error('Popup was blocked or closed. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Firebase authentication. Please add it to your Firebase console.');
      } else if (error.code === 'auth/api-key-not-allowed') {
        throw new Error('API key is not allowed. Please check your Firebase configuration.');
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const saveProject = async (project: Project) => {
    if (!user) return;
    try {
      const projectToSave: GitHubProject = {
        ...project,
        ownerId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhoto: user.photoURL || 'AETHER_LOGO_COMPONENT',
        updatedAt: new Date().toISOString(),
        createdAt: project.createdAt || new Date().toISOString(),
      };

      await saveProjectToGitHub(projectToSave);

      // Reload projects after saving
      const updatedProjects = await loadProjectsFromGitHub();
      setProjects(updatedProjects as Project[]);

      // Update GitHub registry if token is available
      const githubToken = localStorage.getItem('github_token') || project.settings?.githubToken;
      if (githubToken) {
        await addProjectToGithubRegistry(projectToSave, githubToken);
      }
    } catch (error) {
      console.error('[FirebaseProvider] Error saving project to GitHub:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;
    try {
      await deleteProjectFromGitHub(projectId);

      // Reload projects after deleting
      const updatedProjects = await loadProjectsFromGitHub();
      setProjects(updatedProjects as Project[]);

      // Also delete from GitHub registry if token is available
      const githubToken = localStorage.getItem('github_token');
      if (githubToken) {
        await deleteProjectFromGithubRegistry(projectId, githubToken);
      }
    } catch (error) {
      console.error('[FirebaseProvider] Error deleting project from GitHub:', error);
      throw error;
    }
  };

  const saveSnapshot = async (projectId: string, files: Record<string, string>, note?: string) => {
    if (!user) return;
    const snapshotId = Math.random().toString(36).substring(7);
    try {
      // Load project first
      const project = await loadProjectFromGitHub(projectId);
      if (!project) throw new Error('Project not found');

      // Save snapshot in project metadata
      const snapshots = (project as any).snapshots || [];
      snapshots.push({
        id: snapshotId,
        files,
        note: note || '',
        createdAt: new Date().toISOString()
      });

      const updatedProject = {
        ...project,
        snapshots,
        updatedAt: new Date().toISOString()
      };

      await saveProjectToGitHub(updatedProject);
    } catch (error) {
      console.error('[FirebaseProvider] Error saving snapshot to GitHub:', error);
      throw error;
    }
  };

  const getSnapshots = async (projectId: string) => {
    if (!user) return [];
    try {
      const project = await loadProjectFromGitHub(projectId);
      if (!project) return [];
      return ((project as any).snapshots || []).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('[FirebaseProvider] Error getting snapshots from GitHub:', error);
      return [];
    }
  };

  const restoreSnapshot = async (projectId: string, snapshotId: string) => {
    const project = await loadProjectFromGitHub(projectId);
    if (!project) throw new Error('Project not found');
    
    const snapshot = ((project as any).snapshots || []).find((s: any) => s.id === snapshotId);
    if (!snapshot) throw new Error('Snapshot not found');
    
    return snapshot.files;
  };

  const fetchProjectById = (projectId: string, callback: (project: Project) => void) => {
    // GitHub doesn't support real-time updates, so we fetch once
    loadProjectFromGitHub(projectId)
      .then(project => {
        if (project) {
          callback(project as Project);
        }
      })
      .catch(error => {
        console.error('[FirebaseProvider] Error fetching project from GitHub:', error);
      });
    // Return empty function since there's no real-time unsubscribe
    return () => {};
  };

  // Chat history methods
  const saveChatHistory = async (projectId: string, messages: any[]) => {
    if (!user) return;
    try {
      await chatHistoryService.saveChatHistory(projectId, user.uid, messages);
    } catch (error) {
      console.error('[FirebaseProvider] Failed to save chat history:', error);
      throw error;
    }
  };

  const loadChatHistory = async (projectId: string) => {
    if (!user) return [];
    try {
      const chatHistory = await chatHistoryService.loadChatHistory(projectId, user.uid);
      return chatHistory?.messages || [];
    } catch (error) {
      console.error('[FirebaseProvider] Failed to load chat history:', error);
      return [];
    }
  };

  const addChatMessage = async (projectId: string, message: any) => {
    if (!user) return;
    try {
      // Add timestamp to message if not present
      const messageWithTimestamp = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      };
      await chatHistoryService.addMessage(projectId, user.uid, messageWithTimestamp);
    } catch (error) {
      console.error('[FirebaseProvider] Failed to add chat message:', error);
      throw error;
    }
  };

  const subscribeToChatHistory = (projectId: string, callback: (messages: any[]) => void) => {
    if (!user) return () => {};
    return chatHistoryService.subscribeToChatHistory(projectId, user.uid, (chatHistory) => {
      callback(chatHistory?.messages || []);
    });
  };

  // Profile picture methods
  const updateProfilePicture = async (photoURL: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL });
      // Update local user state
      setUser({ ...user, photoURL });
      console.log('[FirebaseProvider] Profile picture updated successfully');
    } catch (error) {
      console.error('[FirebaseProvider] Failed to update profile picture:', error);
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      throw error;
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    // Convert file to base64 for storage in Firestore
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          await updateProfilePicture(base64);
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      signIn, 
      logout, 
      isAuthReady, 
      projects, 
      saveProject, 
      deleteProject, 
      saveSnapshot, 
      getSnapshots, 
      restoreSnapshot,
      fetchProjectById,
      saveChatHistory,
      loadChatHistory,
      addChatMessage,
      subscribeToChatHistory,
      updateProfilePicture,
      uploadProfilePicture
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
