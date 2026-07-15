const express = require('express');
const {
  getAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/membership-plan.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, checkPermission('memberships', 'read'), getAllPlans);
router.get('/:id', authenticate, checkPermission('memberships', 'read'), getPlan);
router.post('/', authenticate, checkPermission('memberships', 'create'), createPlan);
router.put('/:id', authenticate, checkPermission('memberships', 'update'), updatePlan);
router.delete('/:id', authenticate, checkPermission('memberships', 'delete'), deletePlan);

module.exports = router;
