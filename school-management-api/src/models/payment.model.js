
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must be associated with a user'],
    },
    studentEmail: {
      type: String,
      required: [true, 'Payment must be associated with a student email'],
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: [true, 'Payment must be associated with a membership plan'],
    },
    proofOfPayment: {
      type: String,
      required: [true, 'Please provide proof of payment upload path'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment must have an amount'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
