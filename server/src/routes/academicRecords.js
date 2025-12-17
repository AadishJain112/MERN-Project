// backend/routes/academicRecords.js
const router = require('express').Router();
const {
  addMarks,
  getMarks,
  getLatestMarks,
  updateMarks,
  deleteMarks,
  getCGPA,
} = require('../controllers/academicRecordsController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { allowIfHasPermission } = require('../middleware/permissionMiddleware');

// All routes require authentication
router.use(protect);

// POST /api/students/:id/marks - Add marks (teacher with editMarks permission or admin)
router.post(
  '/students/:id/marks',
  (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }
    allowIfHasPermission('editMarks')(req, res, next);
  },
  addMarks
);

// GET /api/students/:id/marks - Get all marks (teacher with viewMarks permission, admin, or student viewing own)
router.get(
  '/students/:id/marks',
  (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }
    if (req.user.role === 'student' && req.params.id === req.user._id.toString()) {
      return next();
    }
    allowIfHasPermission('viewMarks')(req, res, next);
  },
  getMarks
);

// GET /api/students/:id/marks/latest - Get latest marks
router.get(
  '/students/:id/marks/latest',
  (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }
    if (req.user.role === 'student' && req.params.id === req.user._id.toString()) {
      return next();
    }
    allowIfHasPermission('viewMarks')(req, res, next);
  },
  getLatestMarks
);

// GET /api/students/:id/cgpa - Get CGPA
router.get(
  '/students/:id/cgpa',
  (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }
    if (req.user.role === 'student' && req.params.id === req.user._id.toString()) {
      return next();
    }
    allowIfHasPermission('viewMarks')(req, res, next);
  },
  getCGPA
);

// PUT /api/marks/:recordId - Update marks (teacher with editMarks permission or admin)
router.put(
  '/marks/:recordId',
  (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }
    allowIfHasPermission('editMarks')(req, res, next);
  },
  updateMarks
);

// DELETE /api/marks/:recordId - Delete marks (admin only or teacher with editMarks permission)
router.delete(
  '/marks/:recordId',
  (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }
    allowIfHasPermission('editMarks')(req, res, next);
  },
  deleteMarks
);

module.exports = router;

