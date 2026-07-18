const AppError = require('../utils/appError');

const isStrongPassword = (val) => {
  if (!val || val.length < 10) return false;
  const hasUpperCase = /[A-Z]/.test(val);
  const hasLowerCase = /[a-z]/.test(val);
  const hasNumber = /[0-9]/.test(val);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(val);
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError('Name is required', 400));
  }

  if (!email || !email.trim()) {
    return next(new AppError('Email is required', 400));
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (!password || !isStrongPassword(password)) {
    return next(
      new AppError(
        'Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        400
      )
    );
  }

  if (role && !['Student', 'CustomerService', 'OperationsManager', 'Admin', 'CEO'].includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return next(new AppError('Email is required', 400));
  }

  if (!password) {
    return next(new AppError('Password is required', 400));
  }

  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return next(new AppError('Email is required', 400));
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { password } = req.body;

  if (!password || !isStrongPassword(password)) {
    return next(
      new AppError(
        'Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        400
      )
    );
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
};
