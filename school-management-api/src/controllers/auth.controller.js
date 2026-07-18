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
const AuditLog = require('../models/audit-log.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../services/email.service');
const { logAction } = require('../utils/auditLogger');

// Generate access tokens (short-lived)
const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE || '15m',
  });
};

// Generate refresh tokens (long-lived) with JTI for rotation tracking
const signRefreshToken = (id, jti) => {
  return jwt.sign({ id, jti }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE || '7d',
  });
};

// Standard response helper to set HTTP-only cookie and send response
const sendTokensResponse = async (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id);
  const jti = crypto.randomBytes(16).toString('hex');
  const refreshToken = signRefreshToken(user._id, jti);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Track active refresh token
  user.activeRefreshTokens.push({ jti, expiresAt });
  await user.save({ validateBeforeSave: false });

  // Cookie security options for Refresh Token
  const cookieOptions = {
    expires: expiresAt,
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

  await sendTokensResponse(newUser, 201, res);
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

  // Generate a random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  
  user.twoFactorOTP = otp;
  user.twoFactorOTPExpires = Date.now() + 5 * 60 * 1000; // 5 mins
  await user.save({ validateBeforeSave: false });

  // Send mock email
  await sendEmail({
    email: user.email,
    subject: 'Your 2FA Verification Code',
    message: `Your login verification code is: ${otp}. This code is valid for 5 minutes.`
  });

  res.status(200).json({
    status: 'success',
    message: 'OTP sent to email. Please verify 2FA.',
    twoFactorRequired: true,
    userId: user._id,
    email: user.email,
    otp, // returned to allow seamless frontend pre-fill and visual testing!
  });
});

// Helper to parse user agent for browser and OS recognition
const parseUserAgent = (userAgentString) => {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (!userAgentString) return { browser, os };

  // Parse browser
  if (userAgentString.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgentString.includes('Chrome') && !userAgentString.includes('Chromium') && !userAgentString.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgentString.includes('Safari') && !userAgentString.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgentString.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgentString.includes('MSIE') || userAgentString.includes('Trident')) {
    browser = 'Internet Explorer';
  }

  // Parse OS
  if (userAgentString.includes('Windows')) {
    os = 'Windows';
  } else if (userAgentString.includes('Macintosh') || userAgentString.includes('Mac OS')) {
    os = 'macOS';
  } else if (userAgentString.includes('Linux')) {
    os = 'Linux';
  } else if (userAgentString.includes('Android')) {
    os = 'Android';
  } else if (userAgentString.includes('like Mac OS X')) {
    os = 'iOS';
  }

  return { browser, os };
};

/**
 * @route   POST /api/v1/auth/verify-2fa
 * @desc    Verify 2FA OTP and return tokens
 * @access  Public
 */
