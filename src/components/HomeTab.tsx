import React from 'react';
import { Lock, ShieldCheck, ArrowRight, Terminal, Shield, FileCode, Server, HardDrive, KeyRound, Globe } from 'lucide-react';
import type { ShieldedSubmission } from '../types/zcash';
import { DisclosuresWall } from './DisclosuresWall';
import { ZecWhisperLogo } from './ZecWhisperLogo';

interface HomeTabProps {
  submissions: ShieldedSubmission[];
  disclosedCount: number;
  totalZec: string;
  onGoSend: () => void;
  onGoRegister: () => void;
  onGoAbout: () => void;
  onGoDisclosures?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  submissions, disclosedCount, totalZec, onGoSend, onGoRegister, onGoAbout, onGoDisclosures,
}) => {
  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              display: 'inline-flex',
              padding: '6px',
              borderRadius: '26px',
              background: 'radial-gradient(circle, rgba(244,183,40,0.18) 0%, rgba(11,14,20,0) 70%)',
              filter: 'drop-shadow(0 0 24px rgba(244,183,40,0.25))',
            }}>
              <ZecWhisperLogo size={68} />
            </div>
          </div>

          <div className="hero-eyebrow">
            <ShieldCheck size={13} />
            Zcash Orchard · Zero-Knowledge Privacy Architecture
          </div>

          <h1 className="hero-title">
            Whistleblow with<br />
            <span>Zero Footprint</span>
          </h1>

          <p className="hero-desc">
            Send confidential tips, leak documents, and submit bug bounties — all encrypted inside
            Zcash's Orchard shielded pool. Your identity is mathematically untraceable.
          </p>

          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={onGoSend} style={{ padding: '13px 28px', fontSize: '0.95rem', gap: 8 }}>
              <Lock size={16} />
              Send a Shielded Drop
            </button>
            <button type="button" className="btn-secondary" onClick={onGoRegister} style={{ padding: '12px 22px', fontSize: '0.9rem', gap: 8 }}>
              <ShieldCheck size={15} />
              Register Drop Box
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--gold)' }}>{submissions.length}</div>
              <div className="stat-label">Total Drops</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--green)' }}>{totalZec}</div>
              <div className="stat-label">ZEC Shielded</div>
            </div>
            <div
              className="stat-item"
              onClick={onGoDisclosures}
              style={{ cursor: onGoDisclosures ? 'pointer' : 'default' }}
              title="Click to view Public Disclosures Feed"
            >
              <div className="stat-value">{disclosedCount}</div>
              <div className="stat-label">Disclosed {onGoDisclosures && '↗'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Public Disclosures Wall Feed ─── */}
      <section style={{ padding: '3.5rem 0', borderTop: '1px solid var(--border-1)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                <Globe size={13} /> Live Verified Disclosures
              </div>
              <h2 className="section-heading" style={{ margin: 0 }}>Public Disclosures Wall</h2>
              <p className="section-sub" style={{ margin: '0.25rem 0 0' }}>
                Confidential leaks, whistleblow reports, and bounties disclosed to the public with on-chain cryptographic proofs.
              </p>
            </div>
            {onGoDisclosures && (
              <button type="button" className="btn-secondary" onClick={onGoDisclosures} style={{ fontSize: '0.84rem' }}>
                Full Feed View ({disclosedCount}) →
              </button>
            )}
          </div>

          <DisclosuresWall submissions={submissions} />
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid var(--border-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              <Terminal size={13} /> Transmission Protocol
            </div>
            <h2 className="section-heading">How ZecWhisper Works</h2>
            <p className="section-sub" style={{ maxWidth: 520, margin: '0 auto' }}>
              Three steps. No accounts. No servers handling your message.
            </p>
          </div>

          <div className="how-grid">
            {[
              {
                n: '01',
                title: 'Set Up Your Drop Box',
                body: 'Anyone — journalist, researcher, DAO — can register their Zcash Orchard address (u1...) from Zashi or YWallet. Stored client-side.',
              },
              {
                n: '02',
                title: 'Compose & Encrypt',
                body: 'Write your message (up to 512 bytes, encrypted in-band). Optionally attach a file — it\'s AES-256-GCM encrypted client-side before any transmission.',
              },
              {
                n: '03',
                title: 'Scan & Send via Wallet',
                body: 'A ZIP-321 QR code is generated. Scan it with Zashi, YWallet, or ZODL and confirm. The payment and memo arrive shielded — no metadata, no IP, no trace.',
              },
              {
                n: '04',
                title: 'Recipient Receives Privately',
                body: 'The recipient uses their Incoming Viewing Key to decrypt the memo. They can optionally publish the drop to the public disclosure board with proof.',
              },
            ].map(step => (
              <div key={step.n} className="how-card">
                <div className="how-num">{step.n}</div>
                <div className="how-title">{step.title}</div>
                <p className="how-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─── */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid var(--border-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              <ShieldCheck size={13} /> Cryptographic Primitives
            </div>
            <h2 className="section-heading">Zero-Knowledge Security Stack</h2>
            <p className="section-sub" style={{ maxWidth: 520, margin: '0 auto' }}>
              Enforced by mathematics, not trust.
            </p>
          </div>

          <div className="tech-grid">
            {[
              { icon: <Shield size={18} color="var(--gold)" />, name: 'Orchard zk-SNARKs', desc: 'Halo 2 proof system. Sender, amount, and memo are cryptographically hidden from every observer.' },
              { icon: <FileCode size={18} color="var(--green)" />, name: 'ZIP-321 Payment URI', desc: 'Standard Zcash payment request format. Works natively with Zashi, YWallet, and ZODL.' },
              { icon: <Lock size={18} color="var(--cyan)" />, name: 'AES-256-GCM Files', desc: 'Evidence files encrypted in your browser before leaving your device. Keys live in the memo only.' },
              { icon: <Server size={18} color="var(--purple)" />, name: 'Lightwalletd gRPC', desc: 'Connects to real Zcash light nodes (ECC, zec.rocks) for live block heights and compact block scanning.' },
              { icon: <HardDrive size={18} color="var(--amber)" />, name: 'Zero-Server Storage', desc: 'All state lives in your browser\'s localStorage and IndexedDB. No backend database — ever.' },
              { icon: <KeyRound size={18} color="#F87171" />, name: 'IVK-Only Scanning', desc: 'Only Incoming Viewing Keys are used for trial decryption. Spending keys are never requested.' },
            ].map(t => (
              <div key={t.name} className="tech-card">
                <div className="tech-icon" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)' }}>
                  {t.icon}
                </div>
                <div>
                  <div className="tech-name">{t.name}</div>
                  <p className="tech-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid var(--border-1)' }}>
        <div className="container">
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-1)',
            borderRadius: 14,
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
          }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Ready to submit or receive disclosures?
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '1.75rem', maxWidth: 480, margin: '0 auto 1.75rem' }}>
              Register your Orchard Unified Address to receive shielded disclosures, or send one anonymously now.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn-primary" onClick={onGoRegister} style={{ padding: '11px 24px', fontSize: '0.88rem' }}>
                <ShieldCheck size={14} />
                Register Drop Box
              </button>
              <button type="button" className="btn-secondary" onClick={onGoSend} style={{ padding: '11px 20px', fontSize: '0.88rem', gap: 7 }}>
                <Lock size={14} />
                Send a Drop
                <ArrowRight size={14} />
              </button>
              <button type="button" className="btn-ghost" onClick={onGoAbout} style={{ fontSize: '0.86rem', color: 'var(--text-2)' }}>
                Documentation &amp; FAQ →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
