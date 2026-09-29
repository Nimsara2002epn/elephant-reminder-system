import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
        marginBottom: '16px',
        fontSize: '0.875rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#991b1b',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
