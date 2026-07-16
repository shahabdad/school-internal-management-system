const CallLog = require('../models/call-log.model');
const Student = require('../models/student.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @route   POST /api/v1/call-logs
 * @desc    Record a new customer service call log
 * @access  Private (CS, Admin, CEO)
 */
const createCallLog = catchAsync(async (req, res, next) => {
  const { studentId, date, duration, result, notes } = req.body;

  if (!studentId || !duration || !result || !notes) {
    return next(new AppError('Please provide studentId, duration, result, and notes', 400));
  }

  // Ensure student profile exists
  const student = await Student.findById(studentId);
  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Ensure result status is one of the allowed statuses
  const allowedResults = ['No Answer', 'Interested', 'Follow-up', 'Joined', 'Upgraded'];
  if (!allowedResults.includes(result)) {
    return next(new AppError('Invalid call result status', 400));
  }

  const callLog = await CallLog.create({
    student: studentId,
    agent: req.user.id,
    date: date || new Date(),
    duration,
    result,
    notes,
  });

  res.status(201).json({
    status: 'success',
    data: {
      callLog,
    },
  });
});

/**
 * @route   GET /api/v1/call-logs
 * @desc    Get all call logs
 * @access  Private (CS, Operations, Admin, CEO)
 */
const getAllCallLogs = catchAsync(async (req, res, next) => {
  const callLogs = await CallLog.find()
    .populate('student', 'name email status')
    .populate('agent', 'name email role')
    .sort('-date -createdAt');

  res.status(200).json({
    status: 'success',
    results: callLogs.length,
    data: {
      callLogs,
    },
  });
});

/**
 * @route   GET /api/v1/call-logs/:id
 * @desc    Get a single call log by ID
 * @access  Private (CS, Operations, Admin, CEO)
 */
const getCallLog = catchAsync(async (req, res, next) => {
  const callLog = await CallLog.findById(req.params.id)
    .populate('student', 'name email status')
    .populate('agent', 'name email role');

  if (!callLog) {
    return next(new AppError('No call log found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      callLog,
    },
  });
});

/**
 * @route   PUT /api/v1/call-logs/:id
 * @desc    Update a call log record
 * @access  Private (CS, Admin, CEO)
 */
const updateCallLog = catchAsync(async (req, res, next) => {
  const { date, duration, result, notes } = req.body;

  const callLog = await CallLog.findById(req.params.id);
  if (!callLog) {
    return next(new AppError('No call log found with that ID', 404));
  }

  if (date) callLog.date = date;
  if (duration) callLog.duration = duration;
  if (result) {
    const allowedResults = ['No Answer', 'Interested', 'Follow-up', 'Joined', 'Upgraded'];
    if (!allowedResults.includes(result)) {
      return next(new AppError('Invalid call result status', 400));
    }
    callLog.result = result;
  }
  if (notes) callLog.notes = notes;

  await callLog.save();

  res.status(200).json({
    status: 'success',
    data: {
      callLog,
    },
  });
});

/**
 * @route   DELETE /api/v1/call-logs/:id
 * @desc    Delete a call log record (Admin/CEO only)
 * @access  Private (Admin, CEO)
 */
const deleteCallLog = catchAsync(async (req, res, next) => {
  const callLog = await CallLog.findByIdAndDelete(req.params.id);

  if (!callLog) {
    return next(new AppError('No call log found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  createCallLog,
  getAllCallLogs,
  getCallLog,
  updateCallLog,
  deleteCallLog,
};
