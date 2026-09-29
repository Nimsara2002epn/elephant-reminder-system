import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(13, 42, 91, 0.4)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(33, 150, 243, 0.2), 0 10px 20px -5px rgba(13, 42, 91, 0.08)',
          border: '1px solid #E2EAF3',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: isDanger ? '#FFE8F1' : '#FFF8E6',
              color: isDanger ? '#EF4444' : '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px', margin: 0 }}>{message}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 18px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              color: '#64748B',
              border: '1.5px solid #E2EAF3',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F4F8FD';
              e.currentTarget.style.color = '#0D2A5B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 20px',
              fontSize: '0.875rem',
              fontWeight: 700,
              borderRadius: '9999px',
              background: isDanger
                ? 'linear-gradient(135deg, #FF6B8B 0%, #EF4444 100%)'
                : 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isDanger
                ? '0 6px 16px rgba(239, 68, 68, 0.35)'
                : '0 6px 16px rgba(33, 150, 243, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
