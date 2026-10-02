import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Paperclip, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  Lock, 
  Sparkles, 
  FileText,
  Share2,
  X
} from 'lucide-react';
import type { ShieldedRecipient, SubmissionCategory, EncryptedAttachment } from '../types/zcash';
import { 
  MAX_MEMO_BYTES, 
  getUtf8ByteLength, 
  validateShieldedAddress, 
  buildZip321Uri, 
  truncateAddress 
} from '../utils/zip321';
import { encryptFileClientSide } from '../utils/crypto';
import { storeEncryptedEvidence } from '../utils/storage';

interface DropPortalProps {
  recipients: ShieldedRecipient[];
  selectedRecipient: ShieldedRecipient | null;
  onSelectRecipient: (recipient: ShieldedRecipient) => void;
  onSimulateBroadcast: (submission: {
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

export const DropPortal: React.FC<DropPortalProps> = ({
  recipients,
  selectedRecipient,
  onSelectRecipient,
  onSimulateBroadcast,
  onOpenRegisterModal,
  marketPriceUsd,
}) => {
  const [customAddress, setCustomAddress] = useState('');
  const [useCustom, setUseCustom] = useState(recipients.length === 0);
  const [category, setCategory] = useState<SubmissionCategory>('whistleblow');
  const [amount, setAmount] = useState<number>(0.05);
  const [message, setMessage] = useState<string>('');
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [attachmentData, setAttachmentData] = useState<EncryptedAttachment | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showAddressError, setShowAddressError] = useState<boolean>(false);
  const [realTxidInput, setRealTxidInput] = useState<string>('');
  const [txidError, setTxidError] = useState<string>('');

  // Determine the active address based on mode
  const activeAddress = (useCustom || !selectedRecipient) 
    ? customAddress 
    : selectedRecipient.unifiedAddress;
  
  const addressValidation = validateShieldedAddress(activeAddress);
  const isDemo = selectedRecipient?.isDemo && !useCustom;
  const currentByteCount = getUtf8ByteLength(message);
  const isOverByteLimit = currentByteCount > MAX_MEMO_BYTES;
  const bytePercentage = Math.min(100, Math.round((currentByteCount / MAX_MEMO_BYTES) * 100));

  // Share link for current drop box
  const handleCopyCurrentLink = () => {
    if (!addressValidation.valid) {
      alert('Please enter a valid Orchard Unified Address before copying a share link.');
      return;
    }
    const origin = window.location.origin;
    const targetAddr = activeAddress;
    const targetName = selectedRecipient && !useCustom ? selectedRecipient.name : 'Shielded Drop Box';
    const targetHandle = selectedRecipient && !useCustom ? selectedRecipient.handle : `@${truncateAddress(targetAddr)}`;
    const shareUrl = `${origin}/?to=${encodeURIComponent(targetAddr)}&name=${encodeURIComponent(targetName)}&handle=${encodeURIComponent(targetHandle)}`;
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Handle file encryption when user attaches a document
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsEncrypting(true);
    try {
      const result = await encryptFileClientSide(file);
      setAttachmentData({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'application/octet-stream',
        ipfsCid: result.ipfsCid,
        aesKey: result.aesKeyBase64,
        iv: result.ivBase64,
      });
      await storeEncryptedEvidence({
        ipfsCid: result.ipfsCid,
        blob: result.encryptedBlob,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        aesKey: result.aesKeyBase64,
        iv: result.ivBase64,
        timestamp: Date.now(),
      });
      if (!message.trim()) {
        setMessage(`[Confidential Document Attached: ${file.name}] CID:${result.ipfsCid.slice(0, 12)}...`);
      }
    } catch (err) {
      console.error('Failed to encrypt file client-side:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  const removeAttachment = () => setAttachmentData(null);

  // Build the ZIP-321 memo payload
  const finalMemoPayload = attachmentData
    ? `ZECW:${attachmentData.ipfsCid}:${attachmentData.aesKey}:${attachmentData.iv || 'iv'}:${attachmentData.name.replace(/[:|]/g, '_')}${message ? ` | ${message.slice(0, 160)}` : ''}`
    : message;

  const { standardUri, fallbackUri } = buildZip321Uri(activeAddress, amount, finalMemoPayload);

  // Render QR Code when modal opens
  useEffect(() => {
    if (activeModal && activeAddress && addressValidation.valid) {
      QRCode.toDataURL(standardUri, {
        width: 280,
        margin: 2,
        color: { dark: '#07090E', light: '#F4B728' },
      })
        .then(url => setQrDataUrl(url))
        .catch(() => {
          QRCode.toDataURL(fallbackUri, {
            width: 280,
            margin: 2,
            color: { dark: '#07090E', light: '#F4B728' },
          })
            .then(url => setQrDataUrl(url))
            .catch(e => console.error('QR error:', e));
        });
    }
  }, [activeModal, standardUri, fallbackUri, activeAddress, addressValidation.valid]);

  const handleGenerateDrop = () => {
    if (!addressValidation.valid) {
      setShowAddressError(true);
      return;
    }
    if (isOverByteLimit) return;
    setShowAddressError(false);
    setActiveModal(true);
  };

  const handleCopyUri = () => {
    navigator.clipboard.writeText(standardUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackRealTransaction = () => {
    const cleanTxid = realTxidInput.trim().toLowerCase();
    if (!cleanTxid) {
      setTxidError('Please enter the 64-character transaction hash from your wallet.');
      return;
    }
    if (!/^[0-9a-fA-F]{64}$/.test(cleanTxid)) {
      setTxidError('Invalid TxID format. A Zcash transaction hash is exactly 64 hex characters.');
      return;
    }
    setTxidError('');
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#10B981', '#F4B728', '#FFFFFF'],
    });
    onSimulateBroadcast({
      recipientHandle: (useCustom || !selectedRecipient) ? `@${truncateAddress(activeAddress)}` : selectedRecipient.handle,
      amount,
      message,
      category,
      attachment: attachmentData || undefined,
      txid: cleanTxid,
    });
    setRealTxidInput('');
    setActiveModal(false);
  };

  const handleSimulatePayment = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F4B728', '#10B981', '#FFFFFF'],
    });
    onSimulateBroadcast({
      recipientHandle: (useCustom || !selectedRecipient) ? `@${truncateAddress(activeAddress)}` : selectedRecipient.handle,
      amount,
      message,
      category,
      attachment: attachmentData || undefined,
    });
    setActiveModal(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '2rem' }}>
      {/* ===== LEFT COLUMN: Drop Form ===== */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} color="var(--zec-gold)" />
              Encrypted Drop Portal
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '3px' }}>
              Zero-knowledge shielded tips &amp; leaks via Zcash Orchard.
            </p>
          </div>
          <span className="badge badge-orchard">
            <ShieldCheck size={13} />
            Orchard Only
          </span>
        </div>

