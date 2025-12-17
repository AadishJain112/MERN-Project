const router = require('express').Router();
const {
  getPendingActivities,
  approveActivity,
  rejectActivity,
  getAssignedStudents,
  getStudentProfile,
  getStudentAssignmentStats,
} = require('../controllers/teacherController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRoles('teacher'));

router.get('/activities/pending', getPendingActivities);
router.put('/activity/approve/:id', approveActivity);
router.put('/activity/reject/:id', rejectActivity);
router.get('/:id/students', getAssignedStudents);
router.get('/student/:studentId/profile', getStudentProfile);
router.get('/student/:studentId/assignment-stats', getStudentAssignmentStats);

module.exports = router;

