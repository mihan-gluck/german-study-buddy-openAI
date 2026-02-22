// Script to backfill vocabulary tracking for existing sessions
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');

  try {
    const SessionRecords = mongoose.connection.collection('sessionrecords');
    const AiTutorSessions = mongoose.connection.collection('aitutorsessions');
    const LearningModules = mongoose.connection.collection('learningmodules');
    
    console.log('\n🔄 Backfilling vocabulary tracking for existing sessions...\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    // Get all session records without vocabularyUsed
    const sessionsToUpdate = await SessionRecords.find({
      $or: [
        { 'summary.vocabularyUsed': { $exists: false } },
        { 'summary.vocabularyUsed': [] }
      ]
    }).toArray();

    console.log(`\n📊 Found ${sessionsToUpdate.length} sessions to update\n`);

    let updated = 0;
    let skipped = 0;

    for (const sessionRecord of sessionsToUpdate) {
      try {
        // Get the module to access vocabulary list
        const module = await LearningModules.findOne({ _id: sessionRecord.moduleId });
        
        if (!module || !module.vocabulary || module.vocabulary.length === 0) {
          skipped++;
          continue;
        }

        // Extract vocabulary from module
        const moduleVocabulary = module.vocabulary.map(v => {
          if (typeof v === 'string') return v.toLowerCase();
          if (v.german) return v.german.toLowerCase();
          if (v.word) return v.word.toLowerCase();
          return null;
        }).filter(Boolean);

        if (moduleVocabulary.length === 0) {
          skipped++;
          continue;
        }

        // Analyze student messages to find vocabulary usage
        const studentMessages = sessionRecord.messages
          ? sessionRecord.messages.filter(m => m.role === 'student')
          : [];

        const vocabularyUsed = new Set();

        studentMessages.forEach(msg => {
          const messageLower = msg.content.toLowerCase();
          
          // Check each vocabulary item against the message
          moduleVocabulary.forEach(vocab => {
            if (messageLower.includes(vocab)) {
              vocabularyUsed.add(vocab);
            }
          });
        });

        // Update SessionRecord
        const vocabularyArray = Array.from(vocabularyUsed);
        
        await SessionRecords.updateOne(
          { _id: sessionRecord._id },
          { 
            $set: { 
              'summary.vocabularyUsed': vocabularyArray 
            } 
          }
        );

        // Also update AiTutorSession if it exists
        const aiSession = await AiTutorSessions.findOne({ sessionId: sessionRecord.sessionId });
        if (aiSession) {
          await AiTutorSessions.updateOne(
            { sessionId: sessionRecord.sessionId },
            { 
              $set: { 
                'analytics.vocabularyUsed': vocabularyArray 
              } 
            }
          );
        }

        if (vocabularyArray.length > 0) {
          console.log(`✅ ${sessionRecord.studentName}: ${vocabularyArray.length} vocabulary words tracked`);
          updated++;
        } else {
          skipped++;
        }

      } catch (error) {
        console.error(`❌ Error updating session ${sessionRecord.sessionId}:`, error.message);
        skipped++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('\n📊 BACKFILL SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`   Total Sessions Processed: ${sessionsToUpdate.length}`);
    console.log(`   Successfully Updated: ${updated}`);
    console.log(`   Skipped (no vocabulary): ${skipped}`);
    console.log('\n   ✅ Vocabulary tracking backfill complete');
    console.log('   ✅ Analytics will now show vocabulary counts for existing sessions');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
});
