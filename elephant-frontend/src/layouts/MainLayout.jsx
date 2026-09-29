import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { PageTransition } from '../components/common/PageTransition';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage message="Authenticating Elephant Smart Finance..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className="app-main-layout"
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--bg-layout)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Global Floating Ambient Orbs (Refraction Source across all pages) ── */}
      <div
        style={{
          position: 'fixed',
          top: '-120px',
          right: '15%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.18) 50%, transparent 75%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-140px',
          left: '25%',
          width: '580px',
          height: '580px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 75%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '40%',
          left: '5%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, rgba(16, 185, 129, 0.12) 50%, transparent 75%)',
          filter: 'blur(75px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Sidebar Component ── */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ── Main Content Area ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <TopBar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '30px 38px 48px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
