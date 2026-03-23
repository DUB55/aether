/**
 * Share Crypto Module
 * 
 * Provides base64url encoding/decoding utilities for secure project sharing.
 * Uses browser-native APIs (btoa, atob) for encoding operations.
 * 
 * Base64url encoding follows RFC 4648:
 * - Replace + with -
 * - Replace / with _
 * - Remove padding =
 */

/**
 * Converts a Uint8Array to a base64url-encoded string.
 * 
 * @param bytes - The byte array to encode
 * @returns Base64url-encoded string
 */
export function b64u(bytes: Uint8Array): string {
  // Convert Uint8Array to binary string
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  // Use browser's btoa for base64 encoding
  const base64 = btoa(binary);
  
  // Convert to base64url format (RFC 4648)
  return base64
    .replace(/\+/g, '-')  // Replace + with -
    .replace(/\//g, '_')  // Replace / with _
    .replace(/=/g, '');   // Remove padding =
}

/**
 * Converts a base64url-encoded string back to a Uint8Array.
 * 
 * @param value - The base64url-encoded string to decode
 * @returns Decoded byte array
 */
export function b64uToBytes(value: string): Uint8Array {
  // Convert base64url to standard base64
  let base64 = value
    .replace(/-/g, '+')  // Replace - with +
    .replace(/_/g, '/'); // Replace _ with /
  
  // Add padding if needed
  const padding = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padding);
  
  // Use browser's atob for base64 decoding
  const binary = atob(base64);
  
  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return bytes;
}

/**
 * Compresses data using the deflate-raw algorithm.
 * Uses the browser's native CompressionStream API with 'deflate-raw' format
 * (raw DEFLATE without zlib headers).
 * 
 * @param bytes - The byte array to compress
 * @returns Compressed byte array
 */
export async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  // Create a compression stream with deflate-raw format
  const compressionStream = new CompressionStream('deflate-raw');
  
  // Create a readable stream from the input bytes
  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    }
  });
  
  // Pipe through the compression stream
  const compressedStream = readableStream.pipeThrough(compressionStream);
  
  // Read all chunks from the compressed stream
  const reader = compressedStream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine all chunks into a single Uint8Array
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

/**
 * Decompresses data that was compressed with deflate-raw algorithm.
 * Uses the browser's native DecompressionStream API with 'deflate-raw' format.
 * 
 * @param bytes - The compressed byte array to decompress
 * @returns Decompressed byte array
 */
export async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  // Create a decompression stream with deflate-raw format
  const decompressionStream = new DecompressionStream('deflate-raw');
  
  // Create a readable stream from the input bytes
  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    }
  });
  
  // Pipe through the decompression stream
  const decompressedStream = readableStream.pipeThrough(decompressionStream);
  
  // Read all chunks from the decompressed stream
  const reader = decompressedStream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine all chunks into a single Uint8Array
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

/**
 * Generates a cryptographically secure random byte array.
 * Uses the browser's crypto.getRandomValues() for secure randomness.
 * 
 * @param size - The number of random bytes to generate
 * @returns Random byte array
 */
export function rand(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generates a random 256-bit AES-GCM encryption key.
 * Uses the Web Crypto API to generate a cryptographically secure key.
 * 
 * @returns Promise resolving to a CryptoKey for AES-GCM encryption
 */
export async function aesGenKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256, // 256-bit key
    },
    true, // extractable (can be exported)
    ['encrypt', 'decrypt'] // key usages
  );
}

/**
 * Exports an AES-GCM CryptoKey to raw Uint8Array format.
 * 
 * @param key - The CryptoKey to export
 * @returns Promise resolving to the raw key bytes (32 bytes for AES-256)
 */
export async function aesExportRaw(key: CryptoKey): Promise<Uint8Array> {
  const rawKey = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(rawKey);
}

/**
 * Imports a raw Uint8Array as an AES-GCM CryptoKey.
 * 
 * @param raw - The raw key bytes (must be 32 bytes for AES-256)
 * @returns Promise resolving to a CryptoKey for AES-GCM encryption
 */
export async function aesImportRaw(raw: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    raw,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM-256 with a randomly generated IV.
 * 
 * @param key - The AES-GCM CryptoKey to use for encryption
 * @param data - The data to encrypt
 * @returns Promise resolving to an object containing the IV and encrypted data
 */
export async function aesEncrypt(
  key: CryptoKey,
  data: Uint8Array
): Promise<{ iv: Uint8Array; encrypted: Uint8Array }> {
  // Generate a random 12-byte IV (recommended size for AES-GCM)
  const iv = rand(12);
  
  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );
  
  return {
    iv,
    encrypted: new Uint8Array(encrypted),
  };
}

