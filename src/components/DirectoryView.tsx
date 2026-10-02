import React, { useState } from 'react';
import { Check, Lock, Plus, Share2, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ShieldedRecipient } from '../types/zcash';
import { truncateAddress } from '../utils/zip321';

interface DirectoryViewProps {
  recipients: ShieldedRecipient[];
  onSelectAndDrop: (recipient: ShieldedRecipient) => void;
  onOpenRegisterModal: () => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({ 
  recipients, 
  onSelectAndDrop,
  onOpenRegisterModal 
}) => {
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  const handleCopyShareLink = (r: ShieldedRecipient, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = window.location.origin;
    const shareUrl = `${origin}/?to=${encodeURIComponent(r.unifiedAddress)}&name=${encodeURIComponent(r.name)}&handle=${encodeURIComponent(r.handle)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedHandle(r.handle);
    setTimeout(() => setCopiedHandle(null), 2500);
  };

  const realRecipients = recipients.filter(r => !r.isDemo);
  const demoRecipients = recipients.filter(r => r.isDemo);

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Shielded Drop Box Directory
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Real recipients accepting confidential Orchard shielded disclosures.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn glow-gold"
          onClick={onOpenRegisterModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>Register My Drop Box</span>
        </button>
      </div>

      {/* Real Recipients Section */}
      {realRecipients.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <ShieldCheck size={16} color="var(--shield-green)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--shield-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Real Drop Boxes ({realRecipients.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {realRecipients.map(r => (
              <RecipientCard
                key={r.handle}
                r={r}
                copiedHandle={copiedHandle}
                onCopyShareLink={handleCopyShareLink}
                onSelectAndDrop={onSelectAndDrop}
              />
            ))}
          </div>
        </div>
      )}

      {/* Register CTA if no real recipients */}
      {realRecipients.length === 0 && (
        <div className="glass-panel" style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          borderLeft: '3px solid var(--zec-gold)',
        }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(244, 183, 40, 0.1)', border: '1px solid var(--border-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Plus size={24} color="var(--zec-gold)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            No Real Drop Boxes Registered Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
            Register your real Zcash Orchard Unified Address (<span className="mono">u1...</span>) from Zashi, YWallet, or ZODL to start receiving shielded disclosures. It's stored only in your browser — no server involved.
          </p>
          <button
            type="button"
            className="primary-btn glow-gold"
            onClick={onOpenRegisterModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
          >
            <Plus size={16} />
            <span>Register Your Real Drop Box</span>
          </button>
        </div>
      )}

      {/* Demo Recipients Section */}
      {demoRecipients.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <AlertTriangle size={15} color="var(--zec-amber)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--zec-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demo / Test Personas ({demoRecipients.length})
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            These are synthetic test addresses for hackathon judging only. No real ZEC will be received. Use them to test the full UI flow without real funds.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', opacity: 0.8 }}>
            {demoRecipients.map(r => (
              <RecipientCard
                key={r.handle}
                r={r}
                copiedHandle={copiedHandle}
                onCopyShareLink={handleCopyShareLink}
                onSelectAndDrop={onSelectAndDrop}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual cards
function RecipientCard({
  r,
  copiedHandle,
  onCopyShareLink,
  onSelectAndDrop,
}: {
  r: ShieldedRecipient;
  copiedHandle: string | null;
  onCopyShareLink: (r: ShieldedRecipient, e: React.MouseEvent) => void;
  onSelectAndDrop: (r: ShieldedRecipient) => void;
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        borderLeft: r.isDemo ? '2px solid rgba(244, 183, 40, 0.3)' : '2px solid rgba(16, 185, 129, 0.4)',
      }}
    >
      <div>
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.85rem' }}>
          <img
            src={r.avatar}
            alt={r.name}
            style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${r.isDemo ? 'var(--zec-amber)' : 'var(--zec-gold)'}`, background: '#1a1f2e', flexShrink: 0 }}
          />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</h3>
              {r.isDemo ? (
                <span className="badge badge-demo">DEMO</span>
              ) : r.verified ? (
                <span className="badge badge-verified"><Check size={10} /> Real</span>
              ) : null}
            </div>
            <div style={{ color: 'var(--zec-gold)', fontSize: '0.78rem', fontWeight: 600 }}>{r.role}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }} className="mono">{r.handle}</div>
          </div>
        </div>

        {/* Description */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.45', marginBottom: '1rem' }}>
          {r.description}
        </p>

        {/* Address */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '9px 11px', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Orchard UA
            </span>
            <span className="mono" style={{ fontSize: '0.65rem', color: r.isDemo ? 'var(--zec-amber)' : 'var(--shield-green)' }}>
              {r.isDemo ? 'DEMO ONLY' : 'NU5 Mainnet'}
            </span>
          </div>
          <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
            {truncateAddress(r.unifiedAddress, 18, 14)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className="secondary-btn"
          onClick={e => onCopyShareLink(r, e)}
          style={{ padding: '7px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Copy shareable link"
        >
          {copiedHandle === r.handle ? (
            <><Check size={13} color="var(--shield-green)" /><span style={{ color: 'var(--shield-green)' }}>Copied!</span></>
          ) : (
            <><Share2 size={13} /><span>Share</span></>
          )}
        </button>

        <button
          type="button"
          className="primary-btn glow-gold"
          onClick={() => onSelectAndDrop(r)}
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
        >
          <Lock size={13} />
          <span>{r.isDemo ? 'Test Drop' : 'Drop Secret'}</span>
        </button>
      </div>
    </div>
  );
}
