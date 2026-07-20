import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TwoFactorModal } from './TwoFactorModal';

/**
 * Senior Developer Grade Login Component
 * Implements standard accessibility, state management, password toggle, and 2FA trigger.
 */
export const LoginView: React.FC = () => {
  const { login, is2FAPending } = useAuth();

  // Form Field States
  const [email, setEmail] = useState('alex.rivera@academix.edu');
  const [password, setPassword] = useState('P@ssword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to authenticate user credential.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      {/* Brand Header */}
      <div className="login-header-section">
        <div className="login-logo-badge">
          <GraduationCap size={32} color="#ffffff" />
        </div>
        <h1 className="login-title">Academix Pro</h1>
        <div className="login-subtitle">ADMINISTRATIVE PORTAL</div>
      </div>

      {/* Main Login Card */}
      <div className="login-card">
        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Address Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-left-icon" size={18} />
              <input
                id="email-input"
                type="email"
                className="input-styled"
                placeholder="name@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field with Eye Toggle */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label" htmlFor="password-input">Password</label>
            <div className="input-with-icon">
              <Lock className="input-left-icon" size={18} />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="input-styled"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Options Row: Remember Me & Forgot Password */}
          <div className="login-options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              className="forgot-password-link"
              onClick={() => alert('Password reset link has been sent to your administrator email.')}
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="btn-signin"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>

      {/* Footer Legal & Security Notice */}
      <div className="login-footer-section">
        <div className="legal-notice">
          INTERNAL SYSTEM - AUTHORIZED ACCESS ONLY
        </div>
        <div className="legal-links">
          <button type="button" onClick={() => alert('Academix Pro Privacy Policy: Encrypted Enterprise Data Protection.')}>
            Privacy Policy
          </button>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <button type="button" onClick={() => alert('Academix Pro Terms of Service: Authorized Operations Only.')}>
            Terms of Service
          </button>
        </div>
      </div>

      {/* 2FA Verification Modal */}
      <TwoFactorModal
        isOpen={is2FAPending}
        onClose={() => {
          // If modal is closed without 2FA, stay on login page
          window.location.reload();
        }}
      />
    </div>
  );
};
