// backend/routes/analyticsRoutes.js
const router = require('express').Router();
const {
  getOverview,
  getActivityAnalytics,
  getAcademicAnalytics,
  getUserAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

// All analytics routes require admin role
router.use(authorizeRoles('admin'));

router.get('/overview', getOverview);
router.get('/activities', getActivityAnalytics);
router.get('/academics', getAcademicAnalytics);
router.get('/users', getUserAnalytics);

module.exports = router;

