const Student = require('../models/student.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @route   GET /api/v1/students
 * @desc    Get all students
 * @access  Private (Admin, CEO, CustomerService, OperationsManager)
 */
const getAllStudents = catchAsync(async (req, res, next) => {
  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    return next(
      new AppError('You do not have permission to view all student records', 403)
    );
  }

  const students = await Student.find();

  res.status(200).json({
    status: 'success',
    results: students.length,
    data: {
      students,
    },
  });
});

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get single student profile by ID
 * @access  Private (Own profile or Admin/CEO/CS/Operations)
 */
const getStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Enforce dynamic ownership rules via email matching
  if (req.permissionRule?.type === 'ownership') {
    if (student.email !== req.user.email) {
      return next(
        new AppError('You do not have permission to view this student profile', 403)
      );
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      student,
    },
  });
});

/**
 * @route   POST /api/v1/students
 * @desc    Create a new student record
 * @access  Private (Admin, CEO)
 */
const createStudent = catchAsync(async (req, res, next) => {
  const { name, email, phone, address, membership, status } = req.body;

  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    return next(new AppError('Student email is already registered', 400));
  }

  const newStudent = await Student.create({
    name,
    email,
    phone,
    address,
    membership,
    status,
  });

  res.status(201).json({
    status: 'success',
    data: {
      student: newStudent,
    },
  });
});

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Update a student record
 * @access  Private (Own profile or Admin/CEO)
 */
const updateStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Enforce dynamic ownership rules
  if (req.permissionRule?.type === 'ownership') {
    if (student.email !== req.user.email) {
      return next(
        new AppError('You do not have permission to update this student record', 403)
      );
    }
  }

  // Filter allowed fields for update based on role
  const filteredBody = {};
  let allowedFields = ['name', 'phone', 'address'];

  // Admins and CEOs can update membership tier and student status
  if (['Admin', 'CEO'].includes(req.user.role)) {
    allowedFields.push('email', 'membership', 'status');
  }

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      student: updatedStudent,
    },
  });
});

/**
 * @route   DELETE /api/v1/students/:id
 * @desc    Delete a student record
 * @access  Private (Admin, CEO)
 */
const deleteStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
