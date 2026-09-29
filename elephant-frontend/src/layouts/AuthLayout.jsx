import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/common/PageTransition';

export const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #059669 0%, #10B981 40%, #00C49F 70%, #2196F3 100%)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Dynamic Background Organic Curves & Waves */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.85,
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100 150C200 40 450 320 850 160C1250 0 1400 250 1600 120V-100H-100V150Z"
          fill="rgba(255, 255, 255, 0.12)"
        />
        <path
          d="M-50 850C300 650 650 900 1050 720C1350 580 1500 780 1600 680V1000H-50V850Z"
          fill="rgba(255, 255, 255, 0.15)"
        />
        <path
          d="M-120 500C180 350 380 650 780 480C1180 310 1380 600 1600 450V1000H-120V500Z"
          fill="rgba(255, 255, 255, 0.08)"
        />
      </svg>

      {/* Ambient soft blurred light orbs */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255,255,255,0) 70%)',
          top: '-150px',
          left: '-150px',
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(41, 182, 246, 0.3) 0%, rgba(255,255,255,0) 70%)',
          bottom: '-100px',
          right: '-100px',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      <div style={{ width: '100%', maxWidth: '1060px', position: 'relative', zIndex: 10, margin: 'auto' }}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </div>
    </div>
  );
};
