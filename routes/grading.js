// services/grading.service.js
const express = require("express");
const router = express.Router();
const { gradeAssignment } = require("../services/grading.service");

// POST /api/grading/grade
router.post("/grade", async (req, res) => {
  try {
    const { assignmentId, studentId, level, taskType, submissionText } = req.body;
    const result = await gradeAssignment({ assignmentId, studentId, level, taskType, submissionText });
    res.json(result);
  } catch (err) {
    console.error('Error grading assignment:', err);
    res.status(500).json({ error: 'Failed to grade assignment' });
  } finally {
    // Optional: Clean up uploaded files if needed
    // fs.unlink(req.file.path, (err) => {
    //   if (err) console.error('Error deleting uploaded file:', err);
    // });
  } });

module.exports = router;

