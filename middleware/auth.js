//middleware/auth.js

require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware: Verify JWT token
function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user data to request
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
}

// Optional middleware for explicit admin check
function isAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  next();
}

// General role-based access control middleware
const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
  };
};


// ✅ Export all middleware
module.exports = {
  verifyToken,
  isAdmin,
  checkRole,
};


/* // Middleware: Check if user is admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin
  } else {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
}

module.exports = {
  verifyToken,
  isAdmin
}; */



/* require('dotenv').config();  // Import dotenv to access environment variables

const jwt = require('jsonwebtoken');

// Access JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
  // Get the token from Authorization header
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);

    // Attach the decoded user to the request object
    req.user = decoded;
    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }

  // Add this route for getting the user profile
router.get("/profile", auth, async (req, res) => {
  try {
    // Find the user by their ID (from the JWT payload)
    const user = await User.findById(req.user.userId).select('-password'); // Don't send password

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ user }); // Send the user data
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

};
 */