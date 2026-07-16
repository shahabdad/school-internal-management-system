const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Complaint must belong to a student'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide complaint description'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Created', 'Assigned', 'UnderReview', 'Solved', 'Closed'],
      default: 'Created',
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolution: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
