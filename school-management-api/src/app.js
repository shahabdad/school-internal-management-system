const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const studentRoutes = require('./routes/student.routes');
const membershipRoutes = require('./routes/membership.routes');
const membershipPlanRoutes = require('./routes/membership-plan.routes');
const paymentRoutes = require('./routes/payment.routes');
const complaintRoutes = require('./routes/complaint.routes');
const callLogRoutes = require('./routes/call-log.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Serve static files from uploads folder if needed
app.use('/uploads', express.static('src/uploads'));
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/membership-plans', membershipPlanRoutes);
app.use('/api/v1/memberships', membershipRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/call-logs', callLogRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check endpoint
app.use('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'School Management API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes
app.use((req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production mode - do not leak sensitive details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.statusCode === 500 ? 'Something went wrong!' : err.message
    });
  }
});

module.exports = app;
