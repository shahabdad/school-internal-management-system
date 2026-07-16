const express = require('express');
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  seedDatabase,
} = require('../controllers/auth.controller');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../validators/auth.validator');

const router = express.Router();

const { authenticate, checkPermission } = require('../middleware/auth.middleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/seed', seedDatabase);

// RBAC integration test routes
router.get('/test/students-read', authenticate, checkPermission('students', 'read'), (req, res) => {
  if (req.permissionRule?.type === 'ownership') {
    return res.status(403).json({ status: 'fail', message: 'You do not have permission to perform this action' });
  }
  res.status(200).json({ status: 'success', message: 'Authorized: Read Students' });
});

router.post('/test/payments-approve', authenticate, checkPermission('payments', 'approve'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Authorized: Approve Payments' });
});

router.get('/test/complaints-own', authenticate, checkPermission('complaints', 'own'), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Authorized with ownership rule',
    rule: req.permissionRule
  });
});

module.exports = router;
