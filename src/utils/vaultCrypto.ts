// Client-side-only encryption helpers for the Cofre de Notas Local tool.
// Everything here runs with the Web Crypto API in the browser; nothing is
// ever sent to a server. Notes are encrypted with AES-GCM using a key
// derived from the user's password via PBKDF2 (unique salt+iv per note).

const PBKDF2_ITERATIONS = 150_000;

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuffer(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  salt: string;
  iv: string;
  cipher: string;
}

export async function encryptJSON(data: unknown, password: string): Promise<EncryptedPayload> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));
  const cipherBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, plaintext);
  return {
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    cipher: bufferToBase64(cipherBuffer),
  };
}

export async function decryptJSON<T>(payload: EncryptedPayload, password: string): Promise<T> {
  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const cipher = base64ToBuffer(payload.cipher);
  const key = await deriveKey(password, salt);
  const plainBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, cipher as BufferSource);
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(plainBuffer)) as T;
}
