// routes/student.js

const express = require('express');
const router = express.Router();

const Subscription = require('../models/subscriptions');
const User = require('../models/User'); // for fetching student info
const authMiddleware = require('../middleware/auth'); // JWT auth middleware
const { verifyToken, checkRole } = require('../middleware/auth');


// GET /api/student/vapi-courses
router.get('/vapi-courses', verifyToken, checkRole('student'), async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });

    if (!subscription || subscription.courses.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(subscription.courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching VAPI courses' });
  }
});

// ✅ GET /api/student/profile - Get current student's profile
router.get('/profile', verifyToken, checkRole('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      registeredAt: user.registeredAt,
      subscriptionPlan: user.subscriptionPlan || null,
      assignedCourses: user.assignedCourses || [],
    });
  } catch (err) {
    console.error('Student profile error:', err);
    res.status(500).json({ msg: 'Error retrieving student profile', error: err.message });
  }
});

module.exports = router;
