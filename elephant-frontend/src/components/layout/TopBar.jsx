import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  MessageSquare,
  Search,
  Trash2,
  Check,
  User,
  X,
  Receipt,
  Calendar,
  CalendarDays,
  FileText,
  Users,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationApi } from '../../api/notificationApi';
import { billApi } from '../../api/billApi';
import { eventApi } from '../../api/eventApi';
import { reminderApi } from '../../api/reminderApi';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { Link, useNavigate } from 'react-router-dom';

const QUICK_PAGES = [
  { label: 'Dashboard', path: '/dashboard', type: 'Page', icon: TrendingUp },
  { label: 'Bills & Expenses', path: '/bills', type: 'Page', icon: Receipt },
  { label: 'Add New Bill', path: '/bills/new', type: 'Action', icon: Receipt },
  { label: 'Events & Schedules', path: '/events', type: 'Page', icon: Calendar },
  { label: 'Add New Event', path: '/events/new', type: 'Action', icon: Calendar },
  { label: 'Event Calendar', path: '/calendar', type: 'Page', icon: CalendarDays },
  { label: 'Reminders', path: '/reminders', type: 'Page', icon: Bell },
  { label: 'New Reminder', path: '/reminders/new', type: 'Action', icon: Bell },
  { label: 'Collaboration Groups', path: '/collaboration', type: 'Page', icon: Users },
  { label: 'Reports & Analytics', path: '/reports', type: 'Page', icon: FileText },
  { label: 'Generate Report', path: '/reports/history?generate=true', type: 'Action', icon: FileText },
  { label: 'User Profile', path: '/profile', type: 'Page', icon: User },
];

