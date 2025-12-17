const mongoose = require('mongoose');

const academicsSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: String, required: true },
    cgpa: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Academics', academicsSchema);

