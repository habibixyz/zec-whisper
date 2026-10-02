export type SubmissionCategory = 'whistleblow' | 'bounty' | 'press' | 'tip';

export interface ShieldedRecipient {
  name: string;
  handle: string;
  avatar: string;
  role: string;
  unifiedAddress: string;
  description: string;
  verified: boolean;
  /** If true, this is a synthetic test address — not a real wallet destination */
  isDemo?: boolean;
  /** If true, indicates this is an official on-chain escrow/vault contract */
  isContractVault?: boolean;
  /** Public Incoming Viewing Key (IVK) for transparent public auditing */
  viewingKey?: string;
}


export interface EncryptedAttachment {
  name: string;
  size: string;
  type: string;
  ipfsCid: string;
  aesKey: string;
  iv?: string;
  previewUrl?: string;
}

export interface ZecDropRequest {
  recipientAddress: string;
  amount: number;
  message: string;
  category: SubmissionCategory;
  attachment?: EncryptedAttachment;
  zip321Uri: string;
}

export interface ShieldedSubmission {
  id: string;
  txid: string;
  blockHeight: number;
  timestamp: number;
  amount: number;
  recipientHandle: string;
  senderShieldedPool: 'Orchard' | 'Sapling';
  message: string;
  category: SubmissionCategory;
  attachment?: EncryptedAttachment;
  status: 'pending' | 'confirmed';
  isDisclosed: boolean;
  disclosureTimestamp?: number;
}

export type ZcashNetwork = 'mainnet' | 'testnet';

export interface LightwalletdServer {
  id: string;
  name: string;
  endpoint: string;
  network: ZcashNetwork;
  pingMs: number | null;
  status: 'online' | 'degraded' | 'offline';
  isDefault?: boolean;
}

export interface NetworkBlockStatus {
  network: ZcashNetwork;
  blockHeight: number;
  bestBlockHash: string;
  bestBlockTime: string;
  activeServer: LightwalletdServer;
  lastUpdated: number;
  syncPercentage: number;
  isScanning: boolean;
  orchardPoolActive: boolean;
  targetBlockTime: number; // 75 seconds
  mempoolTxs: number;
  difficulty?: number;
  marketPriceUsd?: number;
}

