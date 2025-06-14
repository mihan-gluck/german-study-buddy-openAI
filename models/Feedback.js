const mongoose = require('mongoose');

const studentFeedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  summary: {
    type: String,
    required: true
  },
  conversationTime: {
    type: String, // e.g. "12 minutes", "600 seconds"
    required: true
  },
  fluency: {
    type: String, // ✅ Text input
    required: true
  },
  accent: {
    type: String, // ✅ Text input
    required: true
  },
  grammar: {
    type: String, // ✅ Text input
    required: true
  },
  overallCFBR: {
    type: String, // ✅ Text input (combined score or description)
    required: true
  },
  commonMistakes: {
    type: String, // or Array of Strings if needed
    required: true
  },
  currentLevel: {
    type: String, // e.g. "A2", "B1", etc.
    required: true
  },
  suggestedImprovement: {
    type: String,
    required: true
  }
});

const StudentFeedback = mongoose.model('StudentFeedback', studentFeedbackSchema);
module.exports = StudentFeedback;
