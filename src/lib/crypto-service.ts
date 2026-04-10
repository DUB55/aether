// Crypto service for secure data encryption/decryption
// Uses Web Crypto API for client-side encryption

export interface EncryptionResult {
  success: boolean
  encryptedData?: string
  iv?: string
  error?: string
}

export interface DecryptionResult {
  success: boolean
  decryptedData?: string
  error?: string
}

// Generate a random encryption key
const generateKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

// Export key to base64 for storage
const exportKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey('jwk', key);
  return btoa(JSON.stringify(exported));
};

// Import key from base64
const importKey = async (keyData: string): Promise<CryptoKey> => {
  const exported = JSON.parse(atob(keyData));
  return await window.crypto.subtle.importKey(
    'jwk',
    exported,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

// Derive a key from a password
const deriveKeyFromPassword = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

export const cryptoService = {
  // Encrypt data using AES-GCM
  encrypt: async (data: string, key: CryptoKey): Promise<EncryptionResult> => {
    try {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);
      
      // Generate a random initialization vector
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encodedData
      );
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      // Convert to base64
      const encryptedBase64 = btoa(String.fromCharCode(...combined));
      
      return {
        success: true,
        encryptedData: encryptedBase64,
        iv: btoa(String.fromCharCode(...iv))
      };
    } catch (error) {
      console.error('Encryption error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed'
      };
    }
  },

  // Decrypt data using AES-GCM
  decrypt: async (encryptedData: string, key: CryptoKey): Promise<DecryptionResult> => {
    try {
      // Decode base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // Extract IV (first 12 bytes)
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decrypted);
      
      return {
        success: true,
        decryptedData: decryptedText
      };
    } catch (error) {
      console.error('Decryption error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      };
    }
  },

  // Encrypt data with password-based key derivation
  encryptWithPassword: async (data: string, password: string): Promise<EncryptionResult> => {
    try {
      // Generate a random salt
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      
      // Derive key from password
      const key = await deriveKeyFromPassword(password, salt);
      
      // Encrypt data
      const encryptResult = await cryptoService.encrypt(data, key);
      
      if (!encryptResult.success) {
        return encryptResult;
      }
      
      // Combine salt and encrypted data
      const saltBase64 = btoa(String.fromCharCode(...salt));
      const combined = `${saltBase64}:${encryptResult.encryptedData}`;
      
      return {
        success: true,
        encryptedData: combined
      };
    } catch (error) {
      console.error('Password encryption error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed'
      };
    }
  },

  // Decrypt data with password-based key derivation
  decryptWithPassword: async (encryptedData: string, password: string): Promise<DecryptionResult> => {
    try {
      // Split salt and encrypted data
      const [saltBase64, dataBase64] = encryptedData.split(':');
      
      if (!saltBase64 || !dataBase64) {
        return {
          success: false,
          error: 'Invalid encrypted data format'
        };
      }
      
      // Decode salt
      const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
      
      // Derive key from password
      const key = await deriveKeyFromPassword(password, salt);
      
      // Decrypt data
      return await cryptoService.decrypt(dataBase64, key);
    } catch (error) {
      console.error('Password decryption error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      };
    }
  },

  // Generate a new encryption key
  generateKey: async (): Promise<{ success: boolean; key?: CryptoKey; keyData?: string; error?: string }> => {
    try {
      const key = await generateKey();
      const keyData = await exportKey(key);
      
      return {
        success: true,
        key,
        keyData
      };
    } catch (error) {
      console.error('Key generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Key generation failed'
      };
    }
  },

  // Import a key from storage
  importKey: async (keyData: string): Promise<{ success: boolean; key?: CryptoKey; error?: string }> => {
    try {
      const key = await importKey(keyData);
      
      return {
        success: true,
        key
      };
    } catch (error) {
      console.error('Key import error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Key import failed'
      };
    }
  },

  // Hash a string using SHA-256
  hash: async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  // Generate a random string for tokens/IDs
  generateRandomString: (length: number = 32): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters[array[i] % characters.length];
    }
    return result;
  }
};
