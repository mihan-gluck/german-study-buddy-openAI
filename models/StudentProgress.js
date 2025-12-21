// models/StudentProgress.js

const mongoose = require('mongoose');

const StudentProgressSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  moduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LearningModule', 
    required: true 
  },
  
  // Progress tracking
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused'],
    default: 'not-started'
  },
  
  progressPercentage: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  
  // Performance metrics
  totalScore: { type: Number, default: 0 },
  maxPossibleScore: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  
  // Time tracking
  timeSpent: { type: Number, default: 0 }, // in minutes
  sessionsCount: { type: Number, default: 0 },
  lastSessionDate: Date,
  
  // Exercise completion tracking
  exercisesCompleted: [{
    exerciseIndex: Number,
    attempts: Number,
    bestScore: Number,
    lastAttemptDate: Date,
    isCompleted: Boolean
  }],
  
  // Learning objectives completion
  objectivesCompleted: [{
    objectiveIndex: Number,
    completedAt: Date,
    masteryLevel: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced'],
      default: 'basic'
    }
  }],
  
  // AI Tutor interaction data
  aiInteractions: [{
    sessionId: String,
    messageCount: Number,
    topicsDiscussed: [String],
    helpRequested: [String],
    sessionDate: Date,
    sessionDuration: Number // in minutes
  }],
  
  // Feedback and notes
  teacherFeedback: [{
    feedback: String,
    rating: { type: Number, min: 1, max: 5 },
    providedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    providedAt: { type: Date, default: Date.now }
  }],
  
  studentNotes: String,
  
  // Timestamps
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries
StudentProgressSchema.index({ studentId: 1, moduleId: 1 }, { unique: true });
StudentProgressSchema.index({ studentId: 1, status: 1 });
StudentProgressSchema.index({ moduleId: 1, status: 1 });

// Update the updatedAt field before saving
StudentProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastAccessedAt = Date.now();
  next();
});

// Calculate progress percentage based on completed exercises
StudentProgressSchema.methods.calculateProgress = function() {
  if (this.exercisesCompleted.length === 0) return 0;
  
  const completedCount = this.exercisesCompleted.filter(ex => ex.isCompleted).length;
  const totalExercises = this.exercisesCompleted.length;
  
  this.progressPercentage = Math.round((completedCount / totalExercises) * 100);
  return this.progressPercentage;
};

// Calculate overall performance score
StudentProgressSchema.methods.calculatePerformanceScore = function() {
  if (this.maxPossibleScore === 0) return 0;
  return Math.round((this.totalScore / this.maxPossibleScore) * 100);
};

module.exports = mongoose.model('StudentProgress', StudentProgressSchema);