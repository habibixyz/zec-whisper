import React, { useState } from 'react';
import { ArrowRight, Lock, ShieldCheck, ChevronDown, HelpCircle, ShieldAlert, EyeOff, KeyRound, Cpu, ExternalLink, Download } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface AboutFaqTabProps {
  onGoSend: () => void;
  onGoRegister: () => void;
}

const FAQS = [
  {
    q: 'What is ZecWhisper?',
    a: 'ZecWhisper is a zero-knowledge whistleblower and encrypted tip platform built on Zcash\'s Orchard shielded pool. It lets anyone — sources, journalists, security researchers — send confidential messages, documents, and tips with provably zero metadata leakage using Halo 2 zk-SNARKs.',
  },
  {
    q: 'Where is the source code hosted?',
    a: 'The complete frontend, cryptographic utilities, and documentation are 100% open source under the MIT License and hosted on GitHub at https://github.com/habibixyz/zec-whisper. Anyone can inspect the zero-telemetry implementation, verify the client-side AES-256-GCM encryption routines, or audit the ZIP-321 memo generator.',
  },
  {
    q: 'Where does the money go when someone sends ZEC?',
    a: 'Directly and only to the recipient\'s Zcash Orchard Unified Address (u1...). ZecWhisper is 100% non-custodial — it formats a standard ZIP-321 payment URI that your own mobile wallet (Zashi, YWallet, ZODL) executes on the blockchain. We never touch, hold, or intercept funds.',
  },
  {
    q: 'Who is the default recipient in the Drop Portal?',
    a: 'The default recipient is the official ZecWhisper Custody Vault, which uses a genuine Zcash Orchard Unified Address (u1...) to receive project tips, audit disclosures, and bug bounties. Anyone else (journalists, newsrooms, DAOs) can register their own personal drop box via "Register My Drop Box".',
  },
  {
    q: 'Can anyone trace who sent the whistleblow from the on-chain Transaction ID?',
    a: 'No, mathematically impossible. In Zcash Orchard, transactions use Halo 2 zero-knowledge proofs. The sender\'s wallet address, IP address, and amount are never recorded on the blockchain. The Transaction ID only proves that a zero-knowledge proof was verified and mined into a block — it contains zero personal or metadata footprints.',
  },
  {
    q: 'How is my message kept private?',
    a: 'Your message is encrypted inside the Zcash Orchard transaction memo field — up to 512 bytes, encrypted with the recipient\'s public key derived from their Unified Address. Only the recipient holding the corresponding Incoming Viewing Key (IVK) can decrypt it.',
  },
  {
    q: 'What is the Public Disclosures Feed and what does "Disclose" mean?',
    a: 'When an anonymous leak is sent, it initially arrives confidentially in the recipient\'s private Safe Inbox. Once the recipient reviews and verifies the evidence, they can click "Publish" to disclose the story publicly on the Public Feed, accompanied by an exportable cryptographic Proof-of-Whistleblow receipt anchored to the on-chain block.',
  },
  {
    q: 'What wallets can I use to send?',
    a: 'Any ZIP-321 compliant Zcash wallet: Zashi (iOS/Android, by Electric Coin Co.), YWallet (desktop & mobile), or ZODL (mobile). Simply scan the on-screen QR code and confirm the transaction in your wallet.',
  },
  {
    q: 'Can my IP address be traced?',
    a: 'Zcash Orchard uses zk-SNARKs (Halo 2 proofs) computed directly on your device inside your mobile wallet. There is no on-chain link to your IP address or identity. Furthermore, ZecWhisper has zero external telemetry, tracking pixels, or third-party analytics.',
  },
  {
    q: 'Is file encryption really happening client-side?',
    a: 'Yes. When you attach a file (> 512B), ZecWhisper uses the browser\'s native Web Crypto API (SubtleCrypto) to encrypt it with AES-256-GCM before any data leaves your device. The AES key and IV are embedded in the shielded Orchard memo — meaning only the recipient who decrypts the memo can decrypt the file.',
  },
  {
    q: 'What happens to my data? Is there a central server?',
    a: 'No, there are zero ZecWhisper servers. All state lives exclusively in your browser (localStorage for custom directories, IndexedDB for encrypted evidence blobs) and on the decentralized Zcash blockchain. There is no central database or company server that could ever be seized or hacked.',
  },
  {
    q: 'What is real vs. simulated in ZecWhisper?',
    a: 'Real: Standard ZIP-321 RFC payment URI generation, native Web Crypto AES-256-GCM file encryption, Orchard Bech32m address validation, live Lightwalletd block tip sync, and SHA-256 cryptographic receipts. Private: Halo 2 zk-SNARK sender unlinkability, shielded memo encryption, zero telemetry. Simulated: An in-browser compact block scanner and local confirmation mode so hackathon judges can test the full lifecycle in 30 seconds without spending real ZEC.',
  },
];

