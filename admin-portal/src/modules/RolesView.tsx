import React from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';

export const RolesView: React.FC = () => {
  const permissionsMatrix = [
    { module: 'User Accounts (users)', student: false, cs: false, ops: false, admin: true, ceo: true },
    { module: 'Student Profiles (students)', student: 'Own Records', cs: true, ops: true, admin: true, ceo: true },
    { module: 'Memberships (memberships)', student: 'Own Subscription', cs: true, ops: true, admin: true, ceo: true },
    { module: 'Payments & Receipts (payments)', student: 'Upload Own Proof', cs: 'Review & Approve', ops: 'Read Only', admin: 'Read Only', ceo: true },
    { module: 'Complaints (complaints)', student: 'File Ticket', cs: true, ops: 'Read Only', admin: 'Read Only', ceo: true },
    { module: 'Call Logs (call-logs)', student: false, cs: true, ops: 'Read Only', admin: 'Read Only', ceo: true },
    { module: 'Analytics & Reports (reports)', student: false, cs: false, ops: false, admin: 'Read Only', ceo: true },
    { module: 'Executive Dashboard (dashboard)', student: false, cs: true, ops: true, admin: true, ceo: true },
  ];

  const renderCell = (val: boolean | string) => {
    if (val === true) return <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Check size={16} /> Allowed</span>;
    if (val === false) return <span style={{ color: '#dc2626', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><X size={16} /> Restricted</span>;
    return <span style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.8rem' }}>{val}</span>;
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Role-Based Access Control (RBAC)</h1>
          <p className="page-subtitle">Granular security permissions matrix configured across system modules.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Module / Resource</th>
              <th>Student</th>
              <th>Customer Service</th>
              <th>Operations Manager</th>
              <th>Admin</th>
              <th>CEO</th>
            </tr>
          </thead>
          <tbody>
            {permissionsMatrix.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={16} color="#1d4ed8" /> {row.module}
                  </div>
                </td>
                <td>{renderCell(row.student)}</td>
                <td>{renderCell(row.cs)}</td>
                <td>{renderCell(row.ops)}</td>
                <td>{renderCell(row.admin)}</td>
                <td>{renderCell(row.ceo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
