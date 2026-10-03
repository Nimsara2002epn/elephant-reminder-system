import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Calendar, FileText, Download, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FINTECH_PALETTE = ['#2196F3', '#29B6F6', '#088380', '#D81E6B', '#6A38EB', '#10B981', '#F59E0B'];

export const ReportsDashboardPage = () => {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick CSV Export Modal
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportType, setExportType] = useState('FINANCIAL');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadCharts = async () => {
      try {
        setLoading(true);
        const data = await reportApi.getChartsData();
        setCharts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCharts();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Crunching financial & event analytics..." />;
  }

  // Transform category map to recharts array
  const categoryData = charts?.expensesByCategory
    ? Object.entries(charts.expensesByCategory).map(([name, value]) => ({
        name,
        value: Number(value),
      }))
    : [];

  // Transform monthly map to recharts array
  const monthlyData = charts?.monthlyExpenses
    ? Object.entries(charts.monthlyExpenses).map(([month, amount]) => ({
        month,
        amount: Number(amount),
      }))
    : [];

  // Transform event status counts
  const eventStatusData = charts?.eventStatusCounts
    ? Object.entries(charts.eventStatusCounts).map(([status, count]) => ({
        status,
        count: Number(count),
      }))
    : [];

  const handleQuickExportCsv = async (e) => {
    e.preventDefault();
    try {
      setExporting(true);
      const blob = await reportApi.exportCsv(exportType, exportStartDate, exportEndDate);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `elephant_${exportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExportOpen(false);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D2A5B', letterSpacing: '-0.02em', margin: 0 }}>
            Reports & Visual Analytics
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
            Interactive expense breakdowns, monthly trend charts, and event completion metrics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsExportOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #10B981',
              color: '#059669',
              fontSize: '0.875rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ECFDF5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <FileSpreadsheet size={16} color="#10B981" /> Export CSV
          </button>

          <Link
            to="/reports/history"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #E2EAF3',
              color: '#0D2A5B',
              fontSize: '0.875rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(13, 42, 91, 0.04)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F8FD')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <FileText size={16} color="#2196F3" /> View Archive
          </Link>

          <Link
            to="/reports/history?generate=true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 700,
              boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.38)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <TrendingUp size={16} /> Generate Report
          </Link>
        </div>
      </div>

      {/* Grid of 3 Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px' }}>
        {/* Chart 1: Monthly Expense Trend */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '26px',
            border: '1px solid #E2EAF3',
            boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#E8F4FF', color: '#2196F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                Monthly Expenses Trend
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Amounts in LKR (Past 6 Months)</span>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF3F8" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Expenses']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #E2EAF3', boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.12)', fontWeight: 600, color: '#0D2A5B' }}
                />
                <Bar dataKey="amount" fill="#2196F3" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expenses by Category Donut */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '26px',
            border: '1px solid #E2EAF3',
            boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EEE7FF', color: '#6A38EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                Expense Breakdown by Category
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Category distribution of all bills</span>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            {categoryData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                No bill category data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FINTECH_PALETTE[index % FINTECH_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Total']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #E2EAF3', boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.12)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Event Status Breakdown */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '26px',
            border: '1px solid #E2EAF3',
            boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#DDF7EF', color: '#0E8058', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                Event Status Completion
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Breakdown of scheduled vs completed</span>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventStatusData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF3F8" />
                <XAxis dataKey="status" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #E2EAF3', boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.12)' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick CSV Export Modal */}
      {isExportOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 42, 91, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsExportOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(13, 42, 91, 0.25)',
              border: '1px solid #E2EAF3',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '22px 28px', borderBottom: '1px solid #EEF3F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
                    Export CSV Spreadsheet
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                    Download raw records compatible with Microsoft Excel & Google Sheets
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickExportCsv} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '8px' }}>
                  Select Dataset to Export
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setExportType('FINANCIAL')}
                    style={{
                      padding: '14px',
                      borderRadius: '16px',
                      border: exportType === 'FINANCIAL' ? '2px solid #2196F3' : '1.5px solid #E2EAF3',
                      backgroundColor: exportType === 'FINANCIAL' ? '#F0F7FF' : '#ffffff',
                      color: exportType === 'FINANCIAL' ? '#2196F3' : '#64748B',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    💳 Financial Bills
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportType('EVENT')}
                    style={{
                      padding: '14px',
                      borderRadius: '16px',
                      border: exportType === 'EVENT' ? '2px solid #10B981' : '1.5px solid #E2EAF3',
                      backgroundColor: exportType === 'EVENT' ? '#ECFDF5' : '#ffffff',
                      color: exportType === 'EVENT' ? '#059669' : '#64748B',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    📅 Event Schedules
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                    From Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2EAF3',
                      backgroundColor: '#F8FAFD',
                      fontSize: '0.85rem',
                      color: '#0D2A5B',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                    To Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2EAF3',
                      backgroundColor: '#F8FAFD',
                      fontSize: '0.85rem',
                      color: '#0D2A5B',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #E2EAF3',
                    color: '#64748B',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={exporting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    backgroundColor: '#10B981',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: exporting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {exporting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={16} /> Download .CSV
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
