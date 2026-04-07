/**
 * Client-side encryption utility using Web Crypto API (AES-GCM)
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Encrypts a string payload and returns the encrypted data and the key.
 * The key is returned as a base64 string.
 */
export async function encryptPayload(payload: string): Promise<{ encryptedData: string; keyBase64: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);

  // Generate a random key
  const key = await window.crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

  // Export the key to base64
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

  // Generate a random IV (initialization vector)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  // Combine IV and encrypted data: [iv (12 bytes)][encrypted data]
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  // Convert to base64
  const encryptedData = btoa(String.fromCharCode(...combined));

  return { encryptedData, keyBase64 };
}

/**
 * Decrypts a base64 encrypted string using a base64 key.
 */
export async function decryptPayload(encryptedBase64: string, keyBase64: string): Promise<string> {
  const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const keyData = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));

  // Import the key
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    ALGORITHM,
    true,
    ['decrypt']
  );

  // Extract IV and ciphertext
  const iv = encryptedData.slice(0, 12);
  const ciphertext = encryptedData.slice(12);

  // Decrypt
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
