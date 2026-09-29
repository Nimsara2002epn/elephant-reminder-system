import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  CalendarDays,
  Calendar,
  Bell,
  Users,
  BarChart3,
  User,
  Shield,
  X,
  FileText,
  Database,
  Activity,
  Zap,
  Pin,
  PinOff,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ElephantLogo } from '../common/ElephantLogo';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Pin & Hover Expansion State
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('elephant_sidebar_pinned') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);

  // Admin Mode state
  const [adminMode, setAdminMode] = useState(location.pathname.startsWith('/admin'));

  useEffect(() => {
    setAdminMode(location.pathname.startsWith('/admin'));
  }, [location.pathname]);

  const togglePin = () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    localStorage.setItem('elephant_sidebar_pinned', String(nextPinned));
  };

  // Determine if sidebar should be expanded (always expanded on mobile when open, or if pinned/hovered on desktop)
  const isExpanded = isOpen || isPinned || isHovered;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Bills & Expenses', path: '/bills', icon: Receipt },
    { label: 'Events & Schedules', path: '/events', icon: CalendarDays },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Smart Reminders', path: '/reminders', icon: Bell },
    { label: 'Collaboration', path: '/collaboration', icon: Users },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'User Feedback', path: '/feedback', icon: MessageSquare },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const adminItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Security Logs', path: '/admin/logs', icon: FileText },
    { label: 'Backup & Recovery', path: '/admin/backups', icon: Database },
    { label: 'User Feedback', path: '/admin/feedback', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="mobile-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 37, 64, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 45,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      <aside
        className={`app-sidebar ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'} ${
          isOpen ? 'sidebar-open' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          boxShadow: isExpanded
            ? '10px 0 35px -5px rgba(13, 42, 91, 0.08), inset -1px 0 0 rgba(255, 255, 255, 0.9)'
            : '4px 0 20px rgba(13, 42, 91, 0.04), inset -1px 0 0 rgba(255, 255, 255, 0.7)',
        }}
      >
        {/* ── Brand Header ── */}
        <div
          style={{
            padding: isExpanded ? '20px 18px' : '20px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isExpanded ? 'space-between' : 'center',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(13, 42, 91, 0.07)',
            background: isDark
              ? 'linear-gradient(180deg, rgba(22, 34, 50, 0.8) 0%, rgba(18, 29, 44, 0.6) 100%)'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.25) 100%)',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {adminMode ? (
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  boxShadow: '0 6px 16px -2px rgba(139, 92, 246, 0.35)',
                  flexShrink: 0,
                }}
              >
                🛡️
              </div>
            ) : (
              <ElephantLogo size={40} variant="badge" />
            )}

            {/* Brand Name & Tagline (Shown when expanded) */}
            {isExpanded && (
              <div style={{ overflow: 'hidden', transition: 'opacity 0.2s ease' }}>
                <div
                  style={{
                    fontSize: '1.28rem',
                    fontWeight: 900,
                    color: isDark ? '#F8FAFC' : '#0D2A5B',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.1,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '2px',
                  }}
                >
                  <span>Elephant</span>
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#06B6D4',
                      display: 'inline-block',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: adminMode ? '#A78BFA' : (isDark ? '#34D399' : '#059669'),
                    marginTop: '2px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {adminMode ? 'Admin Workspace' : 'Smart Finance'}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Pin Toggle & Mobile Close */}
          {isExpanded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={togglePin}
                className="desktop-pin-btn"
                title={isPinned ? 'Unpin sidebar (auto-collapse on hover)' : 'Pin sidebar expanded'}
                style={{
                  background: isDark
                    ? isPinned
                      ? 'rgba(6, 182, 212, 0.2)'
                      : 'rgba(255, 255, 255, 0.06)'
                    : isPinned
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'rgba(255, 255, 255, 0.65)',
                  border: isPinned
                    ? '1.5px solid #06B6D4'
                    : isDark
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(226, 234, 243, 0.9)',
                  color: isPinned ? '#38BDF8' : isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(6, 182, 212, 0.25)' : 'rgba(6, 182, 212, 0.2)';
                  e.currentTarget.style.color = '#38BDF8';
                  e.currentTarget.style.borderColor = '#06B6D4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? isPinned
                      ? 'rgba(6, 182, 212, 0.2)'
                      : 'rgba(255, 255, 255, 0.06)'
                    : isPinned
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'rgba(255, 255, 255, 0.65)';
                  e.currentTarget.style.color = isPinned ? '#38BDF8' : isDark ? '#94A3B8' : '#64748B';
                  e.currentTarget.style.borderColor = isPinned
                    ? '#06B6D4'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(226, 234, 243, 0.9)';
                }}
              >
                {isPinned ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
              </button>

              <button
                onClick={onClose}
                className="mobile-menu-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ── Navigation Links Area ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isExpanded ? '16px 12px' : '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          {/* Admin Switcher (If user is Admin) */}
          {isAdmin && isExpanded && (
            <div
              style={{
                marginBottom: '10px',
                padding: '3px',
                backgroundColor: isDark ? 'rgba(18, 29, 44, 0.85)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '14px',
                display: 'flex',
                gap: '4px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 234, 243, 0.9)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAdminMode(false);
                  navigate('/dashboard');
                }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  backgroundColor: !adminMode ? '#06B6D4' : 'transparent',
                  color: !adminMode ? '#ffffff' : isDark ? '#94A3B8' : '#64748B',
                  boxShadow: !adminMode ? '0 2px 8px rgba(6, 182, 212, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <User size={13} /> User
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminMode(true);
                  navigate('/admin/dashboard');
                }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  backgroundColor: adminMode ? '#8B5CF6' : 'transparent',
                  color: adminMode ? '#ffffff' : isDark ? '#94A3B8' : '#64748B',
                  boxShadow: adminMode ? '0 2px 8px rgba(139, 92, 246, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Shield size={13} /> Admin
              </button>
            </div>
          )}

          {/* User Mode Nav Items */}
          {!adminMode &&
            navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={!isExpanded ? item.label : undefined}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    gap: isExpanded ? '12px' : '0',
                    padding: isExpanded ? '11px 16px' : '12px 0',
                    borderRadius: '16px',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#334155',
                    background: isActive
                      ? 'linear-gradient(135deg, #10B981 0%, #06B6D4 55%, #3B82F6 100%)'
                      : 'transparent',
                    boxShadow: isActive ? '0 8px 22px -4px rgba(6, 182, 212, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)' : 'none',
                    border: isActive
                      ? '1px solid rgba(255, 255, 255, 0.6)'
                      : '1px solid transparent',
                    transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)';
                      e.currentTarget.style.color = isDark ? '#F8FAFC' : '#0D2A5B';
                      e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)';
                      e.currentTarget.style.boxShadow = isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 4px 14px rgba(13, 42, 91, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = isDark ? '#94A3B8' : '#334155';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: isExpanded ? 'auto' : '100%',
                        }}
                      >
                        <Icon
                          size={19}
                          color={isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </div>
                      {isExpanded && (
                        <span style={{ flex: 1, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

          {/* Admin Mode Nav Items */}
          {adminMode && (
            <>
              {isExpanded && (
                <div style={{ padding: '6px 14px 4px', fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C3AED' }}>
                  ADMINISTRATION
                </div>
              )}
              {adminItems.map((adm) => {
                const Icon = adm.icon;
                return (
                  <NavLink
                    key={adm.path}
                    to={adm.path}
                    title={!isExpanded ? adm.label : undefined}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isExpanded ? 'flex-start' : 'center',
                      gap: isExpanded ? '12px' : '0',
                      padding: isExpanded ? '11px 16px' : '12px 0',
                      borderRadius: '16px',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#334155',
                      background: isActive
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                        : 'transparent',
                      boxShadow: isActive ? '0 8px 22px -4px rgba(139, 92, 246, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)' : 'none',
                      border: isActive
                        ? '1px solid rgba(255, 255, 255, 0.6)'
                        : '1px solid transparent',
                      transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    })}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)';
                        e.currentTarget.style.color = '#A78BFA';
                        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)';
                        e.currentTarget.style.boxShadow = isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 4px 14px rgba(109, 40, 217, 0.06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = isDark ? '#94A3B8' : '#334155';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: isExpanded ? 'auto' : '100%',
                          }}
                        >
                          <Icon
                            size={19}
                            color={isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                        </div>
                        {isExpanded && (
                          <span style={{ flex: 1, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {adm.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </>
          )}
        </div>

        {/* ── User Profile & Logout Bottom Pinned Footer ── */}
        <div
          style={{
            padding: isExpanded ? '14px 16px' : '14px 10px',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(13, 42, 91, 0.07)',
            backgroundColor: isDark ? 'rgba(18, 29, 44, 0.9)' : 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            marginTop: 'auto',
            transition: 'all 0.25s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpanded ? 'space-between' : 'center',
              gap: isExpanded ? '10px' : '0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: isExpanded ? 1 : 0 }}>
              {/* User Avatar Circle */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: adminMode
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                    : 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              {/* User Name & Role (Shown when expanded) */}
              {isExpanded && (
                <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <div
                    title={user?.name}
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: isDark ? '#F8FAFC' : '#0D2A5B',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {user?.name || 'User'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      color: adminMode ? '#A78BFA' : (isDark ? '#34D399' : '#059669'),
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {user?.role || 'USER'}
                  </div>
                </div>
              )}
            </div>          {/* closes inner flex row (avatar + name) */}
          </div>            {/* closes space-between row */}
        </div>              {/* closes footer outer div */}
      </aside>
    </>
  );
};

export default Sidebar;
