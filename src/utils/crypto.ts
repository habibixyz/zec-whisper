/**
 * Client-Side Cryptography Utilities using Web Crypto API (SubtleCrypto)
 * Encrypts files > 512 bytes with AES-GCM-256 before packaging.
 */

export interface EncryptedPayloadResult {
  ipfsCid: string;
  aesKeyBase64: string;
  ivBase64: string;
  memoPayload: string;
  encryptedBlob: Blob;
}

/**
 * Encrypts a File or ArrayBuffer using AES-256-GCM client-side.
 */
export async function encryptFileClientSide(file: File): Promise<EncryptedPayloadResult> {
  // 1. Generate AES-256 key
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // 2. Generate random 12-byte IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 3. Read file buffer and encrypt
  const fileBuffer = await file.arrayBuffer();
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  // 4. Export key to base64
  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  // 5. Compute SHA-256 for a deterministic mock IPFS CID
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encryptedBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const ipfsCid = `bafybeic${hashHex.slice(0, 32)}`;

  // 6. Compact memo envelope (< 160 bytes): ZECW:cid:key:iv:name
  const safeName = file.name.replace(/[:|]/g, '_').slice(0, 24);
  const memoPayload = `ZECW:${ipfsCid}:${keyBase64}:${ivBase64}:${safeName}`;

  const encryptedBlob = new Blob([encryptedBuffer], { type: 'application/octet-stream' });

  return {
    ipfsCid,
    aesKeyBase64: keyBase64,
    ivBase64,
    memoPayload,
    encryptedBlob,
  };
}

/**
 * Decrypts an encrypted buffer given the base64 key and IV.
 */
export async function decryptFileClientSide(
  encryptedBuffer: ArrayBuffer,
  keyBase64: string,
  ivBase64: string,
  mimeType = 'application/octet-stream'
): Promise<Blob> {
  const rawKey = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

  const key = await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer], { type: mimeType });
}

/**
 * Checks if a memo string contains an encrypted attachment envelope.
 */
export function parseEncryptedMemo(memo: string): {
  isAttachment: boolean;
  ipfsCid?: string;
  aesKey?: string;
  iv?: string;
  fileName?: string;
  rawText: string;
} {
  if (memo.startsWith('ZECW:')) {
    const parts = memo.split(':');
    if (parts.length >= 5) {
      return {
        isAttachment: true,
        ipfsCid: parts[1],
        aesKey: parts[2],
        iv: parts[3],
        fileName: parts.slice(4).join(':'),
        rawText: `[Encrypted File Attachment: ${parts.slice(4).join(':')}]`,
      };
    }
  }
  return {
    isAttachment: false,
    rawText: memo,
  };
}
