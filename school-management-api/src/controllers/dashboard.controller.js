const Student = require('../models/student.model');
const Membership = require('../models/membership.model');
const Payment = require('../models/payment.model');
const Complaint = require('../models/complaint.model');
const CallLog = require('../models/call-log.model');
const catchAsync = require('../utils/catchAsync');
const { getRiskDetailsForStudent } = require('./student.controller');

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Fetch aggregated statistics for customer service dashboard
 * @access  Private (CS, Operations, Admin, CEO)
 */
const getDashboardStats = catchAsync(async (req, res, next) => {
  // 1) Total Students Count
  const totalStudents = await Student.countDocuments();

  // 2) Active Members Count
  const activeMembers = await Membership.countDocuments({ status: 'Active' });

  // 3) Pending Payments Count
  const pendingPayments = await Payment.countDocuments({ status: 'Pending' });

  // 4) Monthly Revenue aggregation (Sum of Approved payments in the current month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const revenueAgg = await Payment.aggregate([
    {
      $match: {
        status: 'Approved',
        reviewedAt: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);
  const monthlyRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  // 5) Complaint Statistics (Grouped by status)
  const complaintsAgg = await Complaint.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
  const complaints = {
    Created: 0,
    Assigned: 0,
    UnderReview: 0,
    Solved: 0,
    Closed: 0,
    total: 0,
  };
  complaintsAgg.forEach((item) => {
    if (item._id in complaints) {
      complaints[item._id] = item.count;
    }
    complaints.total += item.count;
  });

  // 6) Customer Service Call Logs Performance
  const callsAgg = await CallLog.aggregate([
    {
      $group: {
        _id: '$result',
        count: { $sum: 1 },
      },
    },
  ]);
  const calls = {
    'No Answer': 0,
    'Interested': 0,
    'Follow-up': 0,
    'Joined': 0,
    'Upgraded': 0,
    total: 0,
  };
  callsAgg.forEach((item) => {
    if (item._id in calls) {
      calls[item._id] = item.count;
    }
    calls.total += item.count;
  });

  const durationAgg = await CallLog.aggregate([
    {
      $group: {
        _id: null,
        avgDuration: { $avg: '$duration' },
      },
    },
  ]);
  const avgCallDuration = durationAgg.length > 0 ? Math.round(durationAgg[0].avgDuration) : 0;

  // 7) Priority Support Queue (Sorted by Risk Score Descending)
  const students = await Student.find();
  const highRiskStudents = [];
  for (const student of students) {
    const riskDetails = await getRiskDetailsForStudent(student._id, student.email);
    highRiskStudents.push({
      id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      riskLevel: riskDetails.level,
      riskDetails,
    });
  }
  highRiskStudents.sort((a, b) => b.riskDetails.score - a.riskDetails.score);

  res.status(200).json({
    status: 'success',
    data: {
      metrics: {
        totalStudents,
        activeMembers,
        pendingPayments,
        monthlyRevenue,
      },
      complaints,
      csPerformance: {
        calls,
        avgCallDuration,
      },
      highRiskStudents,
    },
  });
});

module.exports = {
  getDashboardStats,
};
