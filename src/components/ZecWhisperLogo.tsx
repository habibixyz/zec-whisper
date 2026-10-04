import React from 'react';

interface ZecWhisperLogoProps {
  size?: number;
  showText?: boolean;
  tagline?: string;
  variant?: 'svg' | 'image';
  className?: string;
}

export const ZecWhisperLogo: React.FC<ZecWhisperLogoProps> = ({
  size = 38,
  showText = false,
  tagline = 'Shielded Whistleblower Protocol',
  variant = 'svg',
  className = '',
}) => {
  return (
    <div
      className={`zecwhisper-logo ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 12, userSelect: 'none' }}
    >
      {variant === 'image' ? (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.26),
            overflow: 'hidden',
            boxShadow: '0 0 18px rgba(244, 183, 40, 0.35)',
            border: '1.5px solid rgba(244, 183, 40, 0.45)',
            flexShrink: 0,
            background: '#0B0E14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/logo.jpg"
            alt="ZecWhisper Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div
          style={{
            width: size,
            height: size,
            flexShrink: 0,
            position: 'relative',
            filter: 'drop-shadow(0 0 10px rgba(244, 183, 40, 0.35))',
          }}
        >
          <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
          >
            <defs>
              <linearGradient id="zwGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFE072" />
                <stop offset="50%" stop-color="#F4B728" />
                <stop offset="100%" stop-color="#B88014" />
              </linearGradient>

              <linearGradient id="zwShieldFill" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="rgba(30, 24, 12, 0.85)" />
                <stop offset="100%" stop-color="rgba(11, 14, 20, 0.95)" />
              </linearGradient>

              <linearGradient id="zwGreenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#34D399" />
                <stop offset="100%" stop-color="#059669" />
              </linearGradient>

              <filter id="zwShieldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#F4B728" flood-opacity="0.5" />
              </filter>
            </defs>

            {/* Whisper Acoustic Sound Waves (Left) */}
            <path
              d="M10 22 C 6 27, 6 37, 10 42"
              stroke="url(#zwGreenGlow)"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M15 18 C 11 26, 11 38, 15 46"
              stroke="url(#zwGreenGlow)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Whisper Acoustic Sound Waves (Right) */}
            <path
              d="M54 22 C 58 27, 58 37, 54 42"
              stroke="url(#zwGreenGlow)"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M49 18 C 53 26, 53 38, 49 46"
              stroke="url(#zwGreenGlow)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Shield Outline & Body */}
            <path
              d="M32 6 L48 13 C 48 30, 42 45, 32 58 C 22 45, 16 30, 16 13 Z"
              fill="url(#zwShieldFill)"
              stroke="url(#zwGoldGrad)"
              strokeWidth="2.75"
              strokeLinejoin="round"
            />

            {/* Inner Shield Inset Ridge */}
            <path
              d="M32 10 L45 16 C 45 29, 39.5 42, 32 53 C 24.5 42, 19 29, 19 16 Z"
              fill="none"
              stroke="rgba(244, 183, 40, 0.3)"
              strokeWidth="1"
            />

            {/* Zcash Currency Strike (Top & Bottom) */}
            <path d="M32 16 L32 22" stroke="url(#zwGoldGrad)" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 42 L32 48" stroke="url(#zwGoldGrad)" strokeWidth="3" strokeLinecap="round" />

            {/* Zcash 'Z' Emblem */}
            <path
              d="M24 22 L40 22 L24 42 L40 42"
              fill="none"
              stroke="url(#zwGoldGrad)"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#zwShieldGlow)"
            />

            {/* Center Z crossbar highlight */}
            <path
              d="M29 32 L35 32"
              stroke="#FFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </div>
      )}

      {showText && (
        <div>
          <div
            style={{
              fontSize: '1.08rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--text-1)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              lineHeight: 1.15,
            }}
          >
            <span>ZECWHISPER</span>
            <span
              style={{
                fontSize: '0.62rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--gold)',
                background: 'rgba(244, 183, 40, 0.12)',
                border: '1px solid rgba(244, 183, 40, 0.3)',
                padding: '1px 5px',
                borderRadius: 4,
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              ORCHARD
            </span>
          </div>
          {tagline && (
            <div
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-3)',
                letterSpacing: '0.02em',
                fontWeight: 400,
                marginTop: 2,
              }}
            >
              {tagline}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
