import React, { useState } from 'react';
import { ArrowRight, Lock, Sparkles, ChevronDown, HelpCircle } from 'lucide-react';

interface AboutFaqTabProps {
  onGoSend: () => void;
  onGoRegister: () => void;
}

const FAQS = [
  {
    q: 'What is ZecWhisper?',
    a: 'ZecWhisper is a zero-knowledge whistleblower and encrypted tip platform built on Zcash\'s Orchard shielded pool. It lets anyone — sources, journalists, security researchers — send confidential messages and tips with provably zero metadata leakage, using real cryptography (not promises).',
  },
  {
    q: 'Where does the money go when someone sends ZEC?',
    a: 'Directly and only to the recipient\'s Zcash Orchard Unified Address (u1...). ZecWhisper has zero custody — it generates a standard ZIP-321 payment URI that the sender\'s own Zcash wallet (Zashi, YWallet, ZODL) executes. We never touch the funds.',
  },
  {
    q: 'Are the drop box names real people?',
    a: 'When you first load ZecWhisper with no registered drop boxes, you may see demo test addresses clearly labeled "DEMO". These are synthetic addresses for UI testing — not real journalists or wallets. Any real person can register their own Zcash address using the "Register My Drop Box" flow.',
  },
  {
    q: 'How is my message kept private?',
    a: 'Your message is encrypted inside the Zcash Orchard transaction memo field — up to 512 bytes, encrypted with the recipient\'s public key derived from their Unified Address. Only the recipient\'s Incoming Viewing Key (IVK) can decrypt it. ZecWhisper never sees the decrypted content.',
  },
  {
    q: 'What wallets can I use to send?',
    a: 'Any ZIP-321 compliant Zcash wallet: Zashi (iOS/Android, by ECC), YWallet (desktop & mobile), or ZODL (mobile). Scan the generated QR code and confirm the transaction. The wallet handles shielding automatically.',
  },
  {
    q: 'Can my IP address be traced?',
    a: 'Zcash Orchard uses zk-SNARKs (Halo 2 proofs) to cryptographically hide the sender, amount, and memo from all network observers — including miners and nodes. As long as you send from a shielded Orchard address (not a t-address), there is no on-chain link to your identity.',
  },
  {
    q: 'What is a "Drop Box"?',
    a: 'A drop box is simply a registered Zcash Orchard Unified Address with a public profile (name, role, description). Anyone can drop you an encrypted message + ZEC tip by scanning your QR code. You receive it directly in your wallet — no intermediary.',
  },
  {
    q: 'Is file encryption really happening client-side?',
    a: 'Yes. When you attach a file, ZecWhisper uses the browser\'s native Web Crypto API (SubtleCrypto) to encrypt it with AES-256-GCM before any data leaves your device. The AES key and IV are embedded in the Orchard memo — meaning only the recipient who decrypts the memo can also decrypt the file.',
  },
  {
    q: 'What happens to my data?',
    a: 'Nothing leaves your browser to our servers — because there are no ZecWhisper servers. Your drop box registrations are stored in your browser\'s localStorage. Encrypted file blobs are stored in your browser\'s IndexedDB. Clearing browser data removes everything.',
  },
  {
    q: 'What is the Judge Testing Kit for?',
    a: 'The Judge Kit is for ZECATHON hackathon judges and reviewers who want to verify ZIP-321 compliance, check privacy guarantees, or test the flow without real ZEC. It provides step-by-step instructions and copyable test vectors.',
  },
];

