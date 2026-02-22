// Script to find all users with suspiciously short session times
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');

  try {
    const Users = mongoose.connection.collection('users');
    const AITutorSessions = mongoose.connection.collection('aitutorsessions');
    const LearningModules = mongoose.connection.collection('learningmodules');

    console.log('\n🔍 Analyzing all AI tutor sessions for suspicious patterns...\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    // Get all sessions
    const allSessions = await AITutorSessions.find({}).toArray();
    console.log(`\n📊 Total sessions in database: ${allSessions.length}`);

    // Analyze sessions by student
    const studentSessionMap = new Map();
    
    for (const session of allSessions) {
      if (!session.studentId) continue;
      
      const studentId = session.studentId.toString();
      
      if (!studentSessionMap.has(studentId)) {
        studentSessionMap.set(studentId, {
          sessions: [],
          totalDuration: 0,
          completedCount: 0,
          suspiciousCount: 0
        });
      }
      
      const studentData = studentSessionMap.get(studentId);
      
      // Calculate session duration
      let duration = 0;
      if (session.startTime && session.endTime) {
        duration = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000);
      } else if (session.duration) {
        duration = session.duration;
      }
      
      // Flag suspicious sessions (less than 2 minutes = 120 seconds)
      const isSuspicious = duration < 120 && (session.status === 'completed' || session.completed);
      
      studentData.sessions.push({
        moduleId: session.moduleId,
        duration: duration,
        status: session.status,
        completed: session.completed,
        createdAt: session.createdAt,
        isSuspicious: isSuspicious
      });
      
      studentData.totalDuration += duration;
      
      if (session.status === 'completed' || session.completed) {
        studentData.completedCount++;
      }
      
      if (isSuspicious) {
        studentData.suspiciousCount++;
      }
    }

    console.log(`\n👥 Total students with sessions: ${studentSessionMap.size}`);

    // Find students with suspicious patterns
    const suspiciousStudents = [];
    
    for (const [studentId, data] of studentSessionMap.entries()) {
      // Criteria for suspicious activity:
      // 1. Has completed sessions
      // 2. Average session time < 2 minutes
      // 3. Has at least one suspicious session
      
      const avgDuration = data.totalDuration / data.sessions.length;
      
      if (data.suspiciousCount > 0 && avgDuration < 120) {
        suspiciousStudents.push({
          studentId: studentId,
          ...data,
          avgDuration: avgDuration
        });
      }
    }

    console.log(`\n⚠️  Found ${suspiciousStudents.length} students with suspicious session patterns\n`);
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    // Get student details and module info
    const studentIds = suspiciousStudents.map(s => new mongoose.Types.ObjectId(s.studentId));
    const students = await Users.find({ _id: { $in: studentIds } }).toArray();
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));

    const moduleIds = [...new Set(
      suspiciousStudents.flatMap(s => 
        s.sessions.map(sess => sess.moduleId?.toString()).filter(Boolean)
      )
    )];
    const modules = await LearningModules.find({
      _id: { $in: moduleIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).toArray();
    const moduleMap = new Map(modules.map(m => [m._id.toString(), m]));

    // Sort by most suspicious first (most suspicious sessions)
    suspiciousStudents.sort((a, b) => b.suspiciousCount - a.suspiciousCount);

    // Display results
    suspiciousStudents.forEach((studentData, index) => {
      const student = studentMap.get(studentData.studentId);
      
      if (!student) return;
      
      const avgMinutes = Math.floor(studentData.avgDuration / 60);
      const avgSeconds = studentData.avgDuration % 60;
      const totalMinutes = Math.floor(studentData.totalDuration / 60);
      const totalSeconds = studentData.totalDuration % 60;
      
      console.log(`\n${index + 1}. 👤 ${student.name} (${student.email})`);
      console.log(`   Student ID: ${student._id}`);
      console.log(`   ───────────────────────────────────────────────────────────────────────`);
      console.log(`   Total Sessions: ${studentData.sessions.length}`);
      console.log(`   Completed: ${studentData.completedCount}`);
      console.log(`   🚨 Suspicious Sessions: ${studentData.suspiciousCount}`);
      console.log(`   Total Time: ${totalMinutes}m ${totalSeconds}s`);
      console.log(`   Avg Time/Session: ${avgMinutes}m ${avgSeconds}s`);
      
      console.log(`\n   📋 Session Details:`);
      studentData.sessions.forEach((session, idx) => {
        const module = session.moduleId ? moduleMap.get(session.moduleId.toString()) : null;
        const moduleName = module ? module.title : 'Unknown Module';
        const durationMin = Math.floor(session.duration / 60);
        const durationSec = session.duration % 60;
        const flag = session.isSuspicious ? '🚨' : '✅';
        
        console.log(`      ${flag} ${moduleName}`);
        console.log(`         Duration: ${durationMin}m ${durationSec}s | Status: ${session.status || 'N/A'}`);
      });
      
      console.log(`   ───────────────────────────────────────────────────────────────────────`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('\n📊 SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`   Total Students Analyzed: ${studentSessionMap.size}`);
    console.log(`   Students with Suspicious Activity: ${suspiciousStudents.length}`);
    console.log(`   Percentage: ${Math.round((suspiciousStudents.length / studentSessionMap.size) * 100)}%`);
    
    const totalSuspiciousSessions = suspiciousStudents.reduce((sum, s) => sum + s.suspiciousCount, 0);
    console.log(`   Total Suspicious Sessions: ${totalSuspiciousSessions}`);
    
    console.log('\n   ⚠️  Suspicious Criteria:');
    console.log('      - Session marked as "completed"');
    console.log('      - Duration less than 2 minutes (120 seconds)');
    console.log('      - Average session time less than 2 minutes');
    
    console.log('\n   💡 Recommendation:');
    console.log('      These students may have rushed through modules before proper');
    console.log('      completion criteria were implemented. Consider:');
    console.log('      1. Resetting their progress for affected modules');
    console.log('      2. Requiring them to retake modules with new criteria');
    console.log('      3. Reviewing their learning outcomes');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    // Export to CSV for further analysis
    if (suspiciousStudents.length > 0) {
      console.log('\n📄 Generating CSV report...');
      
      const csvLines = ['Student Name,Email,Total Sessions,Completed,Suspicious,Total Time (seconds),Avg Time (seconds)'];
      
      suspiciousStudents.forEach(studentData => {
        const student = studentMap.get(studentData.studentId);
        if (student) {
          csvLines.push([
            `"${student.name}"`,
            student.email,
            studentData.sessions.length,
            studentData.completedCount,
            studentData.suspiciousCount,
            studentData.totalDuration,
            Math.round(studentData.avgDuration)
          ].join(','));
        }
      });
      
      const fs = require('fs');
      fs.writeFileSync('suspicious-sessions-report.csv', csvLines.join('\n'));
      console.log('✅ Report saved to: suspicious-sessions-report.csv');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
});
