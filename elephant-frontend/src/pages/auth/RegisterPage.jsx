import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ElephantLogo } from '../../components/common/ElephantLogo';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your information.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '32px',
        boxShadow: '0 25px 60px -15px rgba(13, 42, 91, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.6)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        minHeight: '580px',
        position: 'relative',
      }}
    >
      {/* ── Left Column: Brand Hero & Benefits ── */}
      <div
        style={{
          background: 'linear-gradient(145deg, #0A2540 0%, #0D2A5B 45%, #064E3B 100%)',
          padding: '44px 38px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div>
          {/* Logo & Brand Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
            <ElephantLogo size={52} />
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: '#ffffff' }}>
                Elephant
              </h1>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Smart Finance & Events
              </span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '14px', color: '#F0FDF4', letterSpacing: '-0.02em' }}>
            Join thousands managing life, budgets & events smoothly.
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '28px' }}>
            Create your free Elephant account today. Get automated bill alerts, interactive reports, and shared collaboration workspaces.
          </p>

          {/* Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 600 }}>
              <CheckCircle2 size={18} color="#34D399" />
              <span>Free account with unlimited bills & events</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 600 }}>
              <CheckCircle2 size={18} color="#34D399" />
              <span>Multi-user collaboration & group bill splitting</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 600 }}>
              <CheckCircle2 size={18} color="#34D399" />
              <span>CSV Spreadsheet & Text Report generation</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94A3B8' }}>
          <ShieldCheck size={16} color="#34D399" />
          <span>Your personal financial data is private & encrypted</span>
        </div>
      </div>

      {/* ── Right Column: Sign Up Form ── */}
      <div
        style={{
          padding: '44px 38px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <CheckCircle2 size={44} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0D2A5B', margin: '0 0 8px 0' }}>
              Account Created Successfully!
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>
              Welcome to Elephant. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '22px', textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 900,
                  color: '#0D2A5B',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 6px 0',
                  display: 'inline-block',
                  position: 'relative',
                }}
              >
                CREATE ACCOUNT
                <span
                  style={{
                    display: 'block',
                    width: '40px',
                    height: '4px',
                    borderRadius: '9999px',
                    backgroundColor: '#10B981',
                    margin: '6px auto 0',
                  }}
                />
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '6px', fontWeight: 500 }}>
                Fill in the details below to start using Elephant
              </p>
            </div>

            <ErrorAlert message={error} onClose={() => setError('')} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '13px', color: '#10B981' }} />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Pushpika Wickramasinghe"
                    style={{
                      width: '100%',
                      padding: '11px 18px 11px 44px',
                      borderRadius: '9999px',
                      border: '1.5px solid #E2EAF3',
                      fontSize: '0.875rem',
                      color: '#0D2A5B',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#FAFCFF',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10B981';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2EAF3';
                      e.target.style.backgroundColor = '#FAFCFF';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '13px', color: '#10B981' }} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      padding: '11px 18px 11px 44px',
                      borderRadius: '9999px',
                      border: '1.5px solid #E2EAF3',
                      fontSize: '0.875rem',
                      color: '#0D2A5B',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#FAFCFF',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10B981';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2EAF3';
                      e.target.style.backgroundColor = '#FAFCFF';
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '4px' }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: '#10B981' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 38px',
                        borderRadius: '9999px',
                        border: '1.5px solid #E2EAF3',
                        fontSize: '0.875rem',
                        color: '#0D2A5B',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#FAFCFF',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                      onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '4px' }}>
                    Confirm *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: '#10B981' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 38px',
                        borderRadius: '9999px',
                        border: '1.5px solid #E2EAF3',
                        fontSize: '0.875rem',
                        color: '#0D2A5B',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#FAFCFF',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                      onBlur={(e) => (e.target.style.borderColor = '#E2EAF3')}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '13px 24px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.45)',
                  transition: 'all 0.15s ease',
                  opacity: submitting ? 0.75 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...
                  </>
                ) : (
                  <>
                    REGISTER <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#10B981', fontWeight: 700, textDecoration: 'none' }}>
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

