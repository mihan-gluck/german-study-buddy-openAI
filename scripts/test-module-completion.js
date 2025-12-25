// scripts/test-module-completion.js

require('dotenv').config();
const mongoose = require('mongoose');
const StudentProgress = require('../models/StudentProgress');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function testModuleCompletion() {
  try {
    console.log('🧪 Testing module completion functionality...');
    
    // Find a test student (STU001)
    const student = await User.findOne({ regNo: 'STU001' });
    if (!student) {
      console.error('❌ Test student STU001 not found');
      return;
    }
    console.log('✅ Found test student:', student.name);
    
    // Find the Tamil Restaurant module
    const module = await LearningModule.findOne({ 
      title: { $regex: /Restaurant Conversation/i }
    });
    if (!module) {
      console.error('❌ Restaurant module not found');
      return;
    }
    console.log('✅ Found module:', module.title);
    
    // Check current progress
    let progress = await StudentProgress.findOne({
      studentId: student._id,
      moduleId: module._id
    });
    
    console.log('📊 Current progress:', progress ? progress.status : 'Not enrolled');
    
    // Create or update progress to completed
    if (!progress) {
      progress = new StudentProgress({
        studentId: student._id,
        moduleId: module._id,
        status: 'completed',
        progressPercentage: 100,
        startedAt: new Date(),
        completedAt: new Date(),
        totalScore: 85,
        maxPossibleScore: 100,
        sessionData: {
          totalScore: 85,
          conversationScore: 60,
          exerciseScore: 25,
          messagesExchanged: 15,
          speechMessages: 12,
          sessionType: 'practice',
          completedAt: new Date()
        }
      });
    } else {
      progress.status = 'completed';
      progress.progressPercentage = 100;
      progress.completedAt = new Date();
      progress.totalScore = 85;
    }
    
    await progress.save();
    console.log('✅ Module marked as completed successfully!');
    
    // Verify the update
    const updatedProgress = await StudentProgress.findOne({
      studentId: student._id,
      moduleId: module._id
    });
    
    console.log('📋 Updated progress:');
    console.log('  Status:', updatedProgress.status);
    console.log('  Progress:', updatedProgress.progressPercentage + '%');
    console.log('  Completed At:', updatedProgress.completedAt);
    console.log('  Total Score:', updatedProgress.totalScore);
    
    console.log('🎉 Test completed successfully!');
    console.log('💡 Now check the learning modules page - the module should show as "Completed" in green');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testModuleCompletion();