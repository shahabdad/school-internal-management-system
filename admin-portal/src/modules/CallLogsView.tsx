import React from 'react';
import { mockCallLogs } from '../services/api';
import { PhoneCall, Clock, UserCheck } from 'lucide-react';

export const CallLogsView: React.FC = () => {
  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Customer Service Call Logs</h1>
          <p className="page-subtitle">Track outbound customer service support calls, parent inquiries, and retention conversion rates.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Call ID</th>
              <th>CS Agent</th>
              <th>Student / Contact</th>
              <th>Duration</th>
              <th>Result</th>
              <th>Date</th>
              <th>Interaction Notes</th>
            </tr>
          </thead>
          <tbody>
            {mockCallLogs.map((log) => (
              <tr key={log.id}>
                <td><strong>{log.id}</strong></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <UserCheck size={16} color="#1d4ed8" /> {log.agentName}
                  </div>
                </td>
                <td><strong>{log.studentName}</strong></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <Clock size={14} /> {Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${log.result === 'Joined' ? 'active' : log.result === 'Follow-up' ? 'expiring' : 'pending'}`}>
                    <PhoneCall size={12} style={{ marginRight: '4px' }} />
                    {log.result}
                  </span>
                </td>
                <td>{log.date}</td>
                <td style={{ fontSize: '0.8rem', color: '#334155', maxWidth: '280px' }}>{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
