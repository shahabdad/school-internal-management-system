import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { TwoFactorModal } from '../components/TwoFactorModal';
import { ROUTES } from '../constants/routes';

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid school email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, is2FAPending, cancel2FA } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex.rivera@academix.edu',
      password: 'P@ssword123!',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await login(data.email, data.password);
      if (res.twoFactorRequired) {
        toast.success('OTP code sent to email. Please verify 2FA.');
      } else {
        toast.success('Successfully logged in!');
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Address Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-left-icon" size={18} />
              <input
                id="email"
                type="email"
                className={`input-styled ${errors.email ? 'border-red-500' : ''}`}
                placeholder="name@school.edu"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-600 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          {/* Password Field with Eye Toggle */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-left-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`input-styled ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                {...register('password')}
              />
              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-600 mt-1 block">{errors.password.message}</span>
            )}
          </div>

          {/* Options Row */}
          <div className="login-options-row">
            <label className="checkbox-label">
              <input type="checkbox" {...register('rememberMe')} />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              className="forgot-password-link"
              onClick={() => toast('Password reset link sent to your email.')}
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button type="submit" className="btn-signin" disabled={isLoading}>
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>

      {/* Footer Legal Section */}
      <div className="login-footer-section">
        <div className="legal-notice">
          INTERNAL SYSTEM - AUTHORIZED ACCESS ONLY
        </div>
        <div className="legal-links">
          <button type="button" onClick={() => toast('Privacy Policy: Enterprise Data Security.')}>
            Privacy Policy
          </button>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <button type="button" onClick={() => toast('Terms of Service: Authorized Operations Only.')}>
            Terms of Service
          </button>
        </div>
      </div>

      {/* 2FA Modal */}
      <TwoFactorModal isOpen={is2FAPending} onClose={cancel2FA} />
    </>
  );
};
