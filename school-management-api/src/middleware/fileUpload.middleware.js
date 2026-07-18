const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const fsSync = require('fs');
const AppError = require('../utils/appError');
const { logAction } = require('../utils/auditLogger');

// Ensure destination directory exists
const uploadDir = path.join(__dirname, '../uploads/proofs');
if (!fsSync.existsSync(uploadDir)) {
  fsSync.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration - use secure UUIDs instead of original names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID() || crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueName}${extension}`);
  },
});

// File filter (extension check)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    return cb(null, true);
  }
  cb(new AppError('Forbidden file extension! Only JPG, JPEG, PNG, and PDF files are allowed.', 400), false);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: fileFilter,
}).single('proof');

// Second validation: scanning content for malicious inputs and double checking file integrity
const virusScanAndValidate = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const fileExtension = path.extname(fileName).toLowerCase();

  // Double Check Extension
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
  if (!allowedExtensions.includes(fileExtension)) {
    await fs.unlink(filePath).catch(() => {});
    return next(new AppError('Forbidden file extension! Only JPG, JPEG, PNG, and PDF files are allowed.', 400));
  }

  // Double Check File Size
  const maxSizeBytes = 5 * 1024 * 1024;
  if (req.file.size > maxSizeBytes) {
    await fs.unlink(filePath).catch(() => {});
    return next(new AppError('File size too large. Maximum size allowed is 5MB.', 400));
  }

  // Virus Scan Check
  try {
    const fileContent = await fs.readFile(filePath);
    const fileContentStr = fileContent.toString('utf8');
    
    // EICAR signature and common malicious keywords
    const eicarRegex = /X5O!P%@AP\[4\\PZX54\(P\^\)7CC\)7\}\$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!\$H\+H\*/i;
    
    if (eicarRegex.test(fileContentStr) || 
        fileContentStr.toLowerCase().includes('malware') || 
        fileContentStr.toLowerCase().includes('trojan') || 
        fileContentStr.toLowerCase().includes('virus')) {
      
      // Delete the file immediately
      await fs.unlink(filePath).catch(() => {});

      // Log threat in audit log
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      await logAction({
        userId: req.user ? req.user._id : null,
        userEmail: req.user ? req.user.email : 'anonymous',
        action: 'Virus Detected',
        module: 'Payment',
        ipAddress,
        details: `Malicious signature/content detected in uploaded file: ${fileName}. Upload rejected and file deleted.`
      });

      return next(new AppError('Virus scan failed! A security threat was detected in the file.', 400));
    }

    console.log(`🛡️ Virus scan clean for file: ${fileName}`);
    next();
  } catch (err) {
    await fs.unlink(filePath).catch(() => {});
    return next(new AppError('Failed to scan file for viruses. Upload rejected for safety.', 500));
  }
};

// Secure upload middleware combining all steps
const secureUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size too large. Maximum size allowed is 5MB.', 400));
        }
        return next(new AppError(`File upload error: ${err.message}`, 400));
      }
      return next(err);
    }
    // Proceed to virus scan and second validation check
    virusScanAndValidate(req, res, next);
  });
};

module.exports = {
  secureUpload
};
