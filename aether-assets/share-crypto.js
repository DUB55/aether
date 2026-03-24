const enc = new TextEncoder();
const dec = new TextDecoder();

export function b64u(bytes) {
  let bin = '';
  bytes.forEach((byte) => {
    bin += String.fromCharCode(byte);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function b64uToBytes(value) {
  let safe = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = safe.length % 4 ? 4 - (safe.length % 4) : 0;
  safe += '='.repeat(pad);
  const bin = atob(safe);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export async function deflateRaw(bytes) {
  if (!('CompressionStream' in window)) return bytes;
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

export async function inflateRaw(bytes) {
  if (!('DecompressionStream' in window)) return bytes;
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

export async function aesGenKey() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function aesExportRaw(key) {
  const raw = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(raw);
}

export async function aesImportRaw(raw) {
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
}

export function rand(size) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function packageProject(files) {
  const payload = { v: 1, files: {} };
  files.forEach((file) => {
    payload.files[file.name] = file.content;
  });
  return enc.encode(JSON.stringify(payload));
}

export async function createQuickLink(files) {
  const packed = packageProject(files);
  const compressed = await deflateRaw(packed);
  return `${location.origin}${location.pathname}#v1:${b64u(compressed)}`;
}

export async function createEncryptedSharePayload(files) {
  const packed = packageProject(files);
  const compressed = await deflateRaw(packed);
  const key = await aesGenKey();
  const keyRaw = await aesExportRaw(key);
  const iv = rand(12);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, compressed));
  return {
    encryptedPayload: {
      v: 1,
      iv: b64u(iv),
      data: b64u(cipher),
    },
    keyB64: b64u(keyRaw),
  };
}

export async function unpackQuickLink(hashValue) {
  const bytes = b64uToBytes(hashValue);
  const inflated = await inflateRaw(bytes);
  return JSON.parse(dec.decode(inflated));
}

export async function unpackEncryptedShare(payload, keyB64) {
  const keyRaw = b64uToBytes(keyB64);
  const key = await aesImportRaw(keyRaw);
  const iv = b64uToBytes(payload.iv);
  const data = b64uToBytes(payload.data);
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data));
  const inflated = await inflateRaw(plain);
  return JSON.parse(dec.decode(inflated));
}

export async function createQuickLinkViewer(files) {
  const editorUrl = await createQuickLink(files);
  const url = new URL(editorUrl);
  url.searchParams.set('mode', 'viewer');
  return url.toString();
}

export async function createViewerUrls(files, githubUrl = null) {
  const baseUrl = `${location.origin}${location.pathname}`;
  
  if (githubUrl) {
    // Generate secure (GitHub-based) URLs
    const { encryptedPayload, keyB64 } = await createEncryptedSharePayload(files);
    return {
      editorUrl: `${baseUrl}?src=${encodeURIComponent(githubUrl)}#key=${keyB64}`,
      viewerUrl: `${baseUrl}?mode=viewer&src=${encodeURIComponent(githubUrl)}#key=${keyB64}`,
      encryptedPayload,
      keyB64
    };
  } else {
    // Generate quick link URLs
    const editorUrl = await createQuickLink(files);
    const viewerUrl = await createQuickLinkViewer(files);
    return {
      editorUrl,
      viewerUrl
    };
  }
}
