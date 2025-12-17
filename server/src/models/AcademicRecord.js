// backend/models/AcademicRecord.js
const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
    },
    subjects: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
        internalMarks: { type: Number, required: true, min: 0, max: 100 },
        endTermMarks: { type: Number, required: true, min: 0, max: 100 },
        total: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    sgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate semester records per student
academicRecordSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);

