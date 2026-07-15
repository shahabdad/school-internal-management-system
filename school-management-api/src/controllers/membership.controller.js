const Membership = require('../models/membership.model');
const MembershipPlan = require('../models/membership-plan.model');
const Student = require('../models/student.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

module.exports = {
  getAllMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership,
};
