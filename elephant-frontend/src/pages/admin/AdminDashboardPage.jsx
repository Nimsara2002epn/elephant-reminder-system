import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { adminApi } from '../../api/adminApi';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, FileText, Database, Server, Activity, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { feedbackApi } from '../../api/feedbackApi';

export const AdminDashboardPage = () => {
  const { isDark } = useTheme();
  const [status, setStatus] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        const [data, fbStats] = await Promise.all([
          adminApi.getSystemStatus(),
          feedbackApi.getFeedbackStats().catch(() => null),
        ]);
        setStatus(data);
        setFeedbackStats(fbStats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading system diagnostics..." />;
  }

  const memoryPercent = status?.maxMemoryMb
    ? Math.round((status.usedMemoryMb / status.maxMemoryMb) * 100)
    : 0;

  return (
    <div>
      <PageHeader
        title="Admin Control Center"
        subtitle="System health, security audit monitoring, user permissions, and database recovery"
        breadcrumb="Administration / System Overview"
      />

      {/* Admin Modules Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <Link
          to="/admin/users"
          style={{
            backgroundColor: isDark ? '#162232' : '#ffffff',
            borderRadius: '24px',
            padding: '26px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2EAF3',
            boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.backgroundColor = isDark ? '#1C2B3F' : '#ffffff';
            e.currentTarget.style.boxShadow = isDark ? '0 16px 32px -4px rgba(0, 0, 0, 0.6)' : '0 16px 32px -4px rgba(33, 150, 243, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.backgroundColor = isDark ? '#162232' : '#ffffff';
            e.currentTarget.style.boxShadow = isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(33, 150, 243, 0.18)' : '#E8F4FF', color: '#2196F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0 }}>User Management</h3>
              <p style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '2px', fontWeight: 500 }}>Manage roles & toggle status</p>
            </div>
          </div>
          <ArrowRight size={18} style={{ color: '#2196F3' }} />
        </Link>

        <Link
          to="/admin/logs"
          style={{
            backgroundColor: isDark ? '#162232' : '#ffffff',
            borderRadius: '24px',
            padding: '26px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2EAF3',
            boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.backgroundColor = isDark ? '#1C2B3F' : '#ffffff';
            e.currentTarget.style.boxShadow = isDark ? '0 16px 32px -4px rgba(0, 0, 0, 0.6)' : '0 16px 32px -4px rgba(33, 150, 243, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.backgroundColor = isDark ? '#162232' : '#ffffff';
            e.currentTarget.style.boxShadow = isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(106, 56, 235, 0.22)' : '#EEE7FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0 }}>Security Logs</h3>
              <p style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '2px', fontWeight: 500 }}>Audit trail & clean records</p>
            </div>
          </div>
          <ArrowRight size={18} style={{ color: '#8B5CF6' }} />
        </Link>

        <Link
          to="/admin/backups"
          style={{
            backgroundColor: isDark ? '#162232' : '#ffffff',
            borderRadius: '24px',
            padding: '26px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2EAF3',
            boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.backgroundColor = isDark ? '#1C2B3F' : '#ffffff';
            e.currentTarget.style.boxShadow = isDark ? '0 16px 32px -4px rgba(0, 0, 0, 0.6)' : '0 16px 32px -4px rgba(33, 150, 243, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.backgroundColor = isDark ? '#162232' : '#ffffff';
            e.currentTarget.style.boxShadow = isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#DDF7EF', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0 }}>Database Backups</h3>
              <p style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '2px', fontWeight: 500 }}>Snapshots & data restore</p>
            </div>
          </div>
          <ArrowRight size={18} style={{ color: '#10B981' }} />
        </Link>

        {/* 4. User Feedback */}
        <Link
          to="/admin/feedback"
          style={{
            backgroundColor: isDark ? '#162232' : '#ffffff',
            borderRadius: '24px',
            padding: '26px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2EAF3',
            boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.backgroundColor = isDark ? '#1C2B3F' : '#ffffff';
            e.currentTarget.style.boxShadow = isDark ? '0 16px 32px -4px rgba(0, 0, 0, 0.6)' : '0 16px 32px -4px rgba(33, 150, 243, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.backgroundColor = isDark ? '#162232' : '#ffffff';
            e.currentTarget.style.boxShadow = isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0 }}>User Feedback</h3>
              <p style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '2px', fontWeight: 500 }}>Review ratings, bugs & requests</p>
            </div>
          </div>
          <ArrowRight size={18} style={{ color: '#F59E0B' }} />
        </Link>
      </div>

      {/* KPI Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard title="Total Registered Users" value={status?.totalUsers || 0} subtitle={`${status?.activeUsers || 0} active accounts`} icon={Users} color="blue" />
        <StatCard title="User Feedback" value={feedbackStats?.total ?? 0} subtitle={`${feedbackStats?.pending ?? 0} pending review • ${feedbackStats?.averageRating ?? '5.0'}★`} icon={MessageSquare} color="amber" />
        <StatCard title="Security Log Entries" value={status?.totalLogs || 0} subtitle="Audit entries captured" icon={Activity} color="purple" />
        <StatCard title="System Backups" value={status?.totalBackups || 0} subtitle="Recovery points available" icon={Database} color="green" />
      </div>

      {/* JVM System Diagnostics Card */}
      <div
        style={{
          backgroundColor: isDark ? '#162232' : '#ffffff',
          borderRadius: '24px',
          padding: '30px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2EAF3',
          boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.45)' : '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: isDark ? 'rgba(33, 150, 243, 0.18)' : '#E8F4FF', color: '#2196F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server size={20} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: 0 }}>
            JVM & Hardware Health
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFD', padding: '20px', borderRadius: '16px', border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #EEF3F8' }}>
            <span style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>Memory Utilization ({memoryPercent}%)</span>
            <div style={{ width: '100%', height: '8px', backgroundColor: isDark ? '#334155' : '#E2EAF3', borderRadius: '9999px', overflow: 'hidden', margin: '10px 0' }}>
              <div style={{ width: `${memoryPercent}%`, height: '100%', backgroundColor: memoryPercent > 80 ? '#EF4444' : '#2196F3', borderRadius: '9999px' }} />
            </div>
            <div style={{ fontSize: '0.825rem', color: isDark ? '#CBD5E1' : '#0D2A5B', fontWeight: 600 }}>
              Used: <strong style={{ color: isDark ? '#F8FAFC' : '#0D2A5B' }}>{status?.usedMemoryMb} MB</strong> / Max: <strong style={{ color: isDark ? '#F8FAFC' : '#0D2A5B' }}>{status?.maxMemoryMb} MB</strong>
            </div>
          </div>

          <div style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFD', padding: '20px', borderRadius: '16px', border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #EEF3F8' }}>
            <span style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>Available CPU Processors</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: '6px 0' }}>
              {status?.processors || 1} Cores
            </div>
            <span style={{ fontSize: '0.75rem', color: isDark ? '#34D399' : '#0E8058', fontWeight: 700 }}>Thread Pool Operational</span>
          </div>

          <div style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFD', padding: '20px', borderRadius: '16px', border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #EEF3F8' }}>
            <span style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>Server Local Time</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0D2A5B', margin: '8px 0' }}>
              {status?.serverTime || '—'}
            </div>
            <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>Timezone Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
