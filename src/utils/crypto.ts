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
  try {
    // Validate base64 strings to prevent DOMException
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(keyBase64.trim()) || !base64Regex.test(ivBase64.trim())) {
      throw new Error('Malformed base64 cryptographic keys or initialization vector.');
    }

    const rawKey = Uint8Array.from(atob(keyBase64.trim()), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivBase64.trim()), c => c.charCodeAt(0));

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
  } catch (err) {
    throw new Error(
      `Decryption failed: ${err instanceof Error ? err.message : 'Corrupted ciphertext or invalid key'}`
    );
  }
}

/**
 * Checks if a memo string contains an encrypted attachment envelope.
 * Sanitizes extracted filename to prevent path traversal and XSS.
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
      const rawFileName = parts.slice(4).join(':');
      // Strictly sanitize filename: remove path traversal, HTML tags, and illegal characters
      const sanitizedName = rawFileName
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\.\.+/g, '_')
        .slice(0, 36) || 'attachment.bin';

      return {
        isAttachment: true,
        ipfsCid: parts[1].replace(/[^a-zA-Z0-9]/g, '').slice(0, 64),
        aesKey: parts[2].slice(0, 64),
        iv: parts[3].slice(0, 32),
        fileName: sanitizedName,
        rawText: `[Encrypted File Attachment: ${sanitizedName}]`,
      };
    }
  }
  return {
    isAttachment: false,
    rawText: memo,
  };
}

/**
 * Deterministic Zero-Leak Shielded Identicon Generator (100% Client-Side SVG)
 * Replaces external avatar API calls (like api.dicebear.com) with 0 network calls,
 * 0 telemetry, and guaranteed privacy.
 */
export function generateShieldedIdenticon(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Privacy theme palettes: Zcash Gold, Shield Green, Cyan, Cyber Violet
  const palettes = [
    { bg: '#0B0E14', fg: '#F4B728', accent: '#E0A01E' },
    { bg: '#081116', fg: '#10B981', accent: '#059669' },
    { bg: '#0B101C', fg: '#38BDF8', accent: '#0284C7' },
    { bg: '#130B1C', fg: '#C084FC', accent: '#9333EA' },
  ];
  const palette = palettes[absHash % palettes.length];

  // 5x5 symmetric geometric pattern
  const cells: string[] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      const bitIndex = (y * 3 + x + (absHash % 19)) % 30;
      const filled = Boolean((absHash >> bitIndex) & 1);
      if (filled) {
        cells.push(`<rect x="${(x + 1) * 10}" y="${(y + 1) * 10}" width="10" height="10" rx="2" fill="${palette.fg}"/>`);
        if (x < 2) {
          cells.push(`<rect x="${(5 - x) * 10}" y="${(y + 1) * 10}" width="10" height="10" rx="2" fill="${palette.fg}"/>`);
        }
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70" width="70" height="70">`
    + `<rect width="70" height="70" rx="35" fill="${palette.bg}"/>`
    + `<circle cx="35" cy="35" r="33" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.4"/>`
    + cells.join('')
    + `</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
