import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, FirebaseUser, googleProvider, handleFirestoreError, OperationType, testConnection } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
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
