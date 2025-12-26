// scripts/clean-all-modules.js
// Clean all existing modules from the database

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const LearningModule = require('../models/LearningModule');
const StudentProgress = require('../models/StudentProgress');
const AiTutorSession = require('../models/AiTutorSession');

async function cleanAllModules() {
  try {
    console.log('🧹 Cleaning all modules from database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete all AI tutor sessions
    const sessionsDeleted = await AiTutorSession.deleteMany({});
    console.log(`🗑️ Deleted ${sessionsDeleted.deletedCount} AI tutor sessions`);
    
    // Delete all student progress
    const progressDeleted = await StudentProgress.deleteMany({});
    console.log(`🗑️ Deleted ${progressDeleted.deletedCount} student progress records`);
    
    // Delete all learning modules
    const modulesDeleted = await LearningModule.deleteMany({});
    console.log(`🗑️ Deleted ${modulesDeleted.deletedCount} learning modules`);
    
    console.log('🎉 Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanAllModules();