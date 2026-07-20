import React from 'react';
import { mockAuditLogs } from '../services/api';
import { ShieldAlert } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Immutable Security Audit Logs</h1>
          <p className="page-subtitle">Real-time ledger tracking administrative actions, user changes, and API events.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>User Email</th>
              <th>Action Triggered</th>
              <th>Module</th>
              <th>IP Address</th>
              <th>Timestamp</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {mockAuditLogs.map((log) => (
              <tr key={log.id}>
                <td><strong>{log.id}</strong></td>
                <td>{log.userEmail}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    <ShieldAlert size={12} color="#1d4ed8" /> {log.action}
                  </span>
                </td>
                <td><strong>{log.module}</strong></td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ipAddress}</td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.timestamp}</td>
                <td style={{ fontSize: '0.8rem', color: '#334155' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
