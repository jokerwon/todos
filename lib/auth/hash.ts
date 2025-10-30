const encoder = new TextEncoder();

const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const DIGEST = 'SHA-256';

function randomSalt(bytes = 16): string {
  const array = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(array);
  return toBase64(array);
}

async function deriveKey(password: string, salt: string): Promise<ArrayBuffer> {
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  return globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: DIGEST,
      salt: fromBase64(salt),
      iterations: ITERATIONS,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );
}

export async function hashPassword(password: string, salt?: string) {
  const effectiveSalt = salt ?? randomSalt();
  const bits = await deriveKey(password, effectiveSalt);
  const hash = toBase64(new Uint8Array(bits));
  return { hash, salt: effectiveSalt };
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const derived = await hashPassword(password, salt);
  return timingSafeEqual(fromBase64(derived.hash), fromBase64(hash));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

export function createToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export function getIssueTimestamps(minutes = 30) {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + minutes * 60 * 1000);
  return { issuedAt, expiresAt };
}

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  let binary = '';
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return globalThis.btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(value, 'base64'));
  }

  const binary = globalThis.atob(value);
  const result = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    result[i] = binary.charCodeAt(i);
  }
  return result;
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
