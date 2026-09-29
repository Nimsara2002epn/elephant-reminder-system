import React from 'react';

export const EmptyState = ({
  icon: Icon,
  title,
  message,
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        padding: '56px 24px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1.5px dashed #E2EAF3',
        boxShadow: '0 4px 12px 0 rgba(13, 42, 91, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '20px',
            backgroundColor: '#E8F4FF',
            color: '#2196F3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={30} />
        </div>
      )}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
          {title || 'No items found'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '380px', marginTop: '6px', margin: '6px auto 0' }}>
          {message || 'Get started by creating a new entry.'}
        </p>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '8px',
            padding: '10px 22px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.38)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
