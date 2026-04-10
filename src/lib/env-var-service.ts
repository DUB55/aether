// Environment variable management service
// Securely stores and manages environment variables for projects

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { cryptoService } from './crypto-service';

export interface EnvironmentVariable {
  id: string
  name: string
  value: string
  environment: 'development' | 'staging' | 'production'
  projectId?: string
  workspaceId?: string
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  isEncrypted?: boolean
  description?: string
}

const ENV_VARS_COLLECTION = 'env_vars';
const ENCRYPTION_KEY_STORAGE_KEY = 'aether_env_encryption_key';

export const envVarService = {
  // Generate and store encryption key
  getOrCreateEncryptionKey: async (): Promise<CryptoKey> => {
    let keyData = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
    if (!keyData) {
      const result = await cryptoService.generateKey();
      if (!result.success || !result.keyData) {
        throw new Error(result.error || 'Failed to generate encryption key');
      }
      keyData = result.keyData;
      localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, keyData);
    }
    const result = await cryptoService.importKey(keyData);
    if (!result.success || !result.key) {
      throw new Error(result.error || 'Failed to import encryption key');
    }
    return result.key;
  },

  // Store an environment variable
  storeEnvVar: async (envVar: Omit<EnvironmentVariable, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isEncrypted'>): Promise<EnvironmentVariable> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const encryptionKey = await envVarService.getOrCreateEncryptionKey();
    const encryptionResult = await cryptoService.encrypt(envVar.value, encryptionKey);
    
    if (!encryptionResult.success || !encryptionResult.encryptedData) {
      throw new Error(encryptionResult.error || 'Failed to encrypt environment variable value');
    }

    const newEnvVar: EnvironmentVariable = {
      id: cryptoService.generateRandomString(),
      name: envVar.name,
      value: encryptionResult.encryptedData,
      environment: envVar.environment,
      projectId: envVar.projectId,
      workspaceId: envVar.workspaceId,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isEncrypted: true,
      description: envVar.description
    };

    await setDoc(doc(db, ENV_VARS_COLLECTION, newEnvVar.id), newEnvVar);
    return newEnvVar;
  },

  // Get an environment variable
  getEnvVar: async (id: string): Promise<EnvironmentVariable | null> => {
    const docRef = doc(db, ENV_VARS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const envVar = docSnap.data() as EnvironmentVariable;
    
    // Decrypt the value if it's encrypted
    if (envVar.isEncrypted) {
      const encryptionKey = await envVarService.getOrCreateEncryptionKey();
      const decryptionResult = await cryptoService.decrypt(envVar.value, encryptionKey);
      
      if (!decryptionResult.success || !decryptionResult.decryptedData) {
        throw new Error(decryptionResult.error || 'Failed to decrypt environment variable value');
      }
      
      envVar.value = decryptionResult.decryptedData;
    }

    return envVar;
  },

  // Update an environment variable
  updateEnvVar: async (id: string, updates: Partial<Omit<EnvironmentVariable, 'id' | 'userId' | 'createdAt' | 'isEncrypted'>>): Promise<void> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    // Encrypt the value if it's being updated
    if (updates.value) {
      const encryptionKey = await envVarService.getOrCreateEncryptionKey();
      const encryptionResult = await cryptoService.encrypt(updates.value, encryptionKey);
      
      if (!encryptionResult.success || !encryptionResult.encryptedData) {
        throw new Error(encryptionResult.error || 'Failed to encrypt environment variable value');
      }
      
      updateData.value = encryptionResult.encryptedData;
      updateData.isEncrypted = true;
    }

    await updateDoc(doc(db, ENV_VARS_COLLECTION, id), updateData);
  },

  // Delete an environment variable
  deleteEnvVar: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, ENV_VARS_COLLECTION, id));
  },

  // Get all environment variables for a user
  getUserEnvVars: async (userId?: string): Promise<EnvironmentVariable[]> => {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) {
      throw new Error('User not authenticated');
    }

    const q = query(collection(db, ENV_VARS_COLLECTION), where('userId', '==', uid));
    const querySnapshot = await getDocs(q);

    const envVars: EnvironmentVariable[] = [];
    const encryptionKey = await envVarService.getOrCreateEncryptionKey();

    for (const doc of querySnapshot.docs) {
      const envVar = doc.data() as EnvironmentVariable;
      
      // Decrypt the value if it's encrypted
      if (envVar.isEncrypted) {
        const decryptionResult = await cryptoService.decrypt(envVar.value, encryptionKey);
        if (!decryptionResult.success || !decryptionResult.decryptedData) {
          throw new Error(decryptionResult.error || 'Failed to decrypt environment variable value');
        }
        envVar.value = decryptionResult.decryptedData;
      }
      
      envVars.push(envVar);
    }

    return envVars;
  },

  // Get environment variables for a specific project
  getProjectEnvVars: async (projectId: string): Promise<EnvironmentVariable[]> => {
    const q = query(collection(db, ENV_VARS_COLLECTION), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    const envVars: EnvironmentVariable[] = [];
    const encryptionKey = await envVarService.getOrCreateEncryptionKey();

    for (const doc of querySnapshot.docs) {
      const envVar = doc.data() as EnvironmentVariable;
      
      // Decrypt the value if it's encrypted
      if (envVar.isEncrypted) {
        const decryptionResult = await cryptoService.decrypt(envVar.value, encryptionKey);
        if (!decryptionResult.success || !decryptionResult.decryptedData) {
          throw new Error(decryptionResult.error || 'Failed to decrypt environment variable value');
        }
        envVar.value = decryptionResult.decryptedData;
      }
      
      envVars.push(envVar);
    }

    return envVars;
  },

  // Get environment variables for a specific workspace
  getWorkspaceEnvVars: async (workspaceId: string): Promise<EnvironmentVariable[]> => {
    const q = query(collection(db, ENV_VARS_COLLECTION), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(q);

    const envVars: EnvironmentVariable[] = [];
    const encryptionKey = await envVarService.getOrCreateEncryptionKey();

    for (const doc of querySnapshot.docs) {
      const envVar = doc.data() as EnvironmentVariable;
      
      // Decrypt the value if it's encrypted
      if (envVar.isEncrypted) {
        const decryptionResult = await cryptoService.decrypt(envVar.value, encryptionKey);
        if (!decryptionResult.success || !decryptionResult.decryptedData) {
          throw new Error(decryptionResult.error || 'Failed to decrypt environment variable value');
        }
        envVar.value = decryptionResult.decryptedData;
      }
      
      envVars.push(envVar);
    }

    return envVars;
  },

  // Get environment variables by environment type
  getEnvVarsByEnvironment: async (environment: 'development' | 'staging' | 'production'): Promise<EnvironmentVariable[]> => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const q = query(
      collection(db, ENV_VARS_COLLECTION),
      where('userId', '==', userId),
      where('environment', '==', environment)
    );
    const querySnapshot = await getDocs(q);

    const envVars: EnvironmentVariable[] = [];
    const encryptionKey = await envVarService.getOrCreateEncryptionKey();

    for (const doc of querySnapshot.docs) {
      const envVar = doc.data() as EnvironmentVariable;
      
      // Decrypt the value if it's encrypted
      if (envVar.isEncrypted) {
        const decryptionResult = await cryptoService.decrypt(envVar.value, encryptionKey);
        if (!decryptionResult.success || !decryptionResult.decryptedData) {
          throw new Error(decryptionResult.error || 'Failed to decrypt environment variable value');
        }
        envVar.value = decryptionResult.decryptedData;
      }
      
      envVars.push(envVar);
    }

    return envVars;
  },

  // Export environment variables as .env file format
  exportAsEnvFile: async (environment: 'development' | 'staging' | 'production'): Promise<string> => {
    const envVars = await envVarService.getEnvVarsByEnvironment(environment);
    
    return envVars
      .map(envVar => `${envVar.name}=${envVar.value}`)
      .join('\n');
  },

  // Import environment variables from .env file format
  importFromEnvFile: async (
    envContent: string,
    environment: 'development' | 'staging' | 'production',
    projectId?: string,
    workspaceId?: string
  ): Promise<{ success: boolean; imported: number; errors: string[] }> => {
    const lines = envContent.split('\n');
    let imported = 0;
    const errors: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse KEY=VALUE format
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, name, value] = match;
        
        try {
          await envVarService.storeEnvVar({
            name: name.trim(),
            value: value.trim(),
            environment,
            projectId,
            workspaceId
          });
          imported++;
        } catch (error) {
          errors.push(`Failed to import ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        errors.push(`Invalid format: ${trimmed}`);
      }
    }

    return {
      success: errors.length === 0,
      imported,
      errors
    };
  },

  // Clear encryption key (for security)
  clearEncryptionKey: (): void => {
    localStorage.removeItem(ENCRYPTION_KEY_STORAGE_KEY);
  },

  // Validate environment variable name
  validateName: (name: string): { valid: boolean; error?: string } => {
    if (!name) {
      return { valid: false, error: 'Name is required' };
    }
    
    if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) {
      return { valid: false, error: 'Name must be uppercase letters, numbers, and underscores, starting with a letter or underscore' };
    }
    
    return { valid: true };
  },

  // Get supported environments
  getSupportedEnvironments(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'development', label: 'Development', description: 'Local development environment' },
      { value: 'staging', label: 'Staging', description: 'Pre-production testing environment' },
      { value: 'production', label: 'Production', description: 'Live production environment' }
    ];
  }
};
