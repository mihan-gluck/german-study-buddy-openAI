// Script to clean up SessionRecord collection for proper analytics
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');

  try {
    const SessionRecords = mongoose.connection.collection('sessionrecords');
    const Users = mongoose.connection.collection('users');

    console.log('\n🧹 Cleaning up SessionRecord collection for analytics...\n');
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

    let totalDeleted = 0;
    let studentsProcessed = 0;

    console.log('\n📊 Analyzing SessionRecord collection...\n');

    for (const studentId of suspiciousStudentIds) {
      const objectId = new mongoose.Types.ObjectId(studentId);
      
      // Find all session records for this student
      const sessionRecords = await SessionRecords.find({
        studentId: objectId
      }).toArray();

      if (sessionRecords.length === 0) {
        continue;
      }

      // Filter suspicious records (duration < 2 minutes and completed)
      const suspiciousRecords = sessionRecords.filter(record => {
        const duration = record.durationMinutes || 0;
        const isCompleted = record.sessionState === 'completed';
        return duration < 2 && isCompleted;
      });

      if (suspiciousRecords.length > 0) {
        const user = await Users.findOne({ _id: objectId });
        const userName = user ? user.name : 'Unknown';
        
        console.log(`👤 ${userName} (${studentId})`);
        console.log(`   Total Records: ${sessionRecords.length}`);
        console.log(`   Suspicious Records: ${suspiciousRecords.length}`);
        
        // Delete suspicious records
        const recordIds = suspiciousRecords.map(r => r._id);
        const deleteResult = await SessionRecords.deleteMany({
          _id: { $in: recordIds }
        });
        
        console.log(`   ✅ Deleted ${deleteResult.deletedCount} record(s)`);
        console.log(`   ───────────────────────────────────────────────────────────────────────`);
        
        totalDeleted += deleteResult.deletedCount;
        studentsProcessed++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('\n📊 CLEANUP SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`   Students Processed: ${studentsProcessed}`);
    console.log(`   Session Records Deleted: ${totalDeleted}`);
    
    if (totalDeleted > 0) {
      console.log('\n   ✅ SessionRecord collection cleaned');
      console.log('   ✅ Analytics will now show accurate data');
      console.log('   ✅ Refresh the analytics page to see updated results');
    } else {
      console.log('\n   ℹ️  No suspicious session records found');
      console.log('   ℹ️  Analytics data may be coming from a different source');
    }
    
    console.log('\n   📝 Note:');
    console.log('      If analytics still shows old data, try:');
    console.log('      1. Clear browser cache');
    console.log('      2. Hard refresh the page (Ctrl+Shift+R)');
    console.log('      3. Check if there are other session tracking collections');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
});
