import React from 'react';

export const StatusBadge = ({ status }) => {
  const s = (status || '').toUpperCase();

  const styles = {
    PAID: { bg: '#DDF7EF', text: '#0E8058', border: '#C0EFE0', label: 'Paid' },
    COMPLETED: { bg: '#DDF7EF', text: '#0E8058', border: '#C0EFE0', label: 'Completed' },
    UNPAID: { bg: '#E8F4FF', text: '#2196F3', border: '#D0E8FF', label: 'Unpaid' },
    PENDING: { bg: '#FFF8E6', text: '#B45309', border: '#FCE7B8', label: 'Pending' },
    SCHEDULED: { bg: '#E8F4FF', text: '#2196F3', border: '#D0E8FF', label: 'Scheduled' },
    OVERDUE: { bg: '#FFE8F1', text: '#D81E6B', border: '#FFCCD8', label: 'Overdue' },
    CANCELLED: { bg: '#F4F8FD', text: '#64748B', border: '#E2EAF3', label: 'Cancelled' },
    ACTIVE: { bg: '#DDF7EF', text: '#0E8058', border: '#C0EFE0', label: 'Active' },
    DISABLED: { bg: '#FFE8F1', text: '#D81E6B', border: '#FFCCD8', label: 'Disabled' },
  };

  const current = styles[s] || { bg: '#F4F8FD', text: '#64748B', border: '#E2EAF3', label: status || 'Unknown' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        letterSpacing: '0.01em',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: current.text,
        }}
      />
      {current.label}
    </span>
  );
};
