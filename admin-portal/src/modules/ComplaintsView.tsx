import React from 'react';
import { mockComplaints } from '../services/api';
import { AlertTriangle, UserCheck } from 'lucide-react';

export const ComplaintsView: React.FC = () => {
  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Support Complaints & Tickets</h1>
          <p className="page-subtitle">Monitor customer service feedback tickets raised by students and assign operations staff.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Student Name</th>
              <th>Issue Title</th>
              <th>Description</th>
              <th>Assigned Staff</th>
              <th>Date Filed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockComplaints.map((cmp) => (
              <tr key={cmp.id}>
                <td><strong>{cmp.id}</strong></td>
                <td><strong>{cmp.studentName}</strong></td>
                <td>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={16} color="#dc2626" /> {cmp.title}
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '260px' }}>{cmp.description}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <UserCheck size={14} color="#64748b" /> {cmp.assignedStaff}
                  </div>
                </td>
                <td>{cmp.date}</td>
                <td>
                  <span className={`status-badge ${cmp.status === 'Solved' ? 'approved' : cmp.status === 'Assigned' ? 'expiring' : 'expired'}`}>
                    {cmp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
