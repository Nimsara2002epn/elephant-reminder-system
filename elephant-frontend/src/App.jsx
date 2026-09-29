import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Main Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BillsPage } from './pages/bills/BillsPage';
import { BillFormPage } from './pages/bills/BillFormPage';
import { EventsPage } from './pages/events/EventsPage';
import { EventFormPage } from './pages/events/EventFormPage';
import { CalendarPage } from './pages/events/CalendarPage';
import { RemindersPage } from './pages/reminders/RemindersPage';
import { ReminderFormPage } from './pages/reminders/ReminderFormPage';
import { CollaborationPage } from './pages/collaboration/CollaborationPage';
import { GroupDetailPage } from './pages/collaboration/GroupDetailPage';
import { ReportsDashboardPage } from './pages/reports/ReportsDashboardPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { FeedbackPage } from './pages/feedback/FeedbackPage';
import { ProfilePage } from './pages/profile/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminBackupsPage } from './pages/admin/AdminBackupsPage';

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
          {/* Public / Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Application routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Bills */}
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/bills/new" element={<BillFormPage />} />
            <Route path="/bills/:id/edit" element={<BillFormPage />} />

            {/* Events & Calendar */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/new" element={<EventFormPage />} />
            <Route path="/events/:id/edit" element={<EventFormPage />} />
            <Route path="/calendar" element={<CalendarPage />} />

            {/* Reminders */}
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/reminders/new" element={<ReminderFormPage />} />
            <Route path="/reminders/:id/edit" element={<ReminderFormPage />} />

            {/* Collaboration (Core Module) */}
            <Route path="/collaboration" element={<CollaborationPage />} />
            <Route path="/collaboration/:id" element={<GroupDetailPage />} />

            {/* Reports & Feedback */}
            <Route path="/reports" element={<ReportsDashboardPage />} />
            <Route path="/reports/history" element={<ReportsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />

            {/* Profile */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Console */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <AdminRoute>
                  <AdminLogsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/backups"
              element={
                <AdminRoute>
                  <AdminBackupsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <AdminRoute>
                  <FeedbackPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>
  );
};

export default App;
