// Script to reset progress for students with suspicious sessions
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

    console.log('\n🔄 Starting progress reset for students with suspicious sessions...\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    // List of student IDs with suspicious activity (from previous analysis)
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

    let totalSessionsDeleted = 0;
    let totalProgressReset = 0;
    let studentsProcessed = 0;

    for (const studentId of suspiciousStudentIds) {
      const objectId = new mongoose.Types.ObjectId(studentId);
      
      // Find all suspicious sessions for this student (duration < 120 seconds and completed)
      const suspiciousSessions = await AITutorSessions.find({
        studentId: objectId,
        $or: [
          { status: 'completed' },
          { completed: true }
        ]
      }).toArray();

      const sessionsToDelete = suspiciousSessions.filter(session => {
        let duration = 0;
        if (session.startTime && session.endTime) {
          duration = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000);
        } else if (session.duration) {
          duration = session.duration;
        }
        return duration < 120; // Less than 2 minutes
      });

      if (sessionsToDelete.length > 0) {
        console.log(`\n👤 Processing Student ID: ${studentId}`);
        console.log(`   Found ${sessionsToDelete.length} suspicious session(s) to delete`);

        // Get unique module IDs from suspicious sessions
        const moduleIds = [...new Set(sessionsToDelete.map(s => s.moduleId?.toString()).filter(Boolean))];
        
        console.log(`   Affected modules: ${moduleIds.length}`);

        // Delete suspicious sessions
        const sessionIds = sessionsToDelete.map(s => s._id);
        const deleteResult = await AITutorSessions.deleteMany({
          _id: { $in: sessionIds }
        });
        
        console.log(`   ✅ Deleted ${deleteResult.deletedCount} suspicious session(s)`);
        totalSessionsDeleted += deleteResult.deletedCount;

        // Reset student progress for affected modules
        for (const moduleId of moduleIds) {
          const moduleObjectId = new mongoose.Types.ObjectId(moduleId);
          
          const progressResult = await StudentProgress.updateOne(
            {
              studentId: objectId,
              moduleId: moduleObjectId
            },
            {
              $set: {
                status: 'not-started',
                progress: 0,
                completedAt: null,
                score: 0,
                lastAccessedAt: new Date()
              },
              $unset: {
                exercises: "",
                completedExercises: ""
              }
            }
          );

          if (progressResult.modifiedCount > 0) {
            console.log(`   ✅ Reset progress for module: ${moduleId}`);
            totalProgressReset++;
          }
        }

        studentsProcessed++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('\n📊 RESET SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`   Students Processed: ${studentsProcessed}`);
    console.log(`   Total Sessions Deleted: ${totalSessionsDeleted}`);
    console.log(`   Total Progress Records Reset: ${totalProgressReset}`);
    console.log('\n   ✅ All suspicious sessions have been removed');
    console.log('   ✅ Student progress has been reset for affected modules');
    console.log('   ✅ Students can now properly complete modules with new structure');
    console.log('\n   📝 Next Steps:');
    console.log('      1. Students will see modules as "not-started"');
    console.log('      2. They must complete all exercises and tasks');
    console.log('      3. Minimum 12-minute completion time enforced');
    console.log('      4. 70% minimum score required');
    console.log('      5. 80% vocabulary mastery required');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
});
