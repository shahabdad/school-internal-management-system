const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [10, 'Password must be at least 10 characters long'],
      validate: {
        validator: function (val) {
          const hasUpperCase = /[A-Z]/.test(val);
          const hasLowerCase = /[a-z]/.test(val);
          const hasNumber = /[0-9]/.test(val);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(val);
          return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
        },
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      },
      select: false,
    },
    role: {
      type: String,
      enum: ['Student', 'CustomerService', 'OperationsManager', 'Admin', 'CEO'],
      default: 'Student',
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorOTP: String,
    twoFactorOTPExpires: Date,
    devices: [
      {
        deviceId: {
          type: String,
          required: true,
        },
        browserName: String,
        os: String,
        ipAddress: String,
        approved: {
          type: Boolean,
          default: false,
        },
        approvedAt: Date,
        lastUsedAt: {
          type: Date,
          default: Date.now,
        },
        approvalToken: String,
        approvalTokenExpires: Date,
      },
    ],
    activeRefreshTokens: [
      {
        jti: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return;

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
});

// Update passwordChangedAt property before saving and revoke all active refresh tokens
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token creation time is after passwordChangedAt
  this.activeRefreshTokens = []; // Revoke all sessions on password change
});

// Instance method to compare candidate password with password hash
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Instance method to create and hash a password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