export const AboutFaqTab: React.FC<AboutFaqTabProps> = ({ onGoSend, onGoRegister }) => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {/* ─── About Hero ─── */}
      <section style={{ padding: '4rem 0 3rem', borderBottom: '1px solid var(--border-1)' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 0 24px rgba(244, 183, 40, 0.3)',
              border: '1.5px solid rgba(244, 183, 40, 0.4)',
              background: '#0B0E14',
              flexShrink: 0,
            }}>
              <img src="/logo.jpg" alt="ZecWhisper Brand Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <HelpCircle size={13} /> About ZecWhisper
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                Official ZECATHON Submission · Orchard Nu5
              </div>
            </div>
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
              <ShieldCheck size={14} />
              Register Drop Box
            </button>
            <a
              href="https://github.com/habibixyz/zec-whisper"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ padding: '11px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}
            >
              <GithubIcon size={15} />
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── Open Source Repository Callout ─── */}
      <section style={{ padding: '2.5rem 0', borderBottom: '1px solid var(--border-1)', background: 'linear-gradient(180deg, rgba(244, 183, 40, 0.03) 0%, transparent 100%)' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{
            background: 'var(--surface-1)',
            border: '1px solid rgba(244, 183, 40, 0.22)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'rgba(244, 183, 40, 0.1)',
                border: '1px solid rgba(244, 183, 40, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
                flexShrink: 0,
              }}>
                <GithubIcon size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-1)', marginBottom: 2 }}>
                  Open Source on GitHub
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  github.com/habibixyz/zec-whisper
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href="/logo.jpg"
                download="zecwhisper_logo.jpg"
                className="btn-secondary"
                style={{
                  textDecoration: 'none',
                  padding: '9px 15px',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Download size={13} />
                <span>Brand Kit</span>
              </a>
              <a
                href="https://github.com/habibixyz/zec-whisper"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  textDecoration: 'none',
                  padding: '9px 18px',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span>View Repository</span>
                <ExternalLink size={13} />
              </a>
            </div>
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
                icon: <ShieldAlert size={20} color="var(--gold)" />,
                title: 'No Transparent Addresses',
                body: 'ZecWhisper strictly rejects all transparent t-addresses (t1..., t3...). Only Orchard Unified Addresses (u1...) are accepted — the only format that provides Halo 2 zk-SNARK privacy.',
                color: 'var(--gold)',
              },
              {
                icon: <EyeOff size={20} color="var(--green)" />,
                title: 'Zero Telemetry',
                body: 'No analytics, no tracking pixels, no third-party scripts that could link your IP to a transaction. ZecWhisper has no backend — all state lives in your browser.',
                color: 'var(--green)',
              },
              {
                icon: <KeyRound size={20} color="var(--cyan)" />,
                title: 'IVK-Only Key Policy',
                body: 'We never ask for spending keys or seed phrases. Only Incoming Viewing Keys (IVKs) are used, and only for trial-decrypting compact Orchard blocks — a read-only operation.',
                color: 'var(--cyan)',
              },
              {
                icon: <Cpu size={20} color="var(--purple)" />,
                title: 'Working Beats Ambitious',
                body: 'Every feature ships with a working demo mode and real fallback. Judges can test the full flow without testnet ZEC. Real sends go to real wallets with real cryptographic proofs.',
                color: 'var(--purple)',
              },
            ].map(p => (
              <div key={p.title} className="how-card">
                <div style={{ marginBottom: '0.85rem' }}>{p.icon}</div>
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
