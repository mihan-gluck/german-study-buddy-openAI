// models/VapiAgent.js

const mongoose = require('mongoose');

const VapiAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assistantID: { type: String, required: true },
  apiKey: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VapiAgent', VapiAgentSchema);
