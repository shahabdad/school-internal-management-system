const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Membership must belong to a student'],
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: [true, 'Membership must be associated with a plan'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Membership must have an end date'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Expiring', 'Expired'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;
