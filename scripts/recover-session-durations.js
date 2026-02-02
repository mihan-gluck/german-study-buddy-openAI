// Script to recover session durations from AiTutorSession to SessionRecord

require('dotenv').config();
const mongoose = require('mongoose');
const AiTutorSession = require('../models/AiTutorSession');
const SessionRecord = require('../models/SessionRecord');

async function recoverSessionDurations() {
  try {
    console.log('🔧 Starting Session Duration Recovery...\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find all completed AI sessions with endTime
    const aiSessions = await AiTutorSession.find({ 
      status: 'completed',
      endTime: { $exists: true, $ne: null }
    }).select('sessionId startTime endTime totalDuration');
    
    console.log(`📊 Found ${aiSessions.length} completed AI sessions with endTime\n`);
    
    let recovered = 0;
    let alreadyHadDuration = 0;
    let noMatchingRecord = 0;
    let errors = 0;
    
    for (const aiSession of aiSessions) {
      try {
        // Find matching SessionRecord
        const sessionRecord = await SessionRecord.findOne({ sessionId: aiSession.sessionId });
        
        if (!sessionRecord) {
          noMatchingRecord++;
          continue;
        }
        
        // Check if already has duration
        if (sessionRecord.durationMinutes > 0) {
          alreadyHadDuration++;
          continue;
        }
        
        // Calculate duration from AI session
        let durationMinutes = 0;
        
        if (aiSession.totalDuration) {
          // Use pre-calculated duration if available
          durationMinutes = aiSession.totalDuration;
        } else if (aiSession.endTime && aiSession.startTime) {
          // Calculate from timestamps
          durationMinutes = Math.round((aiSession.endTime - aiSession.startTime) / 60000);
        }
        
        if (durationMinutes > 0) {
          // Update SessionRecord
          sessionRecord.durationMinutes = durationMinutes;
          sessionRecord.endTime = aiSession.endTime;
          
          // Update summary if it exists
          if (sessionRecord.summary) {
            sessionRecord.summary.timeSpentMinutes = durationMinutes;
          }
          
          await sessionRecord.save();
          recovered++;
          
          if (recovered % 10 === 0) {
            console.log(`✅ Recovered ${recovered} sessions...`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing session ${aiSession.sessionId}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RECOVERY SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully recovered: ${recovered} sessions`);
    console.log(`⏭️  Already had duration: ${alreadyHadDuration} sessions`);
    console.log(`⚠️  No matching record: ${noMatchingRecord} sessions`);
    console.log(`❌ Errors: ${errors} sessions`);
    console.log(`📈 Total processed: ${aiSessions.length} sessions\n`);
    
    // Verify the recovery
    const totalRecordsWithDuration = await SessionRecord.countDocuments({ 
      durationMinutes: { $gt: 0 } 
    });
    
    console.log(`🎉 SessionRecords with duration: ${totalRecordsWithDuration}`);
    console.log(`   (was 10, now ${totalRecordsWithDuration})\n`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

recoverSessionDurations();
