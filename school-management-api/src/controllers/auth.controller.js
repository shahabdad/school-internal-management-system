const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const MembershipPlan = require('../models/membership-plan.model');
const Membership = require('../models/membership.model');
const Payment = require('../models/payment.model');
const ReminderJob = require('../models/reminder-job.model');
const Complaint = require('../models/complaint.model');
const CallLog = require('../models/call-log.model');
const Notification = require('../models/notification.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../services/email.service');

// Generate access tokens (short-lived)
const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE || '15m',
  });
};

// Generate refresh tokens (long-lived)
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE || '7d',
  });
};

// Standard response helper to set HTTP-only cookie and send response
const sendTokensResponse = (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Cookie security options for Refresh Token
  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // Default 7 days
    ),
    httpOnly: true, // Safeguards against XSS
    secure: process.env.NODE_ENV === 'production', // Require HTTPS in production
    sameSite: 'lax', // CSRF mitigation
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Omit password hash from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: {
      user,
    },
  });
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Prevent duplicate email registrations
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already registered', 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role: 'Student',
  });

  sendTokensResponse(newUser, 201, res);
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return tokens
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Retrieve user with password hash and active flag explicitly loaded
  const user = await User.findOne({ email }).select('+password +active');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Reject login for deactivated users
  if (user.active === false) {
    return next(new AppError('Your account is deactivated. Please contact support.', 401));
  }

  sendTokensResponse(user, 200, res);
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and clear refresh token cookie
 * @access  Public
 */
const logout = (req, res) => {
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000), // Expire immediately
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Issue new access tokens using a valid refresh token cookie
 * @access  Public
 */
const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return next(new AppError('No refresh token provided. Please log in.', 401));
  }

  // Verify signature and authenticity of refresh token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }

  // Confirm user still exists and select active field
  const currentUser = await User.findById(decoded.id).select('+active');
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // Reject refresh token for deactivated users
  if (currentUser.active === false) {
    return next(new AppError('Your account has been deactivated.', 401));
  }

  // Ensure password has not changed since the token's issuance
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // Sign and return a new short-lived Access Token
  const accessToken = signAccessToken(currentUser._id);

  res.status(200).json({
    status: 'success',
    accessToken,
  });
});

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Generate password reset token and send reset instructions
 * @access  Public
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Find user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Return same generic success response to avoid user enumeration
    return res.status(200).json({
      status: 'success',
      message: 'Token sent to email successfully!',
    });
  }

  // 2) Generate password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send email with token instructions
  const message = `Forgot your password? Send a POST request to /api/v1/auth/reset-password with your token and new password.\n\nYour reset token is: ${resetToken}\n\nThis token is valid for 10 minutes only. If you did not request this, please ignore this message.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email successfully!',
    });
  } catch (err) {
    // Clear reset credentials in the event of an email dispatch failure
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using a valid reset token
 * @access  Public
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token) {
    return next(new AppError('Reset token is required in request body.', 400));
  }

  // 1) Hash token and find user matching hashed token + valid expiry
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) Validate presence of user document
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  // 3) Update password, reset token fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) Login and send fresh authentication response
  sendTokensResponse(user, 200, res);
});
const seedDatabase = catchAsync(async (req, res, next) => {
  // 1) Clear existing data
  await User.deleteMany({});
  await Student.deleteMany({});
  await MembershipPlan.deleteMany({});
  await Membership.deleteMany({});
  await Payment.deleteMany({});
  await ReminderJob.deleteMany({});
  await Complaint.deleteMany({});
  await CallLog.deleteMany({});
  await Notification.deleteMany({});

  // 2) Seed Membership Plans
  const plans = await MembershipPlan.create([
    {
      name: 'Basic',
      price: 50,
      duration: 1,
      features: ['Access to Gym equipment', 'Locker Room access'],
      active: true,
    },
    {
      name: 'Premium',
      price: 120,
      duration: 3,
      features: ['Access to Gym & Pool', 'Locker Room access', '1 Trainer session/mo'],
      active: true,
    },
    {
      name: 'VIP',
      price: 400,
      duration: 12,
      features: ['All Access', 'Locker Room access', 'Unlimited Trainer sessions', 'Free smoothie bar'],
      active: true,
    },
  ]);

  const basicPlan = plans.find(p => p.name === 'Basic');

  // 3) Seed Users (Student and CS Agent)
  const studentUser = await User.create({
    name: 'Student User',
    email: 'student@example.com',
    password: 'password123',
    role: 'Student',
  });

  const csUser = await User.create({
    name: 'CS Agent',
    email: 'cs@example.com',
    password: 'password123',
    role: 'CustomerService',
  });

  // 4) Seed Student Profile
  const studentProfile = await Student.create({
    name: 'Student User',
    email: 'student@example.com',
    phone: '123-456-7890',
    address: '123 Main St, School Town',
    membership: 'Basic',
    status: 'Active',
  });

  // 5) Seed Student Membership (expiring in 15 days)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 15); // Started 15 days ago
  
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1); // Valid for 1 month (expires in 15 days from now)

  const createdMembership = await Membership.create({
    student: studentProfile._id,
    plan: basicPlan._id,
    startDate,
    endDate,
    status: 'Active',
  });

  // 6) Seed Reminder Job for starter membership
  const reminderDate = new Date(endDate);
  reminderDate.setDate(reminderDate.getDate() - 7);

  await ReminderJob.create({
    student: studentProfile._id,
    membership: createdMembership._id,
    reminderDate,
    status: 'Pending',
  });

  // 7) Seed starter Complaint
  await Complaint.create({
    student: studentProfile._id,
    title: 'Locker lock is broken',
    description: 'The lock of my locker #42 is broken and will not lock. Please repair it as soon as possible.',
    status: 'Created',
  });

  // 8) Seed starter Call Log
  await CallLog.create({
    student: studentProfile._id,
    agent: csUser._id,
    date: new Date(),
    duration: 180,
    result: 'Interested',
    notes: 'Called the student to follow up on gym portal activation. They expressed interest in upgrading to Premium.',
  });

  res.status(200).json({
    status: 'success',
    message: 'Database seeded successfully with default plans and credentials!',
    credentials: {
      student: { email: 'student@example.com', password: 'password123' },
      csAgent: { email: 'cs@example.com', password: 'password123' },
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  seedDatabase,
};

