const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
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
  const { name, email, password, role } = req.body;

  // Prevent duplicate email registrations
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

  sendTokensResponse(newUser, 201, res);
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return tokens
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Retrieve user with password hash explicitly loaded
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
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

  // Confirm user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
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
    return next(new AppError('There is no user with that email address.', 404));
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

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
};
