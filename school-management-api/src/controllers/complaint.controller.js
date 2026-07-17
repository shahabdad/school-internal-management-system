const Complaint = require('../models/complaint.model');
const Student = require('../models/student.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { createNotification } = require('./notification.controller');
const { logAction } = require('../utils/auditLogger');

// Helper to notify students of status updates on their complaints
const notifyStudentOfComplaintUpdate = async (complaint) => {
  try {
    const studentProfile = await Student.findById(complaint.student);
    if (studentProfile) {
      const studentUser = await User.findOne({ email: studentProfile.email });
      if (studentUser) {
        await createNotification(
          studentUser._id,
          'Complaint Updated',
          `Your complaint "${complaint.title}" status has changed to: ${complaint.status}.`,
          'complaint_updated'
        );
      }
    }
  } catch (err) {
    console.error('Failed to notify student of complaint update:', err.message);
  }
};

/**
 * @route   POST /api/v1/complaints
 * @desc    Create a new student complaint
 * @access  Private (Student)
 */
const createComplaint = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return next(new AppError('Please provide a complaint title and description', 400));
  }

  // Find student profile linked to the authenticated user's email
  const studentProfile = await Student.findOne({ email: req.user.email });
  if (!studentProfile) {
    return next(new AppError('Student profile not found. Unable to file complaint.', 404));
  }

  const newComplaint = await Complaint.create({
    student: studentProfile._id,
    title,
    description,
    status: 'Created',
  });

  res.status(201).json({
    status: 'success',
    data: {
      complaint: newComplaint,
    },
  });
});

/**
 * @route   GET /api/v1/complaints
 * @desc    Get all complaints (Dynamic ownership for Student; all for Staff)
 * @access  Private (Student, CS, Operations, Admin, CEO)
 */
const getAllComplaints = catchAsync(async (req, res, next) => {
  let filter = {};

  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    const studentProfile = await Student.findOne({ email: req.user.email });
    if (!studentProfile) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: { complaints: [] }
      });
    }
    filter.student = studentProfile._id;
  }

  const complaints = await Complaint.find(filter)
    .populate('student', 'name email status')
    .populate('assignedStaff', 'name email role')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: complaints.length,
    data: {
      complaints,
    },
  });
});

/**
 * @route   GET /api/v1/complaints/:id
 * @desc    Get single complaint details
 * @access  Private (Student own, CS, Operations, Admin, CEO)
 */
const getComplaint = catchAsync(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('student', 'name email status')
    .populate('assignedStaff', 'name email role');

  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  // Enforce ownership checks
  if (req.permissionRule?.type === 'ownership') {
    if (complaint.student.email !== req.user.email) {
      return next(new AppError('You do not have permission to view this complaint', 403));
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      complaint,
    },
  });
});

/**
 * @route   PUT /api/v1/complaints/:id/assign
 * @desc    Assign a staff member to handle the complaint
 * @access  Private (CS, Admin, CEO)
 */
const assignStaff = catchAsync(async (req, res, next) => {
  const { staffId } = req.body;

  if (!staffId) {
    return next(new AppError('Please provide a staff user ID for assignment', 400));
  }

  const staffUser = await User.findById(staffId);
  if (!staffUser || !['CustomerService', 'Admin', 'CEO'].includes(staffUser.role)) {
    return next(new AppError('Assigned user must be a valid staff or admin member', 400));
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  complaint.assignedStaff = staffId;
  complaint.status = 'Assigned';
  await complaint.save();
  await notifyStudentOfComplaintUpdate(complaint);

  // Populate references for the response
  await complaint.populate([
    { path: 'student', select: 'name email' },
    { path: 'assignedStaff', select: 'name email role' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      complaint,
    },
  });
});

/**
 * @route   PUT /api/v1/complaints/:id/review
 * @desc    Mark complaint status as UnderReview
 * @access  Private (CS, Admin, CEO)
 */
const startReview = catchAsync(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id);
  
  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  // Ensure it has been assigned first
  if (complaint.status === 'Created') {
    return next(new AppError('Complaint must be assigned to staff before placing it under review', 400));
  }

  complaint.status = 'UnderReview';
  await complaint.save();
  await notifyStudentOfComplaintUpdate(complaint);

  await complaint.populate([
    { path: 'student', select: 'name email' },
    { path: 'assignedStaff', select: 'name email role' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      complaint,
    },
  });
});

/**
 * @route   PUT /api/v1/complaints/:id/solve
 * @desc    Record resolution details and mark complaint as Solved
 * @access  Private (CS, Admin, CEO)
 */
const solveComplaint = catchAsync(async (req, res, next) => {
  const { resolution } = req.body;

  if (!resolution) {
    return next(new AppError('Please provide resolution details to solve this complaint', 400));
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  complaint.resolution = resolution;
  complaint.status = 'Solved';
  await complaint.save();
  await notifyStudentOfComplaintUpdate(complaint);

  // Log Resolve Complaint action to database audit logs
  await logAction({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'Resolve Complaint',
    module: 'Complaint',
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    details: `Resolved complaint "${complaint.title}" (ID: ${complaint._id}) with resolution: "${resolution}"`
  });

  await complaint.populate([
    { path: 'student', select: 'name email' },
    { path: 'assignedStaff', select: 'name email role' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      complaint,
    },
  });
});

/**
 * @route   PUT /api/v1/complaints/:id/close
 * @desc    Mark complaint status as Closed
 * @access  Private (Student own, CS, Admin, CEO)
 */
const closeComplaint = catchAsync(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id).populate('student', 'email');
  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  // Enforce student ownership rules
  if (req.permissionRule?.type === 'ownership') {
    if (complaint.student.email !== req.user.email) {
      return next(new AppError('You do not have permission to close this complaint', 403));
    }
  }

  complaint.status = 'Closed';
  await complaint.save();
  await notifyStudentOfComplaintUpdate(complaint);

  await complaint.populate([
    { path: 'student', select: 'name email' },
    { path: 'assignedStaff', select: 'name email role' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      complaint,
    },
  });
});

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaint,
  assignStaff,
  startReview,
  solveComplaint,
  closeComplaint,
};
