const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private (Admin, CEO, CustomerService, OperationsManager)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    return next(
      new AppError('You do not have permission to view all users', 403)
    );
  }

  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get single user by ID
 * @access  Private (Own profile or Admin/CEO/CS/Operations)
 */
const getUser = catchAsync(async (req, res, next) => {
  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    if (req.user.id !== req.params.id) {
      return next(
        new AppError('You do not have permission to view other user profiles', 403)
      );
    }
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user (for Admins / CEOs to provision accounts)
 * @access  Private (Admin, CEO)
 */
const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already registered', 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role,
  });

  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update a user
 * @access  Private (Own profile or Admin/CEO)
 */
const updateUser = catchAsync(async (req, res, next) => {
  // Prevent password update via this route
  if (req.body.password) {
    return next(
      new AppError('This route is not for password updates. Please use reset-password.', 400)
    );
  }

  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    if (req.user.id !== req.params.id) {
      return next(
        new AppError('You do not have permission to update other user profiles', 403)
      );
    }

    // Prevent role escalation (e.g. Student changing their own role to Admin/CEO)
    if (req.body.role && req.body.role !== req.user.role) {
      return next(
        new AppError('You do not have permission to change your own role', 403)
      );
    }
  }

  // Filter allowed fields for update
  const filteredBody = {};
  const allowedFields = ['name', 'email'];
  
  // Admins and CEOs can change roles and active status
  if (['Admin', 'CEO'].includes(req.user.role)) {
    allowedFields.push('role', 'active');
  }

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user
 * @access  Private (Admin, CEO)
 */
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
