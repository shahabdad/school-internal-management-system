const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadProof,
  getAllPayments,
  approvePayment,
  rejectPayment,
} = require('../controllers/payment.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

// Ensure destination directory exists
const uploadDir = path.join(__dirname, '../uploads/proofs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File Filter Configuration
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpg, jpeg, png) and PDF files are allowed as proof!'), false);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: fileFilter,
});

const router = express.Router();

router.post(
  '/upload-proof',
  authenticate,
  checkPermission('payments', 'create'),
  upload.single('proof'),
  uploadProof
);

router.get('/', authenticate, checkPermission('payments', 'read'), getAllPayments);
router.put('/:id/approve', authenticate, checkPermission('payments', 'approve'), approvePayment);
router.put('/:id/reject', authenticate, checkPermission('payments', 'approve'), rejectPayment);

module.exports = router;
