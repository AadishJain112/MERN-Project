const Activity = require('../models/Activity');
const TeacherAssignment = require('../models/TeacherAssignment');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const getPendingActivities = async (req, res) => {
  try {
    const query = { status: 'pending' };
    if (req.query.category) {
      query.category = req.query.category;
    }

    let activities = await Activity.find(query)
      .populate({
      path: 'student',
      select: 'name department batch',
      match: { department: req.user.department }
      })
      .sort({ createdAt: -1 });

    activities = activities.filter(a => a.student);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res, status) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    activity.status = status;
    activity.verifiedBy = req.user._id;
    await activity.save();

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveActivity = (req, res) => updateStatus(req, res, 'approved');
const rejectActivity = (req, res) => updateStatus(req, res, 'rejected');

/**
 * GET /api/teachers/:id/students
 * Get students assigned to a teacher
 */
const getAssignedStudents = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if teacher exists
    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get teacher assignment
    const assignment = await TeacherAssignment.findOne({ teacher: id }).populate(
      'studentIds',
      'name email department batch rollNumber'
    );

    if (!assignment || !assignment.studentIds || assignment.studentIds.length === 0) {
      return res.json([]);
    }

    res.json(assignment.studentIds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/teachers/student/:studentId/profile
 * Get a student's profile (teacher can view any student in their classroom)
 */
const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user._id;

    // Verify teacher has a classroom with this student
    const classroom = await Classroom.findOne({
      teacher: teacherId,
      students: studentId
    });

    if (!classroom) {
      return res.status(403).json({ error: 'You do not have access to this student profile' });
    }

    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const academics = await require('../models/Academics').find({ student: studentId }).sort({
      createdAt: -1,
    });
    const attendance = await require('../models/Attendance').find({ student: studentId }).sort({
      createdAt: -1,
    });

    res.json({
      user: student,
      academics,
      attendance,
    });
  } catch (error) {
    console.error('Error in getStudentProfile:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/teachers/student/:studentId/assignment-stats
 * Get assignment statistics for a student (teacher can view any student in their classroom)
 */
const getStudentAssignmentStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user._id;

    // Verify teacher has a classroom with this student
    const classrooms = await Classroom.find({
      teacher: teacherId,
      students: studentId
    }).select('_id');

    if (classrooms.length === 0) {
      return res.status(403).json({ error: 'You do not have access to this student profile' });
    }

    const classroomIds = classrooms.map(c => c._id);

    // Get all assignments from these classrooms
    const assignments = await Assignment.find({ 
      classroom: { $in: classroomIds },
      status: 'published'
    }).lean();

    // Get all student's submissions
    const submissions = await Submission.find({
      student: studentId,
      classroom: { $in: classroomIds },
      status: { $in: ['submitted', 'returned'] }
    })
    .populate('assignment', 'title dueDate maxPoints')
    .lean();

    // Calculate statistics
    const totalAssignments = assignments.length;
    const totalSubmissions = submissions.length;
    const lateSubmissions = submissions.filter(s => s.isLate).length;
    const gradedSubmissions = submissions.filter(s => s.grade !== undefined);
    
    // Grade statistics
    const grades = gradedSubmissions.map(s => ({
      grade: s.grade,
      maxPoints: s.maxPoints,
      percentage: (s.grade / s.maxPoints) * 100
    }));

    const averagePercentage = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
      : 0;

    const peakScore = grades.length > 0
      ? Math.max(...grades.map(g => g.percentage))
      : 0;

    const lowestScore = grades.length > 0
      ? Math.min(...grades.map(g => g.percentage))
      : 0;

    // Grade distribution by assignment
    const gradesByAssignment = gradedSubmissions.map(s => ({
      title: s.assignment?.title || 'Unknown',
      grade: s.grade,
      maxPoints: s.maxPoints,
      percentage: Math.round((s.grade / s.maxPoints) * 100),
      submittedAt: s.submittedAt,
      isLate: s.isLate,
      feedback: s.feedback
    })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Recent submissions (last 10)
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 10)
      .map(s => ({
        title: s.assignment?.title || 'Unknown',
        submittedAt: s.submittedAt,
        isLate: s.isLate,
        grade: s.grade,
        maxPoints: s.maxPoints,
        graded: s.grade !== undefined
      }));

    // Pending assignments (not submitted yet)
    const submittedAssignmentIds = submissions.map(s => s.assignment?._id?.toString());
    const pendingAssignments = assignments
      .filter(a => !submittedAssignmentIds.includes(a._id.toString()))
      .map(a => ({
        title: a.title,
        dueDate: a.dueDate,
        maxPoints: a.maxPoints,
        isOverdue: new Date() > new Date(a.dueDate)
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({
      overview: {
        totalClassrooms: classrooms.length,
        totalAssignments,
        totalSubmissions,
        submissionRate: totalAssignments > 0 
          ? Math.round((totalSubmissions / totalAssignments) * 100) 
          : 0,
        lateSubmissions,
        onTimeSubmissions: totalSubmissions - lateSubmissions,
        pendingAssignments: pendingAssignments.length
      },
      performance: {
        totalGraded: gradedSubmissions.length,
        averagePercentage: Math.round(averagePercentage * 10) / 10,
        peakScore: Math.round(peakScore * 10) / 10,
        lowestScore: Math.round(lowestScore * 10) / 10,
        gradesAbove80: grades.filter(g => g.percentage >= 80).length,
        gradesAbove60: grades.filter(g => g.percentage >= 60 && g.percentage < 80).length,
        gradesBelow60: grades.filter(g => g.percentage < 60).length
      },
      classrooms,
      gradesByAssignment,
      recentSubmissions,
      pendingAssignments: pendingAssignments.slice(0, 5)
    });
  } catch (error) {
    console.error('Error in getStudentAssignmentStats:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPendingActivities, approveActivity, rejectActivity, getAssignedStudents, getStudentProfile, getStudentAssignmentStats };

