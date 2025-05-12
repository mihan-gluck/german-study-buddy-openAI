// routes/student.js

const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const authMiddleware = require('../middleware/auth'); // JWT auth middleware

// GET /api/student/vapi-courses
router.get('/vapi-courses', authMiddleware, async (req, res) => {
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

module.exports = router;
