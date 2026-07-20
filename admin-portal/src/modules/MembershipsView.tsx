import React from 'react';
import { Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import type { MembershipPlan } from '../types';

export const MembershipsView: React.FC = () => {
  const plans: MembershipPlan[] = [
    { id: 'PLAN-1', name: 'Basic Plan', price: 50, durationMonths: 1, active: true, features: ['Gym Floor Access', 'Locker Room Access', 'Standard Hours (8AM-8PM)'] },
    { id: 'PLAN-2', name: 'Standard Tier', price: 120, durationMonths: 3, active: true, features: ['Gym Floor & Pool', 'Locker Room & Sauna', 'Extended Hours (6AM-10PM)', '1 Personal Trainer Session'] },
    { id: 'PLAN-3', name: 'VIP Pass', price: 450, durationMonths: 12, active: true, features: ['All Facility Access 24/7', 'Private VIP Locker', 'Unlimited Guest Passes', 'Weekly Trainer Sessions', 'Complimentary Nutrition Consultation'] },
  ];

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Membership Subscription Tiers</h1>
          <p className="page-subtitle">Configure subscription packages, duration perks, and active student tiers.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {plans.map((p) => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: p.name === 'VIP Pass' ? '2px solid #1d4ed8' : '1px solid #e2e8f0' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: p.name === 'VIP Pass' ? '#1d4ed8' : '#64748b' }}>
                  {p.name === 'VIP Pass' && <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                  {p.name}
                </span>
                <span className="status-badge active">Active</span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Outfit', color: '#0f172a', marginBottom: '0.5rem' }}>
                ${p.price} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>/ {p.durationMonths} mo</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '1rem 0' }} />
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {p.features.map((feat) => (
                  <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
                    <CheckCircle size={16} color="#16a34a" /> {feat}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '1.75rem', width: '100%', justifyContent: 'center' }}
              onClick={() => alert(`Modifying perks for ${p.name}`)}
            >
              <ShieldCheck size={16} /> Edit Plan Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
