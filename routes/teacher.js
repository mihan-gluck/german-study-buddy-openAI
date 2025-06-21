//routes/teacher.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get current teacher profile (GET /api/teacher/profile)
router.get('/profile', verifyToken, checkRole('teacher'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
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


// Get list of all students
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('_id name');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/teacher/update-course-progress/:studentId
router.put('/update-course-progress/:studentId', verifyToken, checkRole(['teacher', 'admin']), async (req, res) => {
  const { courseId, progress } = req.body;

  try {
    const user = await User.findById(req.params.studentId);
    if (!user) return res.status(404).json({ message: 'Student not found' });

    const courseEntry = user.assignedCourses.find(c => c.courseId.toString() === courseId);
    if (!courseEntry) return res.status(404).json({ message: 'Course not assigned to this student' });

    courseEntry.progress = progress; // update progress
    await user.save();

    res.status(200).json({ message: 'Course progress updated successfully' });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ message: 'Failed to update course progress', error: err.message });
  }
});

module.exports = router;



