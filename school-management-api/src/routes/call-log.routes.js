const express = require('express');
const {
  createCallLog,
  getAllCallLogs,
  getCallLog,
  updateCallLog,
  deleteCallLog,
} = require('../controllers/call-log.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, checkPermission('callLogs', 'create'), createCallLog);
router.get('/', authenticate, checkPermission('callLogs', 'read'), getAllCallLogs);
router.get('/:id', authenticate, checkPermission('callLogs', 'read'), getCallLog);
router.put('/:id', authenticate, checkPermission('callLogs', 'update'), updateCallLog);
router.delete('/:id', authenticate, checkPermission('callLogs', 'delete'), deleteCallLog);

module.exports = router;
