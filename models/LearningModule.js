// models/LearningModule.js

const mongoose = require('mongoose');

const LearningModuleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  
  // NEW: Language support
  targetLanguage: {
    type: String,
    enum: ['English', 'German'],
    required: true,
    default: 'German'
  },
  nativeLanguage: {
    type: String,
    enum: ['English', 'Tamil', 'Sinhala'],
    required: true,
    default: 'English'
  },
  
  level: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], 
    required: true 
  },
  category: {
    type: String,
    enum: ['Grammar', 'Vocabulary', 'Conversation', 'Reading', 'Writing', 'Listening'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  estimatedDuration: { 
    type: Number, // in minutes
    required: true 
  },
  
  // Learning objectives and requirements
  learningObjectives: [{
    objective: String,
    description: String
  }],
  
  prerequisites: [String], // Array of prerequisite topics
  
  // Module content structure
  content: {
    introduction: String,
    
    // Role-play specific content (optional - only for role-play modules)
    rolePlayScenario: {
      situation: {
        type: String,
        required: false // e.g., "At a restaurant", "Job interview", "Shopping"
      },
      studentRole: {
        type: String,
        required: false // e.g., "Customer", "Job applicant", "Tourist"
      },
      aiRole: {
        type: String,
        required: false // e.g., "Waiter", "Interviewer", "Shop assistant"
      },
      setting: String, // e.g., "A busy restaurant in Berlin", "A formal office"
      objective: String // e.g., "Order a meal and ask for the bill"
    },
    
    // Vocabulary constraints
    allowedVocabulary: [{
      word: String,
      translation: String,
      category: String // e.g., "food", "greetings", "numbers"
    }],
    
    // Grammar constraints
    allowedGrammar: [{
      structure: String, // e.g., "Present tense", "Modal verbs", "Questions with 'wie'"
      examples: [String],
      level: String
    }],
    
    // Optional conversation starters/examples
    conversationFlow: [{
      stage: String, // e.g., "greeting", "ordering", "paying"
      aiPrompts: [String], // What AI might say
      expectedResponses: [String], // What student should try to say
      helpfulPhrases: [String]
    }],
    
    keyTopics: [String],
    examples: [{
      german: String,
      english: String,
      explanation: String
    }],
    exercises: [{
      type: {
        type: String,
        enum: ['multiple-choice', 'fill-blank', 'translation', 'conversation', 'essay', 'role-play']
      },
      question: String,
      options: [String], // for multiple choice
      correctAnswer: String,
      explanation: String,
      points: { type: Number, default: 1 }
    }]
  },
  
  // AI Tutor Configuration
  aiTutorConfig: {
    personality: {
      type: String,
      default: 'friendly and encouraging German tutor'
    },
    focusAreas: [String], // What the AI should focus on for this module
    commonMistakes: [String], // Common mistakes to watch for
    helpfulPhrases: [String], // German phrases to teach
    culturalNotes: [String] // Cultural context to include
  },
  
  // Metadata
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  tags: [String],
  
  // Update history for admin tracking
  updateHistory: [{
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    changes: {
      type: String, // Description of what was changed
      required: true
    },
    version: {
      type: Number,
      default: 1
    }
  }],
  
  // Current version number
  version: {
    type: Number,
    default: 1
  },
  
  // Analytics
  totalEnrollments: { type: Number, default: 0 },
  averageCompletionTime: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field and track changes before saving
LearningModuleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If this is an update (not initial creation), track the change
  if (!this.isNew && this.isModified()) {
    // Get the user ID from the context (will be set in the route)
    if (this._updateContext && this._updateContext.userId) {
      this.lastUpdatedBy = this._updateContext.userId;
      this.version += 1;
      
      // Add to update history
      this.updateHistory.push({
        updatedBy: this._updateContext.userId,
        updatedAt: new Date(),
        changes: this._updateContext.changes || 'Module updated',
        version: this.version
      });
    }
  }
  
  next();
});

// Index for better query performance
LearningModuleSchema.index({ level: 1, category: 1, isActive: 1 });
LearningModuleSchema.index({ createdBy: 1 });
LearningModuleSchema.index({ tags: 1 });

module.exports = mongoose.model('LearningModule', LearningModuleSchema);