import React, { useState, useEffect } from 'react';
import { Users, Award, Wallet, Calendar, Plus } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { RecentActivity } from '../components/RecentActivity';
import { MiniStatCard } from '../components/MiniStatCard';
import { GenerateReportModal } from '../components/GenerateReportModal';
import { fetchDashboardMetrics, mockActivities } from '../services/api';
import type { DashboardMetrics, TabType } from '../types';

interface DashboardViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardMetrics().then((data) => setMetrics(data));
  }, []);

  const currentMetrics = metrics || {
    totalStudents: 4250,
    totalStudentsGrowth: '+12%',
    activeMembers: 3800,
    activeMembersGrowth: '+5%',
    monthlyRevenue: 85000,
    revenueTarget: 'Target: 95%',
    pendingPayments: 12400,
    pendingPaymentsBadge: 'Priority',
    expiringMemberships: 120,
    expiredMemberships: 45,
    callsToday: 24,
  };

  return (
    <div className="page-container">
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, Alex. Here's what's happening at Academix Pro today.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsReportModalOpen(true)}
        >
          <Plus size={18} />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Top 4 Stat Cards Row */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={currentMetrics.totalStudents.toLocaleString()}
          badgeText={currentMetrics.totalStudentsGrowth}
          badgeType="growth"
          icon={<Users size={22} />}
          iconBg="#dbeafe"
          iconColor="#1d4ed8"
        />

        <StatCard
          title="Active Members"
          value={currentMetrics.activeMembers.toLocaleString()}
          badgeText={currentMetrics.activeMembersGrowth}
          badgeType="growth"
          icon={<Award size={22} />}
          iconBg="#dcfce7"
          iconColor="#15803d"
        />

        <StatCard
          title="Monthly Revenue"
          value={`$${currentMetrics.monthlyRevenue.toLocaleString()}`}
          badgeText={currentMetrics.revenueTarget}
          badgeType="target"
          icon={<Wallet size={22} />}
          isFeatured={true}
        />

        <StatCard
          title="Pending Payments"
          value={`$${currentMetrics.pendingPayments.toLocaleString()}`}
          badgeText={currentMetrics.pendingPaymentsBadge}
          badgeType="priority"
          icon={<Calendar size={22} />}
          iconBg="#fee2e2"
          iconColor="#dc2626"
        />
      </div>

      {/* Middle Grid: Revenue Trends + Recent Activity */}
      <div className="dashboard-middle-grid">
        {/* Left Column: Revenue Chart + 3 Mini Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RevenueChart />

          <div className="mini-stats-grid">
            <MiniStatCard
              title="Expiring Memberships"
              value={currentMetrics.expiringMemberships}
              progressPercent={40}
              colorClass="progress-blue"
            />

            <MiniStatCard
              title="Expired Memberships"
              value={currentMetrics.expiredMemberships}
              progressPercent={22}
              colorClass="progress-red"
              valColor="#dc2626"
            />

            <MiniStatCard
              title="Calls Today"
              value={currentMetrics.callsToday}
              progressPercent={65}
              colorClass="progress-dark"
            />
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <RecentActivity
          activities={mockActivities}
          onViewAll={() => setActiveTab('audit-logs')}
        />
      </div>

      {/* Modal Dialog for "+ Generate Report" */}
      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
