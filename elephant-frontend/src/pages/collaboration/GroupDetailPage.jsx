import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collaborationApi } from '../../api/collaborationApi';
import { billApi } from '../../api/billApi';
import { eventApi } from '../../api/eventApi';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Receipt,
  Calendar,
  PieChart,
  History,
  UserPlus,
  Edit2,
  Trash2,
  ArrowLeft,
  X,
  Save,
  Plus,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
} from 'lucide-react';

export const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members'); // members | bills | events | contributions | activities
  const [error, setError] = useState('');

  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditRespOpen, setIsEditRespOpen] = useState(false);
  const [isAssignBillOpen, setIsAssignBillOpen] = useState(false);
  const [isAssignEventOpen, setIsAssignEventOpen] = useState(false);

  // Form states for modals
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberResp, setMemberResp] = useState('Member');
  const [targetMember, setTargetMember] = useState(null); // for editing responsibility

  // Assign bill form states
  const [myBills, setMyBills] = useState([]);
  const [assignBillId, setAssignBillId] = useState('');
  const [assignBillMemberId, setAssignBillMemberId] = useState('');
  const [billContribution, setBillContribution] = useState('');

  // Assign event form states
  const [myEvents, setMyEvents] = useState([]);
  const [assignEventId, setAssignEventId] = useState('');
  const [assignEventMemberId, setAssignEventMemberId] = useState('');
  const [eventNotes, setEventNotes] = useState('');

  // Submitting flags
  const [submittingModal, setSubmittingModal] = useState(false);
  const [removeUserId, setRemoveUserId] = useState(null);
  const [removeGroupBillId, setRemoveGroupBillId] = useState(null);
  const [removeGroupEventId, setRemoveGroupEventId] = useState(null);

  const loadGroupDetail = async () => {
    try {
      setLoading(true);
      const data = await collaborationApi.getGroupDetail(id);
      setDetail(data);
    } catch (e) {
      console.error('Failed to load group detail:', e);
      setError('Failed to load group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupDetail();
  }, [id]);

  const handleUnassignBill = async () => {
    if (!removeGroupBillId) return;
    try {
      await collaborationApi.unassignBill(id, removeGroupBillId);
      setRemoveGroupBillId(null);
      loadGroupDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove bill from group.');
    }
  };

  const handleUnassignEvent = async () => {
    if (!removeGroupEventId) return;
    try {
      await collaborationApi.unassignEvent(id, removeGroupEventId);
      setRemoveGroupEventId(null);
      loadGroupDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove event from group.');
    }
  };

  // Load candidate users when Add Member modal opens
  const openAddMemberModal = async () => {
    try {
      const usersList = await collaborationApi.searchUsers();
      // Filter out users already in the group
      const existingUserIds = new Set(detail.members.map((m) => m.userId));
      const available = usersList.filter((u) => !existingUserIds.has(u.id));
      setAllUsers(available);
      if (available.length > 0) setSelectedUserId(String(available[0].id));
      setMemberResp('Member');
      setIsAddMemberOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setSubmittingModal(true);
    try {
      await collaborationApi.addMember(id, {
        userId: selectedUserId,
        responsibility: memberResp,
      });
      setIsAddMemberOpen(false);
      loadGroupDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setSubmittingModal(false);
    }
  };

  const openEditRespModal = (member) => {
    setTargetMember(member);
    setMemberResp(member.responsibility || 'Member');
    setIsEditRespOpen(true);
  };

  const handleUpdateResponsibility = async (e) => {
    e.preventDefault();
    if (!targetMember) return;
    setSubmittingModal(true);
    try {
      await collaborationApi.updateResponsibility(id, targetMember.id, memberResp);
      setIsEditRespOpen(false);
      setTargetMember(null);
      loadGroupDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update responsibility.');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeUserId) return;
    try {
      await collaborationApi.removeMember(id, removeUserId);
      setRemoveUserId(null);
      loadGroupDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  // Open Assign Bill Modal
  const openAssignBillModal = async () => {
    try {
      const bills = await billApi.getBills();
      // Filter out bills already assigned
      const assignedBillIds = new Set(detail.sharedBills.map((sb) => sb.billId));
      const availableBills = bills.filter((b) => !assignedBillIds.has(b.id));
      setMyBills(availableBills);
      if (availableBills.length > 0) {
        setAssignBillId(String(availableBills[0].id));
        setBillContribution(String(availableBills[0].amount || ''));
      }
      if (detail.members.length > 0) {
        setAssignBillMemberId(String(detail.members[0].userId));
      }
      setIsAssignBillOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignBill = async (e) => {
    e.preventDefault();
    if (!assignBillId) return;
    setSubmittingModal(true);
    try {
      await collaborationApi.assignBill(id, {
        billId: assignBillId,
        assignedToUserId: assignBillMemberId || null,
        contribution: billContribution || null,
      });
      setIsAssignBillOpen(false);
      loadGroupDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign bill.');
    } finally {
      setSubmittingModal(false);
    }
  };

  // Open Assign Event Modal
  const openAssignEventModal = async () => {
    try {
      const events = await eventApi.getEvents();
      const assignedEventIds = new Set(detail.sharedEvents.map((se) => se.eventId));
      const availableEvents = events.filter((ev) => !assignedEventIds.has(ev.id));
      setMyEvents(availableEvents);
      if (availableEvents.length > 0) setAssignEventId(String(availableEvents[0].id));
      if (detail.members.length > 0) setAssignEventMemberId(String(detail.members[0].userId));
      setEventNotes('');
      setIsAssignEventOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignEvent = async (e) => {
    e.preventDefault();
    if (!assignEventId) return;
    setSubmittingModal(true);
    try {
      await collaborationApi.assignEvent(id, {
        eventId: assignEventId,
        assignedToUserId: assignEventMemberId || null,
        notes: eventNotes || null,
      });
      setIsAssignEventOpen(false);
      loadGroupDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign event.');
    } finally {
      setSubmittingModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading group collaboration hub..." />;
  }

  const group = detail?.group;
  const isOwner = group?.creatorId === user?.id;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/collaboration"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}
        >
          <ArrowLeft size={16} /> Back to Groups
        </Link>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Group Header Hero Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '28px 32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)',
            }}
          >
            👥
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {group?.name}
              </h1>
              {isOwner && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                  Group Owner
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
              {group?.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={openAddMemberModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <UserPlus size={16} /> Add Member
          </button>
          <button
            onClick={openAssignBillModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#2563eb',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Receipt size={16} /> Assign Bill
          </button>
          <button
            onClick={openAssignEventModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#059669',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Calendar size={16} /> Assign Event
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'members', label: `Members (${detail?.members?.length || 0})`, icon: Users },
          { id: 'bills', label: `Shared Bills (${detail?.sharedBills?.length || 0})`, icon: Receipt },
          { id: 'events', label: `Shared Events (${detail?.sharedEvents?.length || 0})`, icon: Calendar },
          { id: 'contributions', label: 'Contribution Breakdown', icon: PieChart },
          { id: 'activities', label: 'Activity Timeline', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 1: MEMBERS */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Group Members & Roles
            </h3>
            <button
              onClick={openAddMemberModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add Member
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Member</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Responsibility</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Joined</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {detail.members.map((m) => {
                  const isThisOwner = m.role === 'OWNER';
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {m.name} {m.userId === user?.id ? '(You)' : ''}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: isThisOwner ? '#eff6ff' : '#f8fafc',
                            color: isThisOwner ? '#1d4ed8' : '#475569',
                            border: isThisOwner ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                          }}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {m.responsibility || 'Member'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {formatDate(m.joinedAt)}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {/* Edit Responsibility Button */}
                          <button
                            onClick={() => openEditRespModal(m)}
                            title="Edit Member Responsibility"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>

                          {/* Remove Member Button (Disabled for owner) */}
                          {!isThisOwner && isOwner && (
                            <button
                              onClick={() => setRemoveUserId(m.userId)}
                              title="Remove from group"
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#fee2e2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 2: SHARED BILLS */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'bills' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Group Assigned Bills
            </h3>
            <button
              onClick={openAssignBillModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Assign Bill
            </button>
          </div>

          {detail.sharedBills.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No shared bills"
              description="Assign payable expenses to this group to track member contributions."
              actionText="Assign Bill"
              onAction={openAssignBillModal}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Bill Title</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Assigned Member</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Amount / Contribution</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Due Date</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Status</th>
                    {isOwner && (
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {detail.sharedBills.map((sb) => (
                    <tr key={sb.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                        {sb.billTitle}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {sb.category || 'General'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          <Users size={13} /> {sb.assignedToName || 'Unassigned'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                        {formatCurrency(sb.contribution || sb.amount)}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>
                        {formatDate(sb.dueDate)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <StatusBadge status={sb.billStatus} />
                      </td>
                      {isOwner && (
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => setRemoveGroupBillId(sb.id)}
                            title="Remove bill from group"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#fee2e2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 3: SHARED EVENTS */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Group Assigned Events
            </h3>
            <button
              onClick={openAssignEventModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Assign Event
            </button>
          </div>

          {detail.sharedEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No shared events"
              description="Assign group milestones, coordination meetings, or duties to members."
              actionText="Assign Event"
              onAction={openAssignEventModal}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Event Title</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Date & Time</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Assigned Coordinator</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Location</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Status</th>
                    {isOwner && (
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {detail.sharedEvents.map((se) => (
                    <tr key={se.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                        {se.eventTitle}
                        {se.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            Notes: {se.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#0f172a', fontWeight: 500 }}>
                        {formatDate(se.eventDate)} {se.eventTime ? `at ${se.eventTime}` : ''}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          <Users size={13} /> {se.assignedToName || 'Whole Group'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {se.eventLocation || '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <StatusBadge status={se.eventStatus} />
                      </td>
                      {isOwner && (
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => setRemoveGroupEventId(se.id)}
                            title="Remove event from group"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#fee2e2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 4: CONTRIBUTIONS */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'contributions' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Member Contribution & Settlement Summary
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Calculated dynamically based on assigned group bills and payment statuses
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Member</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Responsibility</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Assigned Bills</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Paid Amount</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {detail.contributions.map((c) => (
                  <tr key={c.userId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#475569', fontWeight: 500 }}>
                      {c.responsibility}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>
                      {c.assignedBillsCount} {c.assignedBillsCount === 1 ? 'bill' : 'bills'}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#059669' }}>
                      {formatCurrency(c.paidAmount)}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: c.outstandingAmount > 0 ? '#dc2626' : '#64748b' }}>
                      {formatCurrency(c.outstandingAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 5: ACTIVITIES TIMELINE */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'activities' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '18px' }}>
            Collaboration Activity History
          </h3>

          {detail.activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '0.875rem' }}>
              No activities logged yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {detail.activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <History size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                      {act.action}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      {act.userName} • {formatDateTime(act.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ADD MEMBER */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {isAddMemberOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsAddMemberOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Add Member to {group?.name}
              </h3>
              <button onClick={() => setIsAddMemberOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMember} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Select User *
                </label>
                {allUsers.length === 0 ? (
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                    All registered users are already members of this group.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Role / Responsibility
                </label>
                <input
                  type="text"
                  value={memberResp}
                  onChange={(e) => setMemberResp(e.target.value)}
                  placeholder="e.g. Treasurer, Event Coordinator, Member"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal || allUsers.length === 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: submittingModal ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingModal ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: EDIT RESPONSIBILITY */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {isEditRespOpen && targetMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsEditRespOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Update Responsibility
              </h3>
              <button onClick={() => setIsEditRespOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateResponsibility} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Member:</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {targetMember.name} ({targetMember.email})
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  New Responsibility / Role *
                </label>
                <input
                  type="text"
                  required
                  value={memberResp}
                  onChange={(e) => setMemberResp(e.target.value)}
                  placeholder="e.g. Treasurer, Event Coordinator, Catering Lead"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditRespOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: submittingModal ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingModal ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Update Responsibility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: ASSIGN BILL */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {isAssignBillOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsAssignBillOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Assign Bill to Group
              </h3>
              <button onClick={() => setIsAssignBillOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignBill} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Select Bill *
                </label>
                {myBills.length === 0 ? (
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                    No unassigned bills available. Create a bill first.
                  </div>
                ) : (
                  <select
                    required
                    value={assignBillId}
                    onChange={(e) => {
                      setAssignBillId(e.target.value);
                      const selected = myBills.find((b) => String(b.id) === e.target.value);
                      if (selected) setBillContribution(String(selected.amount || ''));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {myBills.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} (LKR {b.amount})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Assign to Member (Optional)
                </label>
                <select
                  value={assignBillMemberId}
                  onChange={(e) => setAssignBillMemberId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">-- Shared by Whole Group --</option>
                  {detail.members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.responsibility || m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Contribution / Share Amount (LKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={billContribution}
                  onChange={(e) => setBillContribution(e.target.value)}
                  placeholder="Defaults to full bill amount"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAssignBillOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal || myBills.length === 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: submittingModal ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingModal ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Assign Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODAL 4: ASSIGN EVENT */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {isAssignEventOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsAssignEventOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Assign Event to Group
              </h3>
              <button onClick={() => setIsAssignEventOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignEvent} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Select Event *
                </label>
                {myEvents.length === 0 ? (
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                    No unassigned events available. Create an event first.
                  </div>
                ) : (
                  <select
                    required
                    value={assignEventId}
                    onChange={(e) => setAssignEventId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {myEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.eventDate})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Assign Coordinator / Member
                </label>
                <select
                  value={assignEventMemberId}
                  onChange={(e) => setAssignEventMemberId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">-- Whole Group Responsibility --</option>
                  {detail.members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.responsibility || m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Assignment Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  placeholder="Special instructions or member duties..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAssignEventOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal || myEvents.length === 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: submittingModal ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingModal ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Assign Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        isOpen={!!removeUserId}
        title="Remove Member"
        message="Are you sure you want to remove this member from the collaboration group?"
        onConfirm={handleRemoveMember}
        onCancel={() => setRemoveUserId(null)}
      />

      {/* Remove Bill from Group Confirmation */}
      <ConfirmDialog
        isOpen={!!removeGroupBillId}
        title="Remove Bill from Group"
        message="Are you sure you want to remove this bill assignment from the group?"
        onConfirm={handleUnassignBill}
        onCancel={() => setRemoveGroupBillId(null)}
      />

      {/* Remove Event from Group Confirmation */}
      <ConfirmDialog
        isOpen={!!removeGroupEventId}
        title="Remove Event from Group"
        message="Are you sure you want to remove this event assignment from the group?"
        onConfirm={handleUnassignEvent}
        onCancel={() => setRemoveGroupEventId(null)}
      />
    </div>
  );
};
