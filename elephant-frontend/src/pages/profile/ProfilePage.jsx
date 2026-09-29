import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { PageHeader } from '../../components/common/PageHeader';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { User, Mail, Phone, Lock, Bell, Palette, Save, Loader2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    themePreference: 'light',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [prefMsg, setPrefMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
      });
      setPreferences({
        emailNotifications: user.emailNotifications !== false,
        inAppNotifications: user.inAppNotifications !== false,
        themePreference: user.themePreference || 'light',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setProfileMsg('');
    setLoading(true);

    try {
      const updated = await authApi.updateProfile(profileData);
      updateUser(updated);
      setProfileMsg('Profile updated successfully! ✨');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setError('');
    setPrefMsg('');
    setLoading(true);

    try {
      const updated = await authApi.updatePreferences(preferences);
      updateUser(updated);
      setPrefMsg('Preferences saved! 🔔');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setPwdMsg('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPwdMsg('Password updated successfully! 🔒');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Ensure your current password is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Account Settings"
        subtitle="Manage your profile identity, notification preferences, and security credentials"
        breadcrumb="Account / Settings"
      />

      <ErrorAlert message={error} onClose={() => setError('')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '30px',
            border: '1px solid #E2EAF3',
            boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#E8F4FF', color: '#2196F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
              Personal Profile
            </h3>
          </div>

          {profileMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#DDF7EF', color: '#0E8058', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                style={{ width: '100%', padding: '11px 16px', borderRadius: '14px', border: '1.5px solid #E2EAF3', fontSize: '0.9rem', color: '#0D2A5B', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
                onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                style={{ width: '100%', padding: '11px 16px', borderRadius: '14px', border: '1.5px solid #E2EAF3', fontSize: '0.9rem', backgroundColor: '#F8FAFD', color: '#94A3B8', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+94 71 234 5678"
                style={{ width: '100%', padding: '11px 16px', borderRadius: '14px', border: '1.5px solid #E2EAF3', fontSize: '0.9rem', color: '#0D2A5B', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
                onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 22px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.38)',
              }}
            >
              <Save size={16} /> Save Profile
            </button>
          </form>
        </div>

        {/* Preferences Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '30px',
            border: '1px solid #E2EAF3',
            boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#DDF8F7', color: '#088380', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
              Alert Preferences
            </h3>
          </div>

          {prefMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#DDF7EF', color: '#0E8058', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
              {prefMsg}
            </div>
          )}

          <form onSubmit={handleUpdatePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFD', borderRadius: '14px', border: '1px solid #E2EAF3' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0D2A5B' }}>Email Notifications</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Receive bill and event alerts via email</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#2196F3', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFD', borderRadius: '14px', border: '1px solid #E2EAF3' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0D2A5B' }}>In-App Notifications</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Show real-time badge alerts on top bar</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.inAppNotifications}
                onChange={(e) => setPreferences({ ...preferences, inAppNotifications: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#2196F3', cursor: 'pointer' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 22px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.38)',
              }}
            >
              <Save size={16} /> Save Preferences
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '30px',
            border: '1px solid #E2EAF3',
            boxShadow: '0 10px 25px -5px rgba(33, 150, 243, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FFE8F1', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0D2A5B', margin: 0 }}>
              Change Password
            </h3>
          </div>

          {pwdMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#DDF7EF', color: '#0E8058', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
              {pwdMsg}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 16px', borderRadius: '14px', border: '1.5px solid #E2EAF3', fontSize: '0.9rem', color: '#0D2A5B', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
                onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                New Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Min 6 characters"
                style={{ width: '100%', padding: '11px 16px', borderRadius: '14px', border: '1.5px solid #E2EAF3', fontSize: '0.9rem', color: '#0D2A5B', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
                onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 16px', borderRadius: '14px', border: '1.5px solid #E2EAF3', fontSize: '0.9rem', color: '#0D2A5B', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = '#29B6F6')}
                onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 22px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #29B6F6 0%, #2196F3 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.38)',
              }}
            >
              <Lock size={16} /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
