// routes/elevenlabsUsage.js

const express = require('express');
const router = express.Router();
const ElevenLabsUsage = require('../models/ElevenLabsUsage');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');

// POST /api/elevenlabs-usage/log
router.post('/log', verifyToken, checkRole('student'), async (req, res) => {
  const { course, assistantID, duration } = req.body;

  try {
    const usage = new ElevenLabsUsage({
      course,
      assistantID,
      duration,
      studentId: req.user.id,
    });

    await usage.save();

    const student = await User.findById(req.user.id);
    student.elevenLabsAccess.totalMonthlyUsage += Math.floor(duration / 60); // convert to minutes
    const remainingTime = 60 * 60 - student.elevenLabsAccess.totalMonthlyUsage * 60; // seconds left

    // Notifications (mock)
    if (remainingTime <= 3600 && remainingTime > 1800) {
      console.log('⚠️ ElevenLabs: Less than 1 hour remaining.');
    } else if (remainingTime <= 1800 && remainingTime > 600) {
      console.log('⚠️ ElevenLabs: Less than 30 minutes remaining.');
    } else if (remainingTime <= 600 && remainingTime > 0) {
      console.log('⚠️ ElevenLabs: Less than 10 minutes remaining.');
    } else if (remainingTime <= 0 && student.elevenLabsAccess.status === 'active') {
      student.elevenLabsAccess.status = 'paused';
      console.log('⛔ ElevenLabs access auto-disabled due to usage limit.');
    }

    await student.save();

    res.status(201).json({ message: '✅ ElevenLabs usage logged successfully' });
  } catch (err) {
    console.error('❌ Error logging ElevenLabs usage:', err);
    res.status(500).json({ message: '❌ Failed to log usage' });
  }
});

module.exports = router;
