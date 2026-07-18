
const Payment = require('../models/payment.model');
const MembershipPlan = require('../models/membership-plan.model');
const Membership = require('../models/membership.model');
const Student = require('../models/student.model');
const User = require('../models/user.model');
const ReminderJob = require('../models/reminder-job.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../services/email.service');
const { createNotification } = require('./notification.controller');
const { logAction } = require('../utils/auditLogger');
const { checkAndNotifyRisk } = require('./student.controller');
const fs = require('fs');

/**
 * @route   POST /api/v1/payments/upload-proof
 * @desc    Upload payment proof
 * @access  Private (Student, Admin, CEO)
 */
const uploadProof = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload proof of payment file', 400));
  }

  const cleanupUploadedFile = () => {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error(`Failed to delete dangling proof file: ${req.file.path}`, err.message);
      });
    }
  };

  const { membershipPlanId } = req.body;
  if (!membershipPlanId) {
    cleanupUploadedFile();
    return next(new AppError('Please provide a membership plan ID', 400));
  }

  try {
    const plan = await MembershipPlan.findById(membershipPlanId);
    if (!plan) {
      cleanupUploadedFile();
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

    // Trigger notifications for: Payment submitted
    // 1. Notify Student
    await createNotification(
      req.user.id,
      'Payment Submitted',
      `Your payment proof for the "${plan.name}" plan has been submitted successfully and is pending review.`,
      'payment_submitted'
    );
    // 2. Notify CS Agents
    const csAgents = await User.find({ role: 'CustomerService' });
    for (const agent of csAgents) {
      await createNotification(
        agent._id,
        'Payment Submitted',
        `A new payment proof from ${req.user.name} (${req.user.email}) for the "${plan.name}" plan is pending review.`,
        'payment_submitted'
      );
    }

    // Check risk and notify staff of risk level spikes
    const student = await Student.findOne({ email: req.user.email });
    if (student) {
      await checkAndNotifyRisk(student._id, student.email, student.name);
    }

    res.status(201).json({
      status: 'success',
      data: {
        payment: newPayment,
      },
    });
  } catch (err) {
    cleanupUploadedFile();
    return next(err);
  }
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
  const mongoose = require('mongoose');
  const payment = await Payment.findById(req.params.id).populate('membershipPlan');

  if (!payment) {
    return next(new AppError('No payment record found with that ID', 404));
  }

  if (payment.status !== 'Pending') {
    return next(
      new AppError(`This payment has already been reviewed (Status: ${payment.status})`, 400)
    );
  }

  // Start MongoDB transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) Update payment status
    payment.status = 'Approved';
    payment.reviewedBy = req.user.id;
    payment.reviewedAt = Date.now();
    await payment.save({ session });

    // 2) Find or Create Student profile inside session
    let studentProfile = await Student.findOne({ email: payment.studentEmail }).session(session);
    const planName = payment.membershipPlan.name;

    if (studentProfile) {
      studentProfile.membership = planName;
      studentProfile.status = 'Active';
      await studentProfile.save({ session });
    } else {
      // Retrieve student user profile to grab the name
      const studentUser = await User.findById(payment.student).session(session);
      const studentName = studentUser ? studentUser.name : 'Student User';

      const studentArray = await Student.create(
        [
          {
            name: studentName,
            email: payment.studentEmail,
            phone: 'N/A',
            address: 'N/A',
            membership: planName,
            status: 'Active',
          },
        ],
        { session }
      );
      studentProfile = studentArray[0];
    }

    // 3) Handle Membership subscription and Reminder Jobs inside session
    const existingMembership = await Membership.findOne({
      student: studentProfile._id,
      status: { $in: ['Active', 'Expiring'] },
      endDate: { $gt: new Date() },
    }).session(session);

    let startDate, endDate, isRenewal = false;

    if (existingMembership) {
      isRenewal = true;
      startDate = new Date(existingMembership.startDate);
      // Extend the membership
      endDate = new Date(existingMembership.endDate);
      endDate.setMonth(endDate.getMonth() + payment.membershipPlan.duration);

      existingMembership.plan = payment.membershipPlan._id;
      existingMembership.endDate = endDate;
      existingMembership.status = 'Active';
      await existingMembership.save({ session });

      // Update or create ReminderJob
      const reminderDate = new Date(endDate);
      reminderDate.setDate(reminderDate.getDate() - 7);

      const reminder = await ReminderJob.findOne({ membership: existingMembership._id }).session(session);
      if (reminder) {
        reminder.reminderDate = reminderDate;
        reminder.status = 'Pending';
        await reminder.save({ session });
      } else {
        await ReminderJob.create(
          [
            {
              student: studentProfile._id,
              membership: existingMembership._id,
              reminderDate,
              status: 'Pending',
            },
          ],
          { session }
        );
      }
    } else {
      startDate = new Date();
      endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + payment.membershipPlan.duration);

      const membershipArray = await Membership.create(
        [
          {
            student: studentProfile._id,
            plan: payment.membershipPlan._id,
            startDate,
            endDate,
            status: 'Active',
          },
        ],
        { session }
      );
      const newMembership = membershipArray[0];

      // Create ReminderJob
      const reminderDate = new Date(endDate);
      reminderDate.setDate(reminderDate.getDate() - 7);

      await ReminderJob.create(
        [
          {
            student: studentProfile._id,
            membership: newMembership._id,
            reminderDate,
            status: 'Pending',
          },
        ],
        { session }
      );
    }

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // Log Approve Payment action to database audit logs
    await logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'Approve Payment',
      module: 'Payment',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      details: `Approved payment of $${payment.amount} for student ${payment.studentEmail} (Plan: ${payment.membershipPlan.name})`
    });

    // Trigger notification: Payment approved
    await createNotification(
      payment.student,
      'Payment Approved',
      `Your payment proof of $${payment.amount} has been approved! Your membership is now Active.`,
      'payment_approved'
    );

    // Send Notification Mock Email (Non-blocking, outside transaction)
    try {
      const expiryString = endDate.toDateString();
      const subject = isRenewal ? 'Membership Renewed & Extended' : 'Payment Approved & Membership Activated';
      const message = isRenewal
        ? `Dear ${studentProfile.name},\n\nYour payment of $${payment.amount} has been successfully approved!\nYour membership has been renewed/extended to the "${planName}" plan.\nYour new expiry date is: ${expiryString}.\n\nThank you,\nSchool Management Team`
        : `Dear ${studentProfile.name},\n\nYour payment of $${payment.amount} has been successfully approved!\nYour membership status has been activated to the "${planName}" plan.\nYour membership expiry date is: ${expiryString}.\n\nThank you,\nSchool Management Team`;

      await sendEmail({
        email: payment.studentEmail,
        subject,
        message,
      });
    } catch (err) {
      console.error('Failed to send notification email:', err.message);
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment,
        studentProfile,
        expiryDate: endDate,
        isRenewal,
      },
    });
  } catch (error) {
    // Abort Transaction in case of failure
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
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

  // Trigger notification: Payment rejected
  await createNotification(
    payment.student,
    'Payment Rejected',
    `Your payment proof of $${payment.amount} was rejected. Please re-upload a valid receipt.`,
    'payment_rejected'
  );

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
