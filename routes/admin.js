//routes/admin.js

const express = require('express');
const mongoose = require('mongoose');
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
router.get('/students', verifyToken, isAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'STUDENT' })
      .select('-password') // exclude passwords
      .populate({
        path: 'assignedTeacher',   // the field in User schema
        select: 'name regNo email medium' // fetch only useful teacher info
      });

    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: err.message
    });
  }
});


// Get all teachers
router.get('/teachers', verifyToken, isAdmin, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'TEACHER' })
      .populate('assignedCourses', 'title') // <-- only fetch 'name' field of Course
      .select('-password');

    res.json({ success: true, data: teachers });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers',
      error: err.message
    });
  }
});


// Assign course to a student (simplified without VAPI)
router.post('/assign-course', verifyToken, isAdmin, async (req, res) => {
  const { studentId, courseName } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.courseAssigned = courseName;
    student.updatedAt = new Date();

    await student.save();
    return res.status(201).json({ success: true, message: 'Course assigned successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error assigning course', error: err });
  }
});

// Update student's subscription - PUT /api/subscriptions/:id
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Subscription not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Delete a subscription - DELETE /api/subscriptions/:id
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subscription deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View subscriptions for a specific student - GET /api/subscriptions/user/:userId
router.get("/user/:userId", verifyToken, isAdmin, async (req, res) => {
  try {
    const subs = await Subscription.find({ userId: req.params.userId });
    res.status(200).json({ success: true, data: subs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// List all courses a student is enrolled in - GET /api/courses/enrolled/:studentId
router.get("/enrolled/:studentId", verifyToken, isAdmin, async (req, res) => {
  try {
    const courses = await Course.find({ students: req.params.studentId });
    res.status(200).json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Bulk assign course (simplified without VAPI)
router.post('/bulk-assign', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { studentIds, courseName } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || !courseName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await User.updateMany(
      { _id: { $in: studentIds } },
      {
        courseAssigned: courseName
      }
    );

    res.json({ message: 'Bulk assignment successful' });
  } catch (err) {
    console.error('Bulk assignment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;




