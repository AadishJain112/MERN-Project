const router = require('express').Router();
const {
  submitAssignment,
  getSubmission,
  getAssignmentSubmissions,
  getStudentSubmissions,
  gradeSubmission,
  returnSubmission,
  getGradingSummary
} = require('../controllers/submissionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

// Student routes
router.post('/', authorizeRoles('student'), upload.single('file'), submitAssignment);
router.get('/classroom/:classroomId', authorizeRoles('student'), getStudentSubmissions);

// Teacher routes
router.get('/assignment/:assignmentId/all', authorizeRoles('teacher'), getAssignmentSubmissions);
router.put('/:id/grade', authorizeRoles('teacher'), gradeSubmission);
router.put('/:id/return', authorizeRoles('teacher'), returnSubmission);
router.get('/assignment/:assignmentId/summary', authorizeRoles('teacher'), getGradingSummary);

// Shared
router.get('/:id', getSubmission);

module.exports = router;
