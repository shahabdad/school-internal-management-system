const Payment = require('../models/payment.model');
const MembershipPlan = require('../models/membership.model');
const Student = require('../models/student.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../services/email.service');

/**
 * @route   POST /api/v1/payments/upload-proof
 * @desc    Upload payment proof
 * @access  Private (Student, Admin, CEO)
 */
const uploadProof = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload proof of payment file', 400));
  }

  const { membershipPlanId } = req.body;
  if (!membershipPlanId) {
    return next(new AppError('Please provide a membership plan ID', 400));
  }

  const plan = await MembershipPlan.findById(membershipPlanId);
  if (!plan) {
    return next(new AppError('Membership plan not found', 404));
  }

  const newPayment = await Payment.create({
    student: req.user.id,
    studentEmail: req.user.email,
    membershipPlan: membershipPlanId,
    proofOfPayment: req.file.path.replace(/\\/g, '/'), // normalization
    amount: plan.price,
    status: 'Pending',
  });

  res.status(201).json({
    status: 'success',
    data: {
      payment: newPayment,
    },
  });
});

/**
 * @route   GET /api/v1/payments
 * @desc    Get all payment records
 * @access  Private (CustomerService, OperationsManager, Admin, CEO)
 */
const getAllPayments = catchAsync(async (req, res, next) => {
  const payments = await Payment.find()
    .populate('student', 'name email')
    .populate('membershipPlan', 'name price duration');

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: {
      payments,
    },
  });
});

/**
 * @route   PUT /api/v1/payments/:id/approve
 * @desc    Approve a payment, activate/create student membership and notify
 * @access  Private (CustomerService, Admin, CEO)
 */
const approvePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate('membershipPlan');

  if (!payment) {
    return next(new AppError('No payment record found with that ID', 404));
  }

  if (payment.status !== 'Pending') {
    return next(
      new AppError(`This payment has already been reviewed (Status: ${payment.status})`, 400)
    );
  }

  // Update payment status
  payment.status = 'Approved';
  payment.reviewedBy = req.user.id;
  payment.reviewedAt = Date.now();
  await payment.save();

  // Find or Create Student Membership
  let studentProfile = await Student.findOne({ email: payment.studentEmail });
  const planName = payment.membershipPlan.name;

  if (studentProfile) {
    studentProfile.membership = planName;
    studentProfile.status = 'Active';
    await studentProfile.save();
  } else {
    // Retrieve student user profile to grab the name
    const studentUser = await User.findById(payment.student);
    const studentName = studentUser ? studentUser.name : 'Student User';

    studentProfile = await Student.create({
      name: studentName,
      email: payment.studentEmail,
      phone: 'N/A',
      address: 'N/A',
      membership: planName,
      status: 'Active',
    });
  }

  // Send Notification Mock Email
  try {
    await sendEmail({
      email: payment.studentEmail,
      subject: 'Payment Approved & Membership Activated',
      message: `Dear ${studentProfile.name},\n\nYour payment of $${payment.amount} has been successfully approved!\nYour membership status has been activated to the "${planName}" plan.\n\nThank you,\nSchool Management Team`,
    });
  } catch (err) {
    // Non-blocking email sending failure
    console.error('Failed to send notification email:', err.message);
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment,
      studentProfile,
    },
  });
});

/**
 * @route   PUT /api/v1/payments/:id/reject
 * @desc    Reject a payment and notify student
 * @access  Private (CustomerService, Admin, CEO)
 */
const rejectPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate('membershipPlan');

  if (!payment) {
    return next(new AppError('No payment record found with that ID', 404));
  }

  if (payment.status !== 'Pending') {
    return next(
      new AppError(`This payment has already been reviewed (Status: ${payment.status})`, 400)
    );
  }

  // Update payment status
  payment.status = 'Rejected';
  payment.reviewedBy = req.user.id;
  payment.reviewedAt = Date.now();
  await payment.save();

  // Retrieve student user profile to grab the name
  const studentUser = await User.findById(payment.student);
  const studentName = studentUser ? studentUser.name : 'Student User';

  // Send Notification Mock Email
  try {
    await sendEmail({
      email: payment.studentEmail,
      subject: 'Payment Proof Rejected',
      message: `Dear ${studentName},\n\nWe regret to inform you that your payment proof of $${payment.amount} for the "${payment.membershipPlan.name}" plan has been rejected.\n\nPlease upload a valid receipt or proof of payment and re-submit.\n\nThank you,\nCustomer Service Department`,
    });
  } catch (err) {
    console.error('Failed to send notification email:', err.message);
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment,
    },
  });
});

module.exports = {
  uploadProof,
  getAllPayments,
  approvePayment,
  rejectPayment,
};
