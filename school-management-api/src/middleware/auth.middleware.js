const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { PERMISSIONS } = require('../config/rbac.config');

const protect = catchAsync(async (req, res, next) => {
  // 1) Extract access token from Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token signature and expiration
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exists in the database and is active
  const currentUser = await User.findById(decoded.id).select('+active');
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token no longer exists.',
        401
      )
    );
  }

  // Reject requests from deactivated users immediately
  if (currentUser.active === false) {
    return next(
      new AppError(
        'Your account has been deactivated.',
        401
      )
    );
  }

  // 4) Check if password was changed after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Grant access to request context
  req.user = currentUser;
  next();
});

// Authenticate is an alias for protect
const authenticate = protect;

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

const restrictTo = authorize;

/**
 * Granular module/action permission verification middleware
 * @param {string} module - The resource module name (e.g., 'students', 'payments')
 * @param {string} action - The action being performed (e.g., 'read', 'create', 'approve')
 */
const checkPermission = (module, action) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userPermissions = PERMISSIONS[userRole] && PERMISSIONS[userRole][module];

    if (!userPermissions) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    // 1) Wildcard CEO access
    if (userPermissions.includes('*')) {
      return next();
    }

    // 2) Direct action permission match (e.g., 'read', 'create', 'approve', 'manage', 'update', 'delete')
    if (userPermissions.includes(action)) {
      return next();
    }

    // 3) Ownership rules matching
    const hasOwnPermission = userPermissions.includes('own');
    const hasSpecificOwnPermission = userPermissions.includes(`${action}_own`);

    if (hasOwnPermission || hasSpecificOwnPermission) {
      req.permissionRule = {
        type: 'ownership',
        module,
        action,
      };
      return next();
    }

    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  };
};

module.exports = {
  protect,
  authenticate,
  authorize,
  restrictTo,
  checkPermission,
};
