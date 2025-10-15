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


// GET - Get student elevenlabs usage via ElevenLabs API
router.get('/apiKey', verifyToken, async (req, res) => {
  try {

    const userId = req.params.id || req.user.id;


    const user = await User.findById(userId);

    if (!user || !user.elevenLabsApiKey) {
      return res.status(404).json({ success: false, msg: 'API key not found' });
    }

    // Call ElevenLabs API using user's key
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': user.elevenLabsApiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.json({ success: true, voices: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Error fetching voices', error: err.message });
  }
});


  // GET - Get ElevenLabs usage by API key (Admin)
  router.get('/admin/usage/:apiKey', verifyToken, async (req, res) => {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }

      const apiKey = req.params.apiKey;
      if (!apiKey) {
        return res.status(400).json({ success: false, msg: 'API key is required' });
      }

      // Call ElevenLabs API using the provided API key
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ success: false, msg: 'Error fetching usage', detail: text });
      }

      const data = await response.json();

      // Return full ElevenLabs API response
      res.json({ success: true, usage: data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: 'Server error', error: err.message });
    }
  });

  // GET - Get ElevenLabs usage by API key (Teacher)
  router.get('/teacher/usage/:apiKey', verifyToken, async (req, res) => {
    try {
      // Only allow TEACHER or ADMIN roles
      if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }

      const apiKey = req.params.apiKey;
      if (!apiKey) {
        return res.status(400).json({ success: false, msg: 'API key is required' });
      }

      // Call ElevenLabs API using the provided API key
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ success: false, msg: 'Error fetching usage', detail: text });
      }

      const data = await response.json();

      res.json({ success: true, usage: data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: 'Server error', error: err.message });
    }
  });


module.exports = router;
