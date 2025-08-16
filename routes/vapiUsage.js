// routes/vapiUsage.js

const express = require('express');
const router = express.Router();
const VapiUsage = require('../models/VapiUsage');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');

// POST /api/vapi-usage/log
router.post('/log', verifyToken, checkRole('student'), async (req, res) => {
  const { course, assistantID, duration } = req.body;

  try {
    const usage = new VapiUsage({
      course,
      assistantId,
      duration, // in seconds
      studentId: req.user.id,
      timestamp: new Date(),
    });

    await usage.save();

    // Update student usage
    const student = await User.findById(req.user.id);
    student.vapiAccess.totalMonthlyUsage += Math.floor(duration / 60); // minutes
    const remainingTime = 60 * 60 - student.vapiAccess.totalMonthlyUsage * 60; // seconds

    // Notify + Auto-disable (mocked for now)
    if (remainingTime <= 3600 && remainingTime > 1800) {
      console.log('⚠️ Less than 1 hour remaining.');
    } else if (remainingTime <= 1800 && remainingTime > 600) {
      console.log('⚠️ Less than 30 minutes remaining.');
    } else if (remainingTime <= 600 && remainingTime > 0) {
      console.log('⚠️ Less than 10 minutes remaining.');
    } else if (remainingTime <= 0 && student.vapiAccess.status === 'active') {
      student.vapiAccess.status = 'paused';
      console.log('⛔ VAPI access auto-disabled due to usage limit.');
    }

    await student.save();
    res.status(201).json({ message: 'Usage logged successfully' });
  } catch (err) {
    console.error('Error logging usage:', err);
    res.status(500).json({ message: 'Error logging usage' });
  }
});

module.exports = router;

