// models/ElevenLabsAgent.js


const mongoose = require('mongoose');

const ElevenLabsAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assistantID: { type: String, required: true },
  apiKey: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ElevenLabsAgent', ElevenLabsAgentSchema);
