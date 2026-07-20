import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, ShieldAlert } from 'lucide-react';
import { GenerateReportModal } from '../components/GenerateReportModal';

export const ReportsView: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Executive Reports & Analytics</h1>
          <p className="page-subtitle">Generate financial, student retention, and operations analytics summaries.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
          <Download size={18} />
          <span>Export Analytics</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Financial Growth Rate</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit' }}>+24.8% YoY</div>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Based on Q2 vs Q1 collections audit.</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Retention Rate</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit' }}>89.4% Active</div>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Memberships renewed within 7 days of expiry.</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>High Risk Flagged</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit' }}>3 Students</div>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Flags: Expiring payment proof + unresolved ticket.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Available Automated System Reports</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { title: 'Monthly Collections & Revenue Ledger', desc: 'Detailed breakdown of all tuition payments, subscriptions, and payment proofs.', type: 'Financial' },
            { title: 'Student Membership Expiration Risk Matrix', desc: 'Forecast of members expiring in the next 14 to 30 days requiring CS outreach.', type: 'Operations' },
            { title: 'Customer Support Escalation & Ticket Resolution Audit', desc: 'Staff turnaround metrics and complaint closing ratios.', type: 'Customer Service' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <BarChart3 size={24} color="#1d4ed8" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.desc}</div>
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setModalOpen(true)}
              >
                Generate
              </button>
            </div>
          ))}
        </div>
      </div>

      <GenerateReportModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
