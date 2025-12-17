const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Classroom = require('../models/Classroom');
const Notification = require('../models/Notification');

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, classroomId, dueDate, maxPoints, instructions } = req.body;
    const teacherId = req.user.id;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (classroom.teacher.toString() !== teacherId) {
      return res.status(403).json({ error: 'Only teacher can create assignments' });
    }

    const assignment = new Assignment({
      title,
      description,
      classroom: classroomId,
      teacher: teacherId,
      dueDate,
      maxPoints,
      instructions,
      status: 'draft'
    });

    await assignment.save();
    await assignment.populate('teacher', 'name email');
    await assignment.populate('classroom', 'name section');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get assignments for a classroom
exports.getClassroomAssignments = async (req, res) => {
  try {
    const { classroomId } = req.params;

    const assignments = await Assignment.find({ classroom: classroomId })
      .populate('teacher', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single assignment
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('classroom', 'name section');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can update assignment' });
    }

    if (assignment.status !== 'draft') {
      return res.status(400).json({ error: 'Can only edit draft assignments' });
    }

    Object.assign(assignment, req.body);
    await assignment.save();

    res.status(200).json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Publish assignment
exports.publishAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can publish assignment' });
    }

    assignment.status = 'published';
    assignment.publishedAt = new Date();
    await assignment.save();

    // Create submissions for all students in classroom
    const classroom = await Classroom.findById(assignment.classroom);
    for (const studentId of classroom.students) {
      const existingSubmission = await Submission.findOne({
        assignment: assignment._id,
        student: studentId
      });
      if (!existingSubmission) {
        new Submission({
          assignment: assignment._id,
          student: studentId,
          classroom: assignment.classroom,
          status: 'draft'
        }).save();
      }
    }

    res.status(200).json({
      message: 'Assignment published successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Close assignment
exports.closeAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can close assignment' });
    }

    assignment.status = 'closed';
    assignment.closedAt = new Date();
    await assignment.save();

    res.status(200).json({
      message: 'Assignment closed successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can delete assignment' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ assignment: req.params.id });

    res.status(200).json({
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
