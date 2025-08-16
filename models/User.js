//models/User.js

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher", "admin"], required: true },
  subscription: { type: String, enum: ["free", "premium"], default: "free" },
  //assignedCourses: String,
  isActive: { type: Boolean, default: true },
  profilePic: { type: String, default: "" },
  subscriptionExpiry: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  vapiAccess: {
    assistantId: String,
    apiKey: String,
    status: { type: String, enum: ['active', 'paused', 'finished'], default: 'active' },
    totalMonthlyUsage: { type: Number, default: 0 } // in minutes
  },
  registeredAt: { type: Date, default: Date.now },

  elevenLabsAccess: {
    agentId: { type: String },
    apiKey: { type: String },
    status: { type: String, enum: ['active', 'paused', 'finished'], default: 'active' },
    totalMonthlyUsage: { type: Number, default: 0 } // in minutes
  },

  
  elevenLabsLink: {
    type: String,
    default: ''
  },


});

courseProgress: [{
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  progressPercent: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}]

assignedCourses: [
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    assignedAt: Date,
    progress: { type: Number, default: 0 } // progress in percentage
  }
]

module.exports = mongoose.model("User", UserSchema);

