import React, { useState } from 'react';
import { Inbox, ShieldCheck, Key, Share2, Check, Download, FileText, RefreshCw, FileCode, ExternalLink } from 'lucide-react';
import type { ShieldedSubmission, ShieldedRecipient, NetworkBlockStatus } from '../types/zcash';
import { simulateCompactBlockScan, type ScanProgress } from '../utils/lightwalletd';
import { ProofReceiptModal } from './ProofReceiptModal';
import { decryptFileClientSide } from '../utils/crypto';
import { getEncryptedEvidence } from '../utils/storage';

interface InboxTabProps {
  submissions: ShieldedSubmission[];
  selectedRecipient: ShieldedRecipient | null;
  onDisclose: (id: string) => void;
  networkStatus: NetworkBlockStatus;
  onOpenScanner?: () => void;
}

const CAT_CLASS: Record<string, string> = {
  whistleblow: 'cat-whistleblow',
  bounty: 'cat-bounty',
  press: 'cat-press',
  tip: 'cat-tip',
};

export const InboxTab: React.FC<InboxTabProps> = ({
  submissions, selectedRecipient, onDisclose, networkStatus, onOpenScanner,
}) => {
  const [ivk, setIvk] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const [proofSub, setProofSub] = useState<ShieldedSubmission | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(submissions[0]?.id || null);

  const filtered = selectedRecipient
    ? submissions.filter(s =>
        s.recipientHandle === selectedRecipient.handle ||
        s.recipientHandle.includes(selectedRecipient.unifiedAddress?.slice(0, 12) || '')
      )
    : submissions;

  const active = filtered.find(s => s.id === selectedId) || filtered[0];

  const handleSync = async () => {
    setIsSyncing(true);
    const target = networkStatus.blockHeight;
    const start = Math.max(1, target - 20);
    await simulateCompactBlockScan(start, target, p => setScanProgress(p));
    setIsSyncing(false);
    setTimeout(() => setScanProgress(null), 3500);
  };

  const handleDecrypt = async (sub: ShieldedSubmission) => {
    if (!sub.attachment) return;
    setDecryptingId(sub.id);
    try {
      const record = await getEncryptedEvidence(sub.attachment.ipfsCid);
      if (record?.blob) {
        const buf = await record.blob.arrayBuffer();
        const blob = await decryptFileClientSide(buf, sub.attachment.aesKey, record.iv, record.type);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = record.name;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
      } else {
        // Fallback: generate disclosure manifest
        await new Promise(r => setTimeout(r, 500));
        const txt = `=== ZECWHISPER DISCLOSURE RECEIPT ===\nRecipient: ${sub.recipientHandle}\nTxID: ${sub.txid}\nBlock: #${sub.blockHeight}\nCID: ${sub.attachment.ipfsCid}\nMemo: ${sub.message}\n======================================`;
        const blob = new Blob([txt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `zecwhisper_${sub.id}.txt`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
      }
    } catch {
      alert('Decryption failed — check key or ciphertext integrity.');
    } finally {
      setDecryptingId(null);
    }
  };

  if (filtered.length === 0 && !submissions.length) {
    return (
      <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div className="empty-icon"><Inbox size={22} color="var(--gold)" /></div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>No Drops Yet</h3>
        <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
          Once someone sends you a shielded tip or disclosure, it will appear here. Switch to the <strong>Send</strong> tab to test the flow.
        </p>
      </div>
    );
  }

  return (
    <div className="inbox-layout">
      {/* ── Left: IVK + List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* IVK panel */}
        <div className="card-sm" style={{ padding: '1.25rem', borderLeft: '3px solid var(--gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: '0.9rem' }}>
              <Key size={15} color="var(--gold)" />
              Incoming Viewing Key
            </div>
            <button
              type="button"
              className="badge badge-green"
              style={{ cursor: 'pointer', border: 'none' }}
              onClick={onOpenScanner}
            >
              <ShieldCheck size={10} />
              #{networkStatus.blockHeight.toLocaleString()}
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            Trial-decrypts compact Orchard blocks via{' '}
            <span className="mono" style={{ color: 'var(--gold)', fontSize: '0.74rem' }}>
              {networkStatus.activeServer.endpoint}
            </span>
            . Spending keys never touched.
          </p>
          <div style={{ display: 'flex', gap: 7 }}>
            <input
              type="password"
              className="input mono"
              value={ivk}
              onChange={e => setIvk(e.target.value)}
              placeholder="uivk1..."
              style={{ fontSize: '0.74rem' }}
            />
            <button
              type="button"
              className="btn-primary"
              onClick={handleSync}
              disabled={isSyncing}
              style={{ padding: '8px 14px', fontSize: '0.78rem', gap: 5, flexShrink: 0 }}
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Scanning...' : 'Sync'}
            </button>
          </div>
          {scanProgress && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.71rem', color: 'var(--text-3)', marginBottom: 4 }}>
                <span className="mono">{scanProgress.statusMessage}</span>
                <span className="mono" style={{ color: 'var(--gold)' }}>{scanProgress.percent}%</span>
              </div>
              <div className="byte-bar">
                <div className="byte-fill" style={{ width: `${scanProgress.percent}%`, background: 'var(--gold)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Messages list */}
        <div className="card-sm" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Inbox size={15} color="var(--gold)" />
              Inbound Feed
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{filtered.length} received</span>
          </div>

          <div className="message-list">
            {filtered.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.84rem' }}>
                No drops for this address yet.
              </div>
            ) : filtered.map(sub => (
              <div
                key={sub.id}
                className={`message-row ${active?.id === sub.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(sub.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span className={`badge ${CAT_CLASS[sub.category] || 'badge-gold'}`} style={{ fontSize: '0.65rem' }}>{sub.category}</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.82rem' }}>+{sub.amount} ZEC</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginBottom: 5 }}>
                  {sub.message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-3)' }}>
                  <span className="mono">#{sub.blockHeight}</span>
                  <span>{new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Active message ── */}
      <div className="card" style={{ padding: '2rem' }}>
        {active ? (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-1)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
                  <span className={`badge ${CAT_CLASS[active.category] || 'badge-gold'}`}>{active.category}</span>
                  <span className="badge badge-gold"><ShieldCheck size={10} /> {active.senderShieldedPool} Verified</span>
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 4 }}>Shielded Drop</h2>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }} className="mono">
                  <span>TxID: {active.txid.slice(0, 20)}…{active.txid.slice(-6)}</span>
                  <a href={`https://blockchair.com/zcash/transaction/${active.txid}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none', display: 'inline-flex' }}>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)' }}>+{active.amount} ZEC</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--green)' }}>Shielded Transfer</div>
              </div>
            </div>

            {/* Memo */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Decrypted Memo (512B In-Band Note)
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-1)', borderRadius: 10, padding: 16, fontSize: '0.92rem', lineHeight: 1.65, minHeight: 100 }}>
                {active.message}
              </div>
            </div>

            {/* Attachment */}
            {active.attachment && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Encrypted Evidence File
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--green-dim)', border: '1px solid var(--border-green)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={22} color="var(--green)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{active.attachment.name}</div>
                      <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
                        CID: {active.attachment.ipfsCid} · {active.attachment.size}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleDecrypt(active)}
                    disabled={decryptingId === active.id}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {decryptingId === active.id
                      ? <><RefreshCw size={13} className="animate-spin" />Decrypting…</>
                      : <><Download size={13} />Decrypt &amp; Download</>}
                  </button>
                </div>
              </div>
            )}

            {/* Disclose action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-1)', borderRadius: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>
                  {active.isDisclosed ? 'Publicly Disclosed' : 'Publish to Public Board'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>
                  {active.isDisclosed ? 'This leak is live on the public disclosure board.' : 'Disclose this tip publicly with verified on-chain proof.'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button type="button" className="btn-secondary" onClick={() => setProofSub(active)} style={{ fontSize: '0.82rem' }}>
                  <FileCode size={14} />Receipt
                </button>
                <button
                  type="button"
                  className={active.isDisclosed ? 'btn-secondary' : 'btn-primary'}
                  disabled={active.isDisclosed}
                  onClick={() => onDisclose(active.id)}
                  style={{ fontSize: '0.82rem' }}
                >
                  {active.isDisclosed ? <><Check size={14} color="var(--green)" />Disclosed</> : <><Share2 size={14} />Publish</>}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><Inbox size={22} color="var(--gold)" /></div>
            <p>Select a message from the left to read it.</p>
          </div>
        )}
      </div>

      {proofSub && <ProofReceiptModal isOpen={true} onClose={() => setProofSub(null)} submission={proofSub} />}
    </div>
  );
};
