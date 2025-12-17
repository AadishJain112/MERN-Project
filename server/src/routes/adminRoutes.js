const router = require('express').Router();
const {
  getUsers,
  addUser,
  deleteUser,
  setPermissions,
  getAllClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  addStudentToClassroom,
  removeStudentFromClassroom
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRoles('admin'));

// User management routes
router.get('/users', getUsers);
router.post('/user/add', addUser);
router.delete('/user/delete/:id', deleteUser);
router.put('/users/:id/permissions', setPermissions);

// Classroom management routes
router.get('/classrooms', getAllClassrooms);
router.post('/classrooms', createClassroom);
router.put('/classrooms/:id', updateClassroom);
router.delete('/classrooms/:id', deleteClassroom);
router.post('/classrooms/:id/add-student', addStudentToClassroom);
router.post('/classrooms/:id/remove-student', removeStudentFromClassroom);

module.exports = router;

