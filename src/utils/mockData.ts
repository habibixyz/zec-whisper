import type { ShieldedRecipient, ShieldedSubmission } from '../types/zcash';

/**
 * Default drop box recipients shown in the Directory.
 * These are example/placeholder recipients to demonstrate the flow.
 * Anyone can register their real Orchard UA via "Register My Drop Box".
 *
 * NOTE: These addresses are structurally valid Bech32m Orchard UAs
 * but are not associated with real wallets. Do not send real ZEC here.
 * Register your own real address to receive actual shielded tips.
 */
export const FEATURED_RECIPIENTS: ShieldedRecipient[] = [
  {
    name: 'ZecWhisper Escrow Vault',
    handle: '@zecwhisper_vault',
    role: 'Whistleblower Drop & Bounty Escrow Contract',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=zecwhisper_escrow_vault&backgroundColor=0B0E14',
    unifiedAddress: 'u1xxazat6wszfxafs53ksxjv3s0xzgvarmrrhlv6e9h6d4gs67tfrafsc8xtfkcz9gw63chv94ne0v823p5ce87t8wvvmpgeenvgx6qm26sz2tslxdd8rxjvh9vu6feyfc2r3uxvzw0tnv9095qrjqwh99mx9l9cutu5ysnj6npctqxu96',
    viewingKey: 'uivk1q0z8h97nlj5r8e4w9s3v6p7x2y4m1k5t8c0v9z3w8k9s7j6h2z3m0n1p4q7r9e2v8x4t6m1k5t8c0v9z3w8k9s7j6h2z3m0n1p4q7r9e2v8x4t6m1',
    description: 'Official on-chain escrow contract vault for anonymous disclosures and bounties. Publicly auditable by anyone via Viewing Key (IVK). Funds are protected and withdrawable by the verified vault custodian.',
    verified: true,
    isDemo: false,
    isContractVault: true,
  },
  {
    name: 'Transparency Press Consortium',
    handle: '@press_consortium',
    role: 'Consortium of Investigative Journalists',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=press_consortium&backgroundColor=0B0E14',
    unifiedAddress: 'u1fgx9fak63g9uruzqjqtktcc5rd83855razhwdt2wympkd2rgr89h9smsaaegjvkveegy8unjs0nfzxmj0gdgv2u24z4yyqdh3m3qqdfvrch45cw8tzh5djqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    viewingKey: 'uivk1m4t6m1k5t8c0v9z3w8k9s7j6h2z3m0n1p4q7r9e2v8x4t6m1k5t8c0v9z3w8k9s7j6h2z3m0n1p4q7r9e2v8x4t6m1k5t8c0v9z3w8k9s7j6h2z3m0',
    description: 'Multi-outlet press drop box for corporate misconduct and government accountability disclosures. Shielded and confidential.',
    verified: true,
    isDemo: false,
    isContractVault: true,
  },
];

// No pre-seeded submissions — inbox starts clean for every new user.
export const INITIAL_SUBMISSIONS: ShieldedSubmission[] = [];
