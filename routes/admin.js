//routes/admin.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Subscription = require('../models/subscriptions');
const User = require('../models/User');
const VapiAgent = require('../models/VapiAgent');
//const auth = require('../middleware/auth');
const { verifyToken, isAdmin, checkRole } = require('../middleware/auth'); // ✅ Correct import
const VapiUsage = require('../models/VapiUsage');

// Admin dashboard route
router.get("/admin-dashboard", verifyToken, checkRole("admin"), (req, res) => {
  res.json({ msg: "Welcome Admin" });
});



// Get all available VAPI agents
router.get('/vapi-agents', verifyToken, isAdmin, async (req, res) => {
  try {
    const agents = await VapiAgent.find();
    res.json(agents);
    res.status(200).json({ success: true, data: agents});
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch agents' });
  }
});

// Add/ Post a new VAPI agent
router.post('/vapi-agents', verifyToken, isAdmin, async (req, res) => {
  const { assistantId, name, description } = req.body;

  try {
    const newAgent = new VapiAgent({ assistantId, name, description });
    await newAgent.save();
    res.status(201).json({ success: true, message: 'Agent added successfully' });
  } catch (err) {
    console.error('Error adding VAPI agent:', err);
    res.status(500).json({ success: false, message: 'Error adding agent', error: err });
  }
});

// Delete an agent
router.delete('/vapi-agents/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await VapiAgent.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete agent' });
  }
  
});

// Get all students
router.get('/students', verifyToken, isAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: err.message});
  }
});

// Assign/ Post a course to a student
router.post('/assign-course', verifyToken, isAdmin, async (req, res) => {
  const { studentId, courseName, assistantId, apiKey } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Update student's VAPI access
    student.courseAssigned = courseName;
    student.vapiAccess = {
      assistantId: assistantId,
      apiKey: apiKey,
      status: 'active',
      totalMonthlyUsage: 0
    };
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


// Update/ POST VAPI access status for a student
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

    return res.status(200).json({ success: true, message: 'VAPI access status updated successfully' });
  } catch (err) {
    console.error('Error updating VAPI status:', err);
    return res.status(500).json({ message: 'Error updating VAPI status', error: err });
  }
});

// Get usage data for a student
router.get('/vapi-usage/daily/:studentId', verifyToken, isAdmin, async (req, res) => {
  const { studentId } = req.params;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const usage = await VapiUsage.aggregate([
    { $match: { studentId: new mongoose.Types.ObjectId(studentId), timestamp: { $gte: startOfDay } } },
    { $group: { _id: null, totalDuration: { $sum: "$duration" } } }
  ]);

  res.json({ success: true, data: { totalDuration: usage[0]?.totalDuration || 0 } });
});

// Get monthly usage for a student
router.get('/vapi-usage/monthly/:studentId', verifyToken, isAdmin, async (req, res) => {
  const { studentId } = req.params;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  try {
    const usage = await VapiUsage.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId), timestamp: { $gte: startOfMonth } } },
      { $group: { _id: null, totalDuration: { $sum: "$duration" } } }
    ]);

    res.json({ success: true, data: { totalDuration: usage[0]?.totalDuration || 0 } }); // in seconds
  } catch (err) {
    console.error("Error fetching monthly usage:", err);
    res.status(500).json({ message: 'Error fetching usage' });
  }
});

// Bulk assign course
router.post('/bulk-assign', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { studentIds, courseName, assistantId, apiKey } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || !courseName || !assistantId || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await User.updateMany(
      { _id: { $in: studentIds } },
      {
        courseAssigned: courseName,
        vapiAccess: {
          status: 'active',
          assistantId,
          apiKey
        }
      }
    );

    res.json({ message: 'Bulk assignment successful' });
  } catch (err) {
    console.error('Bulk assignment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// routes/admin.js

router.post('/reset-monthly-usage', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    await User.updateMany(
      { role: 'student' },
      { $set: { 'vapiAccess.totalMonthlyUsage': 0 } }
    );
    res.status(200).json({ success: true, message: 'Monthly usage reset for all students.' });
  } catch (error) {
    console.error('Error resetting monthly usage:', error);
    res.status(500).json({ success: false, message: 'Failed to reset monthly usage.' });
  }
});


module.exports = router;

/* router.get('/vapi-usage/monthly/:studentId', verifyToken, isAdmin, async (req, res) => {
  const { studentId } = req.params;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await VapiUsage.aggregate([
    { $match: { studentId: new mongoose.Types.ObjectId(studentId), timestamp: { $gte: startOfMonth } } },
    { $group: { _id: null, totalDuration: { $sum: "$duration" } } }
  ]);


  const remainingTime = 60 * 60 - student.vapiAccess.totalMonthlyUsage * 60; // remaining in seconds

if (remainingTime <= 600 && student.vapiAccess.status === 'active') {
  // Send alert: less than 10 min remaining (simulate or integrate email service)
  console.log('Alert: Student has less than 10 minutes left.');
}
if (remainingTime <= 0 && student.vapiAccess.status === 'active') {
  student.vapiAccess.status = 'paused';
  console.log('VAPI access auto-disabled due to usage limit.');
}


  res.json({ totalDuration: usage[0]?.totalDuration || 0 });
}); */




