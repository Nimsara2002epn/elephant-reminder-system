import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ElephantLogo } from '../../components/common/ElephantLogo';
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
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
        minHeight: '560px',
        position: 'relative',
      }}
    >
      {/* ── Left Column: Brand Hero & Features ── */}
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
        {/* Subtle decorative graphic curve */}
        <svg
          style={{ position: 'absolute', right: -60, bottom: -60, width: '260px', height: '260px', opacity: 0.12, pointerEvents: 'none' }}
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="100" fill="url(#heroDecorGrad)" />
          <defs>
            <linearGradient id="heroDecorGrad" x1="0" y1="0" x2="200" y2="200">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#2196F3" />
            </linearGradient>
          </defs>
        </svg>

        <div>
          {/* Logo & Brand Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
        </div>
      </div>

      {/* ── Right Column: Sign In Form ── */}
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
        {/* Sign In Header with emerald accent bar */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
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
            SIGN IN
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
            Enter your email and password to access your account
          </p>
        </div>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
              E-mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#10B981' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 18px 12px 46px',
                  borderRadius: '9999px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#FAFCFF',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10B981';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2EAF3';
                  e.target.style.backgroundColor = '#FAFCFF';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0D2A5B', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#10B981' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 46px 12px 46px',
                  borderRadius: '9999px',
                  border: '1.5px solid #E2EAF3',
                  fontSize: '0.9rem',
                  color: '#0D2A5B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#FAFCFF',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10B981';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2EAF3';
                  e.target.style.backgroundColor = '#FAFCFF';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '13px',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748B', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer' }}
              />
              <span>Remember me</span>
            </label>
            <span
              onClick={() => alert('Please contact your administrator (admin@elephant.com) to reset your password.')}
              style={{ color: '#10B981', fontWeight: 600, cursor: 'pointer' }}
            >
              Forgot Password?
            </span>
          </div>

          {/* LOGIN Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '6px',
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
            onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {submitting ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>
                LOGIN <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer: Register Link */}
        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#10B981', fontWeight: 700, textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

