//middleware/auth.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Secret from .env file

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach the decoded token to the request object (user info)
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};


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