const AuditLog = require('../models/audit-log.model');

/**
 * Log a user action to the AuditLog database collection
 * @param {Object} options
 * @param {string} options.userId - ID of the user performing the action
 * @param {string} options.userEmail - Email of the user performing the action
 * @param {string} options.action - Action performed (e.g. 'User Login')
 * @param {string} options.module - Module related to the action ('Auth', 'Payment', 'User', 'Complaint', 'Membership')
 * @param {string} options.ipAddress - IP address of the client request
 * @param {string} options.details - Optional additional description
 */
const logAction = async ({ userId, userEmail, action, module, ipAddress, details }) => {
  try {
    await AuditLog.create({
      user: userId || null,
      userEmail: userEmail || 'System/Anonymous',
      action,
      module,
      ipAddress: ipAddress || '127.0.0.1',
      details: details || ''
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

module.exports = { logAction };
