const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    userEmail: {
      type: String,
      required: false,
    },
    action: {
      type: String,
      required: [true, 'Audit log must record an action'],
    },
    module: {
      type: String,
      required: [true, 'Audit log must specify a module'],
      enum: ['Auth', 'Payment', 'User', 'Complaint', 'Membership'],
    },
    ipAddress: {
      type: String,
      required: false,
    },
    details: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
