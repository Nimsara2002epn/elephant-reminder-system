import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { eventApi } from '../../api/eventApi';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { Plus, Search, Calendar, CheckCircle2, Clock, XCircle, Edit2, Trash2, MapPin, Star } from 'lucide-react';

export const EventsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, statsData] = await Promise.all([
        eventApi.getEvents({ status: statusFilter, priority: priorityFilter }),
        eventApi.getStats(),
      ]);
      setEvents(eventsData || []);
      setStats(statsData);
    } catch (e) {
      console.error('Failed to load events:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await eventApi.updateStatus(id, status);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await eventApi.deleteEvent(deleteTargetId);
      setDeleteTargetId(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredEvents = events.filter((ev) =>
    searchTerm ? ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div>
      <PageHeader
        title="Events & Schedules"
        subtitle="Manage upcoming milestones, tasks, meetings, and shared group activities"
        breadcrumb="Events & Schedules"
        action={
          <button
            onClick={() => navigate('/events/new')}
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
            <Plus size={18} /> Add Event
          </button>
        }
      />

      {/* Stats row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
          <StatCard title="Total Events" value={stats.total} subtitle="All time scheduled" icon={Calendar} color="blue" />
          <StatCard title="Scheduled" value={stats.scheduled} subtitle="Upcoming events" icon={Clock} color="cyan" />
          <StatCard title="Completed" value={stats.completed} subtitle="Successfully finished" icon={CheckCircle2} color="green" />
          <StatCard title="Cancelled" value={stats.cancelled} subtitle="Archived" icon={XCircle} color="amber" />
        </div>
      )}

      {/* Filters Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '16px 22px',
          border: '1px solid #E2EAF3',
          boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '22px',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: '12px',
              border: '1.5px solid #E2EAF3',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#0D2A5B',
              backgroundColor: '#ffffff',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
            onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1.5px solid #E2EAF3',
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            color: '#0D2A5B',
            fontWeight: 600,
            outline: 'none',
          }}
        >
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1.5px solid #E2EAF3',
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            color: '#0D2A5B',
            fontWeight: 600,
            outline: 'none',
          }}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Events Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #E2EAF3',
          boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <LoadingSpinner message="Loading events..." />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events found"
            message="You don't have any events matching the selected criteria."
            actionText="Add Event"
            onAction={() => navigate('/events/new')}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFD', borderBottom: '1px solid #E2EAF3' }}>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Event Title</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date & Time</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Location</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Priority</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => (
                  <tr
                    key={ev.id}
                    style={{
                      borderBottom: '1px solid #EEF3F8',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFD')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    <td style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B' }}>
                      {ev.title}
                    </td>
                    <td style={{ padding: '16px 22px', color: '#64748B', fontWeight: 500 }}>
                      📅 {formatDate(ev.eventDate)} {ev.eventTime && `• ⏰ ${ev.eventTime}`}
                    </td>
                    <td style={{ padding: '16px 22px', color: '#64748B', fontWeight: 500 }}>
                      {ev.location ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} style={{ color: '#EF4444' }} /> {ev.location}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '16px 22px' }}>
                      <PriorityBadge priority={ev.priority} />
                    </td>
                    <td style={{ padding: '16px 22px' }}>
                      <StatusBadge status={ev.status} />
                    </td>
                    <td style={{ padding: '16px 22px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {ev.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleUpdateStatus(ev.id, 'COMPLETED')}
                            title="Mark as completed"
                            style={{
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              backgroundColor: '#DDF7EF',
                              border: '1px solid #C0EFE0',
                              color: '#0E8058',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            Complete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(ev.id, 'SCHEDULED')}
                            title="Re-open event"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '9999px',
                              backgroundColor: '#F4F8FD',
                              border: '1px solid #E2EAF3',
                              color: '#64748B',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Reopen
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/events/${ev.id}/edit`)}
                          title="Edit event"
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
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => setDeleteTargetId(ev.id)}
                          title="Delete event"
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
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
