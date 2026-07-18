const Student = require('../models/student.model');
const User = require('../models/user.model');
const Membership = require('../models/membership.model');
const Payment = require('../models/payment.model');
const Complaint = require('../models/complaint.model');
const CallLog = require('../models/call-log.model');
const AuditLog = require('../models/audit-log.model');
const Notification = require('../models/notification.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Helper to calculate detailed student risk metrics dynamically
 */
const getRiskDetailsForStudent = async (studentId, email) => {
  const pendingPayment = await Payment.findOne({ studentEmail: email, status: 'Pending' });
  const expiringMembership = await Membership.findOne({ student: studentId, status: 'Expiring' });
  const openComplaint = await Complaint.findOne({ student: studentId, status: { $in: ['Created', 'Assigned', 'UnderReview'] } });

  let score = 0;
  let factors = [];
  if (pendingPayment) {
    score += 30;
    factors.push('Pending Payment');
  }
  if (expiringMembership) {
    score += 35;
    factors.push('Membership Expiring');
  }
  if (openComplaint) {
    score += 35;
    factors.push('Open Complaint');
  }

  let level = 'Low';
  if (score === 100) {
    level = 'Critical';
  } else if (score >= 65) {
    level = 'High';
  } else if (score >= 30) {
    level = 'Medium';
  }

  // Calculate risk trend
  let pastScore = 0;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (pendingPayment && pendingPayment.createdAt < sevenDaysAgo) {
    pastScore += 30;
  }
  if (expiringMembership) {
    const expiry = new Date(expiringMembership.endDate);
    const today = new Date();
    const currentRemainingDays = (expiry - today) / (1000 * 60 * 60 * 24);
    if (currentRemainingDays + 7 <= 7) {
      pastScore += 35;
    }
  }
  if (openComplaint && openComplaint.createdAt < sevenDaysAgo) {
    pastScore += 35;
  }

  let trend = 'stable';
  if (score > pastScore) {
    trend = 'increasing';
  } else if (score < pastScore) {
    trend = 'decreasing';
  }

  return {
    score,
    level,
    trend,
    factors
  };
};

/**
 * Helper to notify CS staff if student has hit High or Critical risk levels
 */
const checkAndNotifyRisk = async (studentId, email, studentName) => {
  const riskDetails = await getRiskDetailsForStudent(studentId, email);
  if (['High', 'Critical'].includes(riskDetails.level)) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingNoti = await Notification.findOne({
      title: `⚠️ Risk Alert: ${studentName}`,
      message: { $regex: riskDetails.level },
      createdAt: { $gte: oneDayAgo }
    });

    if (!existingNoti) {
      const staffMembers = await User.find({ role: { $in: ['CustomerService', 'OperationsManager', 'Admin', 'CEO'] } });
      for (const staff of staffMembers) {
        await Notification.create({
          user: staff._id,
          title: `⚠️ Risk Alert: ${studentName}`,
          message: `Student ${studentName} is now at ${riskDetails.level} risk level (Score: ${riskDetails.score}/100, Trend: ${riskDetails.trend}). Active factors: ${riskDetails.factors.join(', ')}.`,
          type: 'student_risk_alert'
        });
      }
    }
  }
};

/**
 * @route   GET /api/v1/students
 * @desc    Get all students
 * @access  Private (Admin, CEO, CustomerService, OperationsManager)
 */
const getAllStudents = catchAsync(async (req, res, next) => {
  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    return next(
      new AppError('You do not have permission to view all student records', 403)
    );
  }

  const students = await Student.find();

  const studentsWithRisk = [];
  for (const student of students) {
    const riskDetails = await getRiskDetailsForStudent(student._id, student.email);
    studentsWithRisk.push({
      ...student.toObject(),
      riskLevel: riskDetails.level,
      riskDetails,
    });
  }

  res.status(200).json({
    status: 'success',
    results: studentsWithRisk.length,
    data: {
      students: studentsWithRisk,
    },
  });
});

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get single student profile by ID
 * @access  Private (Own profile or Admin/CEO/CS/Operations)
 */
const getStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Enforce dynamic ownership rules via email matching
  if (req.permissionRule?.type === 'ownership') {
    if (student.email !== req.user.email) {
      return next(
        new AppError('You do not have permission to view this student profile', 403)
      );
    }
  }

  const riskLevel = await getRiskLevelForStudent(student._id, student.email);

  res.status(200).json({
    status: 'success',
    data: {
      student: {
        ...student.toObject(),
        riskLevel,
      },
    },
  });
});

/**
 * @route   POST /api/v1/students
 * @desc    Create a new student record
 * @access  Private (Admin, CEO)
 */
const createStudent = catchAsync(async (req, res, next) => {
  const { name, email, phone, address, membership, status } = req.body;

  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    return next(new AppError('Student email is already registered', 400));
  }

  const newStudent = await Student.create({
    name,
    email,
    phone,
    address,
    membership,
    status,
  });

  res.status(201).json({
    status: 'success',
    data: {
      student: newStudent,
    },
  });
});

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Update a student record
 * @access  Private (Own profile or Admin/CEO)
 */
const updateStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    if (student.email !== req.user.email) {
      return next(
        new AppError('You do not have permission to update this student record', 403)
      );
    }
  }

  // Filter allowed fields for update based on role
  const filteredBody = {};
  let allowedFields = ['name', 'phone', 'address'];

  // Admins and CEOs can update membership tier and student status
  if (['Admin', 'CEO'].includes(req.user.role)) {
    allowedFields.push('email', 'membership', 'status');
  }

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      student: updatedStudent,
    },
  });
});

/**
 * @route   DELETE /api/v1/students/:id
 * @desc    Delete a student record
 * @access  Private (Admin, CEO)
 */
const deleteStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @route   GET /api/v1/students/:id/timeline
 * @desc    Get complete chronological student activity timeline
 * @access  Private (Admin, CEO, CustomerService, OperationsManager)
 */
const getStudentTimeline = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new AppError('No student profile found with that ID', 404));
  }

  // Query all related entities using student ID or student email
  const user = await User.findOne({ email: student.email });
  const memberships = await Membership.find({ student: student._id }).populate('plan');
  const payments = await Payment.find({ studentEmail: student.email }).populate('membershipPlan');
  const complaints = await Complaint.find({ student: student._id });
  const callLogs = await CallLog.find({ student: student._id }).populate('agent');

  // Pull login audit logs if user profile exists
  let loginLogs = [];
  if (user) {
    loginLogs = await AuditLog.find({ user: user._id, action: 'User Login' });
  }

  const timelineEvents = [];

  // 1. Registered
  timelineEvents.push({
    action: 'Registered',
    module: 'Auth',
    timestamp: student.createdAt,
    description: `Student account registered successfully: ${student.name} (${student.email})`,
  });

  // 2. Memberships
  memberships.forEach(m => {
    timelineEvents.push({
      action: 'Membership Purchased',
      module: 'Membership',
      timestamp: m.createdAt,
      description: `Purchased plan "${m.plan.name}" (Status: ${m.status}, Expiry: ${m.endDate ? m.endDate.toDateString() : 'N/A'})`,
    });
  });

  // 3. Payments
  payments.forEach(p => {
    timelineEvents.push({
      action: 'Payment Submitted',
      module: 'Payment',
      timestamp: p.createdAt,
      description: `Submitted proof of payment of $${p.amount} for plan "${p.membershipPlan.name}" (Status: Pending)`,
    });
    if (p.status === 'Approved' || p.status === 'Rejected') {
      timelineEvents.push({
        action: p.status === 'Approved' ? 'Payment Approved' : 'Payment Rejected',
        module: 'Payment',
        timestamp: p.reviewedAt || p.updatedAt,
        description: `Payment proof of $${p.amount} was ${p.status.toLowerCase()} by staff member`,
      });
    }
  });

  // 4. Complaints
  complaints.forEach(c => {
    timelineEvents.push({
      action: 'Complaint Created',
      module: 'Complaint',
      timestamp: c.createdAt,
      description: `Filed complaint: "${c.title}" (Status: ${c.status})`,
    });
    if (c.status === 'Solved' && c.resolution) {
      timelineEvents.push({
        action: 'Complaint Resolved',
        module: 'Complaint',
        timestamp: c.updatedAt,
        description: `Complaint solved with resolution: "${c.resolution}"`,
      });
    } else if (c.status === 'Closed') {
      timelineEvents.push({
        action: 'Complaint Closed',
        module: 'Complaint',
        timestamp: c.updatedAt,
        description: `Complaint status marked as Closed`,
      });
    }
  });

  // 5. Calls
  callLogs.forEach(call => {
    timelineEvents.push({
      action: 'Call Logged',
      module: 'Complaint',
      timestamp: call.date || call.createdAt,
      description: `CS Phone Call with agent ${call.agent ? call.agent.name : 'Staff'}: Duration ${call.duration}s. Result: "${call.result}". Notes: "${call.notes}"`,
    });
  });

  // 6. Logins
  loginLogs.forEach(log => {
    timelineEvents.push({
      action: 'User Login',
      module: 'Auth',
      timestamp: log.createdAt,
      description: `Logged in successfully from client IP: ${log.ipAddress}`,
    });
  });

  // Sort events chronologically (oldest first)
  timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Determine risk level
  const riskDetails = await getRiskDetailsForStudent(student._id, student.email);

  res.status(200).json({
    status: 'success',
    data: {
      student: {
        ...student.toObject(),
        riskLevel: riskDetails.level,
        riskDetails,
      },
      timeline: timelineEvents,
    },
  });
});

module.exports = {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentTimeline,
  getRiskDetailsForStudent,
  checkAndNotifyRisk,
};
