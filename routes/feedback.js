// routes/feedback.js

const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { verifyToken, checkRole } = require('../middleware/auth');

// 1️⃣ Add feedback (TEACHER only)
router.post('/', verifyToken, checkRole('teacher'), async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    const saved = await feedback.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error adding feedback:', err);
    res.status(500).json({ success: false, message: 'Failed to add feedback' });
  }
});

// 2️⃣ Get feedback for a student (STUDENT or TEACHER)
router.get('/student/:id', verifyToken, async (req, res) => {
  try {
    // student can only access their own feedback
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const feedbackList = await Feedback.find({ studentId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: feedbackList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
});

// 3️⃣ Get all feedback (TEACHER only)
router.get('/', verifyToken, checkRole('teacher'), async (req, res) => {
  try {
    const allFeedback = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, data: allFeedback });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
});

// GET /feedback?level=B2&page=1&limit=10&startDate=2025-06-01&endDate=2025-06-08
router.get('/', verifyToken, checkRole("teacher"), async (req, res) => {
  try {
    const { level, page = 1, limit = 10, startDate, endDate } = req.query;
    const filter = {};

    // Optional filters
    if (level) filter.currentLevel = level;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const feedbacks = await Feedback.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("studentId", "name email");

    const total = await Feedback.countDocuments(filter);

    res.json({
      success: true,
      data: feedbacks,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching feedback", error: err.message });
  }
});

// GET /feedback/student/:id?page=1&limit=10
router.get('/student/:id', verifyToken, checkRole("student"), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const feedbacks = await Feedback.find({ studentId: req.params.id })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments({ studentId: req.params.id });

    res.json({
      success: true,
      data: feedbacks,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching feedback", error: err.message });
  }
});



module.exports = router;
