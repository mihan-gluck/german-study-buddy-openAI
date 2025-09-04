const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middleware/auth');

// ✅ Teacher-only route
router.get('/teacher-area', verifyToken, checkRole('TEACHER'), (req, res) => {
  res.send('Welcome, Teacher!');
});

// ✅ Student-only route
router.get('/student-area', verifyToken, checkRole('STUDENT'), (req, res) => {
  res.send('Welcome, Student!');
});

module.exports = router;
