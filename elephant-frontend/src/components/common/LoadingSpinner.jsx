import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        gap: '12px',
        color: '#64748b',
      }}
    >
      <Loader2 size={36} className="animate-spin" style={{ color: '#2563eb', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          width: '100%',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
