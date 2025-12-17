// backend/middleware/permissionMiddleware.js

/**
 * Middleware to check if user has a specific permission
 * @param {string} permission - Permission name to check
 * @returns {Function} Express middleware
 */
const allowIfHasPermission = (permission) => {
  return (req, res, next) => {
    // Admin always has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Students can view their own marks
    if (req.user.role === 'student' && permission === 'viewMarks') {
      // Check if requesting own data
      if (req.params.id && req.params.id === req.user._id.toString()) {
        return next();
      }
    }

    // Check if user has the required permission
    const permissions = req.user.permissions || [];
    if (permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
  };
};

module.exports = { allowIfHasPermission };

