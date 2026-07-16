const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Call log must be linked to a student'],
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Call log must have an agent recorder'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
      required: [true, 'Please provide call duration in seconds'],
    },
    result: {
      type: String,
      enum: ['No Answer', 'Interested', 'Follow-up', 'Joined', 'Upgraded'],
      required: [true, 'Please provide call result status'],
    },
    notes: {
      type: String,
      required: [true, 'Please provide call log notes'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const CallLog = mongoose.model('CallLog', callLogSchema);

module.exports = CallLog;
