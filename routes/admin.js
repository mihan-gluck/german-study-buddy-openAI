//routes/admin.js

const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscriptions');
const User = require('../models/User');
//const auth = require('../middleware/auth');
const { verifyToken, isAdmin, checkRole } = require('../middleware/auth'); // ✅ Correct import


// Admin dashboard route
router.get("/admin-dashboard", verifyToken, checkRole("admin"), (req, res) => {
  res.json({ msg: "Welcome Admin" });
});

// Get all students
router.get('/students', verifyToken, isAdmin, checkRole("admin"), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign a course to a student
router.post('/assign-course', verifyToken, isAdmin, async (req, res) => {
  const { studentId, courseName, assistantId, apiKey } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student's VAPI access
    student.courseAssigned = courseName;
    student.vapiAccess = {
      assistantID: assistantId,
      apiKey: apiKey,
      status: 'active',
      totalMonthlyUsage: 0
    };
    student.updatedAt = new Date();

    await student.save();
    return res.status(201).json({ message: 'Course assigned successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error assigning course', error: err });
  }
});

// Update VAPI access status for a student
router.post('/update-vapi-status', verifyToken, isAdmin, async (req, res) => {
  const { studentId, newStatus } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!['active', 'paused', 'finished'].includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    student.vapiAccess.status = newStatus;
    student.updatedAt = new Date();
    await student.save();

    return res.status(200).json({ message: 'VAPI access status updated successfully' });
  } catch (err) {
    console.error('Error updating VAPI status:', err);
    return res.status(500).json({ message: 'Error updating VAPI status', error: err });
  }
});

module.exports = router;

