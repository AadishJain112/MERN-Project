const router = require("express").Router();
const {
  getActivities,
  addActivity,
  getProfile,
  getDashboardStats,
  getAssignmentStats,
} = require("../controllers/studentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);
router.use(authorizeRoles("student"));

router.get("/activities", getActivities);
router.post("/activity/add", upload.single("file"), addActivity);
router.get("/profile", getProfile);
router.get("/dashboard-stats", getDashboardStats);
router.get("/assignment-stats", getAssignmentStats);

module.exports = router;
