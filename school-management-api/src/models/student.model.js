const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide student name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide student email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide student phone number'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide student address'],
      trim: true,
    },
    membership: {
      type: String,
      enum: ['Basic', 'Premium', 'VIP'],
      default: 'Basic',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
