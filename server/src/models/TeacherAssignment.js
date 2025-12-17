// backend/models/TeacherAssignment.js
const mongoose = require('mongoose');

const teacherAssignmentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Index to ensure one assignment per teacher
teacherAssignmentSchema.index({ teacher: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAssignment', teacherAssignmentSchema);

