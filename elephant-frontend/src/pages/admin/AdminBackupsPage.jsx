import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { formatDateTime } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { Database, Plus, RotateCcw, Trash2, ArrowLeft, Loader2, X } from 'lucide-react';

export const AdminBackupsPage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [creating, setCreating] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [recoverTargetId, setRecoverTargetId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getBackups();
      setBackups(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load database backups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreateBackup = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const b = await adminApi.createBackup(backupName || `backup_${Date.now()}`);
      setSuccess(`Backup created successfully: ${b.backupName || b.filename || `backup_${b.id}.sql`}`);
      setIsCreateOpen(false);
      setBackupName('');
      loadBackups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create backup.');
    } finally {
      setCreating(false);
    }
  };

  const handleRecoverBackup = async () => {
    if (!recoverTargetId) return;
    try {
      const res = await adminApi.recoverBackup(recoverTargetId);
      setSuccess(res.message || 'Recovery process completed successfully.');
      setRecoverTargetId(null);
      loadBackups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to recover backup.');
    }
  };

  const handleDeleteBackup = async () => {
    if (!deleteTargetId) return;
    try {
      await adminApi.deleteBackup(deleteTargetId);
      setSuccess('Backup snapshot removed.');
      setDeleteTargetId(null);
      loadBackups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete backup.');
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
        title="Database Snapshots & Disaster Recovery"
        subtitle="Create automated state backups and perform rollback restores"
        breadcrumb="Administration / Backups"
        action={
          <button
            onClick={() => setIsCreateOpen(true)}
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
            <Plus size={18} /> Create Backup
          </button>
        }
      />

      <ErrorAlert message={error} onClose={() => setError('')} />

      {success && (
        <div style={{ padding: '12px 18px', borderRadius: '16px', backgroundColor: '#DDF7EF', border: '1px solid #C0EFE0', color: '#0E8058', marginBottom: '22px', fontSize: '0.875rem', fontWeight: 700 }}>
          {success}
        </div>
      )}

      {/* Backups Table */}
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
          <LoadingSpinner message="Loading backups..." />
        ) : backups.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No database snapshots"
            message="Create your first database snapshot to ensure data resilience."
            actionText="Create Snapshot"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFD', borderBottom: '1px solid #E2EAF3' }}>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Backup File</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Created By</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Timestamp</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr
                    key={b.id}
                    style={{
                      borderBottom: '1px solid #EEF3F8',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFD')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    <td style={{ padding: '16px 22px', fontWeight: 800, color: '#0D2A5B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={16} style={{ color: '#0E8058' }} />
                        {b.backupName || b.filename || `backup_${b.id}.sql`}
                      </div>
                    </td>
                    <td style={{ padding: '16px 22px', color: '#64748B', fontWeight: 500 }}>
                      {b.createdByName || 'Admin'}
                    </td>
                    <td style={{ padding: '16px 22px', color: '#64748B', fontWeight: 500 }}>
                      {formatDateTime(b.createdAt)}
                    </td>
                    <td style={{ padding: '16px 22px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#DDF7EF',
                          color: '#0E8058',
                          border: '1px solid #C0EFE0',
                        }}
                      >
                        AVAILABLE
                      </span>
                    </td>
                    <td style={{ padding: '16px 22px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setRecoverTargetId(b.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '9999px',
                            backgroundColor: '#E8F4FF',
                            border: '1px solid #D0E8FF',
                            color: '#2196F3',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <RotateCcw size={13} /> Recover
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(b.id)}
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
                          title="Delete snapshot"
                        >
                          <Trash2 size={14} />
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

      {/* Create Backup Modal */}
      {isCreateOpen && (
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
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(33, 150, 243, 0.2)',
              border: '1px solid #E2EAF3',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Database size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>Create Database Snapshot</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>State backup of all tables</span>
                </div>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
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
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBackup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                  Snapshot Label (Optional)
                </label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="e.g. pre_migration_backup"
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '9999px',
                    border: '1.5px solid #E2EAF3',
                    backgroundColor: '#ffffff',
                    color: '#64748B',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: creating ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {creating && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  Create Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery Confirm */}
      <ConfirmDialog
        isOpen={!!recoverTargetId}
        title="Confirm Database Recovery"
        message="Are you sure you want to restore the system state from this snapshot? Any modifications made after this snapshot was created will be reverted."
        confirmText="Restore Snapshot"
        isDanger={false}
        onConfirm={handleRecoverBackup}
        onCancel={() => setRecoverTargetId(null)}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Snapshot"
        message="Are you sure you want to permanently delete this snapshot file?"
        onConfirm={handleDeleteBackup}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
