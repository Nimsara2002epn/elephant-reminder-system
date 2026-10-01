import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collaborationApi } from '../../api/collaborationApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { Plus, Users, ArrowRight, Trash2, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CollaborationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Group Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Delete Group State
  const [deleteGroupId, setDeleteGroupId] = useState(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await collaborationApi.getGroups();
      setGroups(data || []);
    } catch (e) {
      console.error('Failed to load groups:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newGroupName.trim()) {
      setCreateError('Group name is required.');
      return;
    }

    setCreating(true);
    try {
      await collaborationApi.createGroup({
        name: newGroupName,
        description: newGroupDesc,
      });
      setIsCreateOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      loadGroups();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupId) return;
    try {
      await collaborationApi.deleteGroup(deleteGroupId);
      setDeleteGroupId(null);
      loadGroups();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <PageHeader
        title="Collaboration Groups"
        subtitle="Manage shared groups, assign bills & events, track team contributions and activity history"
        breadcrumb="Team / Collaboration"
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
            <Plus size={18} /> Create Group
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner message="Loading your collaboration groups..." />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No shared groups yet"
          message="Create a collaboration group (e.g. Family, Office, Roommates) to share expenses and event duties."
          actionText="Create Your First Group"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {groups.map((g) => {
            const isCreator = g.creatorId === user?.id;

            return (
              <div
                key={g.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  padding: '26px',
                  border: '1px solid #E2EAF3',
                  boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/collaboration/${g.id}`)}
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '16px',
                        backgroundColor: '#E8F4FF',
                        color: '#2196F3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Users size={24} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: '#DDF7EF',
                          color: '#0E8058',
                          border: '1px solid #C0EFE0',
                        }}
                      >
                        {g.memberCount} {g.memberCount === 1 ? 'member' : 'members'}
                      </span>

                      {isCreator && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteGroupId(g.id);
                          }}
                          title="Delete Group"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            padding: '6px',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            backgroundColor: '#FFE8F1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0D2A5B', marginBottom: '6px' }}>
                    {g.name}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: '#64748B', minHeight: '40px', lineHeight: 1.4 }}>
                    {g.description || 'Shared collaboration group for team tasks and expenses.'}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1px solid #EEF3F8',
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Created {formatDate(g.createdAt)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#2196F3',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Open Group <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
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
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>Create Group</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Share expenses and schedules</span>
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

            {createError && (
              <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#FFE8F1', color: '#EF4444', fontSize: '0.825rem', marginBottom: '16px', fontWeight: 600 }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Household Bills / Project Team"
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
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="What is this group for?"
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
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Group Confirm */}
      <ConfirmDialog
        isOpen={!!deleteGroupId}
        title="Delete Collaboration Group"
        message="Are you sure you want to permanently delete this group? All shared assignments will be unlinked."
        onConfirm={handleDeleteGroup}
        onCancel={() => setDeleteGroupId(null)}
      />
    </div>
  );
};
