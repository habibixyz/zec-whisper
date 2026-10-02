import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Search, 
  FileCode,
  ExternalLink
} from 'lucide-react';
import type { ShieldedSubmission } from '../types/zcash';
import { ProofReceiptModal } from './ProofReceiptModal';

interface DisclosuresWallProps {
  submissions: ShieldedSubmission[];
}

export const DisclosuresWall: React.FC<DisclosuresWallProps> = ({ submissions }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProofSub, setSelectedProofSub] = useState<ShieldedSubmission | null>(null);

  const disclosedSubs = submissions.filter(s => s.isDisclosed);

  const filtered = disclosedSubs.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = s.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.recipientHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.txid.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Search & Category Filter Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            className="text-input"
            placeholder="Search verified disclosures by keyword, handle, or txid..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'whistleblow', 'bounty', 'press', 'tip'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? 'rgba(244, 183, 40, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${activeCategory === cat ? 'var(--zec-gold)' : 'var(--border-subtle)'}`,
                color: activeCategory === cat ? 'var(--zec-gold)' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {cat === 'all' ? 'All Disclosures' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Disclosures Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filtered.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              {disclosedSubs.length === 0 ? 'No Public Disclosures Published Yet' : 'No disclosures match your search criteria'}
            </div>
            <p style={{ fontSize: '0.84rem', maxWidth: '480px', margin: '0 auto', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {disclosedSubs.length === 0 
                ? 'When recipients verify and disclose incoming shielded leaks from their Safe Inbox, they will be published here with cryptographic proof receipts.' 
                : 'Try adjusting your search terms or selecting a different category filter.'}
            </p>
          </div>
        ) : (
          filtered.map(sub => (
            <div key={sub.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header: Category & Recipient */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`badge badge-${sub.category}`}>
                      {sub.category}
                    </span>
                    <span className="badge badge-orchard">
                      <ShieldCheck size={11} /> Orchard Verified
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--zec-gold)' }}>
                    +{sub.amount} ZEC
                  </span>
                </div>

                {/* Target Handle */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                  Received by <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{sub.recipientHandle}</span>
                </div>

                {/* Disclosure Message */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  "{sub.message}"
                </p>

                {/* Attached Evidence badge */}
                {sub.attachment && (
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="var(--shield-green)" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {sub.attachment.name}
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--shield-green)' }}>
                      Verified Checksum
                    </span>
                  </div>
                )}
              </div>

              {/* On-chain Cryptographic Proof Footer */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div className="mono">
                  Block #{sub.blockHeight}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={`https://blockchair.com/zcash/transaction/${sub.txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--text-dim)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                    }}
                    title="View live on Blockchair"
                  >
                    <ExternalLink size={12} />
                    <span>Explorer</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedProofSub(sub)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--zec-gold)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                    title="Export cryptographic proof receipt (JSON)"
                  >
                    <FileCode size={13} />
                    <span>Proof Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Proof Receipt Modal */}
      {selectedProofSub && (
        <ProofReceiptModal
          isOpen={true}
          onClose={() => setSelectedProofSub(null)}
          submission={selectedProofSub}
        />
      )}
    </div>
  );
};
