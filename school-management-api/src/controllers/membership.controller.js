const Membership = require('../models/membership.model');
const MembershipPlan = require('../models/membership-plan.model');
const Student = require('../models/student.model');
const ReminderJob = require('../models/reminder-job.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const { createNotification } = require('./notification.controller');
const { logAction } = require('../utils/auditLogger');
const { checkAndNotifyRisk } = require('./student.controller');

/**
 * @route   GET /api/v1/memberships
 * @desc    Get all memberships
 * @access  Private (CS, Operations, Admin, CEO, Student own only)
 */
const getAllMemberships = catchAsync(async (req, res, next) => {
  let filter = {};

  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    const studentProfile = await Student.findOne({ email: req.user.email });
    if (!studentProfile) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: { memberships: [] }
      });
    }
    filter.student = studentProfile._id;
  }

  const memberships = await Membership.find(filter)
    .populate('student', 'name email status')
    .populate('plan', 'name price duration');

  res.status(200).json({
    status: 'success',
    results: memberships.length,
    data: {
      memberships,
    },
  });
});

/**
 * @route   GET /api/v1/memberships/:id
 * @desc    Get single membership
 * @access  Private (CS, Operations, Admin, CEO, Student own only)
 */
const getMembership = catchAsync(async (req, res, next) => {
  const membership = await Membership.findById(req.params.id)
    .populate('student', 'name email status')
    .populate('plan', 'name price duration');

  if (!membership) {
    return next(new AppError('No membership found with that ID', 404));
  }

  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    if (membership.student.email !== req.user.email) {
      return next(
        new AppError('You do not have permission to view this membership', 403)
      );
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      membership,
    },
  });
});

/**
 * @route   POST /api/v1/memberships
 * @desc    Manually create a membership subscription (Admin/CEO)
 * @access  Private (Admin, CEO)
 */
const createMembership = catchAsync(async (req, res, next) => {
  const { studentId, planId, startDate, status } = req.body;

  const student = await Student.findById(studentId);
  if (!student) {
    return next(new AppError('Student profile not found', 404));
  }

  const plan = await MembershipPlan.findById(planId);
  if (!plan) {
    return next(new AppError('Membership plan not found', 404));
  }

  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setMonth(start.getMonth() + plan.duration);

  const newMembership = await Membership.create({
    student: studentId,
    plan: planId,
    startDate: start,
    endDate: end,
    status: status || 'Active',
  });

  res.status(201).json({
    status: 'success',
    data: {
      membership: newMembership,
    },
  });
});

/**
 * @route   PUT /api/v1/memberships/:id
 * @desc    Update membership details/status (Admin, CS)
 * @access  Private (Admin, CEO, CustomerService)
 */
const updateMembership = catchAsync(async (req, res, next) => {
  // Allow updating status, startDate, endDate
  const { status, startDate, endDate } = req.body;

  const updatedData = {};
  if (status) updatedData.status = status;
  if (startDate) updatedData.startDate = startDate;
  if (endDate) updatedData.endDate = endDate;

  const membership = await Membership.findByIdAndUpdate(
    req.params.id,
    updatedData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!membership) {
    return next(new AppError('No membership found with that ID', 404));
  }

  // Log Update Membership action to database audit logs
  await logAction({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'Update Membership',
    module: 'Membership',
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    details: `Updated membership ID ${membership._id} (New Status: ${status || 'N/A'}, New Start Date: ${startDate || 'N/A'}, New End Date: ${endDate || 'N/A'})`
  });

  res.status(200).json({
    status: 'success',
    data: {
      membership,
    },
  });
});

/**
 * @route   DELETE /api/v1/memberships/:id
 * @desc    Delete a membership (Admin)
 * @access  Private (Admin, CEO)
 */
const deleteMembership = catchAsync(async (req, res, next) => {
  const membership = await Membership.findByIdAndDelete(req.params.id);

  if (!membership) {
    return next(new AppError('No membership found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @route   GET /api/v1/memberships/reminder-jobs
 * @desc    Get all scheduled membership reminder jobs
 * @access  Private (CS, Admin, CEO)
 */
const getAllReminderJobs = catchAsync(async (req, res, next) => {
  const reminderJobs = await ReminderJob.find()
    .populate({
      path: 'student',
      select: 'name email phone'
    })
    .populate({
      path: 'membership',
      populate: {
        path: 'plan',
        select: 'name price duration'
      }
    })
    .sort('reminderDate');

  res.status(200).json({
    status: 'success',
    results: reminderJobs.length,
    data: {
      reminderJobs,
    },
  });
});

/**
 * @route   POST /api/v1/memberships/simulate-expiry
 * @desc    Simulate membership expiry checks and trigger notifications
 * @access  Private (CS, Admin, CEO)
 */
const simulateExpiryCheck = catchAsync(async (req, res, next) => {
  const Notification = require('../models/notification.model');
  const memberships = await Membership.find({ status: { $in: ['Active', 'Expiring'] } });
  
  let expiredCount = 0;
  let expiringCount = 0;

  for (const membership of memberships) {
    const studentProfile = await Student.findById(membership.student);
    if (!studentProfile) continue;

    const studentUser = await User.findOne({ email: studentProfile.email });
    if (!studentUser) continue;

    const now = new Date();
    const expiry = new Date(membership.endDate);
    const msDiff = expiry.getTime() - now.getTime();
    const daysDiff = msDiff / (1000 * 60 * 60 * 24);

    if (daysDiff <= 0) {
      // Membership has expired
      membership.status = 'Expired';
      await membership.save();

      studentProfile.status = 'Expired';
      await studentProfile.save();

      await createNotification(
        studentUser._id,
        'Membership Expired',
        `Your membership subscription has expired. Please renew your membership to continue access.`,
        'membership_expired'
      );
      
      // Update ReminderJob status
      await ReminderJob.updateMany(
        { membership: membership._id, status: 'Pending' },
        { status: 'Failed' }
      );

      // Check risk and notify staff of risk level spikes
      await checkAndNotifyRisk(studentProfile._id, studentProfile.email, studentProfile.name);

      expiredCount++;
    } else if (daysDiff <= 7) {
      // Membership is expiring (<= 7 days remaining)
      // Check if they were already notified in the last 7 days to avoid spam
      const alreadyNotified = await Notification.findOne({
        user: studentUser._id,
        type: 'membership_expiring',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      if (!alreadyNotified) {
        membership.status = 'Expiring';
        await membership.save();

        await createNotification(
          studentUser._id,
          'Membership Expiring Soon',
          `Your membership subscription will expire on ${expiry.toLocaleDateString()} (in ${Math.ceil(daysDiff)} days). Please renew soon.`,
          'membership_expiring'
        );

        // Check risk and notify staff of risk level spikes
        await checkAndNotifyRisk(studentProfile._id, studentProfile.email, studentProfile.name);

        expiringCount++;
      }
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Membership status simulation check completed successfully.',
    data: {
      expiredCount,
      expiringCount,
    }
  });
});

module.exports = {
  getAllMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership,
  getAllReminderJobs,
  simulateExpiryCheck,
};

