import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Wallet, Calendar, Plus, ChevronDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { StatCard } from '../components/ui/StatCard';
import { MiniStatCard } from '../components/ui/MiniStatCard';
import { RecentActivity } from '../components/RecentActivity';
import { GenerateReportModal } from '../components/GenerateReportModal';
import { useDashboardStats, useRevenueTrends, useRecentActivities } from '../hooks/useDashboard';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { data: metrics } = useDashboardStats();
  const { data: revenueTrends } = useRevenueTrends();
  const { data: activities } = useRecentActivities();

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

  const chartData = revenueTrends || [
    { month: 'Jan', revenue: 42000 },
    { month: 'Feb', revenue: 53000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 57000 },
    { month: 'Jun', revenue: 72000 },
    { month: 'Jul', revenue: 67000 },
    { month: 'Aug', revenue: 85000 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="page-container"
    >
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, Alex. Here's what's happening at Academix Pro today.</p>
        </div>
        <Button onClick={() => setIsReportModalOpen(true)}>
          <Plus size={18} />
          <span>Generate Report</span>
        </Button>
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
        {/* Left Column: Recharts Graph + 3 Mini Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Revenue Trends</div>
                <div className="card-subtitle">Monthly overview of financial collections</div>
              </div>
              <button type="button" className="time-filter-btn">
                Last 6 Months <ChevronDown size={14} />
              </button>
            </div>

            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`$${value?.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#ffffff', border: 'none' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1d4ed8"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mini-stats-grid">
            <MiniStatCard
              title="Expiring Memberships"
              value={currentMetrics.expiringMemberships}
              progressPercent={40}
              colorClass="bg-blue-600"
            />

            <MiniStatCard
              title="Expired Memberships"
              value={currentMetrics.expiredMemberships}
              progressPercent={22}
              colorClass="bg-red-600"
              valColor="#dc2626"
            />

            <MiniStatCard
              title="Calls Today"
              value={currentMetrics.callsToday}
              progressPercent={65}
              colorClass="bg-slate-700"
            />
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <RecentActivity activities={activities || []} />
      </div>

      {/* Modal Dialog */}
      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </motion.div>
  );
};
