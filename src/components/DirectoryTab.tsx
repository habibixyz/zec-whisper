import React, { useState } from 'react';
import { Check, Plus, Share2, ShieldCheck, Lock } from 'lucide-react';
import type { ShieldedRecipient } from '../types/zcash';
import { truncateAddress } from '../utils/zip321';

interface DirectoryTabProps {
  recipients: ShieldedRecipient[];
  onSelectAndSend: (r: ShieldedRecipient) => void;
  onOpenRegisterModal: () => void;
}

export const DirectoryTab: React.FC<DirectoryTabProps> = ({ recipients, onSelectAndSend, onOpenRegisterModal }) => {
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  const copyLink = (r: ShieldedRecipient, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?to=${encodeURIComponent(r.unifiedAddress)}&name=${encodeURIComponent(r.name)}&handle=${encodeURIComponent(r.handle)}`;
    navigator.clipboard.writeText(url);
    setCopiedHandle(r.handle);
    setTimeout(() => setCopiedHandle(null), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
            Drop Box Directory
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
            Verified recipients accepting confidential Orchard shielded disclosures.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={onOpenRegisterModal} style={{ gap: 8 }}>
          <Plus size={15} />
          Register My Drop Box
        </button>
      </div>

      {recipients.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', borderLeft: '3px solid var(--gold)' }}>
          <div className="empty-icon"><Plus size={22} color="var(--gold)" /></div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            No Drop Boxes Yet
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Register your real Zcash Orchard Unified Address (<span className="mono">u1...</span>) from Zashi or YWallet.
            It takes under a minute and is stored only in your browser.
          </p>
          <button type="button" className="btn-primary" onClick={onOpenRegisterModal} style={{ padding: '11px 22px' }}>
            <Plus size={15} />
            Register Your Drop Box
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {recipients.map(r => <RecipientCard key={r.handle} r={r} copiedHandle={copiedHandle} onCopy={copyLink} onSend={onSelectAndSend} />)}
        </div>
      )}
    </div>
  );
};

function RecipientCard({ r, copiedHandle, onCopy, onSend }: {
  r: ShieldedRecipient;
  copiedHandle: string | null;
  onCopy: (r: ShieldedRecipient, e: React.MouseEvent) => void;
  onSend: (r: ShieldedRecipient) => void;
}) {
  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: '3px solid rgba(16,185,129,0.4)',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.85rem' }}>
          <img
            src={r.avatar} alt={r.name}
            style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--gold)', background: '#1a2030', flexShrink: 0, objectFit: 'cover' }}
          />
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <strong style={{ fontSize: '0.96rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</strong>
              {r.isContractVault ? (
                <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}><ShieldCheck size={9} /> Escrow Contract</span>
              ) : r.verified ? (
                <span className="badge badge-green" style={{ fontSize: '0.6rem' }}><Check size={9} /> Verified</span>
              ) : null}
            </div>
            <div style={{ color: 'var(--gold)', fontSize: '0.76rem', fontWeight: 600 }}>{r.role}</div>
            <div className="mono" style={{ color: 'var(--text-3)', fontSize: '0.7rem' }}>{r.handle}</div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '0.9rem' }}>
          {r.description}
        </p>

        {/* Address */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 11px', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--border-1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600 }}>
              {r.isContractVault ? 'Vault Escrow UA' : 'Orchard UA'}
            </span>
            <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--green)' }}>NU5 Mainnet</span>
          </div>
          <div className="mono" style={{ fontSize: '0.71rem', color: 'var(--text-1)', wordBreak: 'break-all' }}>
            {truncateAddress(r.unifiedAddress, 16, 12)}
          </div>
          {r.viewingKey && (
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--gold)', fontWeight: 600 }}>Public Audit IVK:</span>
              <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--text-3)' }}>
                {r.viewingKey.slice(0, 10)}...{r.viewingKey.slice(-8)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={e => onCopy(r, e)}
          style={{ padding: '7px 10px', fontSize: '0.78rem' }}
          title="Copy share link"
        >
          {copiedHandle === r.handle
            ? <><Check size={13} color="var(--green)" /><span style={{ color: 'var(--green)' }}>Copied!</span></>
            : <><Share2 size={13} /><span>Share</span></>}
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onSend(r)}
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
        >
          <Lock size={13} />
          Drop Secret
        </button>
      </div>
    </div>
  );
}
