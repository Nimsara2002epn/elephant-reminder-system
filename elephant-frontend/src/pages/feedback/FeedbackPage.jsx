import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { feedbackApi } from '../../api/feedbackApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { formatDateTime } from '../../utils/formatters';
import {
  MessageSquare,
  Star,
  Send,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Shield,
  X,
  CornerDownRight,
  Filter,
  Check,
  Lightbulb,
  Bug,
  Palette,
  MessageCircle,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'GENERAL', label: 'General Feedback', icon: MessageCircle, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  { id: 'FEATURE', label: 'Feature Request', icon: Lightbulb, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  { id: 'BUG', label: 'Bug Report', icon: Bug, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
  { id: 'UI_UX', label: 'Design & Usability', icon: Palette, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
];

export const FeedbackPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const isAdminPath = location.pathname.startsWith('/admin');

  const [activeTab, setActiveTab] = useState(isAdminPath ? 'admin' : 'my'); // 'my' or 'admin'
  const [feedbacks, setFeedbacks] = useState([]);
  const [adminFeedbacks, setAdminFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState('GENERAL');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Admin Filter & Reply States
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('ALL');
  const [replyTextMap, setReplyTextMap] = useState({});
  const [updatingAdminId, setUpdatingAdminId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const myData = await feedbackApi.getMyFeedback();
      setFeedbacks(myData || []);

      if (isAdmin) {
        const allData = await feedbackApi.getAllFeedback();
        setAdminFeedbacks(allData || []);
        // Initialize reply text map
        const map = {};
        (allData || []).forEach((fb) => {
          map[fb.id] = fb.adminReply || '';
        });
        setReplyTextMap(map);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load feedback records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleStartEdit = (fb) => {
    setEditingId(fb.id);
    setCategory(fb.category || 'GENERAL');
    setTitle(fb.title || '');
    setComment(fb.comment || '');
    setRating(fb.rating || 5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCategory('GENERAL');
    setTitle('');
    setComment('');
    setRating(5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a short summary title.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingId) {
        await feedbackApi.updateFeedback(editingId, {
          title,
          category,
          comment,
          rating,
        });
        setSuccessMsg('Feedback updated successfully! ✨');
        handleCancelEdit();
      } else {
        await feedbackApi.submitFeedback({
          title,
          category,
          comment,
          rating,
        });
        setSuccessMsg('Thank you! Your feedback has been sent to our team. ⭐');
        setTitle('');
        setComment('');
        setRating(5);
        setCategory('GENERAL');
      }
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await feedbackApi.deleteFeedback(id);
      setSuccessMsg('Feedback deleted successfully.');
      if (editingId === id) handleCancelEdit();
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete feedback.');
    }
  };

  const handleAdminUpdate = async (id, status) => {
    try {
      setUpdatingAdminId(id);
      await feedbackApi.adminUpdateFeedback(id, {
        status,
        adminReply: replyTextMap[id] || '',
      });
      setSuccessMsg('Feedback status and reply updated! ✔️');
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update feedback status.');
    } finally {
      setUpdatingAdminId(null);
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
              color: isDark ? '#34D399' : '#065F46',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}
          >
            <Check size={12} /> Resolved
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.2)' : '#E0F2FE',
              color: isDark ? '#38BDF8' : '#0369A1',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}
          >
            <Clock size={12} /> Under Review
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
              color: isDark ? '#FBBF24' : '#92400E',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}
          >
            <AlertCircle size={12} /> Pending Review
          </span>
        );
    }
  };

  // Helper for Category Badge
  const renderCategoryBadge = (catId) => {
    const item = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0];
    const Icon = item.icon;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '9999px',
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : item.bg,
          color: isDark ? '#94A3B8' : item.color,
          fontSize: '0.74rem',
          fontWeight: 700,
        }}
      >
        <Icon size={12} color={item.color} />
        {item.label}
      </span>
    );
  };

  // Filtered Admin List
  const filteredAdminList = adminFeedbacks.filter((fb) => {
    const matchStatus = adminStatusFilter === 'ALL' || fb.status === adminStatusFilter;
    const matchCat = adminCategoryFilter === 'ALL' || fb.category === adminCategoryFilter;
    return matchStatus && matchCat;
  });

  return (
    <div>
      <PageHeader
        title={isAdminPath ? "User Feedback Management" : "User Feedback & Suggestions"}
        subtitle={isAdminPath ? "Review user feedback, inspect bug reports, and respond to feature requests" : "Help us improve Elephant — share suggestions, report bugs, or rate your user experience"}
        breadcrumb={isAdminPath ? "Administration / User Feedback" : "Community / User Feedback"}
      />

      {/* Admin / User Tabs */}
      {isAdmin && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2EAF3',
            paddingBottom: '8px',
          }}
        >
          <button
            onClick={() => setActiveTab('my')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.86rem',
              backgroundColor: activeTab === 'my' ? (isDark ? '#1E293B' : '#0D2A5B') : 'transparent',
              color: activeTab === 'my' ? '#ffffff' : isDark ? '#94A3B8' : '#64748B',
              transition: 'all 0.15s ease',
            }}
          >
            <MessageSquare size={16} /> My Feedback ({feedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.86rem',
              backgroundColor: activeTab === 'admin' ? (isDark ? '#0284C7' : '#0284C7') : 'transparent',
              color: activeTab === 'admin' ? '#ffffff' : isDark ? '#94A3B8' : '#64748B',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={16} /> All Platform Feedback ({adminFeedbacks.length})
          </button>
        </div>
      )}

      <ErrorAlert message={error} onClose={() => setError('')} />

      {successMsg && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '16px',
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : '#DDF7EF',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #C0EFE0',
            color: isDark ? '#34D399' : '#0E8058',
            marginBottom: '22px',
            fontSize: '0.875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── USER VIEW: Form + My Submissions ── */}
      {activeTab === 'my' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
          {/* Submit / Edit Form Card */}
          <div
            style={{
              backgroundColor: isDark ? '#162232' : '#ffffff',
              borderRadius: '24px',
              padding: '30px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2EAF3',
              boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
              height: 'fit-content',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#E0F2FE',
                    color: isDark ? '#38BDF8' : '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {editingId ? <Edit3 size={20} /> : <Sparkles size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0 }}>
                    {editingId ? 'Edit Your Feedback' : 'Submit User Feedback'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', margin: '2px 0 0 0' }}>
                    {editingId ? 'Update your review or comments' : 'Tell us what features or fixes you want'}
                  </p>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: 'none',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #CBD5E1',
                    borderRadius: '9999px',
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isDark ? '#CBD5E1' : '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Category Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B', marginBottom: '8px' }}>
                  Feedback Category *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: isSelected
                            ? `2px solid ${cat.color}`
                            : isDark
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1.5px solid #E2EAF3',
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : cat.bg
                            : isDark
                            ? '#121D2C'
                            : '#ffffff',
                          color: isSelected ? (isDark ? '#FFFFFF' : cat.color) : isDark ? '#94A3B8' : '#64748B',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.8rem',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Icon size={16} color={cat.color} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B', marginBottom: '6px' }}>
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Add Recurring Event Template or Dark Mode is great!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '14px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid #E2EAF3',
                    fontSize: '0.9rem',
                    color: isDark ? '#F8FAFC' : '#0D2A5B',
                    backgroundColor: isDark ? '#121D2C' : '#ffffff',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* Star Rating selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B', marginBottom: '8px' }}>
                  Rate Elephant (1 to 5 Stars) *
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = hoverRating ? star <= hoverRating : star <= rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: active ? '#F59E0B' : isDark ? '#334155' : '#E2EAF3',
                          transition: 'transform 0.1s ease',
                        }}
                      >
                        <Star size={26} fill={active ? '#F59E0B' : 'none'} />
                      </button>
                    );
                  })}
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', marginLeft: '8px' }}>
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Message / Comments */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B', marginBottom: '6px' }}>
                  Detailed Message / Notes
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on your suggestion, describe the steps for a bug, or give general feedback..."
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '14px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid #E2EAF3',
                    fontSize: '0.88rem',
                    color: isDark ? '#F8FAFC' : '#0D2A5B',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: isDark ? '#121D2C' : '#ffffff',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.4)',
                }}
              >
                {submitting ? (
                  'Saving...'
                ) : editingId ? (
                  <>
                    <CheckCircle2 size={16} /> Update Feedback
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send User Feedback
                  </>
                )}
              </button>
            </form>
          </div>

          {/* User Feedback History Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0 }}>
                My Submitted Feedback ({feedbacks.length})
              </h3>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading your feedback submissions..." />
            ) : feedbacks.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No feedback submitted yet"
                message="Use the form to suggest features, report bugs, or share your thoughts on the Elephant app."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    style={{
                      backgroundColor: isDark ? '#162232' : '#ffffff',
                      borderRadius: '20px',
                      padding: '22px',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2EAF3',
                      boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.35)' : '0 4px 14px rgba(33, 150, 243, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Top Row: Category + Status + Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderCategoryBadge(fb.category)}
                        {renderStatusBadge(fb.status)}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Edit Button */}
                        <button
                          onClick={() => handleStartEdit(fb)}
                          title="Edit Feedback"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isDark ? '#38BDF8' : '#0284C7',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '8px',
                            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#E0F2FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(fb.id)}
                          title="Delete Feedback"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '8px',
                            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFE8F1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Feedback Title & Star Rating */}
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: '0 0 6px 0' }}>
                        {fb.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= fb.rating ? '#F59E0B' : 'none'}
                            color={s <= fb.rating ? '#F59E0B' : isDark ? '#334155' : '#E2EAF3'}
                          />
                        ))}
                        <span style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B', marginLeft: '6px', fontWeight: 700 }}>
                          {fb.rating} Stars
                        </span>
                      </div>
                    </div>

                    {/* Feedback Comment */}
                    {fb.comment && (
                      <p style={{ fontSize: '0.86rem', color: isDark ? '#CBD5E1' : '#475569', margin: 0, lineHeight: 1.5 }}>
                        {fb.comment}
                      </p>
                    )}

                    {/* Admin Reply Callout */}
                    {fb.adminReply && (
                      <div
                        style={{
                          marginTop: '4px',
                          padding: '12px 16px',
                          borderRadius: '14px',
                          backgroundColor: isDark ? 'rgba(2, 132, 199, 0.12)' : '#F0F9FF',
                          borderLeft: '4px solid #0284C7',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: isDark ? '#38BDF8' : '#0284C7' }}>
                          <CornerDownRight size={13} /> Elephant Team Response
                        </div>
                        <p style={{ fontSize: '0.82rem', color: isDark ? '#E2E8F0' : '#0F172A', margin: 0, lineHeight: 1.45 }}>
                          {fb.adminReply}
                        </p>
                      </div>
                    )}

                    <div style={{ fontSize: '0.72rem', color: isDark ? '#64748B' : '#94A3B8', marginTop: '2px' }}>
                      Submitted on {formatDateTime(fb.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ADMIN VIEW: All Platform Feedback ── */}
      {isAdmin && activeTab === 'admin' && (
        <div>
          {/* Filter Bar */}
          <div
            style={{
              backgroundColor: isDark ? '#162232' : '#ffffff',
              borderRadius: '20px',
              padding: '18px 24px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2EAF3',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isDark ? '#F8FAFC' : '#0D2A5B', fontWeight: 800, fontSize: '0.9rem' }}>
              <Filter size={18} /> Filters
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {/* Category Filter */}
              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #E2EAF3',
                  backgroundColor: isDark ? '#121D2C' : '#ffffff',
                  color: isDark ? '#F8FAFC' : '#0D2A5B',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="BUG">Bug Reports</option>
                <option value="FEATURE">Feature Requests</option>
                <option value="GENERAL">General Feedback</option>
                <option value="UI_UX">Design & Usability</option>
              </select>

              {/* Status Filter */}
              <select
                value={adminStatusFilter}
                onChange={(e) => setAdminStatusFilter(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #E2EAF3',
                  backgroundColor: isDark ? '#121D2C' : '#ffffff',
                  color: isDark ? '#F8FAFC' : '#0D2A5B',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {/* Feedback Cards List */}
          {filteredAdminList.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No matching feedback found"
              message="No user feedback entries match your active category or status filters."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredAdminList.map((fb) => (
                <div
                  key={fb.id}
                  style={{
                    backgroundColor: isDark ? '#162232' : '#ffffff',
                    borderRadius: '24px',
                    padding: '24px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2EAF3',
                    boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.4)' : '0 6px 18px rgba(33, 150, 243, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {/* Top Bar: User info + category + status + delete */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: isDark ? '#1E293B' : '#E8F4FF',
                          color: '#0284C7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                        }}
                      >
                        {fb.userName ? fb.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B' }}>
                          {fb.userName || 'Anonymous User'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                          {fb.userEmail || '—'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderCategoryBadge(fb.category)}
                      {renderStatusBadge(fb.status)}

                      <button
                        onClick={() => handleDelete(fb.id)}
                        title="Delete Feedback (Admin)"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '8px',
                          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFE8F1',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Feedback Title and Star rating */}
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: '0 0 6px 0' }}>
                      {fb.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= fb.rating ? '#F59E0B' : 'none'}
                          color={s <= fb.rating ? '#F59E0B' : isDark ? '#334155' : '#E2EAF3'}
                        />
                      ))}
                      <span style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B', marginLeft: '6px', fontWeight: 700 }}>
                        {fb.rating} Stars
                      </span>
                      <span style={{ fontSize: '0.72rem', color: isDark ? '#64748B' : '#94A3B8', marginLeft: '12px' }}>
                        Submitted {formatDateTime(fb.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* User Comment */}
                  {fb.comment && (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: isDark ? '#121D2C' : '#F8FAFC',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #EDF2F7',
                        fontSize: '0.88rem',
                        color: isDark ? '#CBD5E1' : '#334155',
                        lineHeight: 1.5,
                      }}
                    >
                      {fb.comment}
                    </div>
                  )}

                  {/* Admin Reply & Status Control */}
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#94A3B8' : '#475569' }}>
                        ADMIN RESPONSE & STATUS CONTROL
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['PENDING', 'UNDER_REVIEW', 'RESOLVED'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={updatingAdminId === fb.id}
                            onClick={() => handleAdminUpdate(fb.id, st)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              border: fb.status === st ? '2px solid #0284C7' : '1px solid transparent',
                              backgroundColor: fb.status === st ? (isDark ? '#0284C7' : '#0284C7') : isDark ? '#0F172A' : '#ffffff',
                              color: fb.status === st ? '#ffffff' : isDark ? '#94A3B8' : '#64748B',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            Mark {st.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Write a response visible to this user..."
                        value={replyTextMap[fb.id] || ''}
                        onChange={(e) => setReplyTextMap({ ...replyTextMap, [fb.id]: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '9px 14px',
                          borderRadius: '10px',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #CBD5E1',
                          backgroundColor: isDark ? '#0F172A' : '#ffffff',
                          color: isDark ? '#F8FAFC' : '#0D2A5B',
                          fontSize: '0.82rem',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        disabled={updatingAdminId === fb.id}
                        onClick={() => handleAdminUpdate(fb.id, fb.status)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: '#0284C7',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Check size={14} /> Save Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
