const express = require('express');
const {
  getAllMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership,
} = require('../controllers/membership.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, checkPermission('memberships', 'read'), getAllMemberships);
router.get('/:id', authenticate, checkPermission('memberships', 'read'), getMembership);
router.post('/', authenticate, checkPermission('memberships', 'create'), createMembership);
router.put('/:id', authenticate, checkPermission('memberships', 'update'), updateMembership);
router.delete('/:id', authenticate, checkPermission('memberships', 'delete'), deleteMembership);

module.exports = router;
