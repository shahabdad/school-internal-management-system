import React, { useState } from 'react';
import { ShieldCheck, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose }) => {
  const { verify2FA } = useAuth();
  const [otpCode, setOtpCode] = useState('612773');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length === 0) {
      setErrorMsg('Please enter the verification OTP code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    const success = await verify2FA(otpCode.trim());
    setIsVerifying(false);

    if (!success) {
      setErrorMsg('Invalid verification code. Please check your email or authenticator app.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '420px', padding: '2rem' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1d4ed8' }}>
            <ShieldCheck size={24} />
            Two-Factor Authentication
          </div>
          <button type="button" onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: '1.4' }}>
          An authentication code has been sent to your administrator email account. Enter your code below to complete login.
        </p>

        {errorMsg && (
          <div style={{ padding: '0.65rem 0.875rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">6-Digit Verification Code</label>
            <input
              type="text"
              className="form-input"
              style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.25rem', fontWeight: 700 }}
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-signin"
              style={{ width: 'auto', padding: '0.65rem 1.25rem' }}
              disabled={isVerifying}
            >
              <span>{isVerifying ? 'Verifying...' : 'Verify Session'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