const verify2FA = catchAsync(async (req, res, next) => {
  const { userId, otp, deviceId } = req.body;

  if (!userId || !otp) {
    return next(new AppError('Please provide user ID and verification code', 400));
  }

  const user = await User.findById(userId).select('+active');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.active === false) {
    return next(new AppError('Your account has been deactivated.', 401));
  }

  if (!user.twoFactorOTP || user.twoFactorOTP !== otp || user.twoFactorOTPExpires < Date.now()) {
    return next(new AppError('Invalid or expired verification code', 400));
  }

  // Clear OTP fields
  user.twoFactorOTP = undefined;
  user.twoFactorOTPExpires = undefined;

  const userAgentString = req.headers['user-agent'] || '';
  const { browser, os } = parseUserAgent(userAgentString);
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // --- DEVICE RECOGNITION SYSTEM ---
  if (deviceId) {
    let device = user.devices.find(d => d.deviceId === deviceId);

    if (device) {
      if (device.approved) {
        // Device recognized and approved
        device.lastUsedAt = Date.now();
        device.ipAddress = ipAddress;
        await user.save({ validateBeforeSave: false });

        await logAction({
          userId: user._id,
          userEmail: user.email,
          action: 'User Login',
          module: 'Auth',
          ipAddress,
          details: `User completed 2FA login successfully from recognized device: ${browser} on ${os} (Role: ${user.role})`
        });

        sendTokensResponse(user, 200, res);
        return;
      } else {
        // Device exists but pending approval (regenerate token and re-send email)
        const approvalToken = crypto.randomBytes(32).toString('hex');
        device.approvalToken = approvalToken;
        device.approvalTokenExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        device.ipAddress = ipAddress;
        
        await user.save({ validateBeforeSave: false });

        const approvalLink = `${req.protocol}://${req.get('host')}/api/v1/auth/approve-device?token=${approvalToken}`;

        await sendEmail({
          email: user.email,
          subject: 'New login detected',
          message: `We detected a login attempt to your account from a new device / browser:
- Browser: ${browser}
- OS: ${os}
- IP Address: ${ipAddress}
- Date: ${new Date().toLocaleString()}

Please approve this device by clicking the link below:
${approvalLink}

If this was not you, please secure your account immediately.`
        });

        await Notification.create({
          user: user._id,
          title: 'Unrecognized Device Login',
          message: `A login was attempted from an unrecognized device (${browser} on ${os}). Verification email sent.`,
          type: 'device_unrecognized'
        });

        res.status(200).json({
          status: 'success',
          deviceApprovalRequired: true,
          userId: user._id,
          deviceId: deviceId,
          approvalToken,
          message: 'Device approval required. An email has been sent to verify this device.'
        });
        return;
      }
    } else {
      // Completely new device
      const approvalToken = crypto.randomBytes(32).toString('hex');
      
      user.devices.push({
        deviceId,
        browserName: browser,
        os,
        ipAddress,
        approved: false,
        approvalToken,
        approvalTokenExpires: Date.now() + 10 * 60 * 1000
      });

      await user.save({ validateBeforeSave: false });

      const approvalLink = `${req.protocol}://${req.get('host')}/api/v1/auth/approve-device?token=${approvalToken}`;

      await sendEmail({
        email: user.email,
        subject: 'New login detected',
        message: `We detected a login attempt to your account from a new device / browser:
- Browser: ${browser}
- OS: ${os}
- IP Address: ${ipAddress}
- Date: ${new Date().toLocaleString()}

Please approve this device by clicking the link below:
${approvalLink}

If this was not you, please secure your account immediately.`
      });

      await Notification.create({
        user: user._id,
        title: 'Unrecognized Device Login',
        message: `A login was attempted from an unrecognized device (${browser} on ${os}). Verification email sent.`,
        type: 'device_unrecognized'
      });

      await logAction({
        userId: user._id,
        userEmail: user.email,
        action: 'Unrecognized Device Login Attempt',
        module: 'Auth',
        ipAddress,
        details: `Login attempted from unrecognized device: ${browser} on ${os}. Approval email dispatched.`
      });

      res.status(200).json({
        status: 'success',
        deviceApprovalRequired: true,
        userId: user._id,
        deviceId: deviceId,
        approvalToken,
        message: 'Device approval required. An email has been sent to verify this device.'
      });
      return;
    }
  }

  // Fallback
  await user.save({ validateBeforeSave: false });

  await logAction({
    userId: user._id,
    userEmail: user.email,
    action: 'User Login',
    module: 'Auth',
    ipAddress,
    details: `User completed 2FA login successfully without device tracking (Role: ${user.role})`
  });

  sendTokensResponse(user, 200, res);
});

/**
 * @route   GET /api/v1/auth/approve-device
 * @desc    Approve a device using the approval token sent via email
 * @access  Public
 */
const approveDevice = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next(new AppError('Device approval token is missing', 400));
  }

  const user = await User.findOne({
    'devices.approvalToken': token,
    'devices.approvalTokenExpires': { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).send(`
      <html>
        <head>
          <title>Device Approval Failed</title>
          <style>
            body { font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; background: radial-gradient(circle at top, #0f172a 0%, #020617 100%); color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: rgba(30, 41, 59, 0.4); padding: 2.5rem; border-radius: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.05); text-align: center; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(16px); }
            h1 { color: #ef4444; margin-top: 0; font-size: 1.8rem; }
            p { color: #94a3b8; line-height: 1.5; font-size: 0.95rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌ Approval Failed</h1>
            <p>The device approval link is invalid or has expired. Please try logging in again to request a new link.</p>
          </div>
        </body>
      </html>
    `);
  }

  const device = user.devices.find(d => d.approvalToken === token);
  if (device) {
    device.approved = true;
    device.approvedAt = Date.now();
    device.approvalToken = undefined;
    device.approvalTokenExpires = undefined;
  }

  await user.save({ validateBeforeSave: false });

  await logAction({
    userId: user._id,
    userEmail: user.email,
    action: 'Approve Device',
    module: 'Auth',
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    details: `Device approved successfully: ${device ? device.browserName : 'Unknown'} on ${device ? device.os : 'Unknown'}`
  });

  // Create an in-app notification about successful approval
  await Notification.create({
    user: user._id,
    title: 'Device Approved',
    message: `New device recognized and approved successfully (${device ? device.browserName : 'Unknown'} on ${device ? device.os : 'Unknown'}).`,
    type: 'device_approved'
  });

  return res.status(200).send(`
    <html>
      <head>
        <title>Device Approved Successfully</title>
        <style>
          body { font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; background: radial-gradient(circle at top, #0f172a 0%, #020617 100%); color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: rgba(30, 41, 59, 0.4); padding: 2.5rem; border-radius: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.05); text-align: center; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(16px); }
          h1 { color: #10b981; margin-top: 0; font-size: 1.8rem; }
          p { color: #94a3b8; line-height: 1.5; font-size: 0.95rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ Device Approved!</h1>
          <p>Your browser/device has been successfully recognized. You can now return to the login screen, where you will be automatically logged in.</p>
        </div>
      </body>
    </html>
  `);
});

