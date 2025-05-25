// models/VapiUsage.js
const mongoose = require('mongoose');

const VapiUsageSchema = new mongoose.Schema({
  course: String,
  assistantID: String,
  duration: Number, // seconds
  timestamp: Date,
  studentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},
});


module.exports = mongoose.model('VapiUsage', VapiUsageSchema);

