const Payment = require('../models/payment.model');
const Membership = require('../models/membership.model');
const Complaint = require('../models/complaint.model');
const CallLog = require('../models/call-log.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../services/email.service');

/**
 * Helper to gather report data based on report type
 * @param {string} reportType 
 * @returns {Promise<Array|null>}
 */
const getReportDataHelper = async (reportType) => {
  let reportData = [];

  switch (reportType) {
    case 'revenue':
      // Monthly billing aggregates for approved payments
      reportData = await Payment.aggregate([
        { $match: { status: 'Approved' } },
        {
          $group: {
            _id: {
              year: { $year: '$reviewedAt' },
              month: { $month: '$reviewedAt' }
            },
            transactionCount: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      ]);
      // Format response keys nicely
      reportData = reportData.map(item => ({
        period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        transactionCount: item.transactionCount,
        totalAmount: Number(item.totalAmount.toFixed(2)),
        avgAmount: Number(item.avgAmount.toFixed(2))
      }));
      break;

    case 'membership':
      // Subscription plans distribution and active vs expired status counts
      reportData = await Membership.aggregate([
        {
          $group: {
            _id: {
              planId: '$plan',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'membershipplans',
            localField: '_id.planId',
            foreignField: '_id',
            as: 'planInfo'
          }
        },
        { $unwind: '$planInfo' },
        {
          $project: {
            _id: 0,
            planName: '$planInfo.name',
            status: '$_id.status',
            count: 1
          }
        },
        { $sort: { planName: 1, status: 1 } }
      ]);
      break;

    case 'payment':
      // Transaction-level logging with status, amounts and reviewers
      const rawPayments = await Payment.find()
        .populate('student', 'name email')
        .populate('plan', 'name price')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

      reportData = rawPayments.map(p => ({
        studentName: p.student ? p.student.name : 'Unknown Student',
        studentEmail: p.student ? p.student.email : 'N/A',
        planName: p.plan ? p.plan.name : 'N/A',
        amount: p.amount,
        status: p.status,
        submittedAt: p.createdAt.toISOString().split('T')[0],
        reviewedBy: p.reviewedBy ? p.reviewedBy.name : 'N/A'
      }));
      break;

    case 'complaint':
      // Complaint statistics per CS agent workload & resolution rates
      reportData = await Complaint.aggregate([
        {
          $group: {
            _id: '$assignedStaff',
            totalAssigned: { $sum: 1 },
            solvedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] }
            },
            closedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
            },
            underReviewCount: {
              $sum: { $cond: [{ $eq: ['$status', 'UnderReview'] }, 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'staffInfo'
          }
        },
        { $unwind: { path: '$staffInfo', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            staffName: { $ifNull: ['$staffInfo.name', 'Unassigned'] },
            staffEmail: { $ifNull: ['$staffInfo.email', 'N/A'] },
            totalAssigned: 1,
            solvedCount: 1,
            closedCount: 1,
            underReviewCount: 1
          }
        },
        { $sort: { totalAssigned: -1 } }
      ]);
      break;

    case 'team-performance':
      // CS Agent performance KPIs (Call outcomes and average durations)
      reportData = await CallLog.aggregate([
        {
          $group: {
            _id: '$agent',
            totalCalls: { $sum: 1 },
            avgDuration: { $avg: '$duration' },
            joinedCount: {
              $sum: { $cond: [{ $eq: ['$result', 'Joined'] }, 1, 0] }
            },
            upgradedCount: {
              $sum: { $cond: [{ $eq: ['$result', 'Upgraded'] }, 1, 0] }
            },
            followUpCount: {
              $sum: { $cond: [{ $eq: ['$result', 'Follow-up'] }, 1, 0] }
            },
            noAnswerCount: {
              $sum: { $cond: [{ $eq: ['$result', 'No Answer'] }, 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'agentInfo'
          }
        },
        { $unwind: { path: '$agentInfo', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            agentName: { $ifNull: ['$agentInfo.name', 'Unknown Agent'] },
            agentEmail: { $ifNull: ['$agentInfo.email', 'N/A'] },
            totalCalls: 1,
            avgDuration: { $round: ['$avgDuration', 1] },
            conversions: { $add: ['$joinedCount', '$upgradedCount'] },
            followUpCount: 1,
            noAnswerCount: 1
          }
        },
        { $sort: { totalCalls: -1 } }
      ]);
      break;

    default:
      return null;
  }

  return reportData;
};

/**
 * @route   GET /api/v1/reports/:reportType
 * @desc    Generate one of five operational reports
 * @access  Private (CS, Operations, Admin, CEO)
 */
const getReport = catchAsync(async (req, res, next) => {
  const { reportType } = req.params;
  const reportData = await getReportDataHelper(reportType);

  if (!reportData) {
    return next(new AppError('Invalid report type requested', 400));
  }

  res.status(200).json({
    status: 'success',
    reportType,
    results: reportData.length,
    data: {
      report: reportData
    }
  });
});

/**
 * @route   POST /api/v1/reports/:reportType/sync-sheets
 * @desc    Simulate syncing report to Google Sheets
 * @access  Private (CS, Operations, Admin, CEO)
 */
const syncGoogleSheets = catchAsync(async (req, res, next) => {
  const { reportType } = req.params;
  const reportData = await getReportDataHelper(reportType);

  if (!reportData) {
    return next(new AppError('Invalid report type requested', 400));
  }

  // Simulate process sync wait time slightly (e.g. 200ms)
  await new Promise(resolve => setTimeout(resolve, 200));

  const sheetId = `mock_sheet_${reportType}_${Date.now().toString(36)}`;
  const sheetUrl = `/google-sheets-mock.html?type=${reportType}&sheetId=${sheetId}`;

  res.status(200).json({
    status: 'success',
    message: 'Report synced to Google Sheets successfully',
    data: {
      reportType,
      sheetId,
      sheetUrl,
      rowCount: reportData.length,
      syncedAt: new Date().toISOString()
    }
  });
});

/**
 * @route   POST /api/v1/reports/:reportType/email-ceo
 * @desc    Format report to HTML and send via email to CEO
 * @access  Private (CS, Operations, Admin, CEO)
 */
const emailReportToCEO = catchAsync(async (req, res, next) => {
  const { reportType } = req.params;
  const reportData = await getReportDataHelper(reportType);

  if (!reportData) {
    return next(new AppError('Invalid report type requested', 400));
  }

  // Find user with CEO role in DB
  const ceoUser = await User.findOne({ role: 'CEO', active: true });
  const ceoEmail = ceoUser ? ceoUser.email : 'ceo@schoolmanagement.com';
  const ceoName = ceoUser ? ceoUser.name : 'CEO';

  // Format report data as HTML table
  let tableHeaders = '';
  let tableRows = '';
  
  if (reportData.length > 0) {
    const keys = Object.keys(reportData[0]);
    tableHeaders = keys.map(k => `<th style="border: 1px solid #e2e8f0; padding: 10px; background-color: #f1f5f9; text-align: left; color: #0f172a; font-weight: 700;">${k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`).join('');
    
    tableRows = reportData.map((row, index) => {
      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = keys.map(k => {
        let val = row[k];
        if (val === null || val === undefined) {
          val = 'N/A';
        } else if (typeof val === 'number' && (k.toLowerCase().includes('amount') || k.toLowerCase().includes('revenue'))) {
          val = `$${val.toFixed(2)}`;
        }
        return `<td style="border: 1px solid #e2e8f0; padding: 10px; color: #334155;">${val}</td>`;
      }).join('');
      return `<tr style="background-color: ${rowBg};">${cells}</tr>`;
    }).join('');
  } else {
    tableHeaders = '<th style="border: 1px solid #e2e8f0; padding: 10px; background-color: #f1f5f9;">No data</th>';
    tableRows = '<tr><td style="border: 1px solid #e2e8f0; padding: 10px; text-align: center; color: #64748b;">No data available.</td></tr>';
  }

  const reportTitleMap = {
    'revenue': 'Revenue Report',
    'membership': 'Membership Report',
    'payment': 'Payment Transaction Report',
    'complaint': 'Complaint Workload Report',
    'team-performance': 'Team Call Performance Report'
  };
  const reportTitle = reportTitleMap[reportType] || 'Operational Report';

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 25px;">
        <span style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; padding: 6px 12px; border-radius: 6px; font-weight: 800; font-size: 20px; margin-right: 10px;">S</span>
        <h2 style="display: inline-block; color: #0f172a; margin: 0; font-size: 22px; vertical-align: middle;">School Internal Management</h2>
        <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Automated Reporting Service</p>
      </div>

      <p style="font-size: 16px; line-height: 1.5;">Hello <strong>${ceoName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.5; color: #475569;">The operational report <strong>${reportTitle}</strong> has been successfully generated and formatted for your review. Below you will find the dynamic summary aggregates.</p>
      
      <div style="margin: 25px 0; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      
      <div style="background-color: #f8fafc; border-left: 4px solid #06b6d4; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
          <strong>Security Notice:</strong> This report contains internal operations data and billing metrics. Please do not share this email or its contents outside the organization.
        </p>
      </div>
      
      <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 30px; text-align: center;">
        Generated on: ${new Date().toLocaleString()} | School Management System Reports Server<br>
        This is an automated operational report sent directly from your management portal.
      </p>
    </div>
  `;

  const emailText = `Hello ${ceoName},\n\nThe operational report ${reportTitle} has been generated.\n\nGenerated on: ${new Date().toLocaleString()}\n\nPlease view the formatted details in your email client or log in to the management panel.`;

  // Send the email (mocked or production)
  await sendEmail({
    email: ceoEmail,
    subject: `📊 [SIMS Report] ${reportTitle} - ${new Date().toISOString().split('T')[0]}`,
    message: emailText,
    html: emailHtml
  });

  res.status(200).json({
    status: 'success',
    message: `Report successfully emailed to CEO (${ceoEmail})`,
    data: {
      recipient: ceoEmail,
      subject: `📊 [SIMS Report] ${reportTitle} - ${new Date().toISOString().split('T')[0]}`,
      body: emailHtml
    }
  });
});

module.exports = {
  getReport,
  syncGoogleSheets,
  emailReportToCEO
};
