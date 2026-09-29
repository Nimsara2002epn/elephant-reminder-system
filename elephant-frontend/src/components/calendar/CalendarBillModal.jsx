import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { X, Edit2, CheckCircle2, RotateCcw, Trash2, Users, Receipt } from 'lucide-react';

export const CalendarBillModal = ({
  isOpen,
  bill,
  onClose,
  onPay,
  onUnpay,
  onDelete,
}) => {
  const navigate = useNavigate();
  if (!isOpen || !bill) return null;

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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(33, 150, 243, 0.2), 0 10px 20px -5px rgba(13, 42, 91, 0.08)',
          border: '1px solid #E2EAF3',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#E8F4FF',
            borderBottom: '1px solid #D0E8FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)',
              }}
            >
              <Receipt size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                {bill.title || 'Bill Details'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                {bill.category || 'General'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(13,42,91,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Amount & Status Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              backgroundColor: '#F8FAFD',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid #E2EAF3',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '2px' }}>
                Amount Due
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0D2A5B' }}>
                {formatCurrency(bill.amount || 0)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '4px' }}>
                Status
              </span>
              <StatusBadge status={bill.status} />
            </div>
          </div>

          {/* Details Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #EEF3F8' }}>
              <span style={{ color: '#64748B', fontWeight: 500 }}>Due Date:</span>
              <strong style={{ color: '#0D2A5B' }}>{formatDate(bill.dueDate)}</strong>
            </div>

            {bill.recurringType && bill.recurringType !== 'NONE' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #EEF3F8' }}>
                <span style={{ color: '#64748B', fontWeight: 500 }}>Recurring:</span>
                <span style={{ fontWeight: 600, color: '#2196F3' }}>{bill.recurringType}</span>
              </div>
            )}

            {bill.description && (
              <div style={{ padding: '6px 0', borderBottom: '1px solid #EEF3F8' }}>
                <span style={{ color: '#64748B', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Description:</span>
                <span style={{ color: '#0D2A5B' }}>{bill.description}</span>
              </div>
            )}
          </div>

          {/* Group Collaboration Note if applicable */}
          {bill.groupName && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#DDF8F7',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                color: '#088380',
                fontWeight: 600,
                border: '1px solid #BCEEEB',
              }}
            >
              <Users size={16} />
              <span>Shared with group: <strong>{bill.groupName}</strong></span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#F8FAFD',
            borderTop: '1px solid #EEF3F8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => onDelete && onDelete(bill.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9999px',
              border: '1px solid #FFCCD8',
              backgroundColor: '#FFE8F1',
              color: '#EF4444',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFD5E5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFE8F1')}
          >
            <Trash2 size={14} /> Delete
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                onClose();
                navigate(`/bills/${bill.id}/edit`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1.5px solid #E2EAF3',
                backgroundColor: '#ffffff',
                color: '#0D2A5B',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8F4FF')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <Edit2 size={14} /> Edit
            </button>

            {bill.status === 'PAID' ? (
              <button
                onClick={() => onUnpay && onUnpay(bill.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#FFF8E6',
                  color: '#B45309',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)',
                }}
              >
                <RotateCcw size={14} /> Mark Unpaid
              </button>
            ) : (
              <button
                onClick={() => onPay && onPay(bill.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
                  color: '#ffffff',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }}
              >
                <CheckCircle2 size={14} /> Mark Paid
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
