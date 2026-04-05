// Middleware factory: checks if the logged-in user has one of the allowed roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not permitted to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { authorize };