export const TopBar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({ pages: [], bills: [], events: [], reminders: [] });
  const [searching, setSearching] = useState(false);

  const searchContainerRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data || []);
      const countRes = await notificationApi.getUnreadCount();
      setUnreadCount(countRes?.unreadCount || 0);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle live global search
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults({ pages: [], bills: [], events: [], reminders: [] });
      setIsSearchOpen(false);
      return;
    }

    setIsSearchOpen(true);
    const matchedPages = QUICK_PAGES.filter(
      (p) => p.label.toLowerCase().includes(query) || p.type.toLowerCase().includes(query)
    );

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [billsData, eventsData, remindersData] = await Promise.allSettled([
          billApi.getBills(),
          eventApi.getEvents(),
          reminderApi.getReminders(),
        ]);

        const bills = (billsData.status === 'fulfilled' ? billsData.value : [])
          .filter(
            (b) =>
              b.title?.toLowerCase().includes(query) ||
              b.category?.toLowerCase().includes(query) ||
              b.status?.toLowerCase().includes(query)
          )
          .slice(0, 4);

        const events = (eventsData.status === 'fulfilled' ? eventsData.value : [])
          .filter(
            (e) =>
              e.title?.toLowerCase().includes(query) ||
              e.priority?.toLowerCase().includes(query) ||
              e.status?.toLowerCase().includes(query)
          )
          .slice(0, 4);

        const reminders = (remindersData.status === 'fulfilled' ? remindersData.value : [])
          .filter((r) => r.message?.toLowerCase().includes(query) || r.channel?.toLowerCase().includes(query))
          .slice(0, 4);

        setSearchResults({
          pages: matchedPages.slice(0, 4),
          bills,
          events,
          reminders,
        });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (path) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.pages.length > 0) {
        handleSelectResult(searchResults.pages[0].path);
      } else if (searchResults.bills.length > 0) {
        handleSelectResult(`/bills?search=${encodeURIComponent(searchQuery)}`);
      } else if (searchResults.events.length > 0) {
        handleSelectResult(`/events?search=${encodeURIComponent(searchQuery)}`);
      } else {
        handleSelectResult(`/bills?search=${encodeURIComponent(searchQuery)}`);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationApi.clearRead();
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await notificationApi.markRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const hasResults =
    searchResults.pages.length > 0 ||
    searchResults.bills.length > 0 ||
    searchResults.events.length > 0 ||
    searchResults.reminders.length > 0;

  return (
    <header
      style={{
        height: '76px',
        backgroundColor: isDark ? 'rgba(14, 23, 38, 0.88)' : 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1.5px solid rgba(255, 255, 255, 0.75)',
        boxShadow: isDark ? '0 4px 25px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(13, 42, 91, 0.03)',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Hamburger & Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            color: isDark ? '#F8FAFC' : '#0D2A5B',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '10px',
            alignItems: 'center',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E8F4FF')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0, lineHeight: 1.1 }}>
            Dashboard
          </h2>
        </div>
      </div>

      {/* Center: Live Search Bar */}
      <div ref={searchContainerRef} style={{ flex: 1, maxWidth: '440px', margin: '0 24px', position: 'relative' }}>
        <Search size={17} style={{ position: 'absolute', left: '16px', top: '12px', color: isDark ? '#64748B' : '#94A3B8', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search bills, events, reminders, pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim()) setIsSearchOpen(true);
          }}
          onKeyDown={handleSearchKeyDown}
          style={{
            width: '100%',
            padding: '10px 38px 10px 42px',
            borderRadius: '9999px',
            border: isDark ? '1.5px solid rgba(255, 255, 255, 0.12)' : '1.5px solid #E2EAF3',
            backgroundColor: isDark ? '#121D2C' : '#F8FAFD',
            fontSize: '0.85rem',
            color: isDark ? '#F8FAFC' : '#0D2A5B',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
        />

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
            }}
            style={{
              position: 'absolute',
              right: '12px',
              top: '10px',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Live Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div
            className="dropdown-animate"
            style={{
              position: 'absolute',
              top: '48px',
              left: 0,
              right: 0,
              backgroundColor: isDark ? '#162232' : '#ffffff',
              borderRadius: '20px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2EAF3',
              boxShadow: isDark ? '0 20px 45px -10px rgba(0, 0, 0, 0.65)' : '0 20px 45px -10px rgba(13, 42, 91, 0.18)',
              zIndex: 100,
              maxHeight: '420px',
              overflowY: 'auto',
              padding: '12px',
            }}
          >
            {searching && !hasResults ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                Searching Elephant records...
              </div>
            ) : !hasResults ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                No records found for "<strong>{searchQuery}</strong>"
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 1. Pages & Actions */}
                {searchResults.pages.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', padding: '4px 10px', letterSpacing: '0.05em' }}>
                      Navigation & Quick Links
                    </div>
                    {searchResults.pages.map((p) => {
                      const Icon = p.icon;
                      return (
                        <div
                          key={p.path}
                          onClick={() => handleSelectResult(p.path)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : '#F4F8FD')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: isDark ? 'rgba(6, 182, 212, 0.15)' : '#E8F4FF', color: '#2196F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={15} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B' }}>{p.label}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2196F3', backgroundColor: isDark ? 'rgba(33, 150, 243, 0.15)' : '#E8F4FF', padding: '2px 8px', borderRadius: '9999px' }}>
                            {p.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Bills & Expenses */}
                {searchResults.bills.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', padding: '4px 10px', letterSpacing: '0.05em' }}>
                      Bills & Expenses
                    </div>
                    {searchResults.bills.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleSelectResult(`/bills?search=${encodeURIComponent(b.title)}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : '#F4F8FD')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: isDark ? 'rgba(6, 182, 212, 0.15)' : '#E8F4FF', color: '#2196F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Receipt size={15} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B' }}>{b.title}</div>
                            <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B' }}>{b.category} • Due {formatDate(b.dueDate)}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: b.status === 'PAID' ? '#10B981' : '#EF4444' }}>
                          {formatCurrency(b.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Events & Schedules */}
                {searchResults.events.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', padding: '4px 10px', letterSpacing: '0.05em' }}>
                      Events & Schedules
                    </div>
                    {searchResults.events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => handleSelectResult(`/events?search=${encodeURIComponent(ev.title)}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : '#F4F8FD')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DDF7EF', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={15} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B' }}>{ev.title}</div>
                            <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B' }}>{formatDate(ev.eventDate)} {ev.eventTime ? `• ${ev.eventTime}` : ''}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: isDark ? 'rgba(33, 150, 243, 0.15)' : '#E8F4FF', color: '#2196F3' }}>
                          {ev.priority || 'Event'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Reminders */}
                {searchResults.reminders.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', padding: '4px 10px', letterSpacing: '0.05em' }}>
                      Reminders
                    </div>
                    {searchResults.reminders.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleSelectResult('/reminders')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : '#F4F8FD')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#EEE7FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={15} />
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B' }}>{r.message}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B' }}>{r.channel || 'IN_APP'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: isDark
                ? isNotifOpen
                  ? '#1E293B'
                  : '#121D2C'
                : isNotifOpen
                ? '#E8F4FF'
                : '#F8FAFD',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2EAF3',
              color: isDark ? '#38BDF8' : isNotifOpen ? '#2196F3' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#E8F4FF')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = isDark
                ? isNotifOpen
                  ? '#1E293B'
                  : '#121D2C'
                : isNotifOpen
                ? '#E8F4FF'
                : '#F8FAFD')
            }
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#2196F3',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(33, 150, 243, 0.4)',
                  border: isDark ? '2px solid #162232' : '2px solid #ffffff',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div
              className="dropdown-animate"
              style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '360px',
                backgroundColor: isDark ? '#162232' : '#ffffff',
                borderRadius: '20px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2EAF3',
                boxShadow: isDark
                  ? '0 20px 40px -10px rgba(0, 0, 0, 0.65)'
                  : '0 20px 40px -10px rgba(13, 42, 91, 0.15)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #EEF3F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0 }}>
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: isDark ? 'rgba(33, 150, 243, 0.2)' : '#E8F4FF',
                        color: isDark ? '#38BDF8' : '#2196F3',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      title="Mark all as read"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isDark ? '#34D399' : '#2196F3',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Read all
                    </button>
                  )}
                  <button
                    onClick={handleClearRead}
                    title="Clear read notifications"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#64748B' : '#94A3B8',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: '32px 20px',
                      textAlign: 'center',
                      color: isDark ? '#64748B' : '#94A3B8',
                      fontSize: '0.85rem',
                    }}
                  >
                    No notifications yet ✨
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkOne(n.id)}
                      style={{
                        padding: '14px 20px',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #F8FAFD',
                        backgroundColor: n.read
                          ? isDark
                            ? '#162232'
                            : '#ffffff'
                          : isDark
                          ? '#1B2A3D'
                          : '#F4F8FD',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = isDark ? '#23354C' : '#E8F4FF')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = n.read
                          ? isDark
                            ? '#162232'
                            : '#ffffff'
                          : isDark
                          ? '#1B2A3D'
                          : '#F4F8FD')
                      }
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: n.read ? 600 : 750,
                            color: isDark ? '#F8FAFC' : '#0D2A5B',
                          }}
                        >
                          {n.title}
                        </div>
                        {!n.read && (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#2196F3',
                              flexShrink: 0,
                              marginTop: '4px',
                            }}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: isDark ? '#94A3B8' : '#64748B',
                          marginTop: '3px',
                          lineHeight: 1.35,
                        }}
                      >
                        {n.message}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: isDark ? '#64748B' : '#94A3B8',
                          marginTop: '6px',
                        }}
                      >
                        {formatDateTime(n.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Quick Link */}
        <Link
          to="/feedback"
          title="User Feedback"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: isDark ? '#121D2C' : '#F8FAFD',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2EAF3',
            color: isDark ? '#94A3B8' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#2D1525' : '#FFE8F1';
            e.currentTarget.style.color = '#F472B6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#121D2C' : '#F8FAFD';
            e.currentTarget.style.color = isDark ? '#94A3B8' : '#64748B';
          }}
        >
          <MessageSquare size={19} />
        </Link>

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="theme-toggle-btn"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: isDark ? '#1E293B' : '#F8FAFD',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #E2EAF3',
            color: isDark ? '#FBBF24' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: isDark ? '0 0 15px rgba(251, 191, 36, 0.25)' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            if (!isDark) {
              e.currentTarget.style.backgroundColor = '#FEF3C7';
              e.currentTarget.style.color = '#D97706';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            if (!isDark) {
              e.currentTarget.style.backgroundColor = '#F8FAFD';
              e.currentTarget.style.color = '#64748B';
            }
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={19} />}
        </button>

        {/* Profile Avatar Pill */}
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px 4px 4px',
            borderRadius: '9999px',
            backgroundColor: isDark ? '#121D2C' : '#F8FAFD',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2EAF3',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#E8F4FF')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#121D2C' : '#F8FAFD')}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B' }}>
            {user?.name?.split(' ')[0] || 'Profile'}
          </span>
        </Link>

        {/* ── Sign Out Button ── */}
        <button
          onClick={logout}
          title="Sign Out"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 14px',
            borderRadius: '9999px',
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FFF5F5',
            border: isDark ? '1px solid rgba(239, 68, 68, 0.32)' : '1px solid #FECACA',
            color: isDark ? '#FCA5A5' : '#DC2626',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#EF4444';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = '#EF4444';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.35)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.16)' : '#FFF5F5';
            e.currentTarget.style.color = isDark ? '#FCA5A5' : '#DC2626';
            e.currentTarget.style.borderColor = isDark ? 'rgba(239, 68, 68, 0.32)' : '#FECACA';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <LogOut size={15} />
          <span className="topbar-signout-label">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
