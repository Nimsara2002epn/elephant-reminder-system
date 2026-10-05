import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { eventApi } from '../../api/eventApi';
import { billApi } from '../../api/billApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CalendarBillModal } from '../../components/calendar/CalendarBillModal';
import { CalendarEventModal } from '../../components/calendar/CalendarEventModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Receipt,
  List,
  Grid3X3,
  CalendarDays,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const CalendarPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [calendarItems, setCalendarItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar View State
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'agenda'
  const [itemTypeFilter, setItemTypeFilter] = useState('ALL'); // 'ALL' | 'EVENT' | 'BILL'
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Selected item modal states
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Delete confirm state
  const [deleteItem, setDeleteItem] = useState(null); // { id, type: 'BILL' | 'EVENT' }

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await eventApi.getCalendarItems();
      setCalendarItems(data || []);
    } catch (e) {
      console.error('Failed to load calendar events:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // ── Month Navigation Helpers ─────────────────────────────────────────────

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const currentMonthLabel = `${monthNames[currentMonth]} ${currentYear}`;

  // ── Build Month Grid Matrix ──────────────────────────────────────────────

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month filler days (to complete 5 or 6 full weeks: 35 or 42 cells)
    const totalCells = days.length <= 35 ? 35 : 42;
    const nextMonthDays = totalCells - days.length;
    for (let n = 1; n <= nextMonthDays; n++) {
      const nextDate = new Date(currentYear, currentMonth + 1, n);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Group items by date: { 'YYYY-MM-DD': [item1, item2] }
  const itemsByDate = useMemo(() => {
    const map = {};
    for (const item of calendarItems) {
      if (itemTypeFilter !== 'ALL' && item.itemType !== itemTypeFilter) {
        continue;
      }
      const d = item.start; // format 'YYYY-MM-DD'
      if (!map[d]) map[d] = [];
      map[d].push(item);
    }
    return map;
  }, [calendarItems, itemTypeFilter]);

  // Filtered items list for Agenda view
  const filteredItems = useMemo(() => {
    return calendarItems
      .filter((it) => (itemTypeFilter === 'ALL' ? true : it.itemType === itemTypeFilter))
      .sort((a, b) => (a.start > b.start ? 1 : -1));
  }, [calendarItems, itemTypeFilter]);

  // Items for the currently selected date
  const selectedDateItems = itemsByDate[selectedDateStr] || [];

  // ── Modal Actions ────────────────────────────────────────────────────────

  const handleItemClick = async (item) => {
    if (item.itemType === 'BILL') {
      try {
        const fullBill = await billApi.getBill(item.id);
        setSelectedBill(fullBill);
      } catch (e) {
        setSelectedBill({
          id: item.id,
          title: item.title,
          dueDate: item.start,
          status: item.billStatus || 'UNPAID',
        });
      }
    } else {
      try {
        const fullEvent = await eventApi.getEvent(item.id);
        setSelectedEvent(fullEvent);
      } catch (e) {
        setSelectedEvent({
          id: item.id,
          title: item.title,
          eventDate: item.start,
          eventTime: item.eventTime,
          location: item.eventLocation,
          status: item.eventStatus || 'SCHEDULED',
        });
      }
    }
  };

  const handlePayBill = async (id) => {
    try {
      await billApi.payBill(id);
      setSelectedBill(null);
      loadItems();
    } catch (e) {
      console.error('Failed to pay bill:', e);
    }
  };

  const handleUnpayBill = async (id) => {
    try {
      await billApi.unpayBill(id);
      setSelectedBill(null);
      loadItems();
    } catch (e) {
      console.error('Failed to unpay bill:', e);
    }
  };

  const handleCompleteEvent = async (id) => {
    try {
      await eventApi.completeEvent(id);
      setSelectedEvent(null);
      loadItems();
    } catch (e) {
      console.error('Failed to complete event:', e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      if (deleteItem.type === 'BILL') {
        await billApi.deleteBill(deleteItem.id);
        setSelectedBill(null);
      } else {
        await eventApi.deleteEvent(deleteItem.id);
        setSelectedEvent(null);
      }
      setDeleteItem(null);
      loadItems();
    } catch (e) {
      console.error('Failed to delete item:', e);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Event & Bill Calendar"
        subtitle="Visual glassmorphic timeline of scheduled events, recurring deadlines, and due bills."
        breadcrumb="Events / Calendar"
        action={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/bills/new')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                background: isDark ? 'rgba(22, 34, 50, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                color: isDark ? '#F8FAFC' : '#0D2A5B',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.9)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isDark ? '0 8px 20px -6px rgba(0, 0, 0, 0.4)' : '0 8px 20px -6px rgba(13, 42, 91, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(22, 34, 50, 0.85)' : 'rgba(255, 255, 255, 0.85)';
              }}
            >
              <Receipt size={16} color="#10B981" /> Add Bill
            </button>
            <button
              onClick={() => navigate('/events/new')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #3B82F6 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px -4px rgba(6, 182, 212, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Plus size={18} /> Add Event
            </button>
          </div>
        }
      />

      {/* ── Glassmorphic Ambient Canvas Container ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: '36px',
          padding: '32px 28px',
          background: isDark
            ? 'linear-gradient(135deg, #0B131F 0%, #0F172A 40%, #0D1C2A 70%, #09131D 100%)'
            : 'linear-gradient(135deg, #FDE2E4 0%, #E8EAFF 40%, #E0F2FE 75%, #DCFCE7 100%)',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.6)'
            : '0 25px 60px -15px rgba(13, 42, 91, 0.15)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        {/* ── Floating Vibrant Ambient Background Orbs (Refraction Source) ── */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '8%',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #D946EF 0%, #8B5CF6 50%, #EC4899 100%)',
            opacity: isDark ? 0.35 : 0.6,
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '4%',
            width: '440px',
            height: '440px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #06B6D4 0%, #10B981 50%, #2563EB 100%)',
            opacity: isDark ? 0.4 : 0.75,
            filter: 'blur(65px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '35%',
            right: '25%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FDE047 0%, #FB923C 60%, transparent 100%)',
            opacity: isDark ? 0.2 : 0.35,
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* ── Glass Toolbar / Controls ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {/* View Filter Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isDark ? 'rgba(18, 29, 44, 0.85)' : 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '5px',
              borderRadius: '9999px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: isDark ? '0 4px 15px rgba(0, 0, 0, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.03)',
            }}
          >
            <button
              onClick={() => setItemTypeFilter('ALL')}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: itemTypeFilter === 'ALL' ? (isDark ? '#162232' : '#ffffff') : 'transparent',
                color: itemTypeFilter === 'ALL' ? (isDark ? '#34D399' : '#0D2A5B') : (isDark ? '#94A3B8' : '#475569'),
                fontWeight: itemTypeFilter === 'ALL' ? 800 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: itemTypeFilter === 'ALL' ? (isDark ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(13, 42, 91, 0.1)') : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              All Items ({calendarItems.length})
            </button>
            <button
              onClick={() => setItemTypeFilter('EVENT')}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: itemTypeFilter === 'EVENT' ? (isDark ? '#162232' : '#ffffff') : 'transparent',
                color: itemTypeFilter === 'EVENT' ? (isDark ? '#60A5FA' : '#2563EB') : (isDark ? '#94A3B8' : '#475569'),
                fontWeight: itemTypeFilter === 'EVENT' ? 800 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: itemTypeFilter === 'EVENT' ? (isDark ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(37, 99, 235, 0.15)') : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Events
            </button>
            <button
              onClick={() => setItemTypeFilter('BILL')}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: itemTypeFilter === 'BILL' ? (isDark ? '#162232' : '#ffffff') : 'transparent',
                color: itemTypeFilter === 'BILL' ? (isDark ? '#34D399' : '#059669') : (isDark ? '#94A3B8' : '#475569'),
                fontWeight: itemTypeFilter === 'BILL' ? 800 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: itemTypeFilter === 'BILL' ? (isDark ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(5, 150, 105, 0.15)') : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Bills
            </button>
          </div>

          {/* View Mode Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isDark ? 'rgba(18, 29, 44, 0.85)' : 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '5px',
              borderRadius: '9999px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: isDark ? '0 4px 15px rgba(0, 0, 0, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.03)',
            }}
          >
            <button
              onClick={() => setViewMode('month')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: viewMode === 'month' ? (isDark ? '#162232' : 'rgba(255, 255, 255, 0.95)') : 'transparent',
                color: viewMode === 'month' ? (isDark ? '#F8FAFC' : '#0D2A5B') : (isDark ? '#94A3B8' : '#475569'),
                fontWeight: viewMode === 'month' ? 800 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'month' ? (isDark ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(13, 42, 91, 0.1)') : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Grid3X3 size={15} /> Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: viewMode === 'agenda' ? (isDark ? '#162232' : 'rgba(255, 255, 255, 0.95)') : 'transparent',
                color: viewMode === 'agenda' ? (isDark ? '#F8FAFC' : '#0D2A5B') : (isDark ? '#94A3B8' : '#475569'),
                fontWeight: viewMode === 'agenda' ? 800 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'agenda' ? (isDark ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(13, 42, 91, 0.1)') : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <List size={15} /> Agenda
            </button>
          </div>
        </div>

        {/* ── Main Translucent Glass Card ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: isDark ? 'rgba(18, 29, 44, 0.78)' : 'rgba(255, 255, 255, 0.52)',
            backdropFilter: 'blur(30px) saturate(190%)',
            WebkitBackdropFilter: 'blur(30px) saturate(190%)',
            borderRadius: '32px',
            border: isDark ? '1.5px solid rgba(255, 255, 255, 0.1)' : '1.5px solid rgba(255, 255, 255, 0.75)',
            boxShadow: isDark
              ? '0 30px 70px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              : '0 30px 70px -15px rgba(13, 42, 91, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.4)',
            overflow: 'hidden',
          }}
        >
          {/* ── Frosted Header Bar (Matching User Reference) ── */}
          <div
            style={{
              padding: '24px 30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.45)',
              background: isDark
                ? 'linear-gradient(180deg, rgba(22, 34, 50, 0.8) 0%, rgba(18, 29, 44, 0.6) 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.15) 100%)',
            }}
          >
            {/* Prev / Next & Month Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '8px 18px',
                borderRadius: '24px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: isDark ? '0 8px 20px -4px rgba(0, 0, 0, 0.4)' : '0 8px 20px -4px rgba(13, 42, 91, 0.06)',
              }}
            >
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.8)',
                  color: isDark ? '#F8FAFC' : '#0D2A5B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#ffffff';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ChevronLeft size={18} />
              </button>

              <h2
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  color: isDark ? '#F8FAFC' : '#0D2A5B',
                  margin: 0,
                  minWidth: '180px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                {currentMonthLabel}
              </h2>

              <button
                onClick={handleNextMonth}
                title="Next Month"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.8)',
                  color: isDark ? '#F8FAFC' : '#0D2A5B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#ffffff';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Today Quick Button & Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={handleToday}
                style={{
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.8)',
                  backgroundColor: isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.65)',
                  fontSize: '0.825rem',
                  fontWeight: 800,
                  color: isDark ? '#F8FAFC' : '#0D2A5B',
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(13, 42, 91, 0.05)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.65)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Today
              </button>

              {/* Mini Legend Indicators */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  background: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.4)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: isDark ? '#94A3B8' : '#475569',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                  <span>Events</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span>Bills</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Content View ── */}
          {loading ? (
            <div style={{ padding: '60px 20px' }}>
              <LoadingSpinner message="Refracting calendar data..." />
            </div>
          ) : viewMode === 'month' ? (
            /* Month Matrix Grid */
            <div>
              {/* Day of Week Labels (SU, MO, TU, WE, TH, FR, SA) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  textAlign: 'center',
                  padding: '16px 14px 12px',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.35)',
                }}
              >
                {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((dayName, idx) => (
                  <div
                    key={dayName}
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      color: idx === 0 || idx === 6 ? '#A78BFA' : (isDark ? '#94A3B8' : '#475569'),
                      textTransform: 'uppercase',
                    }}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Days Cells Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '6px',
                  padding: '14px',
                }}
              >
                {calendarDays.map((cell) => {
                  const dayItems = itemsByDate[cell.dateStr] || [];
                  const isSelected = cell.dateStr === selectedDateStr;
                  const hasBills = dayItems.some((i) => i.itemType === 'BILL');
                  const hasEvents = dayItems.some((i) => i.itemType === 'EVENT');

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      onDoubleClick={() => navigate(`/events/new?date=${cell.dateStr}`)}
                      style={{
                        minHeight: '118px',
                        borderRadius: '20px',
                        padding: '10px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        position: 'relative',
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(30, 41, 59, 0.95)'
                            : 'rgba(255, 255, 255, 0.85)'
                          : cell.isCurrentMonth
                          ? isDark
                            ? 'rgba(22, 34, 50, 0.65)'
                            : 'rgba(255, 255, 255, 0.28)'
                          : isDark
                          ? 'rgba(15, 23, 42, 0.35)'
                          : 'rgba(255, 255, 255, 0.08)',
                        border: isSelected
                          ? '2px solid #8B5CF6'
                          : isDark
                          ? '1px solid rgba(255, 255, 255, 0.07)'
                          : '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: isSelected
                          ? isDark
                            ? '0 12px 28px -6px rgba(139, 92, 246, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
                            : '0 12px 28px -6px rgba(139, 92, 246, 0.35), inset 0 0 0 1px #ffffff'
                          : 'none',
                        opacity: cell.isCurrentMonth ? 1 : 0.45,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = isDark
                            ? 'rgba(30, 41, 59, 0.85)'
                            : 'rgba(255, 255, 255, 0.65)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = isDark
                            ? '0 8px 20px -5px rgba(0, 0, 0, 0.4)'
                            : '0 8px 20px -5px rgba(13, 42, 91, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = cell.isCurrentMonth
                            ? isDark
                              ? 'rgba(22, 34, 50, 0.65)'
                              : 'rgba(255, 255, 255, 0.28)'
                            : isDark
                            ? 'rgba(15, 23, 42, 0.35)'
                            : 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {/* Day Number / Active Ring Header */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: cell.isToday || isSelected ? 900 : cell.isCurrentMonth ? 700 : 500,
                            color: cell.isToday
                              ? '#ffffff'
                              : isSelected
                              ? '#A78BFA'
                              : cell.isCurrentMonth
                              ? isDark
                                ? '#F8FAFC'
                                : '#0D2A5B'
                              : isDark
                              ? '#64748B'
                              : '#94A3B8',
                            background: cell.isToday
                              ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                              : 'transparent',
                            boxShadow: cell.isToday ? '0 6px 14px rgba(139, 92, 246, 0.4)' : 'none',
                          }}
                        >
                          {cell.dayNumber < 10 ? `0${cell.dayNumber}` : cell.dayNumber}
                        </div>

                        {/* Status Dots (Bills/Events) */}
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                          {hasEvents && (
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#2563EB',
                                boxShadow: '0 0 6px rgba(37, 99, 235, 0.6)',
                              }}
                              title="Has Scheduled Events"
                            />
                          )}
                          {hasBills && (
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#10B981',
                                boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                              }}
                              title="Has Due Bills"
                            />
                          )}
                        </div>
                      </div>

                      {/* Item Badges */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          overflowY: 'auto',
                          maxHeight: '65px',
                        }}
                      >
                        {dayItems.slice(0, 2).map((item) => {
                          const isBill = item.itemType === 'BILL';
                          return (
                            <div
                              key={`${item.itemType}_${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemClick(item);
                              }}
                              style={{
                                padding: '3px 6px',
                                borderRadius: '8px',
                                backgroundColor: isBill
                                  ? 'rgba(16, 185, 129, 0.85)'
                                  : 'rgba(37, 99, 235, 0.85)',
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                backdropFilter: 'blur(4px)',
                                WebkitBackdropFilter: 'blur(4px)',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                              title={item.title}
                            >
                              {isBill ? <Receipt size={10} /> : <CalendarIcon size={10} />}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.title?.replace('📅 ', '').replace('💳 ', '')}
                              </span>
                            </div>
                          );
                        })}

                        {dayItems.length > 2 && (
                          <div
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              color: isDark ? '#94A3B8' : '#64748B',
                              textAlign: 'center',
                              padding: '1px 0',
                            }}
                          >
                            +{dayItems.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda List View */
            <div style={{ padding: '24px 30px' }}>
              {filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 16px', color: isDark ? '#94A3B8' : '#64748B' }}>
                  <CalendarDays size={48} style={{ color: '#94A3B8', marginBottom: '14px' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: '0 0 6px' }}>
                    No Scheduled Items
                  </h4>
                  <p style={{ fontSize: '0.85rem', margin: 0, color: isDark ? '#94A3B8' : '#64748B' }}>
                    There are no events or bills matching your current filter in this timeframe.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredItems.map((item) => {
                    const isBill = item.itemType === 'BILL';
                    return (
                      <div
                        key={`${item.itemType}_${item.id}`}
                        onClick={() => handleItemClick(item)}
                        style={{
                          padding: '18px 24px',
                          borderRadius: '20px',
                          backgroundColor: isDark ? 'rgba(22, 34, 50, 0.85)' : 'rgba(255, 255, 255, 0.65)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.8)',
                          borderLeft: `6px solid ${isBill ? '#10B981' : '#2563EB'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          boxShadow: isDark ? '0 8px 20px -5px rgba(0, 0, 0, 0.4)' : '0 8px 20px -5px rgba(13, 42, 91, 0.05)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(22, 34, 50, 0.85)' : 'rgba(255, 255, 255, 0.65)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '14px',
                              background: isBill
                                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isBill
                                ? '0 6px 14px rgba(16, 185, 129, 0.35)'
                                : '0 6px 14px rgba(37, 99, 235, 0.35)',
                              flexShrink: 0,
                            }}
                          >
                            {isBill ? <Receipt size={22} /> : <CalendarIcon size={22} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', letterSpacing: '-0.01em' }}>
                              {item.title}
                            </div>
                            <div
                              style={{
                                fontSize: '0.82rem',
                                color: isDark ? '#94A3B8' : '#64748B',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CalendarDays size={13} /> {item.start}
                              </span>
                              {item.eventTime && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={13} /> {item.eventTime}
                                </span>
                              )}
                              {item.eventLocation && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin size={13} /> {item.eventLocation}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              padding: '5px 14px',
                              borderRadius: '9999px',
                              backgroundColor: isBill
                                ? isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'
                                : isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.15)',
                              color: isBill ? (isDark ? '#34D399' : '#059669') : (isDark ? '#60A5FA' : '#2563EB'),
                              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.6)',
                            }}
                          >
                            {isBill ? (item.billStatus || 'BILL') : (item.eventStatus || 'EVENT')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Selected Date Drawer / Highlights ── */}
        {selectedDateItems.length > 0 && viewMode === 'month' && (
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              marginTop: '24px',
              backgroundColor: isDark ? 'rgba(18, 29, 44, 0.85)' : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '20px 24px',
              border: isDark ? '1.5px solid rgba(255, 255, 255, 0.1)' : '1.5px solid rgba(255, 255, 255, 0.8)',
              boxShadow: isDark ? '0 15px 35px -10px rgba(0, 0, 0, 0.5)' : '0 15px 35px -10px rgba(13, 42, 91, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0 }}>
                    Schedule for {selectedDateStr}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>
                    {selectedDateItems.length} active item{selectedDateItems.length > 1 ? 's' : ''} on this day
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/events/new?date=${selectedDateStr}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: isDark ? '#1E293B' : '#ffffff',
                  color: isDark ? '#60A5FA' : '#2563EB',
                  border: isDark ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add on this day
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {selectedDateItems.map((item) => {
                const isBill = item.itemType === 'BILL';
                return (
                  <div
                    key={`${item.itemType}_${item.id}`}
                    onClick={() => handleItemClick(item)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '16px',
                      backgroundColor: isDark ? 'rgba(22, 34, 50, 0.9)' : 'rgba(255, 255, 255, 0.85)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(13, 42, 91, 0.04)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: isBill
                            ? isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'
                            : isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.15)',
                          color: isBill ? (isDark ? '#34D399' : '#059669') : (isDark ? '#60A5FA' : '#2563EB'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isBill ? <Receipt size={16} /> : <CalendarIcon size={16} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                          {item.eventTime ? `⏰ ${item.eventTime}` : isBill ? '💳 Due today' : '📅 All day'}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: isBill
                          ? isDark ? 'rgba(16, 185, 129, 0.25)' : '#DCFCE7'
                          : isDark ? 'rgba(37, 99, 235, 0.25)' : '#EFF6FF',
                        color: isBill ? (isDark ? '#34D399' : '#166534') : (isDark ? '#60A5FA' : '#1E40AF'),
                      }}
                    >
                      {isBill ? (item.billStatus || 'BILL') : (item.eventStatus || 'EVENT')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Bill Details Modal ── */}
      <CalendarBillModal
        isOpen={!!selectedBill}
        bill={selectedBill}
        onClose={() => setSelectedBill(null)}
        onPay={handlePayBill}
        onUnpay={handleUnpayBill}
        onDelete={(id) => setDeleteItem({ id, type: 'BILL' })}
      />

      {/* ── Event Details Modal ── */}
      <CalendarEventModal
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onComplete={handleCompleteEvent}
        onDelete={(id) => setDeleteItem({ id, type: 'EVENT' })}
      />

      {/* ── Delete Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        title={deleteItem?.type === 'BILL' ? 'Delete Bill' : 'Delete Event'}
        message={`Are you sure you want to delete this ${deleteItem?.type === 'BILL' ? 'bill' : 'event'}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};

export default CalendarPage;
