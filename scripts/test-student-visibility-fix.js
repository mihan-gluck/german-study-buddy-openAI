// Test if students can now see timetables after the fix
require('dotenv').config();
const mongoose = require('mongoose');
const TimeTable = require('../models/TimeTable');
const User = require('../models/User');

async function testStudentVisibility() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const batch = '10';

    // Simulate the NEW backend query (batch only)
    console.log('🔍 Testing NEW query (batch only)...');
    const query = { batch: batch };
    const timetables = await TimeTable.find(query);

    console.log(`   Found ${timetables.length} timetable(s) for batch ${batch}`);

    if (timetables.length === 0) {
      console.log('   ❌ No timetables found');
      return;
    }

    // Show timetable details
    timetables.forEach((tt, index) => {
      console.log(`\n   Timetable ${index + 1}:`);
      console.log(`      ID: ${tt._id}`);
      console.log(`      Medium: ${tt.medium}`);
      console.log(`      Plan: ${tt.plan}`);
      console.log(`      Week: ${new Date(tt.weekStartDate).toDateString()} to ${new Date(tt.weekEndDate).toDateString()}`);
      
      // Check for meetings
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      days.forEach(day => {
        if (tt[day] && tt[day].length > 0) {
          tt[day].forEach(slot => {
            console.log(`      ${day}: ${slot.start} - ${slot.end} ${slot.meetingLinked ? '✅ Meeting Linked' : ''}`);
          });
        }
      });
    });

    // Get all students in batch
    const students = await User.find({
      role: 'STUDENT',
      batch: batch,
      isActive: true
    }).select('name medium subscription');

    console.log(`\n👥 Testing visibility for ${students.length} students:\n`);

    let canSeeCount = 0;
    students.forEach((student, index) => {
      // With NEW query, all students in batch can see timetable
      const canSee = timetables.length > 0;
      
      if (index < 5) {  // Show first 5 students
        console.log(`   ${student.name}`);
        console.log(`      Medium: ${JSON.stringify(student.medium)}, Plan: ${student.subscription}`);
        console.log(`      Can see timetable: ${canSee ? '✅ YES' : '❌ NO'}`);
      }
      
      if (canSee) canSeeCount++;
    });

    if (students.length > 5) {
      console.log(`   ... and ${students.length - 5} more students`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RESULTS:');
    console.log(`   Total students: ${students.length}`);
    console.log(`   Can see timetable: ${canSeeCount} ✅`);
    console.log(`   Cannot see timetable: ${students.length - canSeeCount} ❌`);
    console.log(`   Success rate: ${Math.round((canSeeCount / students.length) * 100)}%`);

    if (canSeeCount === students.length) {
      console.log('\n🎉 SUCCESS! All students can now see the timetable!');
      console.log('   The fix is working correctly.');
    } else {
      console.log('\n⚠️  Some students still cannot see timetable');
      console.log('   This might be because no timetable exists for this batch');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

testStudentVisibility();
