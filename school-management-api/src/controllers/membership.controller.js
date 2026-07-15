const MembershipPlan = require('../models/membership.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @route   GET /api/v1/memberships
 * @desc    Get all membership plans
 * @access  Private (All authenticated roles)
 */
const getAllPlans = catchAsync(async (req, res, next) => {
  const plans = await MembershipPlan.find({ active: true });

  res.status(200).json({
    status: 'success',
    results: plans.length,
    data: {
      plans,
    },
  });
});

/**
 * @route   GET /api/v1/memberships/:id
 * @desc    Get single membership plan by ID
 * @access  Private (All authenticated roles)
 */
const getPlan = catchAsync(async (req, res, next) => {
  const plan = await MembershipPlan.findById(req.params.id);

  if (!plan) {
    return next(new AppError('No membership plan found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

/**
 * @route   POST /api/v1/memberships
 * @desc    Create a new membership plan
 * @access  Private (Admin, CEO)
 */
const createPlan = catchAsync(async (req, res, next) => {
  const { name, price, duration, features } = req.body;

  const existingPlan = await MembershipPlan.findOne({ name });
  if (existingPlan) {
    return next(new AppError('Membership plan with that name already exists', 400));
  }

  const newPlan = await MembershipPlan.create({
    name,
    price,
    duration,
    features,
  });

  res.status(201).json({
    status: 'success',
    data: {
      plan: newPlan,
    },
  });
});

/**
 * @route   PUT /api/v1/memberships/:id
 * @desc    Update a membership plan
 * @access  Private (Admin, CEO, CustomerService)
 */
const updatePlan = catchAsync(async (req, res, next) => {
  const plan = await MembershipPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!plan) {
    return next(new AppError('No membership plan found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

/**
 * @route   DELETE /api/v1/memberships/:id
 * @desc    Delete a membership plan
 * @access  Private (Admin, CEO)
 */
const deletePlan = catchAsync(async (req, res, next) => {
  const plan = await MembershipPlan.findByIdAndDelete(req.params.id);

  if (!plan) {
    return next(new AppError('No membership plan found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
};
