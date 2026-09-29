import React from 'react';

export const PageHeader = ({ title, action }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0D2A5B',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
      </div>

      {action && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{action}</div>}
    </div>
  );
};
