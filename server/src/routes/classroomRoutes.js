const router = require('express').Router();
const {
  createClassroom,
  getTeacherClassrooms,
  getStudentClassrooms,
  getClassroom,
  updateClassroom,
  addStudent,
  removeStudent,
  joinClassroom,
  archiveClassroom
} = require('../controllers/classroomController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

// Teacher routes
router.post('/', authorizeRoles('teacher'), createClassroom);
router.get('/teacher/all', authorizeRoles('teacher'), getTeacherClassrooms);
router.put('/:id', authorizeRoles('teacher'), updateClassroom);
router.post('/:id/add-student', authorizeRoles('teacher'), addStudent);
router.post('/:id/remove-student', authorizeRoles('teacher'), removeStudent);
router.put('/:id/archive', authorizeRoles('teacher'), archiveClassroom);

// Student routes
router.get('/student/all', authorizeRoles('student'), getStudentClassrooms);
router.post('/join/code', authorizeRoles('student'), joinClassroom);

// Shared routes
router.get('/:id', getClassroom);

module.exports = router;
