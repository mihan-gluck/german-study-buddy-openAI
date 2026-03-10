// analyze-completed-sessions.js
// Analyze sessions marked as "completed" to find suspicious ones

require('dotenv').config();
const mongoose = require('mongoose');
const AiTutorSession = require('./models/AiTutorSession');
const User = require('./models/User');
const LearningModule = require('./models/LearningModule');

async function analyzeCompletedSessions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all completed sessions
    const completedSessions = await AiTutorSession.find({ status: 'completed' })
      .populate('studentId')
      .populate('moduleId')
      .sort({ createdAt: -1 });

    console.log(`📊 Total "completed" sessions: ${completedSessions.length}\n`);

    // Analyze suspicious sessions
    const suspicious = {
      veryShort: [],           // < 2 minutes
      fewMessages: [],         // <= 3 messages
      noMessages: [],          // 0 messages
      shortAndFewMessages: [], // < 5 min AND <= 5 messages
      onlyWelcome: []          // Only has welcome message
    };

    completedSessions.forEach(session => {
      const duration = session.totalDuration || 0;
      const messageCount = session.messages?.length || 0;
      const studentMessages = session.messages?.filter(m => m.role === 'student').length || 0;

      // Very short sessions (< 2 minutes)
      if (duration < 2) {
        suspicious.veryShort.push({
          sessionId: session.sessionId,
          student: session.studentId?.name || 'Unknown',
          module: session.moduleId?.title || 'Unknown',
          duration,
          messageCount,
          studentMessages,
          createdAt: session.createdAt
        });
      }

      // Few messages (<= 3)
      if (messageCount <= 3) {
        suspicious.fewMessages.push({
          sessionId: session.sessionId,
          student: session.studentId?.name || 'Unknown',
          module: session.moduleId?.title || 'Unknown',
          duration,
          messageCount,
          studentMessages,
          createdAt: session.createdAt
        });
      }

      // No messages
      if (messageCount === 0) {
        suspicious.noMessages.push({
          sessionId: session.sessionId,
          student: session.studentId?.name || 'Unknown',
          module: session.moduleId?.title || 'Unknown',
          duration,
          createdAt: session.createdAt
        });
      }

      // Short AND few messages (< 5 min AND <= 5 messages)
      if (duration < 5 && messageCount <= 5) {
        suspicious.shortAndFewMessages.push({
          sessionId: session.sessionId,
          student: session.studentId?.name || 'Unknown',
          module: session.moduleId?.title || 'Unknown',
          duration,
          messageCount,
          studentMessages,
          createdAt: session.createdAt
        });
      }

      // Only has welcome message (1 message from tutor, 0 from student)
      if (messageCount === 1 && studentMessages === 0) {
        suspicious.onlyWelcome.push({
          sessionId: session.sessionId,
          student: session.studentId?.name || 'Unknown',
          module: session.moduleId?.title || 'Unknown',
          duration,
          messageContent: session.messages[0]?.content?.substring(0, 100),
          createdAt: session.createdAt
        });
      }
    });

    // Report findings
    console.log('🚨 SUSPICIOUS "COMPLETED" SESSIONS ANALYSIS');
    console.log('='.repeat(80));

    console.log(`\n1️⃣ Very Short Sessions (< 2 minutes): ${suspicious.veryShort.length}`);
    if (suspicious.veryShort.length > 0) {
      console.log('   These sessions are too short to be meaningful:');
      suspicious.veryShort.slice(0, 10).forEach(s => {
        console.log(`   - ${s.student}: ${s.module} (${s.duration}m, ${s.messageCount} msgs, ${s.studentMessages} student msgs)`);
      });
      if (suspicious.veryShort.length > 10) {
        console.log(`   ... and ${suspicious.veryShort.length - 10} more`);
      }
    }

    console.log(`\n2️⃣ Few Messages (<= 3 messages): ${suspicious.fewMessages.length}`);
    if (suspicious.fewMessages.length > 0) {
      console.log('   These sessions have very little interaction:');
      suspicious.fewMessages.slice(0, 10).forEach(s => {
        console.log(`   - ${s.student}: ${s.module} (${s.duration}m, ${s.messageCount} msgs, ${s.studentMessages} student msgs)`);
      });
      if (suspicious.fewMessages.length > 10) {
        console.log(`   ... and ${suspicious.fewMessages.length - 10} more`);
      }
    }

    console.log(`\n3️⃣ No Messages (0 messages): ${suspicious.noMessages.length}`);
    if (suspicious.noMessages.length > 0) {
      console.log('   These sessions have NO conversation at all:');
      suspicious.noMessages.forEach(s => {
        console.log(`   - ${s.student}: ${s.module} (${s.duration}m)`);
      });
    }

    console.log(`\n4️⃣ Short AND Few Messages (< 5 min AND <= 5 msgs): ${suspicious.shortAndFewMessages.length}`);
    if (suspicious.shortAndFewMessages.length > 0) {
      console.log('   These sessions are both short and have little interaction:');
      suspicious.shortAndFewMessages.slice(0, 10).forEach(s => {
        console.log(`   - ${s.student}: ${s.module} (${s.duration}m, ${s.messageCount} msgs, ${s.studentMessages} student msgs)`);
      });
      if (suspicious.shortAndFewMessages.length > 10) {
        console.log(`   ... and ${suspicious.shortAndFewMessages.length - 10} more`);
      }
    }

    console.log(`\n5️⃣ Only Welcome Message (1 msg, 0 student msgs): ${suspicious.onlyWelcome.length}`);
    if (suspicious.onlyWelcome.length > 0) {
      console.log('   These sessions only have the initial welcome message:');
      suspicious.onlyWelcome.slice(0, 10).forEach(s => {
        console.log(`   - ${s.student}: ${s.module} (${s.duration}m)`);
        console.log(`     Message: "${s.messageContent}..."`);
      });
      if (suspicious.onlyWelcome.length > 10) {
        console.log(`   ... and ${suspicious.onlyWelcome.length - 10} more`);
      }
    }

    // Summary statistics
    console.log('\n📈 SUMMARY STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total "completed" sessions: ${completedSessions.length}`);
    console.log(`Suspicious sessions (< 5 min AND <= 5 msgs): ${suspicious.shortAndFewMessages.length} (${(suspicious.shortAndFewMessages.length / completedSessions.length * 100).toFixed(1)}%)`);
    console.log(`Very short sessions (< 2 min): ${suspicious.veryShort.length} (${(suspicious.veryShort.length / completedSessions.length * 100).toFixed(1)}%)`);
    console.log(`Few messages (<= 3): ${suspicious.fewMessages.length} (${(suspicious.fewMessages.length / completedSessions.length * 100).toFixed(1)}%)`);
    console.log(`No messages: ${suspicious.noMessages.length} (${(suspicious.noMessages.length / completedSessions.length * 100).toFixed(1)}%)`);
    console.log(`Only welcome message: ${suspicious.onlyWelcome.length} (${(suspicious.onlyWelcome.length / completedSessions.length * 100).toFixed(1)}%)`);

    // Check a few examples in detail
    console.log('\n🔍 DETAILED EXAMPLES (First 3 suspicious sessions)');
    console.log('='.repeat(80));
    
    for (let i = 0; i < Math.min(3, suspicious.shortAndFewMessages.length); i++) {
      const suspiciousSession = suspicious.shortAndFewMessages[i];
      const fullSession = await AiTutorSession.findOne({ sessionId: suspiciousSession.sessionId })
        .populate('studentId')
        .populate('moduleId');
      
      console.log(`\n[${i + 1}] Session: ${fullSession.sessionId}`);
      console.log(`    Student: ${fullSession.studentId?.name}`);
      console.log(`    Module: ${fullSession.moduleId?.title}`);
      console.log(`    Status: ${fullSession.status}`);
      console.log(`    Duration: ${fullSession.totalDuration || 0} minutes`);
      console.log(`    Created: ${fullSession.createdAt}`);
      console.log(`    Messages (${fullSession.messages?.length || 0}):`);
      
      if (fullSession.messages && fullSession.messages.length > 0) {
        fullSession.messages.forEach((msg, idx) => {
          console.log(`      [${idx + 1}] ${msg.role}: ${msg.content.substring(0, 80)}...`);
        });
      } else {
        console.log('      (No messages)');
      }
      
      console.log(`    Analytics:`, fullSession.analytics);
    }

    // Possible reasons
    console.log('\n💡 POSSIBLE REASONS FOR FALSE "COMPLETED" STATUS:');
    console.log('='.repeat(80));
    console.log('1. Teacher testing modules (quick tests marked as completed)');
    console.log('2. Auto-completion logic triggered too early');
    console.log('3. Sessions marked completed on error/crash');
    console.log('4. Manual completion without proper validation');
    console.log('5. Migration or data import issues');
    console.log('6. Frontend sending completion signal prematurely');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

analyzeCompletedSessions();
