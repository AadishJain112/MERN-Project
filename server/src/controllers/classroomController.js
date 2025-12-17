const Classroom = require('../models/Classroom');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const crypto = require('crypto');

// Create a new classroom
exports.createClassroom = async (req, res) => {
  try {
    const { name, description, section, department } = req.body;
    const teacherId = req.user.id;

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    const classroom = new Classroom({
      name,
      description,
      section,
      department,
      teacher: teacherId,
      code
    });

    await classroom.save();
    await classroom.populate('teacher', 'name email');

    res.status(201).json({
      message: 'Classroom created successfully',
      classroom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all classrooms for a teacher
exports.getTeacherClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ teacher: req.user.id })
      .populate('teacher', 'name email')
      .populate('students', 'name email rollNumber')
      .sort({ createdAt: -1 });

    res.status(200).json(classrooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all classrooms for a student
exports.getStudentClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ students: req.user.id })
      .populate('teacher', 'name email')
      .populate('students', 'name email rollNumber')
      .sort({ createdAt: -1 });

    res.status(200).json(classrooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single classroom
exports.getClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email rollNumber department batch');

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.status(200).json(classroom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update classroom
exports.updateClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (classroom.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can update classroom' });
    }

    Object.assign(classroom, req.body);
    await classroom.save();

    res.status(200).json({
      message: 'Classroom updated successfully',
      classroom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add student to classroom
exports.addStudent = async (req, res) => {
  try {
    const { classroomId, studentId } = req.body;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (classroom.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can add students' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!classroom.students.includes(studentId)) {
      classroom.students.push(studentId);
      await classroom.save();
    }

    res.status(200).json({
      message: 'Student added to classroom',
      classroom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove student from classroom
exports.removeStudent = async (req, res) => {
  try {
    const { classroomId, studentId } = req.body;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (classroom.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can remove students' });
    }

    classroom.students = classroom.students.filter(id => id.toString() !== studentId);
    await classroom.save();

    res.status(200).json({
      message: 'Student removed from classroom',
      classroom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Join classroom with code
exports.joinClassroom = async (req, res) => {
  try {
    const { code } = req.body;
    const studentId = req.user.id;

    const classroom = await Classroom.findOne({ code });
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom code not found' });
    }

    if (classroom.students.includes(studentId)) {
      return res.status(400).json({ error: 'Already joined this classroom' });
    }

    classroom.students.push(studentId);
    await classroom.save();
    await classroom.populate('teacher', 'name email');
    await classroom.populate('students', 'name email rollNumber');

    res.status(200).json({
      message: 'Joined classroom successfully',
      classroom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Archive classroom
exports.archiveClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (classroom.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can archive classroom' });
    }

    classroom.status = 'archived';
    await classroom.save();

    res.status(200).json({
      message: 'Classroom archived successfully',
      classroom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
