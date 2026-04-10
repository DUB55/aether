// Version history and rollback service
// Manages project versions and allows rollback to previous states
// Now uses Firebase Firestore for persistent storage

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot, getDocs, Timestamp } from 'firebase/firestore';

export interface ProjectVersion {
  id: string
  projectId: string
  version: string
  description: string
  files: Record<string, string>
  createdAt: Timestamp
  createdBy: string
  isCurrent: boolean
}

export interface RollbackResult {
  success: boolean
  message: string
  restoredVersion?: ProjectVersion
}

const VERSION_HISTORY_COLLECTION = 'version_history';

export const versionHistoryService = {
  // Save a new version
  saveVersion: async (
    projectId: string,
    files: Record<string, string>,
    description: string,
    createdBy: string
  ): Promise<ProjectVersion> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    // Get existing versions to mark previous current as not current
    const q = query(collection(db, VERSION_HISTORY_COLLECTION), where('projectId', '==', projectId), where('isCurrent', '==', true));
    const querySnapshot = await getDocs(q);
    
    // Mark previous current versions as not current
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { isCurrent: false });
    });
    
    // Generate version number
    const allVersionsQuery = query(collection(db, VERSION_HISTORY_COLLECTION), where('projectId', '==', projectId));
    const allVersionsSnapshot = await getDocs(allVersionsQuery);
    const versionNumber = allVersionsSnapshot.size + 1;
    
    const versionId = `version_${Date.now()}`;
    const now = Timestamp.now();
    
    const newVersion: ProjectVersion = {
      id: versionId,
      projectId,
      version: `v${versionNumber}`,
      description,
      files: { ...files },
      createdAt: now,
      createdBy,
      isCurrent: true
    }
    
    // Store in Firebase Firestore
    const versionRef = doc(db, VERSION_HISTORY_COLLECTION, versionId);
    await setDoc(versionRef, newVersion);
    
    return newVersion;
  },

  // Get all versions for a project
  getVersions: async (projectId: string): Promise<ProjectVersion[]> => {
    const q = query(collection(db, VERSION_HISTORY_COLLECTION), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as ProjectVersion).sort((a, b) => 
      b.createdAt.toMillis() - a.createdAt.toMillis()
    );
  },

  // Get a specific version
  getVersion: async (projectId: string, versionId: string): Promise<ProjectVersion | null> => {
    const versionRef = doc(db, VERSION_HISTORY_COLLECTION, versionId);
    const versionDoc = await getDoc(versionRef);
    
    if (versionDoc.exists()) {
      const version = versionDoc.data() as ProjectVersion;
      if (version.projectId === projectId) {
        return version;
      }
    }
    return null;
  },

  // Get current version
  getCurrentVersion: async (projectId: string): Promise<ProjectVersion | null> => {
    const q = query(collection(db, VERSION_HISTORY_COLLECTION), where('projectId', '==', projectId), where('isCurrent', '==', true));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as ProjectVersion;
    }
    return null;
  },

  // Rollback to a specific version
  rollbackToVersion: async (projectId: string, versionId: string): Promise<RollbackResult> => {
    try {
      const targetVersion = await versionHistoryService.getVersion(projectId, versionId);
      
      if (!targetVersion) {
        return {
          success: false,
          message: 'Version not found'
        }
      }
      
      // Create a new version with the rolled-back state
      const rollbackVersion = await versionHistoryService.saveVersion(
        projectId,
        targetVersion.files,
        `Rollback to ${targetVersion.version}`,
        'system'
      )
      
      return {
        success: true,
        message: `Successfully rolled back to ${targetVersion.version}`,
        restoredVersion: rollbackVersion
      }
    } catch (error) {
      console.error('Rollback error:', error)
      return {
        success: false,
        message: 'Failed to rollback to version'
      }
    }
  },

  // Delete a version (cannot delete current version)
  deleteVersion: async (projectId: string, versionId: string): Promise<boolean> => {
    try {
      const versionRef = doc(db, VERSION_HISTORY_COLLECTION, versionId);
      const versionDoc = await getDoc(versionRef);
      
      if (!versionDoc.exists()) return false;
      
      const version = versionDoc.data() as ProjectVersion;
      if (version.isCurrent) {
        console.error('Cannot delete current version');
        return false;
      }
      
      if (version.projectId !== projectId) return false;
      
      await deleteDoc(versionRef);
      return true;
    } catch (error) {
      console.error('Delete version error:', error);
      return false;
    }
  },

  // Compare two versions
  compareVersions: async (projectId: string, versionId1: string, versionId2: string): Promise<{
    added: string[]
    modified: string[]
    deleted: string[]
  }> => {
    const version1 = await versionHistoryService.getVersion(projectId, versionId1);
    const version2 = await versionHistoryService.getVersion(projectId, versionId2);
    
    if (!version1 || !version2) {
      return { added: [], modified: [], deleted: [] }
    }
    
    const files1 = Object.keys(version1.files);
    const files2 = Object.keys(version2.files);
    
    const added = files2.filter(f => !files1.includes(f));
    const deleted = files1.filter(f => !files2.includes(f));
    const modified = files1.filter(f => files2.includes(f) && version1.files[f] !== version2.files[f]);
    
    return { added, modified, deleted };
  },

  // Get version statistics
  getVersionStats: async (projectId: string) => {
    const versions = await versionHistoryService.getVersions(projectId);
    
    return {
      totalVersions: versions.length,
      currentVersion: versions.find(v => v.isCurrent)?.version || 'none',
      firstVersion: versions[0]?.version || 'none',
      lastVersion: versions[versions.length - 1]?.version || 'none',
      totalStorage: JSON.stringify(versions).length // Approximate storage size
    };
  },

  // Subscribe to version changes for a project (real-time updates)
  subscribeToVersions: (projectId: string, callback: (versions: ProjectVersion[]) => void) => {
    const q = query(collection(db, VERSION_HISTORY_COLLECTION), where('projectId', '==', projectId));
    return onSnapshot(q, (snapshot) => {
      const versions = snapshot.docs.map(doc => doc.data() as ProjectVersion).sort((a, b) => 
        b.createdAt.toMillis() - a.createdAt.toMillis()
      );
      callback(versions);
    });
  },
}