/**
 * @route   POST /api/v1/auth/check-device-approval
 * @desc    Check if a device has been approved, and if so, issue tokens
 * @access  Public
 */
const checkDeviceApproval = catchAsync(async (req, res, next) => {
  const { userId, deviceId } = req.body;

  if (!userId || !deviceId) {
    return next(new AppError('Please provide user ID and device ID', 400));
  }

  const user = await User.findById(userId).select('+active');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.active === false) {
    return next(new AppError('Your account has been deactivated.', 401));
  }

  const device = user.devices.find(d => d.deviceId === deviceId);
  if (!device) {
    return next(new AppError('Device not found', 404));
  }

  if (!device.approved) {
    return res.status(200).json({
      status: 'fail',
      deviceApproved: false,
      message: 'Device is still pending approval. Please check your email.',
    });
  }

  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  await logAction({
    userId: user._id,
    userEmail: user.email,
    action: 'User Login',
    module: 'Auth',
    ipAddress,
    details: `User completed login from recognized device (Role: ${user.role})`
  });

  await sendTokensResponse(user, 200, res);
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and clear refresh token cookie
 * @access  Public
 */
const logout = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        // Remove the specific JTI from active list
        user.activeRefreshTokens = user.activeRefreshTokens.filter(rt => rt.jti !== decoded.jti);
        await user.save({ validateBeforeSave: false });
      }
    } catch (err) {
      // Ignore token verification errors during logout
    }
  }

  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000), // Expire immediately
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

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

  // --- REUSE DETECTION & ROTATION SYSTEM ---
  const tokenJti = decoded.jti;
  
  // Find the token index in user's activeRefreshTokens
  const tokenIndex = currentUser.activeRefreshTokens.findIndex(rt => rt.jti === tokenJti);

  if (tokenIndex === -1) {
    // REUSE DETECTED!
    currentUser.activeRefreshTokens = [];
    await currentUser.save({ validateBeforeSave: false });

    // Log the security breach
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logAction({
      userId: currentUser._id,
      userEmail: currentUser.email,
      action: 'Refresh Token Reuse Detected',
      module: 'Auth',
      ipAddress,
      details: `Potential token reuse attack! All active sessions revoked for user: ${currentUser.email}.`
    });

    // Clear refresh token cookie
    res.cookie('refreshToken', 'loggedout', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });

    return next(new AppError('Potential token reuse detected. All sessions have been revoked. Please log in again.', 401));
  }

  // Remove the used refresh token from the active list
  currentUser.activeRefreshTokens.splice(tokenIndex, 1);

  // Generate new JTI and new Refresh Token
  const newJti = crypto.randomBytes(16).toString('hex');
  const newRefreshToken = signRefreshToken(currentUser._id, newJti);

  // Push new token to active list
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  currentUser.activeRefreshTokens.push({ jti: newJti, expiresAt });
  await currentUser.save({ validateBeforeSave: false });

  // Sign and return a new short-lived Access Token
  const accessToken = signAccessToken(currentUser._id);

  // Send the new rotated Refresh Token in cookie
  const cookieOptions = {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('refreshToken', newRefreshToken, cookieOptions);

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
  await sendTokensResponse(user, 200, res);
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
  await AuditLog.deleteMany({});

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
    password: 'P@ssword123!',
    role: 'Student',
  });

  const csUser = await User.create({
    name: 'CS Agent',
    email: 'cs@example.com',
    password: 'P@ssword123!',
    role: 'CustomerService',
  });

  const opsUser = await User.create({
    name: 'Ops Manager',
    email: 'ops@example.com',
    password: 'P@ssword123!',
    role: 'OperationsManager',
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

  // 5) Seed Student Membership (expiring in 5 days)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 25); // Started 25 days ago
  
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1); // Valid for 1 month (expires in 5 days from now)

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

  // 9) Seed starter Audit Logs
  await AuditLog.create([
    {
      user: csUser._id,
      userEmail: csUser.email,
      action: 'User Login',
      module: 'Auth',
      ipAddress: '192.168.1.100',
      details: 'User logged in successfully (Role: CustomerService)',
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      user: csUser._id,
      userEmail: csUser.email,
      action: 'User Login',
      module: 'Auth',
      ipAddress: '192.168.1.102',
      details: 'User logged in successfully (Role: Student)',
      createdAt: new Date(Date.now() - 7200000)
    }
  ]);

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
  verify2FA,
  approveDevice,
  checkDeviceApproval,
};

