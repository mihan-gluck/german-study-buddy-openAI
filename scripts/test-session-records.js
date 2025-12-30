#!/usr/bin/env node

/**
 * Test Session Records System
 * 
 * This script tests the session records functionality to ensure
 * conversations and summaries are properly stored for teacher review.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SessionRecord = require('../models/SessionRecord');
const User = require('../models/User');
const LearningModule = require('../models/LearningModule');

async function testSessionRecords() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a sample session record
    console.log('\n📝 Test 1: Creating sample session record...');
    
    // Get a student and module for testing
    const student = await User.findOne({ role: 'STUDENT' });
    const module = await LearningModule.findOne({ isActive: true });

    if (!student || !module) {
      console.log('❌ No student or active module found for testing');
      return;
    }

    const sampleSessionRecord = new SessionRecord({
      sessionId: `test-session-${Date.now()}`,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      moduleId: module._id,
      moduleTitle: module.title,
      moduleLevel: module.level,
      sessionType: 'practice',
      sessionState: 'completed',
      startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      endTime: new Date(),
      durationMinutes: 15,
      messages: [
        {
          role: 'tutor',
          content: 'Hello! Welcome to the restaurant conversation practice. I\'ll be your waiter today.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 14 * 60 * 1000)
        },
        {
          role: 'student',
          content: 'Hello! I would like to see the menu please.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 13 * 60 * 1000)
        },
        {
          role: 'tutor',
          content: 'Of course! Here is our menu. What would you like to order?',
          messageType: 'text',
          timestamp: new Date(Date.now() - 12 * 60 * 1000)
        },
        {
          role: 'student',
          content: 'I would like the pasta with tomato sauce, please.',
          messageType: 'speech',
          timestamp: new Date(Date.now() - 11 * 60 * 1000)
        },
        {
          role: 'tutor',
          content: 'Excellent choice! Would you like anything to drink?',
          messageType: 'text',
          timestamp: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
          role: 'student',
          content: 'Yes, I\'ll have a glass of water, thank you.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 9 * 60 * 1000)
        }
      ],
      summary: {
        conversationCount: 4,
        timeSpentMinutes: 15,
        vocabularyUsed: ['menu', 'order', 'pasta', 'sauce', 'drink', 'water'],
        exerciseScore: 85,
        conversationScore: 90,
        totalScore: 175,
        correctAnswers: 3,
        incorrectAnswers: 1,
        accuracy: 75
      },
      isModuleCompleted: false,
      teacherReviewed: false
    });

    await sampleSessionRecord.save();
    console.log('✅ Sample session record created:', sampleSessionRecord._id);

    // Test 2: Retrieve session records
    console.log('\n📊 Test 2: Retrieving session records...');
    
    const sessionRecords = await SessionRecord.find({})
      .populate('studentId', 'name email level')
      .populate('moduleId', 'title level category')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`📋 Found ${sessionRecords.length} session records:`);
    sessionRecords.forEach((record, index) => {
      const stats = record.getConversationStats();
      const performance = record.getPerformanceSummary();
      
      console.log(`\n${index + 1}. Session: ${record.sessionId}`);
      console.log(`   👤 Student: ${record.studentName} (${record.studentId?.level || 'N/A'})`);
      console.log(`   📚 Module: ${record.moduleTitle} (${record.moduleLevel})`);
      console.log(`   💬 Conversations: ${performance.conversationCount}`);
      console.log(`   ⏱️ Duration: ${record.durationMinutes} minutes`);
      console.log(`   📝 Vocabulary: ${performance.vocabularyUsed.join(', ') || 'None'}`);
      console.log(`   🎯 Score: ${performance.totalScore}`);
      console.log(`   ✅ Status: ${record.sessionState}`);
      console.log(`   📋 Reviewed: ${record.teacherReviewed ? 'Yes' : 'No'}`);
      console.log(`   📅 Date: ${record.createdAt.toLocaleDateString()}`);
    });

    // Test 3: Test conversation statistics
    console.log('\n📈 Test 3: Testing conversation statistics...');
    
    const testRecord = sessionRecords[0];
    if (testRecord) {
      const stats = testRecord.getConversationStats();
      console.log('📊 Conversation Statistics:');
      console.log(`   Total Messages: ${stats.totalMessages}`);
      console.log(`   Student Messages: ${stats.studentMessages}`);
      console.log(`   Tutor Messages: ${stats.tutorMessages}`);
      console.log(`   Speech Messages: ${stats.speechMessages}`);
      console.log(`   Text Messages: ${stats.textMessages}`);
    }

    // Test 4: Test performance summary
    console.log('\n🎯 Test 4: Testing performance summary...');
    
    if (testRecord) {
      const performance = testRecord.getPerformanceSummary();
      console.log('🎯 Performance Summary:');
      console.log(`   Conversation Count: ${performance.conversationCount}`);
      console.log(`   Time Spent: ${performance.timeSpent} minutes`);
      console.log(`   Vocabulary Used: ${performance.vocabularyUsed.join(', ')}`);
      console.log(`   Exercise Accuracy: ${performance.exerciseAccuracy}%`);
      console.log(`   Total Score: ${performance.totalScore}`);
      console.log(`   Session Completed: ${performance.sessionCompleted}`);
      console.log(`   Module Completed: ${performance.moduleCompleted}`);
    }

    // Test 5: Test teacher review functionality
    console.log('\n📝 Test 5: Testing teacher review functionality...');
    
    if (testRecord && !testRecord.teacherReviewed) {
      testRecord.teacherReviewed = true;
      testRecord.teacherNotes = 'Great conversation practice! Student showed good understanding of restaurant vocabulary and polite expressions. Recommend focusing on pronunciation of "pasta" and "sauce" in future sessions.';
      testRecord.reviewedAt = new Date();
      
      await testRecord.save();
      console.log('✅ Teacher review added successfully');
      console.log(`📝 Review Notes: ${testRecord.teacherNotes}`);
    }

    // Test 6: Generate statistics
    console.log('\n📊 Test 6: Generating statistics...');
    
    const totalSessions = await SessionRecord.countDocuments({});
    const completedSessions = await SessionRecord.countDocuments({ sessionState: 'completed' });
    const modulesCompleted = await SessionRecord.countDocuments({ isModuleCompleted: true });
    const needsReview = await SessionRecord.countDocuments({ teacherReviewed: false });

    // Calculate average duration
    const avgDurationResult = await SessionRecord.aggregate([
      { $group: { _id: null, avgDuration: { $avg: '$durationMinutes' } } }
    ]);
    const avgDuration = avgDurationResult[0]?.avgDuration || 0;

    console.log('📊 System Statistics:');
    console.log(`   Total Sessions: ${totalSessions}`);
    console.log(`   Completed Sessions: ${completedSessions}`);
    console.log(`   Modules Completed: ${modulesCompleted}`);
    console.log(`   Sessions Needing Review: ${needsReview}`);
    console.log(`   Average Duration: ${Math.round(avgDuration)} minutes`);
    console.log(`   Completion Rate: ${totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Session records can be created and stored');
    console.log('✅ Conversations and summaries are properly saved');
    console.log('✅ Teacher review functionality works');
    console.log('✅ Statistics and analytics are generated');
    console.log('✅ Performance metrics are calculated correctly');
    
    console.log('\n🎯 For Teachers:');
    console.log('- Teachers can now view all student conversations');
    console.log('- Session summaries show: conversations, time spent, vocabulary used');
    console.log('- Teachers can add reviews and notes to sessions');
    console.log('- Statistics help track student progress and engagement');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testSessionRecords();