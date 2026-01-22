//  routes/studentLog.js

const express = require('express');
const router = express.Router();
const StudentLogs = require('../models/StudentLogs');
const User = require('../models/User');

// get all student logs
router.get('/', async (req, res) => {
    try {
        const logs = await StudentLogs.find()
        .populate('studentId', 'name email regNo')
        .populate('assignedTeacherAtUpdate', 'name regNo')
        .sort({ updatedAt: -1 }); // latest first

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        console.error('Error fetching student logs:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch student logs', error: err.message });
    }   
});
// get logs for a specific student
router.get('/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const logs = await StudentLogs.find({ studentId })
        .populate('studentId', 'name email regNo')
        .populate('assignedTeacherAtUpdate', 'name regNo')
        .sort({ updatedAt: -1 }); // latest first

        res.status(200).json({ success: true, data: logs });

    } catch (err) {
        console.error('Error fetching logs for student:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch logs for student', error: err.message });
    }       
});


module.exports = router;