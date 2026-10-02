import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, Paperclip, QrCode, Copy, Check, ExternalLink,
  AlertTriangle, Lock, Sparkles, FileText, Share2, X
} from 'lucide-react';
import type { ShieldedRecipient, SubmissionCategory, EncryptedAttachment } from '../types/zcash';
import { MAX_MEMO_BYTES, getUtf8ByteLength, validateShieldedAddress, buildZip321Uri, truncateAddress } from '../utils/zip321';
import { encryptFileClientSide } from '../utils/crypto';
import { storeEncryptedEvidence } from '../utils/storage';

interface SendTabProps {
  recipients: ShieldedRecipient[];
  selectedRecipient: ShieldedRecipient | null;
  onSelectRecipient: (r: ShieldedRecipient) => void;
  onBroadcast: (data: {
    recipientHandle: string;
    amount: number;
    message: string;
    category: SubmissionCategory;
    attachment?: EncryptedAttachment;
    txid?: string;
  }) => void;
  onOpenRegisterModal?: () => void;
  marketPriceUsd?: number;
}

const CATEGORIES: { id: SubmissionCategory; label: string }[] = [
  { id: 'whistleblow', label: 'Whistleblow' },
  { id: 'bounty',      label: 'Bug Bounty'  },
  { id: 'press',       label: 'Press Leak'  },
  { id: 'tip',         label: 'Anon Tip'    },
];

