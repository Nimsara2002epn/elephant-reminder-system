import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { formatDateTime } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

export const AdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cleanDays, setCleanDays] = useState(30);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getLogs(100);
      setLogs(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load security audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleCleanLogs = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await adminApi.cleanLogs(cleanDays);
      setSuccess(res.message || `Cleaned logs older than ${cleanDays} days.`);
      loadLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clean old logs.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <Link
          to="/admin"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#2196F3' }}
        >
          <ArrowLeft size={16} /> Back to Admin Console
        </Link>
      </div>

      <PageHeader
        title="Security & System Audit Logs"
        subtitle="Chronological log of authentication attempts, database changes, and access security events"
        breadcrumb="Administration / Logs"
      />

      <ErrorAlert message={error} onClose={() => setError('')} />

      {success && (
        <div style={{ padding: '12px 18px', borderRadius: '16px', backgroundColor: '#DDF7EF', border: '1px solid #C0EFE0', color: '#0E8058', marginBottom: '22px', fontSize: '0.875rem', fontWeight: 700 }}>
          {success}
        </div>
      )}

      {/* Clean Old Logs Utility Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '16px 22px',
          border: '1px solid #E2EAF3',
          boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          marginBottom: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '0.875rem', color: '#0D2A5B', fontWeight: 600 }}>
          Showing latest <strong>{logs.length}</strong> security events.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Delete logs older than:</span>
          <select
            value={cleanDays}
            onChange={(e) => setCleanDays(Number(e.target.value))}
            style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #E2EAF3', fontSize: '0.85rem', color: '#0D2A5B', fontWeight: 600, outline: 'none' }}
          >
            <option value={0}>All Logs (Purge All)</option>
            <option value={1}>1 Day</option>
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={90}>90 Days</option>
          </select>
          <button
            onClick={handleCleanLogs}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: '#FFE8F1',
              border: '1px solid #FFCCD8',
              color: '#EF4444',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Trash2 size={14} /> Clean Logs
          </button>
        </div>
      </div>

      {/* Logs Table */}
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
          <LoadingSpinner message="Loading audit log entries..." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFD', borderBottom: '1px solid #E2EAF3' }}>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Timestamp</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>User / IP</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Severity</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr
                    key={l.id}
                    style={{
                      borderBottom: '1px solid #EEF3F8',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFD')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    <td style={{ padding: '14px 22px', color: '#64748B', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {formatDateTime(l.createdAt || l.timestamp)}
                    </td>
                    <td style={{ padding: '14px 22px' }}>
                      <div style={{ fontWeight: 800, color: '#0D2A5B' }}>{l.userName || 'System'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{l.ipAddress || '127.0.0.1'}</div>
                    </td>
                    <td style={{ padding: '14px 22px', fontWeight: 700, color: '#0D2A5B' }}>
                      {l.action}
                    </td>
                    <td style={{ padding: '14px 22px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor:
                            l.severity === 'HIGH' || l.severity === 'CRITICAL' ? '#FFE8F1'
                            : l.severity === 'MEDIUM' || l.severity === 'WARNING' ? '#FFF8E6' : '#E8F4FF',
                          color:
                            l.severity === 'HIGH' || l.severity === 'CRITICAL' ? '#EF4444'
                            : l.severity === 'MEDIUM' || l.severity === 'WARNING' ? '#B45309' : '#2196F3',
                        }}
                      >
                        {l.severity || 'INFO'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 22px', color: '#64748B', maxWidth: '340px' }}>
                      {l.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
