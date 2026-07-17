const express = require('express');
const { getReport, syncGoogleSheets, emailReportToCEO } = require('../controllers/reports.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/:reportType', authenticate, checkPermission('reports', 'read'), getReport);
router.post('/:reportType/sync-sheets', authenticate, checkPermission('reports', 'read'), syncGoogleSheets);
router.post('/:reportType/email-ceo', authenticate, checkPermission('reports', 'read'), emailReportToCEO);

module.exports = router;
