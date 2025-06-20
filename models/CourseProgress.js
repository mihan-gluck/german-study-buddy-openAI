// models/CourseProgress.js

const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progressPercentage: { type: Number, required: true }, // e.g. 0 to 100
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CourseProgress', courseProgressSchema);
