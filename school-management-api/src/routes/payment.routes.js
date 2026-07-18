const express = require('express');
const {
  uploadProof,
  getAllPayments,
  approvePayment,
  rejectPayment,
} = require('../controllers/payment.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');
const { secureUpload } = require('../middleware/fileUpload.middleware');

const router = express.Router();

router.post(
  '/upload-proof',
  authenticate,
  checkPermission('payments', 'create'),
  secureUpload,
  uploadProof
);

router.get('/', authenticate, checkPermission('payments', 'read'), getAllPayments);
router.put('/:id/approve', authenticate, checkPermission('payments', 'approve'), approvePayment);
router.put('/:id/reject', authenticate, checkPermission('payments', 'approve'), rejectPayment);

module.exports = router;
