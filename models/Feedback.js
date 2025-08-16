// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },

    /* ---------- session summary data ---------- */
    summary: { type: String, required: true },
    conversationTime: { type: String, required: true },   // e.g. "12 min 30 s"

    /* ---------- qualitative scores (text) ---------- */
    fluency: { type: String, required: true },
    accent: { type: String, required: true },
    grammar: { type: String, required: true },
    overallCFBR: { type: String, required: true },        // combined rating

    /* ---------- error analysis & guidance ---------- */
    commonMistakes: { type: String, required: true },     // or Array<String>
    currentLevel: { type: String, required: true },       // e.g. "B1"
    suggestedImprovement: { type: String, required: true }
  },
  { timestamps: true }   // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model('Feedback', feedbackSchema);
