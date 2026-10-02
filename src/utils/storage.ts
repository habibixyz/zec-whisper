import type { ShieldedRecipient, ShieldedSubmission } from '../types/zcash';

const RECIPIENTS_STORAGE_KEY = 'zecwhisper_recipients_v2';
const SUBMISSIONS_STORAGE_KEY = 'zecwhisper_submissions_v2';
const DB_NAME = 'ZecWhisperEncryptedStore';
const STORE_NAME = 'encrypted_evidence';

// Auto-purge any legacy mock storage from previous development/demo runs
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('zecwhisper_recipients_v1');
    window.localStorage.removeItem('zecwhisper_submissions_v1');
    window.localStorage.removeItem('zecwhisper_recipients');
    window.localStorage.removeItem('zecwhisper_submissions');
  }
} catch {
  // Ignore in environments without window or localStorage
}

import { FEATURED_RECIPIENTS, INITIAL_SUBMISSIONS } from './mockData';

/**
 * Loads registered recipients from localStorage.
 * Falls back to verified demo recipients if no custom drop box is stored yet.
 */
export function loadSavedRecipients(): ShieldedRecipient[] {
  try {
    const raw = localStorage.getItem(RECIPIENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[ZecWhisper] Failed to parse saved recipients from localStorage:', err);
  }
  return FEATURED_RECIPIENTS;
}

/**
 * Saves recipients to localStorage.
 */
export function saveRecipients(recipients: ShieldedRecipient[]): void {
  try {
    localStorage.setItem(RECIPIENTS_STORAGE_KEY, JSON.stringify(recipients));
  } catch (err) {
    console.error('[ZecWhisper] Failed to save recipients to localStorage:', err);
  }
}

/**
 * Adds a new custom recipient to localStorage.
 */
export function addCustomRecipient(recipient: ShieldedRecipient): ShieldedRecipient[] {
  const current = loadSavedRecipients();
  const filtered = current.filter(
    r => r.handle.toLowerCase() !== recipient.handle.toLowerCase() && r.unifiedAddress !== recipient.unifiedAddress
  );
  const updated = [recipient, ...filtered];
  saveRecipients(updated);
  return updated;
}

/**
 * Loads user submissions from localStorage.
 */
export function loadSavedSubmissions(): ShieldedSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[ZecWhisper] Failed to load submissions:', err);
  }
  return INITIAL_SUBMISSIONS;
}

/**
 * Saves user submissions to localStorage.
 */
export function saveSubmissions(submissions: ShieldedSubmission[]): void {
  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  } catch (err) {
    console.error('[ZecWhisper] Failed to save submissions:', err);
  }
}

/**
 * Opens or initializes the local IndexedDB database for encrypted files.
 */
function openEvidenceDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'ipfsCid' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredEvidenceRecord {
  ipfsCid: string;
  blob: Blob;
  name: string;
  type: string;
  size: string;
  aesKey: string;
  iv: string;
  timestamp: number;
}

/**
 * Stores an encrypted file blob in client IndexedDB.
 */
export async function storeEncryptedEvidence(record: StoredEvidenceRecord): Promise<void> {
  try {
    const db = await openEvidenceDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ZecWhisper] IndexedDB store warning:', err);
  }
}

/**
 * Retrieves an encrypted file record from client IndexedDB by IPFS CID.
 */
export async function getEncryptedEvidence(ipfsCid: string): Promise<StoredEvidenceRecord | null> {
  try {
    const db = await openEvidenceDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(ipfsCid);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ZecWhisper] IndexedDB fetch warning:', err);
    return null;
  }
}
