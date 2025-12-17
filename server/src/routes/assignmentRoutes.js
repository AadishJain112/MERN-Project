const router = require('express').Router();
const {
  createAssignment,
  getClassroomAssignments,
  getAssignment,
  updateAssignment,
  publishAssignment,
  closeAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

// Read endpoints: allow teachers and students
router.get('/classroom/:classroomId', authorizeRoles('teacher', 'student'), getClassroomAssignments);
router.get('/:id', authorizeRoles('teacher', 'student'), getAssignment);

// Write endpoints: teachers only
router.post('/', authorizeRoles('teacher'), createAssignment);
router.put('/:id', authorizeRoles('teacher'), updateAssignment);
router.put('/:id/publish', authorizeRoles('teacher'), publishAssignment);
router.put('/:id/close', authorizeRoles('teacher'), closeAssignment);
router.delete('/:id', authorizeRoles('teacher'), deleteAssignment);

module.exports = router;
