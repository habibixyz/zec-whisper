import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  Lock
} from 'lucide-react';
import type { ShieldedRecipient } from '../types/zcash';
import { validateShieldedAddress } from '../utils/zip321';

interface RegisterDropBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (recipient: ShieldedRecipient) => void;
}

export const RegisterDropBoxModal: React.FC<RegisterDropBoxModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState('');
  const [unifiedAddress, setUnifiedAddress] = useState('');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);

  if (!isOpen) return null;

  const addressValidation = validateShieldedAddress(unifiedAddress);
  const isValid = name.trim() && handle.trim() && addressValidation.valid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) return;

    const formattedHandle = handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`;

    const newRecipient: ShieldedRecipient = {
      name: name.trim(),
      handle: formattedHandle,
      role: role.trim() || 'Independent Recipient',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(formattedHandle)}`,
      unifiedAddress: unifiedAddress.trim(),
      description: description.trim() || 'Accepting confidential zero-knowledge disclosures and shielded tips.',
      verified: true,
    };

    onRegister(newRecipient);
    onClose();
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
      zIndex: 10003,
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
          maxWidth: '620px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2rem',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={20} color="var(--gold)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                Register Your Real Drop Box
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Add your real Zcash Orchard address to receive confidential leaks and shielded tips.
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Orchard Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Your Zcash Orchard Unified Address <span style={{ color: 'var(--zec-gold)' }}>*</span>
            </label>
            <input
              type="text"
              className="text-input mono"
              placeholder="u1... (Paste from Zashi, YWallet, or ZODL)"
              value={unifiedAddress}
              onChange={e => {
                setUnifiedAddress(e.target.value);
                setTouched(true);
              }}
              style={{ fontSize: '0.78rem' }}
            />
            {touched && !addressValidation.valid && unifiedAddress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.74rem', marginTop: '6px' }}>
                <AlertTriangle size={14} />
                <span>{addressValidation.error}</span>
              </div>
            )}
            {addressValidation.valid && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--shield-green)', fontSize: '0.74rem', marginTop: '6px' }}>
                <ShieldCheck size={14} />
                <span>Valid Orchard Unified Address (Mainnet)</span>
              </div>
            )}
          </div>

              {/* Name & Handle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Display Name <span style={{ color: 'var(--zec-gold)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Enter your name or organization"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Public Handle <span style={{ color: 'var(--zec-gold)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="text-input mono"
                    placeholder="@your_handle"
                    value={handle}
                    onChange={e => setHandle(e.target.value)}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Role or Field
                </label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Security Researcher, Press Organization, Auditor"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Drop Box Description & Leak Guidelines
                </label>
                <textarea
                  className="text-input"
                  rows={3}
                  placeholder="Describe what disclosures or documents you accept (e.g. security vulnerabilities, financial audits, anonymous tips)..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

          {/* Privacy Notice */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}>
            <Lock size={16} color="var(--shield-green)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Your profile is stored locally in your browser. All tips sent to this drop box arrive directly in your private Zcash wallet inside the Orchard pool.
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn glow-gold"
              disabled={!isValid}
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserCheck size={16} />
              <span>Save & Activate Drop Box</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
