const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Notification must have a title'],
    },
    message: {
      type: String,
      required: [true, 'Notification must have a message'],
    },
    type: {
      type: String,
      enum: [
        'payment_submitted',
        'payment_approved',
        'payment_rejected',
        'membership_expiring',
        'membership_expired',
        'complaint_updated',
      ],
      required: [true, 'Notification must have a trigger type'],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
