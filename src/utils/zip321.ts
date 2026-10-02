/**
 * ZIP-321 Payment Request and Zcash URI Utilities
 * Ref: https://zips.z.cash/zip-0321
 */

export const MAX_MEMO_BYTES = 512;

/**
 * Returns the UTF-8 byte length of a string.
 */
export function getUtf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

const BECH32M_CHARS = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

/**
 * Validates that an address is a strictly shielded Zcash Orchard Unified Address (u1...)
 * or Sapling shielded address (zs1...).
 * Explicitly rejects transparent addresses ('t1', 't3') and invalid Bech32m characters.
 */
export function validateShieldedAddress(address: string): { valid: boolean; error?: string } {
  const clean = address.trim();
  if (!clean) {
    return { valid: false, error: 'Address cannot be empty.' };
  }

  // Reject spaces
  if (/\s/.test(clean)) {
    return { valid: false, error: 'Address contains illegal whitespace characters.' };
  }

  // Explicitly reject transparent addresses
  if (clean.startsWith('t1') || clean.startsWith('t3')) {
    return { 
      valid: false, 
      error: 'CRITICAL PRIVACY VIOLATION: Transparent addresses (t-addresses) leak transaction graphs. Only Orchard Unified Addresses (u1...) are accepted.' 
    };
  }

  // Validate Orchard Unified Address (Mainnet)
  if (clean.startsWith('u1')) {
    if (clean.length < 80) {
      return { 
        valid: false, 
        error: 'Unified Address appears truncated. A valid Orchard Unified Address is typically 100+ characters.' 
      };
    }

    // Check casing: Bech32m must be entirely lowercase (or entirely uppercase, though Zcash standardizes lowercase)
    if (clean !== clean.toLowerCase()) {
      return { 
        valid: false, 
        error: 'Unified Address must be all lowercase (mixed casing is invalid in Bech32m).' 
      };
    }

    // Validate data characters after the 'u1' prefix
    const dataPart = clean.slice(2);
    for (let i = 0; i < dataPart.length; i++) {
      const char = dataPart[i];
      if (!BECH32M_CHARS.includes(char)) {
        return {
          valid: false,
          error: `Invalid character '${char}' at position ${i + 3}. Bech32m addresses cannot contain '1', 'b', 'i', or 'o'.`,
        };
      }
    }

    return { valid: true };
  }

  // Validate Orchard Unified Address (Testnet)
  if (clean.startsWith('utest1')) {
    if (clean.length < 80) {
      return { 
        valid: false, 
        error: 'Testnet Unified Address appears truncated. A valid Orchard Unified Address is typically 100+ characters.' 
      };
    }

    if (clean !== clean.toLowerCase()) {
      return { 
        valid: false, 
        error: 'Testnet Unified Address must be all lowercase (mixed casing is invalid in Bech32m).' 
      };
    }

    const dataPart = clean.slice(6);
    for (let i = 0; i < dataPart.length; i++) {
      const char = dataPart[i];
      if (!BECH32M_CHARS.includes(char)) {
        return {
          valid: false,
          error: `Invalid character '${char}' at position ${i + 7}. Bech32m addresses cannot contain '1', 'b', 'i', or 'o'.`,
        };
      }
    }

    return { valid: true };
  }

  // Sapling shielded addresses (Mainnet & Testnet)
  if (clean.startsWith('zs1') || clean.startsWith('ztestsapling1')) {
    return { valid: true };
  }

  return { 
    valid: false, 
    error: 'Please enter a valid Zcash Orchard Unified Address (starts with u1 or utest1).' 
  };
}

/**
 * Encodes text to Base64URL without padding, as specified in ZIP-321.
 */
export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Builds a ZIP-321 compliant URI and fallback URI for maximum mobile wallet compatibility.
 */
export function buildZip321Uri(address: string, amount: number, memoText: string): {
  standardUri: string;
  fallbackUri: string;
  byteCount: number;
  isOverLimit: boolean;
} {
  const cleanAddress = address.trim();
  const trimmedMemo = memoText.trim();
  const hasMemo = trimmedMemo.length > 0;

  const encoder = new TextEncoder();
  const memoBytes = encoder.encode(memoText);
  const byteCount = memoBytes.length;
  const isOverLimit = byteCount > MAX_MEMO_BYTES;

  // Build standard query parameters
  const standardParams: string[] = [];
  const fallbackParams: string[] = [];

  if (amount > 0) {
    standardParams.push(`amount=${amount}`);
    fallbackParams.push(`amount=${amount}`);
  }

  if (hasMemo) {
    const base64UrlMemo = toBase64Url(memoBytes);
    standardParams.push(`memo=${base64UrlMemo}`);
    fallbackParams.push(`memo=${encodeURIComponent(memoText)}`);
  }

  const standardQuery = standardParams.length > 0 ? `?${standardParams.join('&')}` : '';
  const fallbackQuery = fallbackParams.length > 0 ? `?${fallbackParams.join('&')}` : '';

  // ZIP-321 standard: base64url encoded
  const standardUri = `zcash:${cleanAddress}${standardQuery}`;
  
  // Wallet-friendly fallback URI
  const fallbackUri = `zcash:${cleanAddress}${fallbackQuery}`;

  return {
    standardUri,
    fallbackUri,
    byteCount,
    isOverLimit,
  };
}

/**
 * Truncates an address for UI display while preserving prefix and suffix.
 */
export function truncateAddress(address: string, prefixLen = 12, suffixLen = 8): string {
  if (!address) return '';
  if (address.length <= prefixLen + suffixLen) return address;
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}
