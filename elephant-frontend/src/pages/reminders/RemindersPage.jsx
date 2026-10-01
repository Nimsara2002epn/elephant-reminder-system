import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reminderApi } from '../../api/reminderApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';
import { Plus, Bell, Clock, Edit2, Trash2, Power, Users, Receipt, Calendar } from 'lucide-react';

export const RemindersPage = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderApi.getReminders();
      setReminders(data || []);
    } catch (e) {
      console.error('Failed to load reminders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleToggleActive = async (reminder) => {
    try {
      if (reminder.active) {
        await reminderApi.deactivate(reminder.id);
      } else {
        await reminderApi.activate(reminder.id);
      }
      loadReminders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await reminderApi.deleteReminder(deleteTargetId);
      setDeleteTargetId(null);
      loadReminders();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reminders"
        subtitle="Manage email alerts and in-app notifications for bills, scheduled events, and shared activities"
        breadcrumb="Alerts / Reminders"
        action={
          <button
            onClick={() => navigate('/reminders/new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
            <Plus size={18} /> New Reminder
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner message="Loading reminders..." />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders set"
          message="Create your first automated reminder for upcoming bills or scheduled events."
          actionText="Create Reminder"
          onAction={() => navigate('/reminders/new')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {reminders.map((r) => {
            const isBill = !!r.bill;
            const isEvent = !!r.event;
            const targetTitle = isBill ? r.bill?.title : isEvent ? r.event?.title : r.title || 'General Reminder';

            return (
              <div
                key={r.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  padding: '24px',
                  border: '1px solid #E2EAF3',
                  boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  opacity: r.active ? 1 : 0.65,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 16px 32px -4px rgba(33, 150, 243, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(33, 150, 243, 0.06)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        backgroundColor: isBill ? '#E8F4FF' : isEvent ? '#DDF7EF' : '#EEE7FF',
                        color: isBill ? '#2196F3' : isEvent ? '#0E8058' : '#6A38EB',
                      }}
                    >
                      {isBill ? <Receipt size={12} /> : isEvent ? <Calendar size={12} /> : <Bell size={12} />}
                      {isBill ? 'Bill Reminder' : isEvent ? 'Event Reminder' : 'Custom Alert'}
                    </span>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: r.active ? '#DDF7EF' : '#FFE8F1',
                        color: r.active ? '#0E8058' : '#EF4444',
                      }}
                    >
                      {r.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0D2A5B', margin: '0 0 6px', lineHeight: 1.3 }}>
                    {targetTitle}
                  </h3>

                  {r.reminderTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                      <Clock size={14} style={{ color: '#2196F3' }} />
                      <span>{formatDateTime(r.reminderTime)}</span>
                    </div>
                  )}

                  {r.message && (
                    <p style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '8px', margin: '8px 0 0', lineHeight: 1.4 }}>
                      {r.message}
                    </p>
                  )}

                  {/* Channel Badges */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                    {r.sendEmail && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#E8F4FF', color: '#2196F3', padding: '2px 8px', borderRadius: '9999px' }}>
                        ✉️ Email Alert
                      </span>
                    )}
                    {r.inApp && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#DDF8F7', color: '#088380', padding: '2px 8px', borderRadius: '9999px' }}>
                        🔔 In-App Alert
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #EEF3F8', paddingTop: '14px' }}>
                  <button
                    onClick={() => handleToggleActive(r)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      border: 'none',
                      backgroundColor: r.active ? '#FFF8E6' : '#DDF7EF',
                      color: r.active ? '#B45309' : '#0E8058',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Power size={13} /> {r.active ? 'Pause' : 'Activate'}
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => navigate(`/reminders/${r.id}/edit`)}
                      title="Edit reminder"
                      style={{
                        padding: '7px',
                        borderRadius: '10px',
                        backgroundColor: '#E8F4FF',
                        border: '1px solid #D0E8FF',
                        color: '#2196F3',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      onClick={() => setDeleteTargetId(r.id)}
                      title="Delete reminder"
                      style={{
                        padding: '7px',
                        borderRadius: '10px',
                        backgroundColor: '#FFE8F1',
                        border: '1px solid #FFCCD8',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Reminder"
        message="Are you sure you want to remove this automated reminder?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
