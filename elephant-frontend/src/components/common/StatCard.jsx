import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const { isDark } = useTheme();

  const colorMap = {
    blue: {
      bg: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(37, 99, 235, 0.12)',
      border: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(37, 99, 235, 0.25)',
      text: isDark ? '#38BDF8' : '#2563EB',
      iconBg: isDark
        ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(37, 99, 235, 0.18) 0%, rgba(6, 182, 212, 0.18) 100%)',
    },
    green: {
      bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)',
      border: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
      text: isDark ? '#34D399' : '#059669',
      iconBg: isDark
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(52, 211, 153, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.18) 100%)',
    },
    cyan: {
      bg: isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.12)',
      border: isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.25)',
      text: isDark ? '#22D3EE' : '#0891B2',
      iconBg: isDark
        ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(16, 185, 129, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(16, 185, 129, 0.18) 100%)',
    },
    amber: {
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.12)',
      border: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)',
      text: isDark ? '#FBBF24' : '#D97706',
      iconBg: isDark
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(251, 146, 60, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(251, 146, 60, 0.18) 100%)',
    },
    red: {
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)',
      border: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.25)',
      text: isDark ? '#F87171' : '#DC2626',
      iconBg: isDark
        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(248, 113, 113, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(244, 63, 94, 0.18) 100%)',
    },
    purple: {
      bg: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.12)',
      border: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.25)',
      text: isDark ? '#A78BFA' : '#7C3AED',
      iconBg: isDark
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.18) 100%)',
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="app-stat-card"
      style={{
        backgroundColor: isDark ? '#162232' : 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '26px',
        padding: '24px 26px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1.5px solid rgba(255, 255, 255, 0.8)',
        boxShadow: isDark
          ? '0 15px 35px -5px rgba(0, 0, 0, 0.45)'
          : '0 15px 35px -5px rgba(13, 42, 91, 0.06)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDark ? '#1B2A3D' : 'rgba(255, 255, 255, 0.9)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 20px 45px -8px rgba(0, 0, 0, 0.65)'
          : '0 20px 45px -8px rgba(13, 42, 91, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isDark ? '#162232' : 'rgba(255, 255, 255, 0.65)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 15px 35px -5px rgba(0, 0, 0, 0.45)'
          : '0 15px 35px -5px rgba(13, 42, 91, 0.06)';
      }}
    >
      <div>
        <span
          className="stat-card-title"
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: isDark ? '#94A3B8' : '#64748B',
            display: 'block',
            marginBottom: '6px',
          }}
        >
          {title}
        </span>
        <div
          className="stat-card-value"
          style={{
            fontSize: '1.85rem',
            fontWeight: 900,
            color: isDark ? '#F8FAFC' : '#0D2A5B',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        {subtitle && (
          <span
            className="stat-card-subtitle"
            style={{
              fontSize: '0.8rem',
              color: isDark ? '#64748B' : '#64748B',
              marginTop: '6px',
              display: 'block',
              fontWeight: 600,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '18px',
            background: c.iconBg,
            color: c.text,
            border: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
