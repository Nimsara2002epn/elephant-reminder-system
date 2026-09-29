import React from 'react';

/**
 * ElephantLogo — Style 1: Modern Minimal Geometric
 * Clean geometric elephant in a blue→teal gradient badge.
 * Simplified shapes: round head, left ear oval, upward curling trunk with ✓ tip.
 */
export const ElephantLogo = ({
  size = 48,
  className = '',
  showText = false,
  textVariant = 'dark',
  variant = 'badge',
  subtitle = 'Bill & Event Reminder',
}) => {
  // Static unique ID suffix based on variant to avoid SSR mismatch
  const uid = variant;

  return (
    <div
      className={`elephant-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size > 44 ? '12px' : '8px',
        userSelect: 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          filter: `drop-shadow(0 4px 14px rgba(59, 130, 246, 0.40))`,
          transition: 'transform 0.2s ease, filter 0.2s ease',
        }}
      >
        <defs>
          {/* Blue → Cyan → Teal gradient — matches Style 1 */}
          <linearGradient id={`g1_${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#4F8EF7" />
            <stop offset="48%"  stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Gloss sheen on top half */}
          <linearGradient id={`g2_${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#fff" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* ── BADGE ROUNDED SQUARE ── */}
        <rect x="0" y="0" width="100" height="100" rx="26" fill={`url(#g1_${uid})`} />

        {/* Gloss overlay top-half */}
        <rect x="0" y="0" width="100" height="52" rx="26" fill={`url(#g2_${uid})`} />

        {/* Inner border ring */}
        <rect x="2" y="2" width="96" height="96" rx="24" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.20" fill="none" />

        {/* ══════════════════════════════════════
            GEOMETRIC ELEPHANT — simple & clean
            Face looking to the RIGHT
            ══════════════════════════════════════ */}

        {/* HEAD — large white rounded shape */}
        <ellipse cx="46" cy="54" rx="25" ry="26" fill="#FFFFFF" fillOpacity="0.95" />

        {/* FOREHEAD bump (top of head) */}
        <ellipse cx="50" cy="33" rx="18" ry="14" fill="#FFFFFF" fillOpacity="0.95" />

        {/* EAR — big oval on the LEFT */}
        <ellipse cx="24" cy="50" rx="12" ry="18" fill="#FFFFFF" fillOpacity="0.55" />

        {/* Ear inner (darker to show depth) */}
        <ellipse cx="24" cy="50" rx="7" ry="12" fill="#FFFFFF" fillOpacity="0.25" />

        {/* SNOUT — slightly protruding right side */}
        <ellipse cx="68" cy="60" rx="9" ry="7" fill="#FFFFFF" fillOpacity="0.88" />

        {/* TRUNK — curves up-right from snout */}
        <path
          d="M 73 55 C 80 44 88 38 92 30"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.90"
        />

        {/* CHECKMARK at trunk tip — ✓ */}
        <path
          d="M 84 27 L 90 34 L 100 18"
          stroke="#FFFFFF"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* EYE — friendly dark circle */}
        <circle cx="58" cy="42" r="4.5" fill="#0D2A5B" fillOpacity="0.80" />
        {/* Eye highlight */}
        <circle cx="60" cy="40" r="1.8" fill="#FFFFFF" />

        {/* TUSK — small white arc below eye */}
        <path
          d="M 64 60 C 70 63 76 62 78 57"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.65"
        />
      </svg>

      {/* ── WORDMARK (shown when showText=true or variant='pill') ── */}
      {(showText || variant === 'pill') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div
            style={{
              fontSize: size > 40 ? '1.5rem' : '1.05rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: textVariant === 'light' ? '#FFFFFF' : '#0D2A5B',
              lineHeight: 1.05,
              display: 'flex',
              alignItems: 'baseline',
              gap: '0px',
            }}
          >
            <span>elephant</span>
            {/* Teal dot accent */}
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#06B6D4',
                display: 'inline-block',
                marginLeft: '2px',
                marginBottom: '2px',
                flexShrink: 0,
              }}
            />
          </div>
          <span
            style={{
              fontSize: size > 40 ? '0.60rem' : '0.52rem',
              fontWeight: 700,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: textVariant === 'light' ? 'rgba(255,255,255,0.70)' : '#64748B',
              lineHeight: 1.2,
            }}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export default ElephantLogo;
