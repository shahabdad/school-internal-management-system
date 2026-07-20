import React from 'react';
import { mockUsers } from '../services/api';
import { UserCheck, Shield } from 'lucide-react';

export const UsersView: React.FC = () => {
  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">System User Accounts</h1>
          <p className="page-subtitle">Manage administrative login credentials, staff accounts, and security access levels.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Last Active Session</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((usr) => (
              <tr key={usr.id}>
                <td><strong>{usr.id}</strong></td>
                <td>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <UserCheck size={16} color="#1d4ed8" /> {usr.name}
                  </div>
                </td>
                <td>{usr.email}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Shield size={12} /> {usr.role}
                  </span>
                </td>
                <td>{usr.lastLogin}</td>
                <td>
                  <span className={`status-badge ${usr.active ? 'active' : 'expired'}`}>
                    {usr.active ? 'Active' : 'Disabled'}
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
