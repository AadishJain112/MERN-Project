// backend/controllers/studentController.js
const Activity = require('../models/Activity');
const Academics = require('../models/Academics');
const Attendance = require('../models/Attendance');
const AcademicRecord = require('../models/AcademicRecord');
const { calcCGPA } = require('../utils/grades');

const getActivities = async (req, res) => {
  try {
    const query = { student: req.user._id };
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const activities = await Activity.find(query).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addActivity = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category required' });
    }

    const filePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const activity = await Activity.create({
      student: req.user._id,
      title,
      description,
      category,
      file: filePath,
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const academics = await Academics.find({ student: req.user._id }).sort({
      createdAt: -1,
    });
    const attendance = await Attendance.find({ student: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      user: req.user,
      academics,
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/student/dashboard-stats
 * Get comprehensive dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get activities
    const activities = await Activity.find({ student: studentId });
    const activitiesByStatus = {
      total: activities.length,
      approved: activities.filter((a) => a.status === 'approved').length,
      pending: activities.filter((a) => a.status === 'pending').length,
      rejected: activities.filter((a) => a.status === 'rejected').length,
    };

    const activitiesByCategory = {
      event: activities.filter((a) => a.category === 'event').length,
      achievement: activities.filter((a) => a.category === 'achievement').length,
      skill: activities.filter((a) => a.category === 'skill').length,
    };

    // Get academic records
    const academicRecords = await AcademicRecord.find({ student: studentId }).sort({
      semester: 1,
    });
    const cgpaData = calcCGPA(academicRecords);
    const latestRecord = academicRecords[academicRecords.length - 1];

    // Get attendance
    const attendanceRecords = await Attendance.find({ student: studentId }).sort({
      createdAt: -1,
    });
    const totalAttendance = attendanceRecords.reduce(
      (sum, record) => sum + record.present,
      0
    );
    const totalDays = attendanceRecords.reduce((sum, record) => sum + record.total, 0);
    const attendancePercentage =
      totalDays > 0 ? Math.round((totalAttendance / totalDays) * 100) : 0;

    // Recent activities (last 5)
    const recentActivities = await Activity.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status category createdAt');

    // Performance trend (last 4 semesters)
    const performanceTrend = academicRecords
      .slice(-4)
      .map((record) => ({
        semester: record.semester,
        sgpa: record.sgpa,
      }));

    res.json({
      activities: {
        ...activitiesByStatus,
        byCategory: activitiesByCategory,
      },
      academics: {
        cgpa: cgpaData,
        totalSemesters: academicRecords.length,
        latestSGPA: latestRecord?.sgpa || null,
        latestSemester: latestRecord?.semester || null,
        performanceTrend,
      },
      attendance: {
        percentage: attendancePercentage,
        totalPresent: totalAttendance,
        totalDays,
        records: attendanceRecords.slice(0, 6),
      },
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/student/assignment-stats
 * Get comprehensive assignment and classroom statistics
 */
const getAssignmentStats = async (req, res) => {
  try {
    const Classroom = require('../models/Classroom');
    const Assignment = require('../models/Assignment');
    const Submission = require('../models/Submission');
    
    const studentId = req.user._id;

    // Get all classrooms the student is enrolled in
    const classrooms = await Classroom.find({ students: studentId })
      .select('name section department')
      .lean();

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
    console.error('Error in getAssignmentStats:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActivities, addActivity, getProfile, getDashboardStats, getAssignmentStats };
