/**
 * Tests for share-crypto module project packaging functions
 */

import {
  packageProject,
  createEncryptedSharePayload,
  unpackEncryptedShare,
  type ProjectPayload,
} from './share-crypto';

describe('Project Packaging Functions', () => {
  const testFiles = [
    { name: 'index.html', content: '<!DOCTYPE html><html><body>Hello</body></html>' },
    { name: 'style.css', content: 'body { margin: 0; }' },
    { name: 'script.js', content: 'console.log("test");' },
  ];

  describe('packageProject', () => {
    it('should convert file array to versioned JSON payload', () => {
      const result = packageProject(testFiles);
      
      // Should return a Uint8Array
      expect(result).toBeInstanceOf(Uint8Array);
      
      // Should be valid JSON when decoded
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(result);
      const payload: ProjectPayload = JSON.parse(jsonString);
      
      // Should have version field
      expect(payload.v).toBe(1);
      
      // Should have files object
      expect(payload.files).toBeDefined();
      expect(Object.keys(payload.files)).toHaveLength(3);
      
      // Should preserve file names and contents
      expect(payload.files['index.html']).toBe(testFiles[0].content);
      expect(payload.files['style.css']).toBe(testFiles[1].content);
      expect(payload.files['script.js']).toBe(testFiles[2].content);
    });

    it('should handle empty file array', () => {
      const result = packageProject([]);
      
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(result);
      const payload: ProjectPayload = JSON.parse(jsonString);
      
      expect(payload.v).toBe(1);
      expect(payload.files).toEqual({});
    });

    it('should handle single file', () => {
      const singleFile = [{ name: 'test.txt', content: 'test content' }];
      const result = packageProject(singleFile);
      
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(result);
      const payload: ProjectPayload = JSON.parse(jsonString);
      
      expect(payload.files['test.txt']).toBe('test content');
    });
  });

  describe('createEncryptedSharePayload and unpackEncryptedShare', () => {
    it('should encrypt and decrypt project files (round-trip)', async () => {
      // Encrypt the files
      const { encryptedPayload, keyB64 } = await createEncryptedSharePayload(testFiles);
      
      // Verify encrypted payload structure
      expect(encryptedPayload.v).toBe(1);
      expect(encryptedPayload.iv).toBeDefined();
      expect(encryptedPayload.data).toBeDefined();
      expect(typeof encryptedPayload.iv).toBe('string');
      expect(typeof encryptedPayload.data).toBe('string');
      
      // Verify key is a string
      expect(typeof keyB64).toBe('string');
      expect(keyB64.length).toBeGreaterThan(0);
      
      // Decrypt the payload
      const decryptedPayload = await unpackEncryptedShare(encryptedPayload, keyB64);
      
      // Verify decrypted payload structure
      expect(decryptedPayload.v).toBe(1);
      expect(decryptedPayload.files).toBeDefined();
      
      // Verify all files are preserved
      expect(Object.keys(decryptedPayload.files)).toHaveLength(3);
      expect(decryptedPayload.files['index.html']).toBe(testFiles[0].content);
      expect(decryptedPayload.files['style.css']).toBe(testFiles[1].content);
      expect(decryptedPayload.files['script.js']).toBe(testFiles[2].content);
    });

    it('should handle empty file array in encryption/decryption', async () => {
      const { encryptedPayload, keyB64 } = await createEncryptedSharePayload([]);
      const decryptedPayload = await unpackEncryptedShare(encryptedPayload, keyB64);
      
      expect(decryptedPayload.files).toEqual({});
    });

    it('should handle large file content', async () => {
      const largeContent = 'x'.repeat(10000);
      const largeFiles = [{ name: 'large.txt', content: largeContent }];
      
      const { encryptedPayload, keyB64 } = await createEncryptedSharePayload(largeFiles);
      const decryptedPayload = await unpackEncryptedShare(encryptedPayload, keyB64);
      
      expect(decryptedPayload.files['large.txt']).toBe(largeContent);
    });

    it('should fail with wrong encryption key', async () => {
      const { encryptedPayload } = await createEncryptedSharePayload(testFiles);
      
      // Generate a different key
      const { keyB64: wrongKey } = await createEncryptedSharePayload([{ name: 'dummy', content: 'dummy' }]);
      
      // Should throw an error when decrypting with wrong key
      await expect(unpackEncryptedShare(encryptedPayload, wrongKey)).rejects.toThrow();
    });

    it('should produce different encrypted data each time (random IV)', async () => {
      const { encryptedPayload: payload1 } = await createEncryptedSharePayload(testFiles);
      const { encryptedPayload: payload2 } = await createEncryptedSharePayload(testFiles);
      
      // IVs should be different
      expect(payload1.iv).not.toBe(payload2.iv);
      
      // Encrypted data should be different
      expect(payload1.data).not.toBe(payload2.data);
    });

    it('should handle special characters in file names and content', async () => {
      const specialFiles = [
        { name: 'file with spaces.txt', content: 'content with\nnewlines\tand\ttabs' },
        { name: 'file-with-dashes.js', content: 'const emoji = "🚀";' },
        { name: 'file_with_underscores.css', content: '/* comment */ body { }' },
      ];
      
      const { encryptedPayload, keyB64 } = await createEncryptedSharePayload(specialFiles);
      const decryptedPayload = await unpackEncryptedShare(encryptedPayload, keyB64);
      
      expect(decryptedPayload.files['file with spaces.txt']).toBe(specialFiles[0].content);
      expect(decryptedPayload.files['file-with-dashes.js']).toBe(specialFiles[1].content);
      expect(decryptedPayload.files['file_with_underscores.css']).toBe(specialFiles[2].content);
    });
  });

  describe('Base64url encoding in encrypted payload', () => {
    it('should use URL-safe base64url encoding (no +, /, or =)', async () => {
      const { encryptedPayload, keyB64 } = await createEncryptedSharePayload(testFiles);
      
      // Check that IV, data, and key don't contain URL-unsafe characters
      expect(encryptedPayload.iv).not.toMatch(/[+/=]/);
      expect(encryptedPayload.data).not.toMatch(/[+/=]/);
      expect(keyB64).not.toMatch(/[+/=]/);
    });
  });
});