export const AboutFaqTab: React.FC<AboutFaqTabProps> = ({ onGoSend, onGoRegister }) => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {/* ─── About Hero ─── */}
      <section style={{ padding: '4rem 0 3rem', borderBottom: '1px solid var(--border-1)' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            <HelpCircle size={13} /> About ZecWhisper
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Privacy is a right,<br />
            <span style={{ color: 'var(--gold)' }}>not a feature.</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            ZecWhisper is an open whistleblower and encrypted tip protocol built for the ZECATHON hackathon.
            It uses Zcash's Orchard shielded pool — the most advanced financial privacy system deployed at
            scale — to let anyone send confidential messages with mathematically verifiable zero metadata leakage.
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Unlike traditional whistleblower platforms that rely on server-side anonymization, VPNs, or
            operational security promises, ZecWhisper uses <strong style={{ color: 'var(--text-1)' }}>zk-SNARKs</strong> — 
            cryptographic proofs that make metadata leakage <em>mathematically impossible</em>, not just 
            policy-prohibited.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn-primary" onClick={onGoSend} style={{ padding: '12px 24px' }}>
              <Lock size={15} />
              Send a Drop
            </button>
            <button type="button" className="btn-secondary" onClick={onGoRegister} style={{ padding: '11px 20px' }}>
              <Sparkles size={14} />
              Register Drop Box
            </button>
          </div>
        </div>
      </section>

      {/* ─── Core Principles ─── */}
      <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-1)' }}>
        <div className="container">
          <h2 className="section-heading" style={{ marginBottom: '0.5rem' }}>Core Principles</h2>
          <p className="section-sub" style={{ marginBottom: '2rem' }}>
            These aren't marketing claims — they're enforced by the cryptographic protocol itself.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                icon: '🔐',
                title: 'No Transparent Addresses',
                body: 'ZecWhisper strictly rejects all transparent t-addresses (t1..., t3...). Only Orchard Unified Addresses (u1...) are accepted — the only format that provides Halo 2 zk-SNARK privacy.',
                color: 'var(--gold)',
              },
              {
                icon: '📵',
                title: 'Zero Telemetry',
                body: 'No analytics, no tracking pixels, no third-party scripts that could link your IP to a transaction. ZecWhisper has no backend — all state lives in your browser.',
                color: 'var(--green)',
              },
              {
                icon: '🔑',
                title: 'IVK-Only Key Policy',
                body: 'We never ask for spending keys or seed phrases. Only Incoming Viewing Keys (IVKs) are used, and only for trial-decrypting compact Orchard blocks — a read-only operation.',
                color: 'var(--cyan)',
              },
              {
                icon: '⚙️',
                title: 'Working Beats Ambitious',
                body: 'Every feature ships with a working demo mode and real fallback. Judges can test the full flow without testnet ZEC. Real sends go to real wallets with real cryptographic proofs.',
                color: 'var(--purple)',
              },
            ].map(p => (
              <div key={p.title} className="how-card">
                <div style={{ fontSize: '1.75rem', marginBottom: '0.85rem' }}>{p.icon}</div>
                <div className="how-title" style={{ color: p.color }}>{p.title}</div>
                <p className="how-body">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Supported Wallets ─── */}
      <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-1)' }}>
        <div className="container">
          <h2 className="section-heading" style={{ marginBottom: '0.5rem' }}>Supported Wallets</h2>
          <p className="section-sub" style={{ marginBottom: '2rem' }}>
            Any ZIP-321 compliant Zcash wallet works out of the box.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Zashi', by: 'Electric Coin Co.', platforms: 'iOS · Android', desc: 'The official ECC wallet. Best Orchard Unified Address support with native ZIP-321 QR scanning.', link: 'https://electriccoin.co/zashi/' },
              { name: 'YWallet', by: 'Hanh', platforms: 'Desktop · Mobile', desc: 'High-performance Sapling & Orchard wallet with advanced features and fast sync.', link: 'https://ywallet.app/' },
              { name: 'ZODL', by: 'ZODL Team', platforms: 'Mobile', desc: 'Orchard-native mobile client focused on shielded transactions and privacy by default.', link: 'https://zodl.net/' },
            ].map(w => (
              <a
                key={w.name}
                href={w.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div className="how-card" style={{ height: '100%', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '2px' }}>{w.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-3)' }}>by {w.by}</div>
                    </div>
                    <span className="badge badge-gold">{w.platforms}</span>
                  </div>
                  <p className="how-body">{w.desc}</p>
                  <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Learn more <ArrowRight size={12} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 className="section-heading" style={{ marginBottom: '0.5rem' }}>Frequently Asked Questions</h2>
          <p className="section-sub" style={{ marginBottom: '0' }}>
            Real answers about how ZecWhisper works and what it can and can't do.
          </p>

          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className="faq-chevron" />
                </button>
                {open === i && (
                  <div className="faq-a">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
