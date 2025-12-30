// models/SessionRecord.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['student', 'tutor'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'speech', 'exercise', 'feedback', 'role-play-intro', 'role-play-active', 'role-play-complete'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const sessionSummarySchema = new mongoose.Schema({
  conversationCount: {
    type: Number,
    default: 0
  },
  timeSpentMinutes: {
    type: Number,
    default: 0
  },
  vocabularyUsed: [{
    type: String
  }],
  exerciseScore: {
    type: Number,
    default: 0
  },
  conversationScore: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  incorrectAnswers: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  }
});

const sessionRecordSchema = new mongoose.Schema({
  // Session identification
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Student and module information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningModule',
    required: true
  },
  moduleTitle: {
    type: String,
    required: true
  },
  moduleLevel: {
    type: String,
    required: true
  },
  
  // Session details
  sessionType: {
    type: String,
    enum: ['practice', 'test', 'role-play'],
    default: 'practice'
  },
  sessionState: {
    type: String,
    enum: ['active', 'completed', 'manually_ended', 'abandoned'],
    default: 'active'
  },
  
  // Timing information
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  durationMinutes: {
    type: Number,
    default: 0
  },
  
  // Conversation data
  messages: [messageSchema],
  
  // Session summary
  summary: sessionSummarySchema,
  
  // Performance metrics
  isModuleCompleted: {
    type: Boolean,
    default: false
  },
  
  // Teacher review
  teacherReviewed: {
    type: Boolean,
    default: false
  },
  teacherNotes: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
sessionRecordSchema.index({ studentId: 1, createdAt: -1 });
sessionRecordSchema.index({ moduleId: 1, createdAt: -1 });
sessionRecordSchema.index({ sessionState: 1 });
sessionRecordSchema.index({ teacherReviewed: 1 });

// Virtual for session duration calculation
sessionRecordSchema.virtual('formattedDuration').get(function() {
  if (this.durationMinutes < 60) {
    return `${this.durationMinutes} min`;
  }
  const hours = Math.floor(this.durationMinutes / 60);
  const minutes = this.durationMinutes % 60;
  return `${hours}h ${minutes}m`;
});

// Method to calculate conversation statistics
sessionRecordSchema.methods.getConversationStats = function() {
  const studentMessages = this.messages.filter(msg => msg.role === 'student');
  const tutorMessages = this.messages.filter(msg => msg.role === 'tutor');
  const speechMessages = this.messages.filter(msg => msg.messageType === 'speech');
  
  return {
    totalMessages: this.messages.length,
    studentMessages: studentMessages.length,
    tutorMessages: tutorMessages.length,
    speechMessages: speechMessages.length,
    textMessages: this.messages.length - speechMessages.length
  };
};

// Method to get performance summary
sessionRecordSchema.methods.getPerformanceSummary = function() {
  const stats = this.getConversationStats();
  
  return {
    conversationCount: stats.studentMessages,
    timeSpent: this.durationMinutes,
    vocabularyUsed: this.summary.vocabularyUsed || [],
    exerciseAccuracy: this.summary.accuracy || 0,
    totalScore: this.summary.totalScore || 0,
    sessionCompleted: this.sessionState === 'completed',
    moduleCompleted: this.isModuleCompleted
  };
};

module.exports = mongoose.model('SessionRecord', sessionRecordSchema);