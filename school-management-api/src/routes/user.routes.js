const express = require('express');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, checkPermission('users', 'read'), getAllUsers);
router.get('/:id', authenticate, checkPermission('users', 'read'), getUser);
router.post('/', authenticate, checkPermission('users', 'create'), createUser);
router.put('/:id', authenticate, checkPermission('users', 'update'), updateUser);
router.delete('/:id', authenticate, checkPermission('users', 'delete'), deleteUser);

module.exports = router;
