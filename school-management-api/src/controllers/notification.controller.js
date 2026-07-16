const Notification = require('../models/notification.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Helper function to trigger notifications programmatically in controllers
 */
const createNotification = async (userId, title, message, type) => {
  try {
    return await Notification.create({
      user: userId,
      title,
      message,
      type,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

/**
 * @route   GET /api/v1/notifications
 * @desc    Get current user's notifications
 * @access  Private (Authenticated User)
 */
const getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort('-createdAt')
    .limit(50); // limit to last 50 notifications

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications,
    },
  });
});

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private (Authenticated User)
 */
const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }

  // Ensure notification belongs to the authenticated user
  if (notification.user.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to modify this notification', 403));
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    status: 'success',
    data: {
      notification,
    },
  });
});

/**
 * @route   PUT /api/v1/notifications/read-all
 * @desc    Mark all of current user's notifications as read
 * @access  Private (Authenticated User)
 */
const markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
