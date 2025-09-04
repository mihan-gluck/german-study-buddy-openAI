const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["STUDENT", "TEACHER", "ADMIN"], required: true },
  subscription: { type: String, enum: ["SILVER", "PLATINUM"], required: function() { return this.role === "STUDENT"; } },
  batch: { type: String, required: function() { return this.role === "STUDENT"; }},
  medium: { type: String, required: function() { return this.role === "STUDENT"; }},
  elevenLabsWidgetLink: { type: String, default: ""},
  elevenLabsApiKey: { type: String, default: ""},

  isActive: { type: Boolean, default: true },
  profilePic: { type: String, default: "" },
  subscriptionExpiry: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  registeredAt: { type: Date, default: Date.now },

  vapiAccess: {
    assistantId: String,
    apiKey: String,
    status: { type: String, enum: ['active', 'paused', 'finished'], default: 'active' },
    totalMonthlyUsage: { type: Number, default: 0 }
  },

  elevenLabsAccess: {
    agentId: { type: String },
    apiKey: { type: String },
    status: { type: String, enum: ['active', 'paused', 'finished'], default: 'active' },
    totalMonthlyUsage: { type: Number, default: 0 }
  },

  elevenLabsLink: { type: String, default: '' },

  // ✅ move these inside schema
  courseProgress: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    progressPercent: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }],

  assignedCourses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      assignedAt: Date,
      progress: { type: Number, default: 0 }
    }
  ]
});

module.exports = mongoose.model("User", UserSchema);