/**
 * Decrypts data using AES-GCM-256 with the provided IV.
 * 
 * @param key - The AES-GCM CryptoKey to use for decryption
 * @param iv - The initialization vector used during encryption
 * @param encrypted - The encrypted data to decrypt
 * @returns Promise resolving to the decrypted data
 */
export async function aesDecrypt(
  key: CryptoKey,
  iv: Uint8Array,
  encrypted: Uint8Array
): Promise<Uint8Array> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encrypted
  );
  
  return new Uint8Array(decrypted);
}

/**
 * Project payload structure with version and files.
 */
export interface ProjectPayload {
  v: number;
  files: Record<string, string>;
}

/**
 * Encrypted payload structure with version, IV, and encrypted data.
 * All fields are base64url-encoded for URL safety.
 */
export interface EncryptedPayload {
  v: number;
  iv: string;
  data: string;
}

/**
 * Packages project files into a versioned JSON payload and converts to bytes.
 * 
 * @param files - Array of files with name and content properties
 * @returns Uint8Array containing the JSON payload
 */
export function packageProject(files: Array<{ name: string; content: string }>): Uint8Array {
  // Create the project payload structure
  const payload: ProjectPayload = {
    v: 1, // Version 1 of the payload format
    files: {}
  };
  
  // Convert file array to key-value structure
  for (const file of files) {
    payload.files[file.name] = file.content;
  }
  
  // Convert to JSON string
  const jsonString = JSON.stringify(payload);
  
  // Convert JSON string to Uint8Array
  const encoder = new TextEncoder();
  return encoder.encode(jsonString);
}

/**
 * Creates an encrypted and compressed project payload with encryption key.
 * 
 * This function:
 * 1. Packages files into JSON format
 * 2. Compresses the JSON using deflate-raw
 * 3. Generates a random AES-GCM-256 encryption key
 * 4. Encrypts the compressed data with a random IV
 * 5. Returns the encrypted payload and key as base64url strings
 * 
 * @param files - Array of files with name and content properties
 * @returns Promise resolving to encrypted payload and base64url-encoded key
 */
export async function createEncryptedSharePayload(
  files: Array<{ name: string; content: string }>
): Promise<{ encryptedPayload: EncryptedPayload; keyB64: string }> {
  // Step 1: Package files into JSON format
  const packagedBytes = packageProject(files);
  
  // Step 2: Compress the JSON data
  const compressedBytes = await deflateRaw(packagedBytes);
  
  // Step 3: Generate a random encryption key
  const key = await aesGenKey();
  
  // Step 4: Encrypt the compressed data
  const { iv, encrypted } = await aesEncrypt(key, compressedBytes);
  
  // Step 5: Export the key and encode everything as base64url
  const rawKey = await aesExportRaw(key);
  const keyB64 = b64u(rawKey);
  
  const encryptedPayload: EncryptedPayload = {
    v: 1, // Version 1 of the encrypted payload format
    iv: b64u(iv),
    data: b64u(encrypted)
  };
  
  return { encryptedPayload, keyB64 };
}

/**
 * Unpacks an encrypted project payload using the provided encryption key.
 * 
 * This function:
 * 1. Decodes the base64url-encoded key, IV, and encrypted data
 * 2. Imports the encryption key
 * 3. Decrypts the data using AES-GCM-256
 * 4. Decompresses the decrypted data
 * 5. Parses the JSON to get the project payload
 * 
 * @param payload - The encrypted payload with version, IV, and data
 * @param keyB64 - The base64url-encoded encryption key
 * @returns Promise resolving to the decrypted project payload
 * @throws Error if decryption fails or payload is invalid
 */
export async function unpackEncryptedShare(
  payload: EncryptedPayload,
  keyB64: string
): Promise<ProjectPayload> {
  // Step 1: Decode base64url strings to bytes
  const rawKey = b64uToBytes(keyB64);
  const iv = b64uToBytes(payload.iv);
  const encryptedData = b64uToBytes(payload.data);
  
  // Step 2: Import the encryption key
  const key = await aesImportRaw(rawKey);
  
  // Step 3: Decrypt the data
  const compressedBytes = await aesDecrypt(key, iv, encryptedData);
  
  // Step 4: Decompress the data
  const packagedBytes = await inflateRaw(compressedBytes);
  
  // Step 5: Parse the JSON to get the project payload
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(packagedBytes);
  const projectPayload: ProjectPayload = JSON.parse(jsonString);
  
  return projectPayload;
}
