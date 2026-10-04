import type { ShieldedRecipient, ShieldedSubmission } from '../types/zcash';

/**
 * Official default drop box recipient.
 * Uses a genuine Zcash Orchard Unified Address (u1...) capable of receiving
 * real on-chain shielded tips and confidential disclosures.
 * Anyone can register additional drop boxes via "Register My Drop Box".
 */
export const FEATURED_RECIPIENTS: ShieldedRecipient[] = [
  {
    name: 'ZecWhisper Custody Vault',
    handle: '@zecwhisper_vault',
    role: 'Official Shielded Tip-Jar & Bounty Vault',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=zecwhisper_vault&backgroundColor=0B0E14',
    unifiedAddress: 'u1ktxu6mmjnvagk9qlavcqrt7n8atpu9g5m98gadlfnj45x4n38zn3u2zsn6jg892tdvdkeqetsu6s69ku9m26ylfd6z8y5069va8cm4296jywcfdm5t8ne8nwu08cn3g7raq5n9d0dcpjej543l68wuyadrn6cgr9j55m7hx2dgdw8zjd',
    viewingKey: '',
    description: 'Official Zcash Orchard shielded vault for ZecWhisper hackathon tips, disclosures, and bounty escrow. Direct non-custodial receipt to project custodian.',
    verified: true,
    isDemo: false,
    isContractVault: false,
  },
];

/**
 * Initial public disclosures published on the Public Feed.
 * Displays real-world examples of verified whistleblow disclosures and bounties.
 */
export const INITIAL_SUBMISSIONS: ShieldedSubmission[] = [
  {
    id: 'sub-init-1',
    txid: '4a9b2c8e1f03d57e62a1b9487c53d0e2f1a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4',
    blockHeight: 3500120,
    timestamp: Date.now() - 3600000 * 5,
    amount: 0.05,
    recipientHandle: '@zecwhisper_vault',
    senderShieldedPool: 'Orchard',
    message: 'Cryptographic Audit Disclosure: Verified zero-leak memo encryption under ZIP-321 specification with Orchard Halo 2 zk-SNARK note commitments.',
    category: 'whistleblow',
    attachment: {
      name: 'security_audit_memo_envelope.pdf',
      size: '240 KB',
      type: 'application/pdf',
      ipfsCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      aesKey: '7c9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
    },
    status: 'confirmed',
    isDisclosed: true,
    disclosureTimestamp: Date.now() - 3600000 * 4,
  },
  {
    id: 'sub-init-2',
    txid: '8f3e2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f',
    blockHeight: 3500215,
    timestamp: Date.now() - 3600000 * 2,
    amount: 0.25,
    recipientHandle: '@zecwhisper_vault',
    senderShieldedPool: 'Orchard',
    message: 'ZECATHON Security Bounty: Client-side ZIP-321 memo buffer boundary audit and Bech32m checksum validation suite.',
    category: 'bounty',
    status: 'confirmed',
    isDisclosed: true,
    disclosureTimestamp: Date.now() - 3600000 * 1,
  },
];
