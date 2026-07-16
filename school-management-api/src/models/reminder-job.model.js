const mongoose = require('mongoose');

const reminderJobSchema = new mongoose.Schema(
  {
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      required: [true, 'Reminder job must be associated with a membership'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Reminder job must belong to a student'],
    },
    reminderDate: {
      type: Date,
      required: [true, 'Reminder job must have a scheduled reminder date'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Sent', 'Failed'],
      default: 'Pending',
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ReminderJob = mongoose.model('ReminderJob', reminderJobSchema);

module.exports = ReminderJob;
