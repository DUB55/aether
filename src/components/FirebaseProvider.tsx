import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, FirebaseUser, googleProvider, handleFirestoreError, OperationType, testConnection } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, Timestamp, deleteDoc, updateDoc, getDocFromServer, getDocs, orderBy } from 'firebase/firestore';
import { type Project } from '@/types';
import { deleteProjectFromGithubRegistry, addProjectToGithubRegistry } from '@/lib/github-registry';
import { storage as indexedDBStorage } from '@/lib/storage';

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
      const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          updatedAt: (doc.data().updatedAt as Timestamp).toDate().toISOString(),
          createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
        } as Project));
        setProjects(projectsData);
      }, async (error) => {
        handleFirestoreError(error, OperationType.LIST, 'projects');
        // Fallback to IndexedDB
        console.log('[FirebaseProvider] Firestore list failed, falling back to IndexedDB');
        try {
          const localProjects = await indexedDBStorage.getAllProjects();
          setProjects(localProjects);
        } catch (indexedDBError) {
          console.error('[FirebaseProvider] IndexedDB list also failed:', indexedDBError);
          setProjects([]);
        }
      });

      return () => unsubscribe();
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
    const projectRef = doc(db, 'projects', project.id);
    try {
      const updatedAt = Timestamp.now();
      const createdAt = project.createdAt ? Timestamp.fromDate(new Date(project.createdAt)) : Timestamp.now();
      
      const projectToSave = {
        ...project,
        ownerId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhoto: user.photoURL || 'AETHER_LOGO_COMPONENT',
        updatedAt,
        createdAt,
      };

      await setDoc(projectRef, projectToSave, { merge: true });

      // Update GitHub registry if token is available
      const githubToken = localStorage.getItem('github_token') || project.settings?.githubToken;
      if (githubToken) {
        await addProjectToGithubRegistry({
          ...projectToSave,
          updatedAt: updatedAt.toDate().toISOString(),
          createdAt: createdAt.toDate().toISOString()
        }, githubToken);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${project.id}`);
      // Fallback to IndexedDB
      console.log('[FirebaseProvider] Firestore save failed, falling back to IndexedDB');
      try {
        await indexedDBStorage.saveProject(project);
      } catch (indexedDBError) {
        console.error('[FirebaseProvider] IndexedDB save also failed:', indexedDBError);
      }
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;
    const projectRef = doc(db, 'projects', projectId);
    try {
      // Get project settings to see if we have a GitHub token
      const projectDoc = await getDoc(projectRef);
      const projectData = projectDoc.data() as Project | undefined;
      const githubToken = localStorage.getItem('github_token') || projectData?.settings?.githubToken;

      await deleteDoc(projectRef);

      // Also delete from GitHub registry if token is available
      if (githubToken) {
        await deleteProjectFromGithubRegistry(projectId, githubToken);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`);
      // Fallback to IndexedDB
      console.log('[FirebaseProvider] Firestore delete failed, falling back to IndexedDB');
      try {
        await indexedDBStorage.deleteProject(projectId);
      } catch (indexedDBError) {
        console.error('[FirebaseProvider] IndexedDB delete also failed:', indexedDBError);
      }
    }
  };

  const saveSnapshot = async (projectId: string, files: Record<string, string>, note?: string) => {
    if (!user) return;
    const snapshotId = Math.random().toString(36).substring(7);
    const snapshotRef = doc(db, 'projects', projectId, 'snapshots', snapshotId);
    try {
      await setDoc(snapshotRef, {
        id: snapshotId,
        projectId,
        files,
        note: note || '',
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${projectId}/snapshots/${snapshotId}`);
    }
  };

  const getSnapshots = async (projectId: string) => {
    if (!user) return [];
    const q = query(
      collection(db, 'projects', projectId, 'snapshots'),
      orderBy('createdAt', 'desc')
    );
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `projects/${projectId}/snapshots`);
      return [];
    }
  };

  const restoreSnapshot = async (projectId: string, snapshotId: string) => {
    const snapshotRef = doc(db, 'projects', projectId, 'snapshots', snapshotId);
    const snapshotDoc = await getDoc(snapshotRef);
    if (snapshotDoc.exists()) {
      return snapshotDoc.data().files;
    }
    throw new Error('Snapshot not found');
  };

  const fetchProjectById = (projectId: string, callback: (project: Project) => void) => {
    return onSnapshot(doc(db, 'projects', projectId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          ...data,
          id: snapshot.id,
          updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
          createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as Project);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `projects/${projectId}`);
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
      fetchProjectById
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
