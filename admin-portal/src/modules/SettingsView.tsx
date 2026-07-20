import React, { useState } from 'react';
import { Save, Lock, Server } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:5000/api/v1');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [autoRefreshMinutes, setAutoRefreshMinutes] = useState(15);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Admin Portal Settings</h1>
          <p className="page-subtitle">Configure system options, API endpoint URLs, security parameters, and notifications.</p>
        </div>
      </div>

      <div style={{ maxWidth: '720px' }}>
        <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {savedMsg && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              Settings saved successfully!
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} color="#1d4ed8" /> API Server Connection
            </h3>
            <div className="form-group">
              <label className="form-label">Backend REST API Endpoint</label>
              <input
                type="text"
                className="form-input"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">JWT Token Refresh Interval (Minutes)</label>
              <input
                type="number"
                className="form-input"
                value={autoRefreshMinutes}
                onChange={(e) => setAutoRefreshMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="#1d4ed8" /> Authentication & Security
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
              <input
                type="checkbox"
                checked={twoFactorEnforced}
                onChange={(e) => setTwoFactorEnforced(e.target.checked)}
              />
              Enforce Multi-Factor Authentication (OTP 2FA) for all Admin accounts
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
              Send instant email notifications on High Risk student flags
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary">
              <Save size={16} /> Save Portal Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
