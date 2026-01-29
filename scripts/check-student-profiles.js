// Check student profiles to see their medium and subscription
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const TimeTable = require('../models/TimeTable');

async function checkStudentProfiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const batch = '10';

    // Get timetable
    const timetable = await TimeTable.findOne({ batch }).sort({ createdAt: -1 });
    
    if (!timetable) {
      console.log('❌ No timetable found for batch', batch);
      return;
    }

    console.log('📅 TIMETABLE for Batch', batch);
    console.log('   Medium:', timetable.medium);
    console.log('   Plan:', timetable.plan);
    console.log('   Week:', new Date(timetable.weekStartDate).toDateString(), 
                'to', new Date(timetable.weekEndDate).toDateString());
    console.log('');

    // Get students
    const students = await User.find({ 
      role: 'STUDENT', 
      batch: batch,
      isActive: true 
    }).select('name batch medium subscription');

    console.log('👥 STUDENTS in Batch', batch, '(' + students.length + ' total):\n');

    let matchCount = 0;
    let mismatchCount = 0;

    students.forEach(student => {
      const mediumMatch = student.medium && student.medium.includes(timetable.medium);
      const planMatch = student.subscription === timetable.plan;
      const canSee = mediumMatch && planMatch;

      console.log(`   ${student.name}`);
      console.log(`      Medium: ${JSON.stringify(student.medium)} ${mediumMatch ? '✅' : '❌'}`);
      console.log(`      Subscription: ${student.subscription} ${planMatch ? '✅' : '❌'}`);
      console.log(`      Can see timetable: ${canSee ? '✅ YES' : '❌ NO'}`);
      console.log('');

      if (canSee) matchCount++;
      else mismatchCount++;
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 SUMMARY:');
    console.log(`   Total students: ${students.length}`);
    console.log(`   Can see timetable: ${matchCount} ✅`);
    console.log(`   Cannot see timetable: ${mismatchCount} ❌`);

    if (mismatchCount > 0) {
      console.log('\n⚠️  ISSUE DETECTED: Some students cannot see the timetable!');
      console.log('\n💡 CAUSE:');
      console.log('   Students filter timetables by: batch + medium + plan');
      console.log('   Timetable has: batch=' + batch + ', medium=' + timetable.medium + ', plan=' + timetable.plan);
      console.log('   Students with different medium/plan cannot see it');
      
      console.log('\n🔧 SOLUTIONS:');
      console.log('   Option 1: Update student profiles to match timetable');
      console.log('   Option 2: Create separate timetables for each medium/plan combination');
      console.log('   Option 3: Change timetable filtering to only use batch (not medium/plan)');
    } else {
      console.log('\n✅ All students can see the timetable!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkStudentProfiles();
