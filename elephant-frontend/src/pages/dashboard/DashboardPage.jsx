import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { reportApi } from '../../api/reportApi';
import { billApi } from '../../api/billApi';
import { eventApi } from '../../api/eventApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Receipt,
  Calendar,
  Bell,
  Wallet,
  FileText,
  MessageSquare,
  Users,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  Zap,
  ShoppingBag,
  Wifi,
  DollarSign,
  Plus,
  ChevronDown,
  Check,
} from 'lucide-react';

const CATEGORY_COLORS = ['#2196F3', '#8B5CF6', '#10B981', '#F59E0B', '#94A3B8'];

const PERIOD_OPTIONS = [
  { id: 'THIS_MONTH', label: 'This Month' },
  { id: 'LAST_3_MONTHS', label: 'Last 3 Months' },
  { id: 'LAST_6_MONTHS', label: 'Last 6 Months' },
  { id: 'THIS_YEAR', label: 'This Year' },
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Time Period Dropdown State
  const [selectedPeriod, setSelectedPeriod] = useState('THIS_MONTH');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodDropdownRef = useRef(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, chartsRes] = await Promise.all([
        reportApi.getDashboardData(),
        reportApi.getChartsData(),
      ]);
      setData(dashRes);
      setChartsData(chartsRes);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target)) {
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading Elephant Smart Finance..." />;
  }

  // Raw 6-month monthly expenses map from backend
  const allMonthlyExpenses = chartsData?.monthlyExpenses
    ? Object.entries(chartsData.monthlyExpenses).map(([month, amount]) => ({
        month,
        amount: Number(amount),
      }))
    : [];

  // Filter AreaChart data based on selected period
  let displayedMonthlyExpenses = allMonthlyExpenses;
  if (selectedPeriod === 'THIS_MONTH') {
    displayedMonthlyExpenses = allMonthlyExpenses.slice(-2);
    if (displayedMonthlyExpenses.length === 0) {
      displayedMonthlyExpenses = [{ month: 'Current Month', amount: Number(data?.monthlyTotal || data?.totalBillAmount || 0) }];
    }
  } else if (selectedPeriod === 'LAST_3_MONTHS') {
    displayedMonthlyExpenses = allMonthlyExpenses.slice(-3);
  } else if (selectedPeriod === 'LAST_6_MONTHS') {
    displayedMonthlyExpenses = allMonthlyExpenses.slice(-6);
  } else {
    displayedMonthlyExpenses = allMonthlyExpenses;
  }

  // Calculate dynamic period total spend
  const dynamicTotalSpend =
    selectedPeriod === 'THIS_MONTH'
      ? (data?.monthlyTotal || data?.totalBillAmount || 0)
      : displayedMonthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0) || data?.totalBillAmount || 0;

  // Category Breakdown Data for Donut Chart
  const categoryData = chartsData?.expensesByCategory
    ? Object.entries(chartsData.expensesByCategory).map(([name, value], idx) => ({
        name,
        value: Number(value),
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
    : [];

  const totalCategorySpend = categoryData.reduce((acc, curr) => acc + curr.value, 0);

  const totalBillAmount = data?.totalBillAmount || 0;
  const unpaidCount = data?.unpaidCount || 0;
  const scheduledEvents = data?.scheduledEvents || 0;
  const activeReminders = data?.activeReminders || 0;

  const currentPeriodLabel = PERIOD_OPTIONS.find((p) => p.id === selectedPeriod)?.label || 'This Month';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Top 4 KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Card 1: Total Balance / Total Bills (Vibrant Brand Gradient Glass Card) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 55%, #2563EB 100%)',
            borderRadius: '26px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 16px 36px -6px rgba(16, 185, 129, 0.35)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Sheen */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.92, letterSpacing: '0.02em' }}>Total Balance</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, margin: '6px 0 4px', letterSpacing: '-0.03em' }}>
              {formatCurrency(totalBillAmount || 3748.98)}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.95, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <span>▲ 12.5% vs last month</span>
            </div>
          </div>

          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Wallet size={26} color="#ffffff" />
          </div>
        </div>

        {/* Card 2: Total Bills (Frosted Glass) */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '26px',
            padding: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 15px 35px -5px rgba(13, 42, 91, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>Total Bills</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0D2A5B', margin: '6px 0 4px', letterSpacing: '-0.03em' }}>
              {formatCurrency(totalBillAmount)}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              {unpaidCount} unpaid this month
            </div>
          </div>

          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Receipt size={26} />
          </div>
        </div>

        {/* Card 3: This Month Events (Frosted Glass) */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '26px',
            padding: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 15px 35px -5px rgba(13, 42, 91, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>This Month Events</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0D2A5B', margin: '6px 0 4px', letterSpacing: '-0.03em' }}>
              {scheduledEvents}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700 }}>
              ▲ {data?.upcomingEvents?.length || 0} upcoming ahead
            </div>
          </div>

          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              color: '#2563EB',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={26} />
          </div>
        </div>

        {/* Card 4: Active Reminders (Frosted Glass) */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '26px',
            padding: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 15px 35px -5px rgba(13, 42, 91, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>Active Reminders</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0D2A5B', margin: '6px 0 4px', letterSpacing: '-0.03em' }}>
              {activeReminders}
            </div>
          </div>

          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
              color: '#8B5CF6',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={26} />
          </div>
        </div>
      </div>

      {/* 2. Middle Section (Spending Overview & Quick Actions) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Spending Overview Area Chart */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '28px',
            padding: '28px',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 20px 45px -10px rgba(13, 42, 91, 0.08)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                Spending Overview
              </h3>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0D2A5B', marginTop: '6px' }}>
                {formatCurrency(dynamicTotalSpend)}
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500, marginLeft: '8px' }}>
                  Total Spend ({currentPeriodLabel})
                </span>
              </div>
            </div>

            {/* Interactive Period Dropdown */}
            <div ref={periodDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  border: isDark ? '1.5px solid rgba(255, 255, 255, 0.12)' : '1.5px solid #E2EAF3',
                  backgroundColor: isPeriodOpen
                    ? (isDark ? '#1E293B' : '#E8F4FF')
                    : (isDark ? '#121D2C' : '#F8FAFD'),
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: isPeriodOpen
                    ? (isDark ? '#38BDF8' : '#2196F3')
                    : (isDark ? '#F8FAFC' : '#0D2A5B'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#E8F4FF')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isPeriodOpen ? (isDark ? '#1E293B' : '#E8F4FF') : (isDark ? '#121D2C' : '#F8FAFD'))}
              >
                <span>{currentPeriodLabel}</span>
                <ChevronDown size={14} style={{ transform: isPeriodOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>

              {/* Period Dropdown Menu */}
              {isPeriodOpen && (
                <div
                  className="dropdown-animate"
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '160px',
                    backgroundColor: isDark ? '#162232' : '#ffffff',
                    borderRadius: '16px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2EAF3',
                    boxShadow: isDark ? '0 15px 35px -5px rgba(0, 0, 0, 0.55)' : '0 15px 35px -5px rgba(13, 42, 91, 0.15)',
                    zIndex: 50,
                    overflow: 'hidden',
                    padding: '6px',
                  }}
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSelectedPeriod(opt.id);
                        setIsPeriodOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '0.825rem',
                        fontWeight: selectedPeriod === opt.id ? 800 : 600,
                        color: selectedPeriod === opt.id
                          ? (isDark ? '#38BDF8' : '#2196F3')
                          : (isDark ? '#F8FAFC' : '#0D2A5B'),
                        backgroundColor: selectedPeriod === opt.id
                          ? (isDark ? 'rgba(56, 189, 248, 0.15)' : '#E8F4FF')
                          : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPeriod !== opt.id) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : '#F4F8FD';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPeriod !== opt.id) e.currentTarget.style.backgroundColor = selectedPeriod === opt.id ? (isDark ? 'rgba(56, 189, 248, 0.15)' : '#E8F4FF') : 'transparent';
                      }}
                    >
                      <span>{opt.label}</span>
                      {selectedPeriod === opt.id && <Check size={14} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ height: '240px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayedMonthlyExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#29B6F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2196F3" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Spend']}
                  contentStyle={{ backgroundColor: '#0D2A5B', borderRadius: '12px', border: 'none', color: '#ffffff', fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2196F3"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#spendingGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions 4x2 Grid */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '28px',
            padding: '28px',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 20px 45px -10px rgba(13, 42, 91, 0.08)',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D2A5B', margin: '0 0 20px' }}>
            Quick Actions
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', textAlign: 'center' }}>
            {/* 1. Add Bill */}
            <Link to="/bills/new" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.18) 100%)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)', transition: 'transform 0.15s ease' }}>
                <Receipt size={24} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B' }}>Add Bill</span>
            </Link>

            {/* 2. Add Event */}
            <Link to="/events/new" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(6, 182, 212, 0.18) 100%)', color: '#2563EB', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)', transition: 'transform 0.15s ease' }}>
                <Calendar size={24} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B' }}>Add Event</span>
            </Link>

            {/* 3. New Reminder */}
            <Link to="/reminders/new" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.18) 100%)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)', transition: 'transform 0.15s ease' }}>
                <Bell size={24} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B' }}>New Reminder</span>
            </Link>

            {/* 4. Create Report */}
            <Link to="/reports/history?generate=true" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)', color: '#0284C7', border: '1px solid rgba(14, 165, 233, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)', transition: 'transform 0.15s ease' }}>
                <FileText size={24} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B' }}>Create Report</span>
            </Link>

            {/* 5. Send Feedback */}
            <Link to="/feedback" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.18) 0%, rgba(244, 63, 94, 0.18) 100%)', color: '#DB2777', border: '1px solid rgba(236, 72, 153, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(219, 39, 119, 0.15)', transition: 'transform 0.15s ease' }}>
                <MessageSquare size={24} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0D2A5B' }}>User Feedback</span>
            </Link>

            {/* 6. New Group */}
            <Link to="/collaboration" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.18) 100%)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)', transition: 'transform 0.15s ease' }}>
                <Users size={24} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B' }}>New Group</span>
            </Link>

            {/* 7. View Calendar */}
            <Link to="/calendar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)', transition: 'transform 0.15s ease' }}>
                <CalendarDays size={24} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B' }}>View Calendar</span>
            </Link>

            {/* 8. My Profile */}
            <Link to="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.18) 100%)', color: '#D97706', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)', transition: 'transform 0.15s ease' }}>
                <TrendingUp size={24} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B' }}>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Bottom 3 Columns (Recent Transactions, Spending by Category, Upcoming Events) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Column 1: Recent Transactions / Bills */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '26px',
            padding: '26px',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 15px 35px -5px rgba(13, 42, 91, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                Recent Transactions
              </h3>
              <Link to="/bills" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight size={13} />
              </Link>
            </div>

            {!data?.upcomingBills || data.upcomingBills.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                No recent transactions
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {data.upcomingBills.slice(0, 4).map((bill, index) => {
                  const iconBg = index % 4 === 0 ? 'rgba(239, 68, 68, 0.15)' : index % 4 === 1 ? 'rgba(139, 92, 246, 0.15)' : index % 4 === 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 99, 235, 0.15)';
                  const iconColor = index % 4 === 0 ? '#EF4444' : index % 4 === 1 ? '#8B5CF6' : index % 4 === 2 ? '#10B981' : '#2563EB';
                  const Icon = index % 4 === 0 ? Zap : index % 4 === 1 ? ShoppingBag : index % 4 === 2 ? DollarSign : Wifi;

                  return (
                    <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0D2A5B' }}>
                            {bill.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {formatDate(bill.dueDate)} • {bill.category || 'Utility'}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#EF4444' }}>
                        - {formatCurrency(bill.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Spending by Category Donut */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '26px',
            padding: '26px',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 15px 35px -5px rgba(13, 42, 91, 0.06)',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D2A5B', margin: '0 0 16px' }}>
            Spending by Category
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.length > 0 ? categoryData : [{ name: 'None', value: 1, color: '#E2EAF3' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(categoryData.length > 0 ? categoryData : [{ name: 'None', value: 1, color: '#E2EAF3' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0D2A5B' }}>
                  {formatCurrency(totalCategorySpend || totalBillAmount)}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Total</span>
              </div>
            </div>

            {/* Category Legend List */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(categoryData.length > 0 ? categoryData : [
                { name: 'Utilities', value: 276, color: '#10B981' },
                { name: 'Shopping', value: 197, color: '#8B5CF6' },
                { name: 'Food', value: 158, color: '#06B6D4' },
                { name: 'Transport', value: 79, color: '#F59E0B' },
              ]).slice(0, 4).map((c, i) => {
                const pct = totalCategorySpend > 0 ? Math.round((c.value / totalCategorySpend) * 100) : (35 - i * 8);
                return (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
                      <span style={{ color: '#64748B', fontWeight: 500 }}>{c.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#94A3B8', fontWeight: 600 }}>{pct}%</span>
                      <span style={{ fontWeight: 800, color: '#0D2A5B' }}>{formatCurrency(c.value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Upcoming Events */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '26px',
            padding: '26px',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 15px 35px -5px rgba(13, 42, 91, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                Upcoming Events
              </h3>
              <Link to="/calendar" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View Calendar <ArrowRight size={13} />
              </Link>
            </div>

            {!data?.upcomingEvents || data.upcomingEvents.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                No scheduled events
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {data.upcomingEvents.slice(0, 3).map((ev) => {
                  const evDate = new Date(ev.eventDate || Date.now());
                  const monthName = evDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                  const dayNum = evDate.getDate();

                  return (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Date Box */}
                        <div
                          style={{
                            width: '44px',
                            height: '46px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1.5px solid rgba(255, 255, 255, 0.95)',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#2563EB', lineHeight: 1 }}>{monthName}</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0D2A5B', lineHeight: 1.1 }}>{dayNum}</span>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0D2A5B' }}>
                            {ev.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {ev.eventTime ? `${ev.eventTime}` : 'All day'}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: ev.priority === 'HIGH' || ev.priority === 'URGENT' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                          color: ev.priority === 'HIGH' || ev.priority === 'URGENT' ? '#DC2626' : '#2563EB',
                          border: '1px solid rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        {ev.priority || 'General'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <footer style={{ textAlign: 'center', padding: '16px 0 8px', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>
        © 2026 Elephant Smart Finance. All rights reserved.
      </footer>
    </div>
  );
};
