import React, { useState } from 'react';
import { mockPayments } from '../services/api';
import { Check, XCircle, FileText } from 'lucide-react';
import type { Payment } from '../types';

export const PaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  const handleApprove = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p))
    );
  };

  const handleReject = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p))
    );
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Payments & Receipts</h1>
          <p className="page-subtitle">Verify student billing receipts, approve pending transactions, and track revenue.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Student Name</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Proof</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.id}</strong></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.studentName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.studentEmail}</div>
                </td>
                <td>{p.planName}</td>
                <td><strong style={{ fontSize: '1rem', color: '#0f172a' }}>${p.amount}.00</strong></td>
                <td>{p.date}</td>
                <td>
                  <span className={`status-badge ${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#1d4ed8', fontSize: '0.8rem', fontWeight: 600 }}
                    onClick={() => alert(`Viewing receipt for ${p.id}`)}
                  >
                    <FileText size={14} /> Receipt.pdf
                  </button>
                </td>
                <td>
                  {p.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleApprove(p.id)}
                        style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(p.id)}
                        style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
