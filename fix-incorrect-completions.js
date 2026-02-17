// fix-incorrect-completions.js
// Script to fix incorrectly marked module completions in the database
// Run this ONCE to clean up existing data

const mongoose = require('mongoose');
require('dotenv').config();

const StudentProgress = require('./models/StudentProgress');
const SessionRecord = require('./models/SessionRecord');
const LearningModule = require('./models/LearningModule');

async function fixIncorrectCompletions() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Find all StudentProgress records marked as completed
    console.log('\n📊 Step 1: Finding all completed StudentProgress records...');
    const completedProgress = await StudentProgress.find({ 
      status: 'completed',
      progressPercentage: 100 
    }).populate('moduleId');

    console.log(`Found ${completedProgress.length} completed progress records`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;

    // Step 2: Check each completion against session records
    for (const progress of completedProgress) {
      if (!progress.moduleId) {
        console.log(`⚠️ Skipping progress ${progress._id} - module not found`);
        continue;
      }

      const module = progress.moduleId;
      const requiredMinutes = module.minimumCompletionTime || 15;

      // Find the most recent session for this student and module
      const recentSession = await SessionRecord.findOne({
        studentId: progress.studentId,
        moduleId: progress.moduleId._id,
        sessionState: { $in: ['completed', 'manually_ended', 'abandoned'] }
      }).sort({ createdAt: -1 });

      if (!recentSession) {
        console.log(`⚠️ No session found for student ${progress.studentId}, module ${module.title}`);
        continue;
      }

      const sessionDuration = recentSession.durationMinutes || 0;

      // Check if completion is valid
      if (sessionDuration < requiredMinutes) {
        console.log(`\n🔧 FIXING: Student ${progress.studentId}`);
        console.log(`   Module: ${module.title}`);
        console.log(`   Duration: ${sessionDuration} min < ${requiredMinutes} min required`);
        console.log(`   Current status: completed (100%)`);
        console.log(`   New status: in-progress`);

        // Update StudentProgress to in-progress
        progress.status = 'in-progress';
        progress.progressPercentage = Math.min(Math.round((sessionDuration / requiredMinutes) * 100), 95);
        progress.completedAt = null;
        await progress.save();

        // Update SessionRecord
        recentSession.sessionState = 'manually_ended';
        recentSession.isModuleCompleted = false;
        await recentSession.save();

        fixedCount++;
      } else {
        console.log(`✅ Valid completion: ${module.title} (${sessionDuration} min >= ${requiredMinutes} min)`);
        alreadyCorrectCount++;
      }
    }

    // Step 3: Fix SessionRecords with 0 duration but marked as completed
    console.log('\n📊 Step 3: Finding SessionRecords with 0 duration marked as completed...');
    const zeroMinuteSessions = await SessionRecord.find({
      durationMinutes: { $lte: 5 }, // 5 minutes or less
      sessionState: 'completed',
      isModuleCompleted: true
    }).populate('moduleId');

    console.log(`Found ${zeroMinuteSessions.length} sessions with ≤5 minutes marked as completed`);

    let sessionFixedCount = 0;

    for (const session of zeroMinuteSessions) {
      if (!session.moduleId) {
        console.log(`⚠️ Skipping session ${session.sessionId} - module not found`);
        continue;
      }

      const module = session.moduleId;
      const requiredMinutes = module.minimumCompletionTime || 15;

      console.log(`\n🔧 FIXING SESSION: ${session.sessionId}`);
      console.log(`   Module: ${module.title}`);
      console.log(`   Duration: ${session.durationMinutes} min < ${requiredMinutes} min required`);
      console.log(`   Current state: completed, isModuleCompleted: true`);
      console.log(`   New state: manually_ended, isModuleCompleted: false`);

      session.sessionState = 'manually_ended';
      session.isModuleCompleted = false;
      await session.save();

      sessionFixedCount++;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FIX SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ StudentProgress records already correct: ${alreadyCorrectCount}`);
    console.log(`🔧 StudentProgress records fixed: ${fixedCount}`);
    console.log(`🔧 SessionRecord records fixed: ${sessionFixedCount}`);
    console.log(`📊 Total records processed: ${completedProgress.length + zeroMinuteSessions.length}`);
    console.log('='.repeat(60));

    console.log('\n✅ Fix completed successfully!');
    console.log('💡 Refresh the admin analytics page to see the corrected data.');

  } catch (error) {
    console.error('❌ Error fixing incorrect completions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the fix
fixIncorrectCompletions();
