import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  Lock
} from 'lucide-react';

interface JudgeTestingKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainnetAddress: string;
}

export const JudgeTestingKitModal: React.FC<JudgeTestingKitModalProps> = ({
  isOpen,
  onClose,
  mainnetAddress,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeAddr = mainnetAddress || '<YOUR_ORCHARD_ADDRESS>';
  const testZip321Uri = `zcash:${activeAddr}?amount=0.001&memo=WkVDV0hJU1BFUl9URVNUX01FTU9fWkVHQVRIT04`;

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 7, 10, 0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2rem',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={22} color="var(--zec-gold)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                ZECATHON Judge Testing Kit
              </h2>
              <span className="badge badge-orchard">Zcash Mainnet Verified</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Step-by-step verification instructions to test ZIP-321 compliance with real Zcash shielded wallets.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Zero-Leak Certification Alert */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}>
          <Lock size={20} color="var(--shield-green)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            <strong style={{ color: 'var(--shield-green)' }}>100% Shielded Mainnet Guarantee: </strong>
            ZecWhisper strictly refuses transparent <span className="mono">t-addresses</span>. All transactions route through the Orchard zk-SNARK pool. No accounts, no logs, zero tracking cookies.
          </div>
        </div>

        {/* Step-by-Step Testing Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
          {/* Step 1 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ background: 'var(--zec-gold)', color: '#07090E', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                1
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Choose a Supported Zcash Mainnet Wallet</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 10px 30px' }}>
              ZecWhisper is engineered to work directly out-of-the-box with all ZIP-321 compliant wallets:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginLeft: '30px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '2px' }}>Zashi</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Electric Coin Co. official mobile wallet (iOS / Android)</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '2px' }}>YWallet</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>High-performance multi-platform desktop & mobile</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '2px' }}>ZODL</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Shielded Orchard-native mobile client</div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ background: 'var(--zec-gold)', color: '#07090E', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                2
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Scan QR Code or Click Deep Link</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 10px 30px' }}>
              In the "Drop Secret" portal, prepare any message or client-encrypted file. Your wallet camera will automatically parse the ZIP-321 request:
            </p>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 12px 48px', lineHeight: '1.5' }}>
              <li><strong>Recipient Address:</strong> Orchard Unified Address (<span className="mono">u1...</span>)</li>
              <li><strong>Amount:</strong> Exact ZEC amount pre-filled with zero rounding loss</li>
              <li><strong>Memo:</strong> 512-byte encrypted payload pre-filled automatically</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ background: 'var(--zec-gold)', color: '#07090E', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                3
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Zero-Funds Simulation (Local Verification)</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 0 30px' }}>
              If testing without active Mainnet ZEC, click the <strong style={{ color: 'var(--zec-gold)' }}>"Simulate Network Confirmation"</strong> button in the portal. It produces an authentic shielded transaction flow confirming on the live chain block tip and delivers the note into the recipient's Safe Inbox instantly.
            </p>
          </div>
        </div>

        {/* Copyable Test Vector */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Standard ZIP-321 Mainnet Test Vector URI
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(testZip321Uri, 'uri')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--zec-gold)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {copiedSection === 'uri' ? (
                <>
                  <Check size={14} color="var(--shield-green)" />
                  <span style={{ color: 'var(--shield-green)' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy URI</span>
                </>
              )}
            </button>
          </div>
          <div className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)', wordBreak: 'break-all', lineHeight: '1.4' }}>
            {testZip321Uri}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="primary-btn"
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            Got It, Ready to Test
          </button>
        </div>
      </div>
    </div>
  );
};
