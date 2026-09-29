import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const p = (priority || '').toUpperCase();

  const styles = {
    HIGH: { bg: '#FFE8F1', text: '#D81E6B', border: '#FFCCD8', label: 'High' },
    URGENT: { bg: '#FFE8F1', text: '#D81E6B', border: '#FFCCD8', label: 'Urgent' },
    MEDIUM: { bg: '#FFF8E6', text: '#B45309', border: '#FCE7B8', label: 'Medium' },
    LOW: { bg: '#DDF8F7', text: '#088380', border: '#BCEEEB', label: 'Low' },
  };

  const current = styles[p] || { bg: '#F4F8FD', text: '#64748B', border: '#E2EAF3', label: priority || 'Normal' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 9px',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 700,
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        letterSpacing: '0.02em',
      }}
    >
      {current.label}
    </span>
  );
};
