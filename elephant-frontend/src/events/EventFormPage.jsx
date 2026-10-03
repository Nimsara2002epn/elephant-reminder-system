import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { eventApi } from '../../api/eventApi';
import { PageHeader } from '../../components/common/PageHeader';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export const EventFormPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: searchParams.get('date') || '',
    eventTime: '',
    location: '',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    notes: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const loadEvent = async () => {
        try {
          const ev = await eventApi.getEvent(id);
          setFormData({
            title: ev.title || '',
            description: ev.description || '',
            eventDate: ev.eventDate || '',
            eventTime: ev.eventTime || '',
            location: ev.location || '',
            priority: ev.priority || 'MEDIUM',
            status: ev.status || 'SCHEDULED',
            notes: ev.notes || '',
          });
        } catch (err) {
          console.error(err);
          setError('Failed to load event details.');
        } finally {
          setLoading(false);
        }
      };
      loadEvent();
    } else if (searchParams.get('date')) {
      setFormData((prev) => ({ ...prev, eventDate: searchParams.get('date') }));
    }
  }, [id, isEdit, searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.status === 'SCHEDULED' && formData.eventDate < todayStr) {
      setError('A scheduled upcoming event must have a date of today or in the future.');
      return;
    }
    if (formData.status === 'COMPLETED' && formData.eventDate > todayStr) {
      setError('A completed event cannot be set to a future date.');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await eventApi.updateEvent(id, formData);
      } else {
        await eventApi.createEvent(formData);
      }
      navigate('/events');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save event. Please check your input.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading event details..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <Link
          to="/events"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#2196F3' }}
        >
          <ArrowLeft size={16} /> Back to Events
        </Link>
      </div>

      <PageHeader
        title={isEdit ? 'Edit Event' : 'Add New Event'}
        subtitle={isEdit ? 'Update details for this scheduled activity' : 'Schedule a meeting, milestone, deadline, or appointment'}
        breadcrumb={isEdit ? 'Events / Edit' : 'Events / New'}
      />

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '36px',
          border: '1px solid #E2EAF3',
          boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          maxWidth: '800px',
        }}
      >
        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Electricity Bill Review / Project Planning Meeting"
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '14px',
                border: '1.5px solid #E2EAF3',
                fontSize: '0.9rem',
                color: '#0D2A5B',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
              onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
            />
          </div>

          {/* Priority & Status Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: 600,
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: 600,
                }}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Date & Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Date * {formData.status === 'SCHEDULED' && <span style={{ color: '#2196F3', fontSize: '0.75rem', fontWeight: 500 }}>(Today or Future)</span>}
                {formData.status === 'COMPLETED' && <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 500 }}>(Today or Past Date)</span>}
                {formData.status === 'CANCELLED' && <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>(Any Date)</span>}
              </label>
              <input
                type="date"
                name="eventDate"
                required
                min={formData.status === 'SCHEDULED' ? new Date().toISOString().split('T')[0] : undefined}
                max={formData.status === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined}
                value={formData.eventDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
                onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Time (Optional)
              </label>
              <input
                type="time"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
                onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
              Location / Link (Optional)
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Conference Room / Zoom Link"
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '14px',
                border: '1.5px solid #E2EAF3',
                fontSize: '0.9rem',
                color: '#0D2A5B',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
              onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
              Description & Agendas (Optional)
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline event agenda, checklist items, or goals..."
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '14px',
                border: '1.5px solid #E2EAF3',
                fontSize: '0.9rem',
                color: '#0D2A5B',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                resize: 'vertical',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
              onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/events')}
              style={{
                padding: '10px 22px',
                borderRadius: '9999px',
                border: '1.5px solid #E2EAF3',
                backgroundColor: '#ffffff',
                color: '#64748B',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F8FD')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
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
                padding: '10px 26px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.38)',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
              {isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