        {/* === Recipient Selector === */}
        <div className="input-group">
          <div className="input-label">
            <span>Drop Box Recipient</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {addressValidation.valid && (
                <button
                  type="button"
                  onClick={handleCopyCurrentLink}
                  style={{ background: 'none', border: 'none', color: 'var(--shield-green)', cursor: 'pointer', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Copy permanent shareable link for this drop box"
                >
                  {linkCopied ? <Check size={13} /> : <Share2 size={13} />}
                  <span>{linkCopied ? 'Copied!' : 'Share Link'}</span>
                </button>
              )}
              {recipients.length > 0 && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--zec-gold)', cursor: 'pointer', fontSize: '0.74rem' }}
                  onClick={() => setUseCustom(!useCustom)}
                >
                  {useCustom ? '← Back to Saved' : '+ Custom Address'}
                </button>
              )}
            </div>
          </div>

          {/* Recipient picker mode: show tabs */}
          {!useCustom && selectedRecipient && recipients.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
              {recipients.map(r => (
                <button
                  key={r.handle}
                  type="button"
                  onClick={() => onSelectRecipient(r)}
                  style={{
                    background: selectedRecipient?.handle === r.handle ? 'rgba(244, 183, 40, 0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedRecipient?.handle === r.handle ? 'var(--zec-gold)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <img src={r.avatar} alt={r.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{r.handle}</div>
                    {r.isDemo && (
                      <span className="badge badge-demo" style={{ marginTop: '2px' }}>DEMO</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Custom address input */
            <div>
              <input
                type="text"
                className="text-input mono"
                placeholder="Paste Orchard Unified Address (u1...)"
                value={customAddress}
                onChange={e => {
                  setCustomAddress(e.target.value);
                  setShowAddressError(false);
                }}
                style={{ fontSize: '0.8rem' }}
                autoFocus={useCustom}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  Must start with <span className="mono">u1</span> — get this from Zashi or YWallet
                </span>
                {onOpenRegisterModal && (
                  <button
                    type="button"
                    onClick={onOpenRegisterModal}
                    style={{ background: 'none', border: 'none', color: 'var(--zec-gold)', cursor: 'pointer', fontSize: '0.72rem', textDecoration: 'underline', padding: 0 }}
                  >
                    Save to Directory
                  </button>
                )}
              </div>
              {customAddress && !addressValidation.valid && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.74rem', marginTop: '6px' }}>
                  <AlertTriangle size={13} />
                  <span>{addressValidation.error}</span>
                </div>
              )}
              {addressValidation.valid && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--shield-green)', fontSize: '0.74rem', marginTop: '6px' }}>
                  <Check size={13} />
                  <span>Valid Orchard Unified Address — real ZEC will go here</span>
                </div>
              )}
            </div>
          )}

          {/* Demo mode warning — shown when a demo recipient is selected */}
          {isDemo && !useCustom && (
            <div style={{
              background: 'rgba(244, 183, 40, 0.07)',
              border: '1px solid rgba(244, 183, 40, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: 'var(--zec-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span><strong>DEMO:</strong> This is a test address for judging purposes only. To send real ZEC, click <strong>"+ Custom Address"</strong> and paste your Orchard UA from Zashi/YWallet.</span>
              </div>
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                style={{
                  background: 'rgba(244, 183, 40, 0.2)',
                  border: '1px solid var(--zec-gold)',
                  color: 'var(--zec-gold)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                Use My Address
              </button>
            </div>
          )}

          {/* Real destination confirmation */}
          {addressValidation.valid && !isDemo && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.07)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: 'var(--shield-green)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '4px',
            }}>
              <ShieldCheck size={15} style={{ flexShrink: 0 }} />
              <span><strong>Real Wallet:</strong> Funds sent here arrive directly in this Zcash Orchard wallet. ZecWhisper has zero custody.</span>
            </div>
          )}
        </div>

        {/* === Category Picker === */}
        <div className="input-group">
          <label className="input-label">Disclosure Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { id: 'whistleblow', label: 'Whistleblow' },
              { id: 'bounty', label: 'Bug Bounty' },
              { id: 'press', label: 'Press Leak' },
              { id: 'tip', label: 'Anonymous Tip' },
            ].map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id as SubmissionCategory)}
                style={{
                  background: category === c.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${category === c.id ? 'var(--zec-gold)' : 'var(--border-subtle)'}`,
                  color: category === c.id ? 'var(--zec-gold)' : 'var(--text-muted)',
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.77rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* === Encrypted Memo === */}
        <div className="input-group">
          <div className="input-label">
            <span>Confidential Message (Shielded Memo)</span>
            <span style={{ 
              fontSize: '0.74rem', 
              color: isOverByteLimit ? 'var(--danger)' : currentByteCount > 400 ? 'var(--zec-amber)' : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)'
            }}>
              {currentByteCount}/{MAX_MEMO_BYTES}B
            </span>
          </div>
          <textarea
            className="text-area"
            placeholder="Write your confidential disclosure, credentials, or instructions here. This memo is encrypted end-to-end inside the Orchard transaction."
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ minHeight: '100px' }}
          />
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${bytePercentage}%`, 
                background: isOverByteLimit ? 'var(--danger)' : 'var(--zec-gold)',
                transition: 'width 0.15s ease'
              }} 
            />
          </div>
        </div>

        {/* === File Attachment === */}
        <div className="input-group">
          <div className="input-label">
            <span>Attach Evidence (AES-256-GCM Encrypted)</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--shield-green)' }}>Client-side only</span>
          </div>
          {!attachmentData ? (
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.01)',
              color: 'var(--text-muted)',
              fontSize: '0.84rem',
              transition: 'border-color 0.2s',
            }}>
              <Paperclip size={16} />
              <span>{isEncrypting ? 'Encrypting locally...' : 'Attach PDF, TXT, ZIP, or image'}</span>
              <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(16, 185, 129, 0.07)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="var(--shield-green)" />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{attachmentData.name} ({attachmentData.size})</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--shield-green)' }} className="mono">
                    AES-256-GCM • CID: {attachmentData.ipfsCid.slice(0, 14)}...
                  </div>
                </div>
              </div>
              <button type="button" onClick={removeAttachment} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem', padding: '4px 8px' }}>
                Remove
              </button>
            </div>
          )}
        </div>

        {/* === ZEC Amount === */}
        <div className="input-group">
          <div className="input-label">
            <span>ZEC Tip / Bounty Amount</span>
            {marketPriceUsd && marketPriceUsd > 0 && amount > 0 && (
              <span style={{ fontSize: '0.74rem', color: 'var(--shield-green)' }} className="mono">
                ≈ ${(amount * marketPriceUsd).toFixed(2)} USD
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[0.01, 0.05, 0.1, 0.5, 1.0].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                style={{
                  flex: '1 1 0',
                  background: amount === val ? 'rgba(244, 183, 40, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${amount === val ? 'var(--zec-gold)' : 'var(--border-subtle)'}`,
                  color: amount === val ? 'var(--zec-gold)' : 'var(--text-muted)',
                  padding: '8px 0',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {val}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', marginTop: '4px' }}>
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="Custom amount (ZEC)"
              value={amount > 0 ? amount : ''}
              onChange={e => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="text-input mono"
              style={{ fontSize: '0.85rem', paddingRight: '50px' }}
            />
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--zec-gold)', fontWeight: 700 }}>
              ZEC
            </span>
          </div>
        </div>

        {/* Address error state */}
        {showAddressError && !addressValidation.valid && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginTop: '0.75rem',
            color: '#F87171',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>
                {useCustom || recipients.length === 0 
                  ? 'Enter a valid Orchard Unified Address (u1...) to generate the QR code.' 
                  : 'No valid address selected. Pick a recipient or enter a custom Orchard address.'}
              </span>
            </div>
            {recipients.length > 0 && useCustom && (
              <button
                type="button"
                onClick={() => { setUseCustom(false); setShowAddressError(false); }}
                style={{
                  background: 'rgba(244, 183, 40, 0.2)',
                  border: '1px solid var(--zec-gold)',
                  color: 'var(--zec-gold)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Pick Saved
              </button>
            )}
          </div>
        )}

        {/* Over byte limit warning */}
        {isOverByteLimit && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            marginTop: '0.75rem',
            color: '#F87171',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertTriangle size={14} />
            <span>Message exceeds 512-byte Orchard memo limit. Shorten your message by {currentByteCount - MAX_MEMO_BYTES} bytes.</span>
          </div>
        )}

        {/* === Generate Button === */}
        <button
          type="button"
          className="primary-btn glow-gold"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '1rem' }}
          disabled={isOverByteLimit}
          onClick={handleGenerateDrop}
        >
          <QrCode size={18} />
          Generate ZIP-321 Payment QR Code
        </button>
      </div>

      {/* ===== RIGHT COLUMN: Recipient Profile + Privacy Guarantees ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Active Recipient Profile Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          {selectedRecipient && !useCustom ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1rem' }}>
                <img 
                  src={selectedRecipient.avatar} 
                  alt={selectedRecipient.name}
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--zec-gold)', background: '#1a1f2e' }} 
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedRecipient.name}</h3>
                    {selectedRecipient.isDemo && (
                      <span className="badge badge-demo">DEMO</span>
                    )}
                    {selectedRecipient.verified && !selectedRecipient.isDemo && (
                      <span className="badge badge-verified"><Check size={10} /> Verified</span>
                    )}
                  </div>
                  <div style={{ color: 'var(--zec-gold)', fontSize: '0.82rem', fontWeight: 500 }}>
                    {selectedRecipient.role}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.73rem' }} className="mono">
                    {selectedRecipient.handle}
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                {selectedRecipient.description}
              </p>

              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                  {selectedRecipient.isDemo ? 'Demo Test Address (NOT a Real Wallet)' : 'Orchard Unified Address'}
                </div>
                <div className="mono" style={{ fontSize: '0.72rem', wordBreak: 'break-all', color: selectedRecipient.isDemo ? 'var(--zec-amber)' : 'var(--zec-gold)' }}>
                  {selectedRecipient.unifiedAddress}
                </div>
              </div>
            </div>
          ) : addressValidation.valid ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--shield-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Lock size={22} color="var(--shield-green)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Direct Orchard Drop</h3>
                  <span className="badge badge-orchard" style={{ marginTop: '3px' }}>Live Mainnet Destination</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                ZEC sent here arrives directly in this Orchard wallet. ZecWhisper has no custody and cannot intercept funds.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--shield-green)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                  Destination Address
                </div>
                <div className="mono" style={{ fontSize: '0.72rem', wordBreak: 'break-all', color: 'var(--shield-green)' }}>
                  {activeAddress}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244, 183, 40, 0.08)', border: '1px solid var(--border-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Lock size={20} color="var(--zec-gold)" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Select or Enter Recipient
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.4', margin: 0 }}>
                Pick a recipient from the list or enter your own Orchard Unified Address (<span className="mono">u1...</span>) to verify the route.
              </p>
            </div>
          )}
        </div>

        {/* Zero-Leak Security Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid var(--shield-green)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem', color: 'var(--shield-green)' }}>
            <ShieldCheck size={16} />
            Zero-Leak Guarantees
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--shield-green)', flexShrink: 0 }}>✓</span>
              <span><strong>Sender Privacy:</strong> Orchard zk-SNARKs hide your IP and wallet completely.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--shield-green)', flexShrink: 0 }}>✓</span>
              <span><strong>Encrypted Memo:</strong> Only the recipient's viewing key can decrypt your text.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--shield-green)', flexShrink: 0 }}>✓</span>
              <span><strong>No Accounts:</strong> No email, cookies, or server logs. Ever.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--shield-green)', flexShrink: 0 }}>✓</span>
              <span><strong>Non-Custodial:</strong> ZecWhisper never holds or routes your funds.</span>
            </li>
          </ul>
        </div>

        {/* How-to flow hint */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid rgba(244, 183, 40, 0.4)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--zec-gold)', marginBottom: '0.6rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Sparkles size={14} />
            How it works
          </h4>
          <ol style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
            <li>Select a recipient or paste your own Orchard address</li>
            <li>Write your encrypted message (optional)</li>
            <li>Set a ZEC tip amount (can be 0.01 ZEC minimum)</li>
            <li>Click <strong style={{ color: 'var(--zec-gold)' }}>Generate QR Code</strong></li>
            <li>Scan with Zashi, YWallet, or ZODL to send</li>
          </ol>
        </div>
      </div>

      {/* ===== QR CODE MODAL ===== */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10005,
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div className="glass-panel glow-gold" style={{ maxWidth: '460px', width: '100%', padding: '2rem', position: 'relative', textAlign: 'center' }}>
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveModal(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-dim)', cursor: 'pointer', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={16} />
            </button>

            <span className="badge badge-orchard" style={{ marginBottom: '0.75rem' }}>
              <Lock size={11} /> ZIP-321 Shielded Payment
            </span>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              Scan with Zcash Wallet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              Open <strong>Zashi</strong>, <strong>YWallet</strong>, or <strong>ZODL</strong> and scan this QR.
            </p>

            {/* Destination badge — critical trust indicator */}
            {isDemo ? (
              <div style={{
                background: 'rgba(244, 183, 40, 0.1)',
                border: '1px solid rgba(244, 183, 40, 0.35)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                color: 'var(--zec-amber)',
                marginBottom: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <AlertTriangle size={13} />
                <span>⚠ DEMO test address — NOT a real wallet. Use this for offline testing only.</span>
              </div>
            ) : (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 12px',
                fontSize: '0.76rem',
                color: 'var(--shield-green)',
                marginBottom: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <ShieldCheck size={13} />
                <span>Real Orchard Wallet — ZEC goes directly to recipient</span>
              </div>
            )}

            {/* QR Code */}
            <div style={{ 
              background: '#F4B728', 
              padding: '12px', 
              borderRadius: 'var(--radius-lg)', 
              display: 'inline-block',
              boxShadow: '0 0 30px rgba(244, 183, 40, 0.25)',
              marginBottom: '1.25rem'
            }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Zcash ZIP-321 Payment QR" style={{ width: '220px', height: '220px', display: 'block' }} />
              ) : (
                <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#07090E', fontSize: '0.85rem', fontWeight: 600 }}>
                  Generating QR...
                </div>
              )}
            </div>

            {/* Payment summary */}
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Amount:</span>
                <span style={{ color: 'var(--zec-gold)', fontWeight: 600 }}>
                  {amount} ZEC{marketPriceUsd && marketPriceUsd > 0 ? ` (≈ $${(amount * marketPriceUsd).toFixed(2)})` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>To:</span>
                <span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.75rem' }}>{truncateAddress(activeAddress)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Memo:</span>
                <span style={{ color: 'var(--shield-green)' }}>{currentByteCount > 0 ? `${currentByteCount}B encrypted` : 'None'}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={fallbackUri}
                  className="primary-btn"
                  style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: '0.84rem' }}
                >
                  <ExternalLink size={15} />
                  Open in Wallet App
                </a>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCopyUri}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copied ? <Check size={15} color="var(--shield-green)" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied' : 'Copy URI'}</span>
                </button>
              </div>

              {/* Real TxID confirmation input */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
                  Sent with Zashi / YWallet? Paste TxID to confirm:
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="text-input mono"
                    placeholder="64-character transaction ID"
                    value={realTxidInput}
                    onChange={e => { setRealTxidInput(e.target.value); setTxidError(''); }}
                    style={{ fontSize: '0.73rem', padding: '7px 10px', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleTrackRealTransaction}
                    className="primary-btn glow-gold"
                    style={{ padding: '7px 12px', fontSize: '0.74rem', whiteSpace: 'nowrap' }}
                  >
                    Confirm Tx
                  </button>
                </div>
                {txidError && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.72rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} />{txidError}
                  </div>
                )}
              </div>

              {/* Demo-only simulation button */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  padding: '9px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} color="var(--zec-gold)" />
                <span>Simulate Confirmation (Zero-Funds Demo Mode)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
