// backend/controllers/academicRecordsController.js
const AcademicRecord = require('../models/AcademicRecord');
const User = require('../models/User');
const { calcSubjectTotal, calcSGPA, calcCGPA } = require('../utils/grades');

/**
 * POST /api/students/:id/marks
 * Add academic marks for a student
 */
const addMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, subjects, remarks } = req.body;

    // Validation
    if (!semester || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Semester and subjects array are required' });
    }

    const semesterNum = parseInt(semester);
    if (isNaN(semesterNum) || semesterNum < 1) {
      return res.status(400).json({ message: 'Semester must be a positive integer' });
    }

    // Validate subjects
    for (const subject of subjects) {
      if (!subject.code || !subject.name) {
        return res.status(400).json({ message: 'Each subject must have code and name' });
      }
      if (
        typeof subject.internalMarks !== 'number' ||
        typeof subject.endTermMarks !== 'number'
      ) {
        return res.status(400).json({ message: 'Marks must be numbers' });
      }
      if (
        subject.internalMarks < 0 ||
        subject.internalMarks > 100 ||
        subject.endTermMarks < 0 ||
        subject.endTermMarks > 100
      ) {
        return res.status(400).json({ message: 'Marks must be between 0 and 100' });
      }
    }

    // Check if student exists
    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if record already exists for this semester
    const existingRecord = await AcademicRecord.findOne({ student: id, semester });
    if (existingRecord) {
      return res.status(400).json({ message: 'Academic record already exists for this semester' });
    }

    // Calculate totals and SGPA
    const subjectsWithTotals = subjects.map((subject) => ({
      code: subject.code,
      name: subject.name,
      internalMarks: subject.internalMarks,
      endTermMarks: subject.endTermMarks,
      total: calcSubjectTotal(subject.internalMarks, subject.endTermMarks),
    }));

    const sgpa = calcSGPA(subjectsWithTotals);

    // Create academic record
    const academicRecord = await AcademicRecord.create({
      student: id,
      semester: semesterNum,
      subjects: subjectsWithTotals,
      sgpa,
      createdBy: req.user._id,
      remarks: remarks || '',
    });

    res.status(201).json(academicRecord);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Academic record already exists for this semester' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/students/:id/marks
 * Get all academic records for a student
 */
const getMarks = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const records = await AcademicRecord.find({ student: id })
      .sort({ semester: -1 })
      .populate('createdBy', 'name email');

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/students/:id/marks/latest
 * Get latest semester record for a student
 */
const getLatestMarks = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await AcademicRecord.findOne({ student: id })
      .sort({ semester: -1 })
      .populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({ message: 'No academic records found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/marks/:recordId
 * Update academic marks
 */
const updateMarks = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { subjects, remarks } = req.body;

    const record = await AcademicRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Academic record not found' });
    }

    // If subjects are provided, validate and recalculate
    if (subjects && Array.isArray(subjects)) {
      if (subjects.length === 0) {
        return res.status(400).json({ message: 'Subjects array cannot be empty' });
      }

      // Validate subjects
      for (const subject of subjects) {
        if (!subject.code || !subject.name) {
          return res.status(400).json({ message: 'Each subject must have code and name' });
        }
        if (
          typeof subject.internalMarks !== 'number' ||
          typeof subject.endTermMarks !== 'number'
        ) {
          return res.status(400).json({ message: 'Marks must be numbers' });
        }
        if (
          subject.internalMarks < 0 ||
          subject.internalMarks > 100 ||
          subject.endTermMarks < 0 ||
          subject.endTermMarks > 100
        ) {
          return res.status(400).json({ message: 'Marks must be between 0 and 100' });
        }
      }

      // Calculate totals and SGPA
      const subjectsWithTotals = subjects.map((subject) => ({
        code: subject.code,
        name: subject.name,
        internalMarks: subject.internalMarks,
        endTermMarks: subject.endTermMarks,
        total: calcSubjectTotal(subject.internalMarks, subject.endTermMarks),
      }));

      record.subjects = subjectsWithTotals;
      record.sgpa = calcSGPA(subjectsWithTotals);
    }

    if (remarks !== undefined) {
      record.remarks = remarks;
    }

    await record.save();
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/marks/:recordId
 * Delete academic record
 */
const deleteMarks = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await AcademicRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Academic record not found' });
    }

    await AcademicRecord.findByIdAndDelete(recordId);
    res.json({ message: 'Academic record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/students/:id/cgpa
 * Calculate and return CGPA for a student
 */
const getCGPA = async (req, res) => {
  try {
    const { id } = req.params;

    const records = await AcademicRecord.find({ student: id }).sort({ semester: 1 });
    const cgpa = calcCGPA(records);

    res.json({
      cgpa,
      totalSemesters: records.length,
      records: records.map((r) => ({
        semester: r.semester,
        sgpa: r.sgpa,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMarks,
  getMarks,
  getLatestMarks,
  updateMarks,
  deleteMarks,
  getCGPA,
};

