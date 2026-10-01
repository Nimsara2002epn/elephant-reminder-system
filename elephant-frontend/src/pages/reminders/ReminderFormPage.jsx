import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { reminderApi } from '../../api/reminderApi';
import { PageHeader } from '../../components/common/PageHeader';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Save, Loader2, Users, Bell } from 'lucide-react';

export const ReminderFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    reminderType: 'GENERAL',
    triggerDateTime: '',
    recurring: false,
    recurringPattern: 'DAILY',
    notifyEmail: true,
    notifyInApp: true,
    groupId: '',
    assignedToUserId: '',
    billId: '',
    eventId: '',
    relatedActivity: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const ctx = await reminderApi.getContext();
        setContext(ctx);

        if (isEdit) {
          const r = await reminderApi.getReminder(id);
          setFormData({
            title: r.title || '',
            reminderType: r.reminderType || 'GENERAL',
            triggerDateTime: r.triggerDateTime ? r.triggerDateTime.substring(0, 16) : '',
            recurring: r.recurring || false,
            recurringPattern: r.recurringPattern || 'DAILY',
            notifyEmail: r.notifyEmail !== false,
            notifyInApp: r.notifyInApp !== false,
            groupId: r.groupId ? String(r.groupId) : '',
            assignedToUserId: r.assignedToUserId ? String(r.assignedToUserId) : (ctx.currentUser ? String(ctx.currentUser.id) : ''),
            billId: r.billId ? String(r.billId) : '',
            eventId: r.eventId ? String(r.eventId) : '',
            relatedActivity: r.relatedActivity || '',
          });
        } else {
          // New reminder defaults: Personal / No Group, assigned to current user
          if (ctx.currentUser) {
            setFormData((prev) => ({
              ...prev,
              assignedToUserId: String(ctx.currentUser.id),
            }));
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load reminder configuration.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  // Handle Group Selection change with the exact requested behavior:
  const handleGroupChange = (e) => {
    const selectedGroupId = e.target.value;
    if (!selectedGroupId) {
      // "-- Personal / No Group --" selected
      setFormData((prev) => ({
        ...prev,
        groupId: '',
        // Automatically set Assign To to current logged-in user
        assignedToUserId: context?.currentUser ? String(context.currentUser.id) : '',
      }));
    } else {
      // Shared Group selected
      const groupMemberList = context?.groupMembers?.[selectedGroupId] || [];
      const firstMemberId = groupMemberList.length > 0 ? String(groupMemberList[0].id) : (context?.currentUser ? String(context.currentUser.id) : '');
      setFormData((prev) => ({
        ...prev,
        groupId: selectedGroupId,
        assignedToUserId: firstMemberId,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const nowStr = new Date().toISOString().substring(0, 16);
    if (formData.triggerDateTime && formData.triggerDateTime < nowStr) {
      setError('Trigger date and time must be today or in the future.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        reminderType: formData.reminderType,
        triggerDateTime: formData.triggerDateTime,
        recurring: formData.recurring,
        recurringPattern: formData.recurring ? formData.recurringPattern : null,
        notifyEmail: formData.notifyEmail,
        notifyInApp: formData.notifyInApp,
        groupId: formData.groupId || null,
        assignedToUserId: formData.assignedToUserId || null,
        billId: formData.reminderType === 'BILL' ? formData.billId || null : null,
        eventId: formData.reminderType === 'EVENT' ? formData.eventId || null : null,
        relatedActivity: formData.relatedActivity || null,
      };

      if (isEdit) {
        await reminderApi.updateReminder(id, payload);
      } else {
        await reminderApi.createReminder(payload);
      }
      navigate('/reminders');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save reminder.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading reminder options..." />;
  }

  const isPersonalNoGroup = !formData.groupId;
  const currentGroupMembers = formData.groupId && context?.groupMembers?.[formData.groupId]
    ? context.groupMembers[formData.groupId]
    : [];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/reminders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}
        >
          <ArrowLeft size={16} /> Back to Reminders
        </Link>
      </div>

      <PageHeader
        title={isEdit ? 'Edit Reminder' : 'Add Reminder'}
        subtitle="Configure alerts for personal bills, events, and shared collaboration responsibilities"
      />

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          maxWidth: '800px',
        }}
      >
        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Reminder Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Reminder Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Pay electricity bill / Submit event report"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* 2. Reminder Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Reminder Type *
              </label>
              <select
                name="reminderType"
                value={formData.reminderType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="GENERAL">General</option>
                <option value="BILL">Bill</option>
                <option value="EVENT">Event</option>
                <option value="RESPONSIBILITY">Responsibility</option>
              </select>
            </div>

            {/* 3. Trigger Date & Time */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Trigger Date & Time *
              </label>
              <input
                type="datetime-local"
                name="triggerDateTime"
                required
                min={new Date().toISOString().substring(0, 16)}
                value={formData.triggerDateTime}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Optional Bill / Event selectors based on type */}
          {formData.reminderType === 'BILL' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Link to Specific Bill
              </label>
              <select
                name="billId"
                value={formData.billId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">-- Select Bill (Optional) --</option>
                {context?.bills?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.amount ? `LKR ${b.amount}` : ''})
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.reminderType === 'EVENT' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Link to Specific Event
              </label>
              <select
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">-- Select Event (Optional) --</option>
                {context?.events?.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.eventDate})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Collaboration Section: Shared Group & Assign To */}
          <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginBottom: '14px' }}>
              <Users size={18} /> Collaboration & Member Assignment
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Shared Group Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '6px' }}>
                  Shared Group
                </label>
                <select
                  name="groupId"
                  value={formData.groupId}
                  onChange={handleGroupChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #93c5fd',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                >
                  <option value="">-- Personal / No Group --</option>
                  {context?.groups?.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.memberCount} members)
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign To Dropdown (Auto-locked on personal, populated dynamically on group select) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '6px' }}>
                  Assign To {isPersonalNoGroup && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Locked to You)</span>}
                </label>
                <select
                  name="assignedToUserId"
                  disabled={isPersonalNoGroup}
                  value={formData.assignedToUserId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #93c5fd',
                    fontSize: '0.9rem',
                    backgroundColor: isPersonalNoGroup ? '#f1f5f9' : '#ffffff',
                    color: isPersonalNoGroup ? '#64748b' : '#0f172a',
                    cursor: isPersonalNoGroup ? 'not-allowed' : 'pointer',
                    outline: 'none',
                  }}
                >
                  {isPersonalNoGroup ? (
                    <option value={context?.currentUser?.id || ''}>
                      {context?.currentUser?.name || 'Current User'} (You)
                    </option>
                  ) : (
                    currentGroupMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.id === context?.currentUser?.id ? '(You)' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {isPersonalNoGroup && (
              <p style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '10px' }}>
                ℹ️ When "Personal / No Group" is selected, this reminder is automatically assigned to you. Select a shared group above to assign reminders to other members.
              </p>
            )}
          </div>

          {/* Recurring Options */}
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                Recurring Reminder
              </span>
            </label>

            {formData.recurring && (
              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Repeat Pattern
                </label>
                <select
                  name="recurringPattern"
                  value={formData.recurringPattern}
                  onChange={handleChange}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            )}
          </div>

          {/* Notification Channels */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Notification Delivery Channels
            </label>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notifyInApp"
                  checked={formData.notifyInApp}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
                In-App Notification
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notifyEmail"
                  checked={formData.notifyEmail}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
                Email Notification
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/reminders')}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Reminder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
