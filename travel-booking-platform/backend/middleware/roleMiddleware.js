// Role-based access control middleware
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ 
        message: 'No role found. Access denied.' 
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.userRole}` 
      });
    }
    
    next();
  };
};

module.exports = roleMiddleware;
