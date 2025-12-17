// backend/middleware/auditMiddleware.js
const AuditLog = require('../models/AuditLog');

/**
 * Middleware to log user actions
 */
const auditLog = (action, resource) => {
  return async (req, res, next) => {
    // Store original json function
    const originalJson = res.json;

    // Override json function to log after response
    res.json = function (data) {
      // Log the action asynchronously (don't block response)
      setImmediate(async () => {
        try {
          await AuditLog.create({
            user: req.user?._id,
            action,
            resource,
            resourceId: req.params?.id || req.body?.id,
            details: {
              method: req.method,
              path: req.path,
              query: req.query,
              body: action.includes('delete') || action.includes('password')
                ? { hidden: true }
                : req.body,
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            status: res.statusCode < 400 ? 'success' : 'failure',
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }
      });

      // Call original json function
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = { auditLog };

