// models/Feedback.js
const mongoose = require('mongoose');

const meetingLinkSchema = new mongoose.Schema({
  batch: { type: String, required: true },
  subscriptionPlan: { type: String, required: true },
  platform: { type: String, required: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MeetingLink', meetingLinkSchema);
