import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (id) => {
    setError('');
    setActionSuccess('');
    try {
      await adminApi.toggleUserStatus(id);
      setActionSuccess('User status changed.');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle user status.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetId) return;
    setError('');
    setActionSuccess('');
    try {
      await adminApi.deleteUser(deleteTargetId);
      setActionSuccess('User account permanently deleted.');
      setDeleteTargetId(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user account.');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    setError('');
    setActionSuccess('');
    try {
      await adminApi.updateUserRole(id, newRole);
      setActionSuccess(`User role updated to ${newRole}.`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const filteredUsers = users.filter((u) =>
    searchTerm
      ? u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

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
        title="User Account Management"
        subtitle="Manage user permissions, activate/disable accounts, and elevate administrators"
        breadcrumb="Administration / Users"
      />

      <ErrorAlert message={error} onClose={() => setError('')} />

      {actionSuccess && (
        <div style={{ padding: '12px 18px', borderRadius: '16px', backgroundColor: '#DDF7EF', border: '1px solid #C0EFE0', color: '#0E8058', marginBottom: '22px', fontSize: '0.875rem', fontWeight: 700 }}>
          {actionSuccess}
        </div>
      )}

      {/* Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '16px 22px',
          border: '1px solid #E2EAF3',
          boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Search size={18} style={{ color: '#94A3B8' }} />
        <input
          type="text"
          placeholder="Search by user name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '0.9rem',
            color: '#0D2A5B',
          }}
        />
      </div>

      {/* Users Table */}
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
          <LoadingSpinner message="Loading user accounts..." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFD', borderBottom: '1px solid #E2EAF3' }}>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>User</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Account Status</th>
                  <th style={{ padding: '16px 22px', fontWeight: 700, color: '#0D2A5B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #EEF3F8',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFD')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      <td style={{ padding: '16px 22px' }}>
                        <div style={{ fontWeight: 800, color: '#0D2A5B' }}>
                          {u.name} {isSelf ? '(You)' : ''}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '16px 22px', color: '#64748B', fontWeight: 500 }}>
                        {u.phone || '—'}
                      </td>
                      <td style={{ padding: '16px 22px' }}>
                        <select
                          disabled={isSelf}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            border: '1.5px solid #E2EAF3',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: u.role === 'ADMIN' ? '#EEE7FF' : '#E8F4FF',
                            color: u.role === 'ADMIN' ? '#6A38EB' : '#2196F3',
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px 22px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: u.enabled ? '#DDF7EF' : '#FFE8F1',
                            color: u.enabled ? '#0E8058' : '#EF4444',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: u.enabled ? '#0E8058' : '#EF4444' }} />
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 22px', textAlign: 'right' }}>
                        {!isSelf && (
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleToggleStatus(u.id)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '9999px',
                                border: 'none',
                                backgroundColor: u.enabled ? '#FFF8E6' : '#DDF7EF',
                                color: u.enabled ? '#B45309' : '#0E8058',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {u.enabled ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => setDeleteTargetId(u.id)}
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
                              title="Delete user account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete User Account"
        message="Are you sure you want to permanently delete this user account? All associated records will be permanently removed."
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
