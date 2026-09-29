import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { formatDate } from '../../utils/formatters';
import { X, Edit2, CheckCircle2, Trash2, Calendar, MapPin, Clock } from 'lucide-react';

export const CalendarEventModal = ({
  isOpen,
  event,
  onClose,
  onComplete,
  onDelete,
}) => {
  const navigate = useNavigate();
  if (!isOpen || !event) return null;

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
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#DDF8F7',
            borderBottom: '1px solid #BCEEEB',
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
                background: 'linear-gradient(135deg, #088380 0%, #06706E 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(8, 131, 128, 0.3)',
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                {event.title || 'Event Details'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <StatusBadge status={event.status} />
                {event.priority && <PriorityBadge priority={event.priority} />}
              </div>
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

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Date / Time / Location Highlight Grid */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} style={{ color: '#2196F3' }} />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block' }}>Date</span>
                <strong style={{ fontSize: '0.9rem', color: '#0D2A5B' }}>{formatDate(event.eventDate)}</strong>
              </div>
            </div>

            {event.eventTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} style={{ color: '#2196F3' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block' }}>Time</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0D2A5B' }}>{event.eventTime}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Location & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
            {event.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #EEF3F8' }}>
                <MapPin size={16} style={{ color: '#EF4444' }} />
                <span style={{ color: '#64748B', fontWeight: 500 }}>Location:</span>
                <strong style={{ color: '#0D2A5B' }}>{event.location}</strong>
              </div>
            )}

            {event.description && (
              <div style={{ padding: '6px 0' }}>
                <span style={{ color: '#64748B', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Description:</span>
                <p style={{ color: '#0D2A5B', margin: 0, lineHeight: 1.5 }}>{event.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
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
            onClick={() => onDelete && onDelete(event.id)}
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
                navigate(`/events/${event.id}/edit`);
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

            {event.status !== 'COMPLETED' && (
              <button
                onClick={() => onComplete && onComplete(event.id)}
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
                <CheckCircle2 size={14} /> Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
