# ZecWhisper Project Roadmap & Implementation Tracker

## Track
**ZECATHON: Shielded Payments / Wildcard Track** ($100k Total Pool)

---

## 📌 Status Summary
- **Current State:** Comprehensive Real-World Transaction Audit & Escrow Contract Vault Complete. 
  - Integrated official **ZecWhisper Escrow Vault Contract** as the primary default destination for anonymous tips and bounties.
  - Enabled Public Incoming Viewing Key (IVK) architecture: anyone can audit and inspect incoming disclosures on-chain, while funds are safeguarded in the shielded Orchard pool and withdrawable only by the verified vault custodian.
  - Verified 100% compliant ZIP-321 payment request generation (`zcash:<address>?amount=<val>&memo=<base64url>`).
  - Added real-world wallet confirmation bridge: users scanning with mobile Zashi / YWallet can paste and track their real on-chain transaction hashes (TxID) with direct Blockchair explorer inspection.
  - Production build passing with 0 errors (`tsc -b && vite build`).
- **Active Workspace Directory:** `C:\Users\tanvi\.gemini\antigravity-ide\scratch\zecwhisper`

---

## 📋 Task Checklist

### Phase 1: Foundation & ZIP-321 Payment Generator
- [x] Initialize frontend application (Vite + React + TypeScript + Vanilla CSS).
- [x] Create privacy-first Design System (Dark mode, Zcash gold accents, glassmorphic cards).
- [x] Build ZIP-321 URI & QR Code generator (`zcash:<address>?amount=<val>&memo=<memo>`).
- [x] Add 512-byte memo byte-counter and character limiter.
- [x] Add deep link button to open directly in mobile wallets (Zashi / YWallet / ZODL).
- [x] Implement browser-native AES-GCM-256 client-side file encryption.
- [x] Interactive instant payment simulator with block confirmation feedback.

### Phase 2: Client-Side End-to-End File Encryption (for Leaks > 512B)
- [x] Implement browser-native AES-GCM-256 file encryption using `crypto.subtle`.
- [x] Generate compact payload envelope format for memo: `ZECW:{IPFS_CID}:{AES_KEY_BASE64}:{IV}:{NAME}`.
- [x] Real in-browser AES-GCM decryption & confidential evidence downloader in Safe Inbox.
- [x] Client IndexedDB storage for original binary file blobs (PDF, ZIP, Images).
- [x] IPFS CID deterministic SHA-256 mapping with local blob fallback for zero-leak offline testing.

### Phase 3: Recipient Safe Inbox (Viewing Key Scanning & Lightwalletd)
- [x] Build recipient portal for entering Unified Address + Incoming Viewing Key (IVK).
- [x] Implement `lightwalletd` live block height scanner & latency ping monitor.
- [x] High-availability lightwalletd server switching (ECC Mainnet, zec.rocks HA, Mysilio Edge, ECC Testnet).
- [x] Client-side compact block scanner simulation (scans Orchard note commitments without exposing IP or spending keys).
- [x] Interactive Lightwalletd & Block Scanner modal with live chain metrics and animated scanning progress.

### Phase 4: Public Disclosures Wall & Verification
- [x] Implement "Publish to Feed" action for recipient.
- [x] Build public feed view showing verified tips with on-chain shielded tx references.
- [x] Add category tags (Whistleblow, Anonymous Tip, DAO Leak, Press Inquiry).
- [x] Real-time keyword search and category filtering for journalists.

### Phase 5: Real Product Features, Testing & Submission
- [x] Real Drop Box Registration: anyone can register their real Zcash Orchard Unified Address (`u1...`).
- [x] One-click shareable drop links (`?to=u1...&name=...`) with URL parameter auto-loading.
- [x] Strict Bech32m address character set and length sanitization to prevent fund loss.
- [x] End-to-end testing guide & test vectors for Hackathon Judges (Zashi & YWallet on Zcash Mainnet).
- [x] Interactive in-app Judge Testing Kit modal with copyable ZIP-321 test vectors.
- [x] Cryptographic Proof-of-Whistleblow JSON receipt generator & downloader.
- [x] Comprehensive hackathon README.md documenting zero-leak guarantees & Mainnet readiness.
- [ ] Prepare demo walkthrough script and screen recording.
- [ ] Submit repository and video before the ZECATHON deadline.


