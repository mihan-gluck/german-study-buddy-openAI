const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Get current teacher profile (GET /api/teacher/profile)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Access denied: not a teacher' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      assignedCourses: user.assignedCourses || [],
      registeredAt: user.registeredAt,
    });
  } catch (err) {
    console.error('Teacher profile error:', err);
    res.status(500).json({ msg: 'Error retrieving teacher profile', error: err.message });
  }
});

module.exports = router;