export const SendTab: React.FC<SendTabProps> = ({
  recipients, selectedRecipient, onSelectRecipient, onBroadcast, onOpenRegisterModal, marketPriceUsd,
}) => {
  const hasRealRecipients = recipients.some(r => !r.isDemo);
  const [customAddress, setCustomAddress] = useState('');
  const [useCustom, setUseCustom]   = useState(!hasRealRecipients || !selectedRecipient || !!selectedRecipient?.isDemo);
  const [category, setCategory]     = useState<SubmissionCategory>('whistleblow');
  const [amount, setAmount]         = useState(0);
  const [message, setMessage]       = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [attachment, setAttachment] = useState<EncryptedAttachment | null>(null);
  const [copied, setCopied]         = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQR, setShowQR]         = useState(false);
  const [qrUrl, setQrUrl]           = useState('');
  const [showAddrErr, setShowAddrErr] = useState(false);
  const [realTxid, setRealTxid]     = useState('');
  const [txidErr, setTxidErr]       = useState('');

  const activeAddr = useCustom || !selectedRecipient ? customAddress : selectedRecipient.unifiedAddress;
  const validation = validateShieldedAddress(activeAddr);
  const isDemo     = !useCustom && !!selectedRecipient?.isDemo;
  const byteCount  = getUtf8ByteLength(message);
  const overLimit  = byteCount > MAX_MEMO_BYTES;
  const bytePct    = Math.min(100, Math.round((byteCount / MAX_MEMO_BYTES) * 100));

  const memoPayload = attachment
    ? `ZECW:${attachment.ipfsCid}:${attachment.aesKey}:${attachment.iv || 'iv'}:${attachment.name.replace(/[:|]/g, '_')}${message ? ` | ${message.slice(0, 140)}` : ''}`
    : message;

  const { standardUri, fallbackUri } = buildZip321Uri(activeAddr, amount, memoPayload);

  // Generate QR when modal opens
  useEffect(() => {
    if (showQR && activeAddr && validation.valid) {
      QRCode.toDataURL(standardUri, { width: 260, margin: 2, color: { dark: '#07090E', light: '#F4B728' } })
        .then(url => setQrUrl(url))
        .catch(() => QRCode.toDataURL(fallbackUri, { width: 260, margin: 2, color: { dark: '#07090E', light: '#F4B728' } })
          .then(url => setQrUrl(url))
          .catch(console.error));
    }
  }, [showQR, standardUri, fallbackUri, activeAddr, validation.valid]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsEncrypting(true);
    try {
      const res = await encryptFileClientSide(file);
      setAttachment({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, type: file.type || 'application/octet-stream', ipfsCid: res.ipfsCid, aesKey: res.aesKeyBase64, iv: res.ivBase64 });
      await storeEncryptedEvidence({ ipfsCid: res.ipfsCid, blob: res.encryptedBlob, name: file.name, type: file.type || 'application/octet-stream', size: `${(file.size / 1024).toFixed(1)} KB`, aesKey: res.aesKeyBase64, iv: res.ivBase64, timestamp: Date.now() });
      if (!message.trim()) setMessage(`[Encrypted: ${file.name}] CID:${res.ipfsCid.slice(0, 10)}...`);
    } catch (err) {
      console.error('Encrypt error:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleGenerate = () => {
    if (!validation.valid) { setShowAddrErr(true); return; }
    if (overLimit) return;
    setShowAddrErr(false);
    setShowQR(true);
  };

  const handleConfirmTx = () => {
    const clean = realTxid.trim().toLowerCase();
    if (!clean) { setTxidErr('Enter the 64-character transaction hash.'); return; }
    if (!/^[0-9a-fA-F]{64}$/.test(clean)) { setTxidErr('Invalid TxID — must be 64 hex characters.'); return; }
    setTxidErr('');
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors: ['#10B981', '#F4B728', '#FFFFFF'] });
    onBroadcast({ recipientHandle: getHandle(), amount, message, category, attachment: attachment || undefined, txid: clean });
    setRealTxid(''); setShowQR(false);
  };

  const handleSimulate = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#F4B728', '#10B981', '#FFFFFF'] });
    onBroadcast({ recipientHandle: getHandle(), amount, message, category, attachment: attachment || undefined });
    setShowQR(false);
  };

  const getHandle = () => (useCustom || !selectedRecipient) ? `@${truncateAddress(activeAddr)}` : selectedRecipient.handle;

  const copyLink = () => {
    if (!validation.valid) return;
    const name = selectedRecipient && !useCustom ? selectedRecipient.name : 'Shielded Drop Box';
    const handle = selectedRecipient && !useCustom ? selectedRecipient.handle : `@${truncateAddress(activeAddr)}`;
    navigator.clipboard.writeText(`${window.location.origin}/?to=${encodeURIComponent(activeAddr)}&name=${encodeURIComponent(name)}&handle=${encodeURIComponent(handle)}`);
    setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <>
      <div className="send-layout">
        {/* ══════════ LEFT: Form ══════════ */}
        <div className="send-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div className="panel-title"><Lock size={18} color="var(--gold)" /> Drop Portal</div>
              <div className="panel-sub">Zero-knowledge shielded disclosure via Zcash Orchard.</div>
            </div>
            <span className="badge badge-gold"><ShieldCheck size={11} /> Orchard Only</span>
          </div>

          {/* Recipient Mode Tabs */}
          <div className="field" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`btn-ghost ${useCustom ? 'active' : ''}`}
                  onClick={() => setUseCustom(true)}
                  style={{
                    fontSize: '0.78rem',
                    padding: '5px 10px',
                    borderRadius: 6,
                    background: useCustom ? 'rgba(244,183,40,0.12)' : 'transparent',
                    border: `1px solid ${useCustom ? 'var(--border-gold)' : 'transparent'}`,
                    color: useCustom ? 'var(--gold)' : 'var(--text-3)',
                    fontWeight: useCustom ? 700 : 500,
                  }}
                >
                  🎯 Direct Orchard Address (u1...)
                </button>
                {recipients.length > 0 && (
                  <button
                    type="button"
                    className={`btn-ghost ${!useCustom ? 'active' : ''}`}
                    onClick={() => setUseCustom(false)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: !useCustom ? 'rgba(244,183,40,0.12)' : 'transparent',
                      border: `1px solid ${!useCustom ? 'var(--border-gold)' : 'transparent'}`,
                      color: !useCustom ? 'var(--gold)' : 'var(--text-3)',
                      fontWeight: !useCustom ? 700 : 500,
                    }}
                  >
                    📁 Directory Drop Boxes ({recipients.length})
                  </button>
                )}
              </div>

              {validation.valid && (
                <button type="button" className="btn-ghost" style={{ fontSize: '0.74rem', color: 'var(--green)', padding: '2px 6px' }} onClick={copyLink}>
                  {linkCopied ? <><Check size={12} /> Copied!</> : <><Share2 size={12} /> Share Link</>}
                </button>
              )}
            </div>

            {/* Saved recipients grid */}
            {!useCustom && selectedRecipient && recipients.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                {recipients.map(r => (
                  <button
                    key={r.handle}
                    type="button"
                    onClick={() => onSelectRecipient(r)}
                    style={{
                      background: selectedRecipient?.handle === r.handle ? 'rgba(244,183,40,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selectedRecipient?.handle === r.handle ? 'rgba(244,183,40,0.5)' : 'var(--border-1)'}`,
                      borderRadius: 10, padding: '10px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <img src={r.avatar} alt={r.name} style={{ width: 30, height: 30, borderRadius: '50%', background: '#1a2030', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-3)' }}>{r.handle}</div>
                      {r.isDemo && <span className="badge badge-demo" style={{ marginTop: 2 }}>DEMO</span>}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Custom address input */
              <div>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input mono"
                    placeholder="Paste Orchard Unified Address (u1...)"
                    value={customAddress}
                    onChange={e => { setCustomAddress(e.target.value); setShowAddrErr(false); }}
                    style={{ fontSize: '0.8rem' }}
                    autoFocus={useCustom}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-3)' }}>
                  <span>Must start with <span className="mono">u1</span> — copy from Zashi or YWallet</span>
                  {onOpenRegisterModal && (
                    <button type="button" className="btn-ghost" style={{ fontSize: '0.72rem', color: 'var(--gold)', padding: 0 }} onClick={onOpenRegisterModal}>
                      Save to directory →
                    </button>
                  )}
                </div>
                {customAddress && !validation.valid && (
                  <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#F87171', display: 'flex', gap: 5, alignItems: 'center' }}>
                    <AlertTriangle size={13} />{validation.error}
                  </div>
                )}
                {validation.valid && (
                  <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--green)', display: 'flex', gap: 5, alignItems: 'center' }}>
                    <Check size={13} />Valid Orchard Unified Address — ZEC goes directly here
                  </div>
                )}
              </div>
            )}

            {/* Demo warning */}
            {isDemo && (
              <div className="alert alert-amber" style={{ marginTop: 8 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>DEMO address</strong> — This is a test-only address with no real wallet. To send real ZEC,
                  click <strong>"+ Custom address"</strong> and paste your Orchard UA from Zashi, or
                  <button type="button" onClick={() => setUseCustom(true)} style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', textDecoration: 'underline', padding: '0 3px', fontWeight: 700 }}>use my address</button>.
                </div>
              </div>
            )}
            {/* Confirmed real */}
            {validation.valid && !isDemo && (
              <div className="alert alert-green" style={{ marginTop: 8 }}>
                <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span><strong>Real wallet destination.</strong> Funds arrive directly via Zcash Orchard — ZecWhisper has zero custody.</span>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="field" style={{ marginBottom: '1.25rem' }}>
            <div className="field-label"><span>Category</span></div>
            <div className="cat-pills">
              {CATEGORIES.map(c => (
                <button key={c.id} type="button" className={`cat-pill ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="field" style={{ marginBottom: '1.25rem' }}>
            <div className="field-label">
              <span>Encrypted Message (Orchard Memo)</span>
              <span className="mono" style={{ fontSize: '0.72rem', color: overLimit ? 'var(--red)' : byteCount > 400 ? 'var(--amber)' : 'var(--text-3)' }}>
                {byteCount}/{MAX_MEMO_BYTES}B
              </span>
            </div>
            <textarea
              className="textarea"
              placeholder="Write your confidential message, disclosure, or instructions. This is encrypted inside the Orchard transaction and only the recipient's viewing key can decrypt it."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <div className="byte-bar">
              <div className="byte-fill" style={{ width: `${bytePct}%`, background: overLimit ? 'var(--red)' : bytePct > 80 ? 'var(--amber)' : 'var(--gold)' }} />
            </div>
          </div>

          {/* File */}
          <div className="field" style={{ marginBottom: '1.25rem' }}>
            <div className="field-label">
              <span>Attach Evidence File</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--green)' }}>AES-256-GCM · Client-side only</span>
            </div>
            {!attachment ? (
              <label className="attach-area">
                <Paperclip size={15} />
                <span>{isEncrypting ? 'Encrypting in your browser...' : 'Click to attach PDF, TXT, ZIP, or image'}</span>
                <input type="file" onChange={handleFile} style={{ display: 'none' }} />
              </label>
            ) : (
              <div className="alert alert-green" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={18} color="var(--green)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-1)' }}>{attachment.name} ({attachment.size})</div>
                    <div className="mono" style={{ fontSize: '0.69rem', color: 'var(--green)' }}>AES-256-GCM encrypted · CID: {attachment.ipfsCid.slice(0, 14)}...</div>
                  </div>
                </div>
                <button type="button" className="btn-ghost" style={{ color: 'var(--red)', flexShrink: 0 }} onClick={() => setAttachment(null)}>Remove</button>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <div className="field-label">
              <span>Attach Optional ZEC Bounty / Tip</span>
              {amount === 0 ? (
                <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--green)' }}>
                  ✓ Free (Message Only)
                </span>
              ) : marketPriceUsd && marketPriceUsd > 0 ? (
                <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--green)' }}>
                  ≈ ${(amount * marketPriceUsd).toFixed(2)} USD
                </span>
              ) : null}
            </div>
            <div className="amount-pills">
              {[0, 0.01, 0.05, 0.1, 0.5].map(v => (
                <button key={v} type="button" className={`amount-pill ${amount === v ? 'active' : ''}`} onClick={() => setAmount(v)}>
                  {v === 0 ? '0 (Free / Message Only)' : `${v} ZEC`}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', marginTop: 7 }}>
              <input
                type="number" step="0.001" min="0" placeholder="0 ZEC (or enter custom tip)"
                className="input mono" style={{ paddingRight: 50 }}
                value={amount > 0 ? amount : ''}
                onChange={e => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.76rem', color: 'var(--gold)', fontWeight: 700 }}>ZEC</span>
            </div>
            <div style={{ fontSize: '0.71rem', color: 'var(--text-3)', marginTop: 5 }}>
              Tip is optional. You can whistleblow and send encrypted memos with 0 ZEC (only the network fee of ~0.0001 ZEC is paid by your wallet).
            </div>
          </div>

          {/* Errors */}
          {showAddrErr && !validation.valid && (
            <div className="alert alert-red" style={{ marginBottom: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{useCustom || recipients.length === 0 ? 'Enter a valid Orchard Unified Address (u1...) to generate the QR code.' : 'Select a recipient or enter a custom address.'}</span>
              </div>
            </div>
          )}
          {overLimit && (
            <div className="alert alert-red" style={{ marginBottom: '1rem' }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>Message is {byteCount - MAX_MEMO_BYTES} bytes over the 512-byte Orchard limit.</span>
            </div>
          )}

          {/* Generate button */}
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.92rem' }}
            disabled={overLimit}
            onClick={handleGenerate}
          >
            <QrCode size={17} />
            Generate ZIP-321 Payment QR Code
          </button>
        </div>

        {/* ══════════ RIGHT: Recipient Info + Security ══════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Recipient card */}
          <div className="recipient-card">
            {selectedRecipient && !useCustom ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1rem' }}>
                  <img src={selectedRecipient.avatar} alt={selectedRecipient.name} className="rec-avatar" />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <strong style={{ fontSize: '1.05rem' }}>{selectedRecipient.name}</strong>
                      {selectedRecipient.isDemo && <span className="badge badge-demo">DEMO</span>}
                      {selectedRecipient.verified && !selectedRecipient.isDemo && <span className="badge badge-green"><Check size={9} /> Verified</span>}
                    </div>
                    <div style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600 }}>{selectedRecipient.role}</div>
                    <div className="mono" style={{ fontSize: '0.71rem', color: 'var(--text-3)' }}>{selectedRecipient.handle}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.55, marginBottom: '1rem' }}>{selectedRecipient.description}</p>
                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-1)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                    {selectedRecipient.isDemo ? '⚠ Demo Test Address (not a real wallet)' : 'Orchard Unified Address'}
                  </div>
                  <div className="mono" style={{ fontSize: '0.7rem', wordBreak: 'break-all', color: selectedRecipient.isDemo ? 'var(--amber)' : 'var(--gold)' }}>
                    {selectedRecipient.unifiedAddress}
                  </div>
                </div>
              </>
            ) : validation.valid ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.85rem' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid var(--border-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lock size={20} color="var(--green)" />
                  </div>
                  <div>
                    <strong style={{ fontSize: '1rem' }}>Direct Orchard Drop</strong>
                    <div><span className="badge badge-green" style={{ marginTop: 3 }}>Live Mainnet</span></div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  ZEC arrives directly in this Orchard wallet. ZecWhisper has zero custody.
                </p>
                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-green)' }}>
                  <div className="mono" style={{ fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--green)' }}>{activeAddr}</div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(244,183,40,0.08)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Lock size={20} color="var(--gold)" />
                </div>
                <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                  {recipients.length > 0 ? 'Select a recipient' : 'Enter recipient address'}
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                  {recipients.length > 0
                    ? 'Pick one of the saved drop boxes on the left, or click "+ Custom address" to enter your own.'
                    : 'Paste an Orchard Unified Address (u1...) from Zashi or YWallet to verify the route.'}
                </p>
                {recipients.length === 0 && onOpenRegisterModal && (
                  <button type="button" className="btn-primary" onClick={onOpenRegisterModal} style={{ marginTop: '1rem', padding: '9px 18px', fontSize: '0.84rem' }}>
                    <Sparkles size={14} />
                    Register My Drop Box
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Security checklist */}
          <div className="card-sm" style={{ padding: '1.25rem', borderLeft: '3px solid var(--green)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
              <ShieldCheck size={15} /> Zero-Leak Guarantees
            </div>
            <ul className="check-list">
              <li><span className="check-icon">✓</span><span><strong>Sender Privacy</strong> — Orchard zk-SNARKs hide your wallet address and IP.</span></li>
              <li><span className="check-icon">✓</span><span><strong>Encrypted Memo</strong> — Only the recipient's viewing key can decrypt it.</span></li>
              <li><span className="check-icon">✓</span><span><strong>No Accounts</strong> — No email, login, cookies, or server logs.</span></li>
              <li><span className="check-icon">✓</span><span><strong>Non-Custodial</strong> — ZecWhisper never holds or routes your funds.</span></li>
            </ul>
          </div>

          {/* How to send hint */}
          <div className="card-sm" style={{ padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--gold)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} /> How to Send
            </div>
            <ol style={{ paddingLeft: '1.15rem', fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.75 }}>
              <li>Select a recipient or paste your Orchard address</li>
              <li>Write your message (optional)</li>
              <li>Choose a ZEC amount</li>
              <li>Click <strong style={{ color: 'var(--gold)' }}>Generate QR Code</strong></li>
              <li>Scan with Zashi, YWallet, or ZODL</li>
              <li>Paste your TxID to confirm delivery</li>
            </ol>
          </div>
        </div>
      </div>

      {/* ══════════ QR Modal ══════════ */}
      {showQR && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button type="button" className="modal-close" onClick={() => setShowQR(false)}>
              <X size={15} />
            </button>

            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
              <Lock size={10} /> ZIP-321 Shielded Payment
            </span>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Scan with Your Wallet</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              Open <strong>Zashi</strong>, <strong>YWallet</strong>, or <strong>ZODL</strong> and scan.
            </p>

            {isDemo ? (
              <div className="alert alert-amber" style={{ marginBottom: '1rem', justifyContent: 'center', textAlign: 'center', fontSize: '0.76rem' }}>
                <AlertTriangle size={13} />
                <span>Demo test address · To send real ZEC, enter your own Orchard address (<span className="mono">u1...</span>).</span>
              </div>
            ) : (
              <div className="alert alert-green" style={{ marginBottom: '1rem', justifyContent: 'center', textAlign: 'center', fontSize: '0.78rem' }}>
                <ShieldCheck size={14} />
                <span><strong>Live Zcash Mainnet (Orchard)</strong> — Non-custodial direct transfer</span>
              </div>
            )}

            <div className="qr-frame">
              {qrUrl
                ? <img src={qrUrl} alt="ZIP-321 QR" style={{ width: 220, height: 220, display: 'block' }} />
                : <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#07090E', fontWeight: 600 }}>Generating...</div>
              }
            </div>

            {/* Summary */}
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: 10, textAlign: 'left', marginBottom: '1rem', fontSize: '0.8rem' }}>
              {[
                ['Amount', `${amount} ZEC${marketPriceUsd && marketPriceUsd > 0 ? ` (≈ $${(amount * marketPriceUsd).toFixed(2)})` : ''}`, 'var(--gold)'],
                ['To', truncateAddress(activeAddr), 'var(--text-1)'],
                ['Memo', byteCount > 0 ? `${byteCount}B encrypted` : 'None', 'var(--green)'],
              ].map(([k, v, c]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-3)' }}>{k}</span>
                  <span className={k === 'To' ? 'mono' : ''} style={{ color: c as string, fontWeight: 600, fontSize: '0.78rem' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={fallbackUri} className="btn-primary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', fontSize: '0.84rem' }}>
                  <ExternalLink size={14} />Open in Wallet
                </a>
                <button type="button" className="btn-secondary" onClick={() => { navigator.clipboard.writeText(standardUri); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy URI'}
                </button>
              </div>

              {/* TxID confirmation */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-1)', borderRadius: 10, padding: 12, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <div style={{ fontSize: '0.71rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Broadcasted? Paste TxID to record:
                  </div>
                  {realTxid.trim().length === 64 && (
                    <a
                      href={`https://blockchair.com/zcash/transaction/${realTxid.trim().toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.7rem', color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
                    >
                      <ExternalLink size={10} /> Explorer
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text" className="input mono"
                    placeholder="64-character transaction hash"
                    value={realTxid}
                    onChange={e => { setRealTxid(e.target.value); setTxidErr(''); }}
                    style={{ fontSize: '0.72rem', padding: '7px 10px', flex: 1 }}
                  />
                  <button type="button" className="btn-primary" onClick={handleConfirmTx} style={{ padding: '7px 12px', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                    Confirm & Record
                  </button>
                </div>
                {txidErr && <div style={{ color: 'var(--red)', fontSize: '0.72rem', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={11} />{txidErr}</div>}
              </div>

              {/* Demo simulation helper */}
              <div style={{ textAlign: 'center', marginTop: 2 }}>
                <button type="button" onClick={handleSimulate} className="btn-ghost" style={{ fontSize: '0.74rem', color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Sparkles size={12} color="var(--gold)" />
                  Testing without a wallet? Simulate confirmation →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
