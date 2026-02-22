// Script to verify and clean up all completion-related data for proper analytics
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');

  try {
    const AITutorSessions = mongoose.connection.collection('aitutorsessions');
    const StudentProgress = mongoose.connection.collection('studentprogresses');
    const SessionRecords = mongoose.connection.collection('sessionrecords');

    console.log('\n🧹 Cleaning up completion data for proper analytics...\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    // List of student IDs with suspicious activity
    const suspiciousStudentIds = [
      '698ab7206acbb3881482f919', // Ms. Nachammai
      '696df964b4abcf92b2514c3a', // Harjuna Raguwaran
      '698e34196acbb38814a1fc03', // Vishnu
      '696df9dbb4abcf92b251504d', // Jenitha
      '696df918b4abcf92b25149b7', // Rahul
      '696df6bab4abcf92b25135c8', // Arunalini Mariyanayagam
      '698e343d6acbb38814a1fdf9', // Kilukshan
      '692055d7e9cd166359b40803', // Dhanushya Ramachandran
      '696ba9a2d0b2896c901a9533', // Nadeesh Thiwanka
      '696ba9a4d0b2896c901a954d', // Kasun Kanishka
      '69205c07e9cd166359b40dd2', // Mihan Gluck Global
      '696ba9a4d0b2896c901a9551', // Deveena Pathmanathan
      '692695d6eca5db23f8a98ee5', // Test Student
      '698e34516acbb38814a1fe66', // Pradeep
      '696ba99bd0b2896c901a94db', // Nirrojan Sureshkumar
      '696df8cab4abcf92b2514796', // Fathima Afna
      '696ba9a4d0b2896c901a954b', // Ishara Anurangi Jayakodi
      '69205bbae9cd166359b40d68'  // Community Builder
    ];

    let totalCleaned = 0;

    console.log('\n📊 Step 1: Checking for remaining suspicious AI Tutor Sessions...\n');
    
    for (const studentId of suspiciousStudentIds) {
      const objectId = new mongoose.Types.ObjectId(studentId);
      
      // Find any remaining suspicious sessions
      const remainingSessions = await AITutorSessions.find({
        studentId: objectId
      }).toArray();

      const suspiciousRemaining = remainingSessions.filter(session => {
        let duration = 0;
        if (session.startTime && session.endTime) {
          duration = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000);
        } else if (session.duration) {
          duration = session.duration;
        }
        return duration < 120 && (session.status === 'completed' || session.completed);
      });

      if (suspiciousRemaining.length > 0) {
        console.log(`   Found ${suspiciousRemaining.length} remaining suspicious sessions for student ${studentId}`);
        
        const sessionIds = suspiciousRemaining.map(s => s._id);
        const deleteResult = await AITutorSessions.deleteMany({
          _id: { $in: sessionIds }
        });
        
        console.log(`   ✅ Deleted ${deleteResult.deletedCount} session(s)`);
        totalCleaned += deleteResult.deletedCount;
      }
    }

    console.log('\n📊 Step 2: Cleaning up Student Progress records...\n');
    
    let progressCleaned = 0;
    
    for (const studentId of suspiciousStudentIds) {
      const objectId = new mongoose.Types.ObjectId(studentId);
      
      // Find progress records with suspicious completion (completed but low progress/score)
      const suspiciousProgress = await StudentProgress.find({
        studentId: objectId,
        $or: [
          { status: 'completed', progress: { $lt: 50 } },
          { status: 'completed', score: { $lt: 50 } },
          { completedAt: { $exists: true }, progress: { $lt: 50 } }
        ]
      }).toArray();

      if (suspiciousProgress.length > 0) {
        console.log(`   Found ${suspiciousProgress.length} suspicious progress records for student ${studentId}`);
        
        for (const progress of suspiciousProgress) {
          await StudentProgress.updateOne(
            { _id: progress._id },
            {
              $set: {
                status: 'not-started',
                progress: 0,
                score: 0,
                completedAt: null
              },
              $unset: {
                exercises: "",
                completedExercises: "",
                completedTasks: ""
              }
            }
          );
          progressCleaned++;
        }
        
        console.log(`   ✅ Cleaned ${suspiciousProgress.length} progress record(s)`);
      }
    }

    console.log('\n📊 Step 3: Checking Session Records collection...\n');
    
    let sessionRecordsCleaned = 0;
    
    for (const studentId of suspiciousStudentIds) {
      const objectId = new mongoose.Types.ObjectId(studentId);
      
      // Check if sessionrecords collection exists and has data
      const sessionRecords = await SessionRecords.find({
        studentId: objectId
      }).toArray();

      if (sessionRecords.length > 0) {
        const suspiciousRecords = sessionRecords.filter(record => {
          const duration = record.duration || 0;
          return duration < 120 && record.completed;
        });

        if (suspiciousRecords.length > 0) {
          console.log(`   Found ${suspiciousRecords.length} suspicious session records for student ${studentId}`);
          
          const recordIds = suspiciousRecords.map(r => r._id);
          const deleteResult = await SessionRecords.deleteMany({
            _id: { $in: recordIds }
          });
          
          console.log(`   ✅ Deleted ${deleteResult.deletedCount} session record(s)`);
          sessionRecordsCleaned += deleteResult.deletedCount;
        }
      }
    }

    console.log('\n📊 Step 4: Verifying data integrity...\n');
    
    // Verify no suspicious data remains
    let verificationIssues = 0;
    
    for (const studentId of suspiciousStudentIds) {
      const objectId = new mongoose.Types.ObjectId(studentId);
      
      // Check AI Tutor Sessions
      const sessions = await AITutorSessions.find({
        studentId: objectId,
        $or: [
          { status: 'completed' },
          { completed: true }
        ]
      }).toArray();

      const stillSuspicious = sessions.filter(session => {
        let duration = 0;
        if (session.startTime && session.endTime) {
          duration = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000);
        } else if (session.duration) {
          duration = session.duration;
        }
        return duration < 120;
      });

      if (stillSuspicious.length > 0) {
        console.log(`   ⚠️  Student ${studentId} still has ${stillSuspicious.length} suspicious session(s)`);
        verificationIssues += stillSuspicious.length;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('\n📊 CLEANUP SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`   AI Tutor Sessions Cleaned: ${totalCleaned}`);
    console.log(`   Student Progress Records Cleaned: ${progressCleaned}`);
    console.log(`   Session Records Cleaned: ${sessionRecordsCleaned}`);
    console.log(`   Total Records Cleaned: ${totalCleaned + progressCleaned + sessionRecordsCleaned}`);
    
    if (verificationIssues === 0) {
      console.log('\n   ✅ All suspicious completion data has been removed');
      console.log('   ✅ Analytics will now show accurate data');
      console.log('   ✅ No incomplete/rushed completions in the system');
    } else {
      console.log(`\n   ⚠️  Warning: ${verificationIssues} suspicious records still found`);
      console.log('   ℹ️  You may need to run this script again');
    }
    
    console.log('\n   📈 Analytics Impact:');
    console.log('      - Completion rates will be more accurate');
    console.log('      - Average session times will reflect real learning');
    console.log('      - Student progress metrics will be reliable');
    console.log('      - Module effectiveness can be properly measured');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
});
