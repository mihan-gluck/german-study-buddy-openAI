#!/usr/bin/env node

/**
 * Test Stopped Sessions Display
 * 
 * This script tests how sessions that are stopped in between
 * appear in both student summaries and teacher views.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SessionRecord = require('../models/SessionRecord');
const User = require('../models/User');
const LearningModule = require('../models/LearningModule');

async function testStoppedSessions() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get a student and module for testing
    const student = await User.findOne({ role: 'STUDENT' });
    const module = await LearningModule.findOne({ isActive: true });

    if (!student || !module) {
      console.log('❌ No student or active module found for testing');
      return;
    }

    console.log('\n📝 Creating different session scenarios...');

    // Scenario 1: Session completed normally
    const completedSession = new SessionRecord({
      sessionId: `completed-session-${Date.now()}`,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      moduleId: module._id,
      moduleTitle: module.title,
      moduleLevel: module.level,
      sessionType: 'practice',
      sessionState: 'completed', // ✅ COMPLETED
      startTime: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      endTime: new Date(),
      durationMinutes: 20,
      messages: [
        {
          role: 'tutor',
          content: 'Welcome to the lesson!',
          messageType: 'text',
          timestamp: new Date(Date.now() - 19 * 60 * 1000)
        },
        {
          role: 'student',
          content: 'Hello, I\'m ready to learn.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 18 * 60 * 1000)
        },
        // ... more conversation ...
        {
          role: 'tutor',
          content: 'Congratulations! You have completed this module successfully!',
          messageType: 'text',
          timestamp: new Date(Date.now() - 1 * 60 * 1000)
        }
      ],
      summary: {
        conversationCount: 15,
        timeSpentMinutes: 20,
        vocabularyUsed: ['hello', 'goodbye', 'restaurant', 'menu', 'order', 'please', 'thank you'],
        exerciseScore: 85,
        conversationScore: 90,
        totalScore: 175,
        correctAnswers: 8,
        incorrectAnswers: 2,
        accuracy: 80
      },
      isModuleCompleted: true,
      teacherReviewed: false
    });

    // Scenario 2: Session stopped manually (student said "stop")
    const stoppedSession = new SessionRecord({
      sessionId: `stopped-session-${Date.now()}`,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      moduleId: module._id,
      moduleTitle: module.title,
      moduleLevel: module.level,
      sessionType: 'practice',
      sessionState: 'manually_ended', // ⚠️ STOPPED EARLY
      startTime: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
      endTime: new Date(),
      durationMinutes: 8,
      messages: [
        {
          role: 'tutor',
          content: 'Welcome to the lesson!',
          messageType: 'text',
          timestamp: new Date(Date.now() - 7 * 60 * 1000)
        },
        {
          role: 'student',
          content: 'Hello, I\'m ready to learn.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 6 * 60 * 1000)
        },
        {
          role: 'tutor',
          content: 'Great! Let\'s start with some vocabulary.',
          messageType: 'text',
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          role: 'student',
          content: 'stop', // Student stopped the session
          messageType: 'text',
          timestamp: new Date(Date.now() - 2 * 60 * 1000)
        },
        {
          role: 'tutor',
          content: 'Session ended by your request. 🎯\n\n💬 Conversations: 2\n⏱️ Time Spent: 8 minutes\n📚 Vocabulary Used: hello\n\nGreat job! You can start a new session anytime. 🌟',
          messageType: 'text',
          timestamp: new Date(Date.now() - 1 * 60 * 1000)
        }
      ],
      summary: {
        conversationCount: 2,
        timeSpentMinutes: 8,
        vocabularyUsed: ['hello'],
        exerciseScore: 0,
        conversationScore: 20,
        totalScore: 20,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0
      },
      isModuleCompleted: false, // ❌ NOT COMPLETED
      teacherReviewed: false
    });

    // Scenario 3: Session abandoned (student left without saying stop)
    const abandonedSession = new SessionRecord({
      sessionId: `abandoned-session-${Date.now()}`,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      moduleId: module._id,
      moduleTitle: module.title,
      moduleLevel: module.level,
      sessionType: 'practice',
      sessionState: 'abandoned', // ❌ ABANDONED
      startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      endTime: new Date(Date.now() - 2 * 60 * 1000), // Ended 2 minutes ago
      durationMinutes: 3,
      messages: [
        {
          role: 'tutor',
          content: 'Welcome to the lesson!',
          messageType: 'text',
          timestamp: new Date(Date.now() - 4 * 60 * 1000)
        },
        {
          role: 'student',
          content: 'Hi',
          messageType: 'text',
          timestamp: new Date(Date.now() - 3 * 60 * 1000)
        }
        // Student left without completing or saying stop
      ],
      summary: {
        conversationCount: 1,
        timeSpentMinutes: 3,
        vocabularyUsed: [],
        exerciseScore: 0,
        conversationScore: 5,
        totalScore: 5,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0
      },
      isModuleCompleted: false, // ❌ NOT COMPLETED
      teacherReviewed: false
    });

    // Save all test sessions
    await completedSession.save();
    await stoppedSession.save();
    await abandonedSession.save();

    console.log('✅ Created test sessions:');
    console.log(`   1. Completed Session: ${completedSession._id}`);
    console.log(`   2. Stopped Session: ${stoppedSession._id}`);
    console.log(`   3. Abandoned Session: ${abandonedSession._id}`);

    // Show how each session appears to teachers
    console.log('\n👩‍🏫 TEACHER VIEW - How different session states appear:');
    console.log('=' .repeat(70));

    const allSessions = [completedSession, stoppedSession, abandonedSession];

    allSessions.forEach((session, index) => {
      const performance = session.getPerformanceSummary();
      
      console.log(`\n${index + 1}. ${session.sessionState.toUpperCase()} SESSION:`);
      console.log(`   👤 Student: ${session.studentName}`);
      console.log(`   📚 Module: ${session.moduleTitle}`);
      console.log(`   💬 Conversations: ${performance.conversationCount}`);
      console.log(`   ⏱️ Time Spent: ${performance.timeSpent} minutes`);
      console.log(`   📝 Vocabulary: ${performance.vocabularyUsed.join(', ') || 'None used'}`);
      console.log(`   🎯 Score: ${performance.totalScore}`);
      console.log(`   📊 Accuracy: ${performance.exerciseAccuracy}%`);
      
      // Status indicators
      let statusIcon = '';
      let statusMessage = '';
      
      switch (session.sessionState) {
        case 'completed':
          statusIcon = '✅';
          statusMessage = 'Session Completed Successfully';
          break;
        case 'manually_ended':
          statusIcon = '⚠️';
          statusMessage = 'Session Stopped Early by Student';
          break;
        case 'abandoned':
          statusIcon = '❌';
          statusMessage = 'Session Abandoned (Student Left)';
          break;
      }
      
      console.log(`   ${statusIcon} Status: ${statusMessage}`);
      console.log(`   📋 Module Completed: ${session.isModuleCompleted ? 'Yes ✅' : 'No ❌'}`);
      console.log(`   📝 Needs Review: ${session.teacherReviewed ? 'No' : 'Yes ⚠️'}`);
    });

    // Show student summary examples
    console.log('\n👤 STUDENT SUMMARY - What students see when sessions end:');
    console.log('=' .repeat(70));

    console.log('\n1. ✅ COMPLETED SESSION SUMMARY:');
    console.log(`Session Complete! 🎉

💬 Conversations: 15
⏱️ Time Spent: 20 minutes
📚 Vocabulary Used: hello, goodbye, restaurant, menu, order, please, thank you

Great job! 🌟`);

    console.log('\n2. ⚠️ STOPPED SESSION SUMMARY:');
    console.log(`Session ended by your request. 🎯

💬 Conversations: 2
⏱️ Time Spent: 8 minutes
📚 Vocabulary Used: hello

Great job! You can start a new session anytime. 🌟`);

    console.log('\n3. ❌ ABANDONED SESSION (No summary shown to student)');
    console.log('   - Student left without proper ending');
    console.log('   - Session automatically marked as abandoned');
    console.log('   - Teacher can see incomplete session in dashboard');

    // Teacher insights
    console.log('\n🎯 TEACHER INSIGHTS:');
    console.log('=' .repeat(70));
    
    console.log('\n📊 Session Analysis:');
    console.log('✅ Completed Sessions:');
    console.log('   - Full conversation and vocabulary practice');
    console.log('   - Module marked as completed');
    console.log('   - High engagement and scores');
    
    console.log('\n⚠️ Stopped Sessions:');
    console.log('   - Student said "stop" or ended early');
    console.log('   - Partial progress recorded');
    console.log('   - Module NOT marked as completed');
    console.log('   - May indicate difficulty or time constraints');
    
    console.log('\n❌ Abandoned Sessions:');
    console.log('   - Student left without completing');
    console.log('   - Very low engagement');
    console.log('   - May indicate technical issues or disengagement');
    console.log('   - Requires teacher follow-up');

    // Recommendations for teachers
    console.log('\n💡 TEACHER RECOMMENDATIONS:');
    console.log('=' .repeat(70));
    
    console.log('\nFor Stopped Sessions:');
    console.log('• Check if content is too difficult');
    console.log('• Ask student about time constraints');
    console.log('• Provide encouragement to complete modules');
    console.log('• Consider breaking modules into smaller parts');
    
    console.log('\nFor Abandoned Sessions:');
    console.log('• Follow up with student directly');
    console.log('• Check for technical issues');
    console.log('• Assess student engagement and motivation');
    console.log('• Provide additional support if needed');

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testStoppedSessions();