// check-session-states.js
const mongoose = require('mongoose');
require('dotenv').config();

const SessionRecord = require('./models/SessionRecord');
const StudentProgress = require('./models/StudentProgress');

async function checkSessionStates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check SessionRecords with short duration
    console.log('📊 Checking SessionRecords with ≤5 minutes duration:');
    console.log('='.repeat(80));
    
    const shortSessions = await SessionRecord.find({ 
      durationMinutes: { $lte: 5 } 
    })
    .select('sessionId moduleTitle durationMinutes sessionState isModuleCompleted studentName')
    .limit(10)
    .sort({ createdAt: -1 });

    shortSessions.forEach((session, index) => {
      console.log(`\n${index + 1}. Session: ${session.sessionId}`);
      console.log(`   Student: ${session.studentName}`);
      console.log(`   Module: ${session.moduleTitle}`);
      console.log(`   Duration: ${session.durationMinutes} min`);
      console.log(`   State: ${session.sessionState}`);
      console.log(`   Module Completed: ${session.isModuleCompleted}`);
      
      if (session.durationMinutes <= 5 && session.sessionState === 'completed') {
        console.log(`   ❌ ISSUE: Short session marked as 'completed'`);
      } else if (session.durationMinutes <= 5 && session.sessionState === 'manually_ended') {
        console.log(`   ✅ CORRECT: Short session marked as 'manually_ended'`);
      }
    });

    // Check StudentProgress with 100% completion
    console.log('\n\n📊 Checking StudentProgress with 100% completion:');
    console.log('='.repeat(80));
    
    const completedProgress = await StudentProgress.find({ 
      progressPercentage: 100,
      status: 'completed'
    })
    .populate('moduleId', 'title minimumCompletionTime')
    .populate('studentId', 'name')
    .limit(10)
    .sort({ updatedAt: -1 });

    for (const progress of completedProgress) {
      if (!progress.moduleId || !progress.studentId) continue;
      
      // Find most recent session for this student/module
      const recentSession = await SessionRecord.findOne({
        studentId: progress.studentId._id,
        moduleId: progress.moduleId._id
      }).sort({ createdAt: -1 });

      console.log(`\n${progress.studentId.name} - ${progress.moduleId.title}`);
      console.log(`   Progress: ${progress.progressPercentage}%`);
      console.log(`   Status: ${progress.status}`);
      
      if (recentSession) {
        console.log(`   Last Session Duration: ${recentSession.durationMinutes} min`);
        console.log(`   Last Session State: ${recentSession.sessionState}`);
        console.log(`   Required Time: ${progress.moduleId.minimumCompletionTime || 15} min`);
        
        const requiredTime = progress.moduleId.minimumCompletionTime || 15;
        if (recentSession.durationMinutes < requiredTime && progress.status === 'completed') {
          console.log(`   ❌ ISSUE: Marked complete with insufficient time`);
        } else if (recentSession.durationMinutes >= requiredTime) {
          console.log(`   ✅ CORRECT: Sufficient time for completion`);
        }
      }
    }

    await mongoose.connection.close();
    console.log('\n\n✅ Check complete');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
  }
}

checkSessionStates();
