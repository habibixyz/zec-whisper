import type { ShieldedRecipient, ShieldedSubmission } from '../types/zcash';

/**
 * DEMO TEST ADDRESSES — HACKATHON JUDGES / OFFLINE DEMO ONLY
 *
 * These Bech32m Unified Addresses are structurally valid but belong to no real wallet.
 * Do NOT send real ZEC here. Register your own real address via "Register My Drop Box".
 */
export const FEATURED_RECIPIENTS: ShieldedRecipient[] = [
  {
    name: 'Test Drop Box A',
    handle: '@demo_test_a',
    role: 'Demo Test Address',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=demo_test_a&backgroundColor=F4B728',
    unifiedAddress: 'u1teet92qqr59kf4x63e46mhnfaqjqd35wzxhph88h3kvv0z3y4rjga8rgf9p4tvqveaz6wj9d9nn9ayccmwasr0q5tn0543drhcvc8twg6q3e3pp3tsxxf6qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    description: 'Demo test address for hackathon judging only. No real ZEC received here. Register your own Orchard address to accept real drops.',
    verified: false,
    isDemo: true,
  },
  {
    name: 'Test Drop Box B',
    handle: '@demo_test_b',
    role: 'Demo Test Address',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=demo_test_b&backgroundColor=10B981',
    unifiedAddress: 'u1fgx9fak63g9uruzqjqtktcc5rd83855razhwdt2wympkd2rgr89h9smsaaegjvkveegy8unjs0nfzxmj0gdgv2u24z4yyqdh3m3qqdfvrch45cw8tzh5djqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    description: 'Demo test address for ZIP-321 flow testing. Not a real drop box — use the Register flow to add your Orchard UA.',
    verified: false,
    isDemo: true,
  },
];

export const INITIAL_SUBMISSIONS: ShieldedSubmission[] = [
  {
    id: 'sub-seed-1',
    txid: '3f9b2d8e4a7c1b5f6e8a0d2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d',
    blockHeight: 3500180,
    timestamp: Date.now() - 1000 * 60 * 45,
    amount: 0.1,
    recipientHandle: '@demo_test_a',
    senderShieldedPool: 'Orchard',
    message: '[DEMO] Test shielded memo: Encrypted payload successfully delivered via Orchard zk-SNARK pool.',
    category: 'whistleblow',
    status: 'confirmed',
    isDisclosed: true,
    disclosureTimestamp: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'sub-seed-2',
    txid: '7a1b3c5e8f0a2d4c6e8b0a2d4f6e8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d',
    blockHeight: 3500210,
    timestamp: Date.now() - 1000 * 60 * 18,
    amount: 0.5,
    recipientHandle: '@demo_test_b',
    senderShieldedPool: 'Orchard',
    message: '[DEMO] Bug bounty submission: Memory edge case in compact block trial decryption under high reorg depth.',
    category: 'bounty',
    status: 'confirmed',
    isDisclosed: false,
  },
];
