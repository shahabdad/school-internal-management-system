const express = require('express');
const {
  createComplaint,
  getAllComplaints,
  getComplaint,
  assignStaff,
  startReview,
  solveComplaint,
  closeComplaint,
} = require('../controllers/complaint.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, checkPermission('complaints', 'create'), createComplaint);
router.get('/', authenticate, checkPermission('complaints', 'read'), getAllComplaints);
router.get('/:id', authenticate, checkPermission('complaints', 'read'), getComplaint);
router.put('/:id/assign', authenticate, checkPermission('complaints', 'update'), assignStaff);
router.put('/:id/review', authenticate, checkPermission('complaints', 'update'), startReview);
router.put('/:id/solve', authenticate, checkPermission('complaints', 'update'), solveComplaint);
router.put('/:id/close', authenticate, checkPermission('complaints', 'update'), closeComplaint);

module.exports = router;
