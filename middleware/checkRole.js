//middleware/checkRole,js

module.exports = function (requiredRole) {
    return (req, res, next) => {
      // Ensure user information is available from the auth middleware
      if (!req.user) {
        return res.status(401).json({ msg: "User not authenticated" });
      }
  
      // Check if the user's role matches the required role
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ msg: "Access denied" });
      }
  
      next();  // User has the required role, proceed to the route handler
    };
  };
  