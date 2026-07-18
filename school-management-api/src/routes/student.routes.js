const express = require('express');
const {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentTimeline,
} = require('../controllers/student.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, checkPermission('students', 'read'), getAllStudents);
router.get('/:id', authenticate, checkPermission('students', 'read'), getStudent);
router.get('/:id/timeline', authenticate, checkPermission('students', 'read'), getStudentTimeline);
router.post('/', authenticate, checkPermission('students', 'create'), createStudent);
router.put('/:id', authenticate, checkPermission('students', 'update'), updateStudent);
router.delete('/:id', authenticate, checkPermission('students', 'delete'), deleteStudent);

module.exports = router;
