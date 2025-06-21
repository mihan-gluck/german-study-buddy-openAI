// models/ElevenLabsUsage.js


const mongoose = require('mongoose');

const ElevenLabsUsageSchema = new mongoose.Schema({
  course: String,
  assistantID: String,
  duration: Number, // in seconds
  timestamp: { type: Date, default: Date.now },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('ElevenLabsUsage', ElevenLabsUsageSchema);
