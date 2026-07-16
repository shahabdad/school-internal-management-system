const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/stats', authenticate, checkPermission('dashboard', 'read'), getDashboardStats);

module.exports = router;
