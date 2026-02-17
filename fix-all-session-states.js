// fix-all-session-states.js
// Script to fix ALL session states based on duration vs required time

const mongoose = require('mongoose');
require('dotenv').config();

const SessionRecord = require('./models/SessionRecord');
const LearningModule = require('./models/LearningModule');

async function fixAllSessionStates() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find ALL sessions marked as 'completed'
    console.log('📊 Finding all sessions marked as "completed"...');
    const completedSessions = await SessionRecord.find({ 
      sessionState: 'completed'
    }).populate('moduleId');

    console.log(`Found ${completedSessions.length} sessions marked as completed\n`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let noModuleCount = 0;

    for (const session of completedSessions) {
      if (!session.moduleId) {
        console.log(`⚠️ Skipping session ${session.sessionId} - module not found`);
        noModuleCount++;
        continue;
      }

      const module = session.moduleId;
      const requiredMinutes = module.minimumCompletionTime || 15;
      const actualMinutes = session.durationMinutes || 0;

      // Check if session should be marked as completed
      if (actualMinutes < requiredMinutes) {
        console.log(`🔧 FIXING: ${session.sessionId}`);
        console.log(`   Module: ${module.title}`);
        console.log(`   Duration: ${actualMinutes} min < ${requiredMinutes} min required`);
        console.log(`   Current: sessionState='completed', isModuleCompleted=${session.isModuleCompleted}`);
        console.log(`   New: sessionState='manually_ended', isModuleCompleted=false`);

        session.sessionState = 'manually_ended';
        session.isModuleCompleted = false;
        await session.save();

        fixedCount++;
      } else {
        console.log(`✅ Valid: ${module.title} (${actualMinutes} min >= ${requiredMinutes} min)`);
        
        // Ensure isModuleCompleted is true for valid completions
        if (!session.isModuleCompleted) {
          console.log(`   🔧 Setting isModuleCompleted=true`);
          session.isModuleCompleted = true;
          await session.save();
          fixedCount++;
        } else {
          alreadyCorrectCount++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FIX SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Sessions already correct: ${alreadyCorrectCount}`);
    console.log(`🔧 Sessions fixed: ${fixedCount}`);
    console.log(`⚠️  Sessions skipped (no module): ${noModuleCount}`);
    console.log(`📊 Total sessions processed: ${completedSessions.length}`);
    console.log('='.repeat(60));

    console.log('\n✅ Fix completed successfully!');
    console.log('💡 Refresh the admin analytics page to see the corrected data.');

  } catch (error) {
    console.error('❌ Error fixing session states:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the fix
fixAllSessionStates();
