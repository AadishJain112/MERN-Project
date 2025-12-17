const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Classroom = require('../models/Classroom');
const Notification = require('../models/Notification');

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, content } = req.body;
    const studentId = req.user.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.status !== 'published') {
      return res.status(400).json({ error: 'Assignment is not published' });
    }

    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    });

    // Only block if there's already a submitted submission (not draft)
    if (submission && submission.status === 'submitted') {
      return res.status(400).json({ error: 'You have already submitted this assignment' });
    }

    // If draft exists, update it; otherwise create new
    if (!submission) {
      submission = new Submission({
        assignment: assignmentId,
        student: studentId,
        classroom: assignment.classroom,
        content,
        status: 'submitted',
        submittedAt: new Date()
      });
    } else {
      // Update draft to submitted
      submission.content = content;
      submission.status = 'submitted';
      submission.submittedAt = new Date();
    }

    // Handle optional file upload
    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;
      submission.attachments = [{
        filename: req.file.originalname,
        url: fileUrl,
        uploadedAt: new Date()
      }];
    }

    // Check if late
    if (new Date() > assignment.dueDate) {
      submission.isLate = true;
    }

    await submission.save();
    await submission.populate('student', 'name email');
    await submission.populate('assignment', 'title');

    // Notify teacher
    await Notification.create({
      user: assignment.teacher,
      title: 'New Submission',
      message: `Student submitted ${assignment.title}`,
      type: 'submission',
      relatedId: submission._id
    });

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get submission
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email rollNumber')
      .populate('assignment', 'title description dueDate maxPoints')
      .populate('gradedBy', 'name email');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all submissions for an assignment
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Only teacher can view submissions
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can view submissions' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email rollNumber department')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student submissions for a classroom
exports.getStudentSubmissions = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const studentId = req.user.id;

    const submissions = await Submission.find({
      classroom: classroomId,
      student: studentId
    })
      .populate('assignment', 'title dueDate maxPoints status')
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Grade submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const assignment = await Assignment.findById(submission.assignment);

    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can grade submissions' });
    }

    if (grade < 0 || grade > assignment.maxPoints) {
      return res.status(400).json({ error: `Grade must be between 0 and ${assignment.maxPoints}` });
    }

    submission.grade = grade;
    submission.maxPoints = assignment.maxPoints;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;
    submission.status = 'returned';

    await submission.save();

    // Notify student
    await Notification.create({
      user: submission.student,
      title: 'Assignment Graded',
      message: `Your submission has been graded: ${grade}/${assignment.maxPoints}`,
      type: 'grading',
      relatedId: submission._id
    });

    res.status(200).json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Return submission for revision
exports.returnSubmission = async (req, res) => {
  try {
    const { feedback } = req.body;
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const assignment = await Assignment.findById(submission.assignment);

    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can return submissions' });
    }

    submission.feedback = feedback;
    submission.status = 'returned';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await submission.save();

    // Notify student
    await Notification.create({
      user: submission.student,
      title: 'Assignment Returned',
      message: 'Your submission needs revision. Please check the feedback.',
      type: 'submission',
      relatedId: submission._id
    });

    res.status(200).json({
      message: 'Submission returned successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get grading summary for assignment
exports.getGradingSummary = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only teacher can view grading summary' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email rollNumber');

    const summary = {
      totalSubmitted: submissions.filter(s => s.status === 'submitted' || s.status === 'returned').length,
      totalGraded: submissions.filter(s => s.grade !== undefined).length,
      averageGrade: submissions
        .filter(s => s.grade !== undefined)
        .reduce((sum, s) => sum + (s.grade / s.maxPoints) * 100, 0) / 
        submissions.filter(s => s.grade !== undefined).length || 0,
      submissions: submissions.map(s => ({
        _id: s._id,
        studentName: s.student.name,
        studentEmail: s.student.email,
        rollNumber: s.student.rollNumber,
        submittedAt: s.submittedAt,
        isLate: s.isLate,
        grade: s.grade,
        maxPoints: s.maxPoints,
        percentage: s.grade ? (s.grade / s.maxPoints) * 100 : null,
        status: s.status
      }))
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
