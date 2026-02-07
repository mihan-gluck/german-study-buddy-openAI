// Script to get all PLATINUM plan students with "ongoing" status
// Usage: node scripts/get-platinum-ongoing-students.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function getPlatinumOngoingStudents() {
  try {
    console.log('🔍 Fetching PLATINUM Plan Students with Ongoing Status\n');
    console.log('='.repeat(80));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Query for PLATINUM students with "ongoing" status
    const students = await User.find({
      role: 'STUDENT',
      subscription: 'PLATINUM',
      studentStatus: { $regex: /ongoing/i } // Case-insensitive match
    })
    .select('name email regNo level studentStatus subscription phone address createdAt')
    .sort({ name: 1 }) // Sort alphabetically by name
    .lean();

    console.log(`📊 Found ${students.length} PLATINUM students with Ongoing status\n`);
    console.log('='.repeat(80));
    console.log('\n');

    if (students.length === 0) {
      console.log('❌ No PLATINUM students with "ongoing" status found.\n');
      console.log('💡 Possible reasons:');
      console.log('   - No students have PLATINUM subscription');
      console.log('   - No students have "ongoing" status');
      console.log('   - Status field might use different values\n');
      
      // Show what statuses exist
      const allStatuses = await User.distinct('studentStatus', { role: 'STUDENT', subscription: 'PLATINUM' });
      console.log('📋 Available student statuses for PLATINUM students:');
      allStatuses.forEach(status => console.log(`   - ${status || '(empty)'}`));
      console.log('\n');
    } else {
      // Display students
      console.log('👥 PLATINUM STUDENTS - ONGOING STATUS');
      console.log('='.repeat(80));
      console.log('\n');

      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name}`);
        console.log(`   RegNo:    ${student.regNo}`);
        console.log(`   Email:    ${student.email}`);
        console.log(`   Level:    ${student.level}`);
        console.log(`   Status:   ${student.studentStatus}`);
        console.log(`   Phone:    ${student.phone || 'N/A'}`);
        console.log(`   Address:  ${student.address || 'N/A'}`);
        console.log(`   Joined:   ${new Date(student.createdAt).toLocaleDateString()}`);
        console.log('');
      });

      console.log('='.repeat(80));
      console.log('\n');

      // Summary by level
      console.log('📚 BREAKDOWN BY LEVEL');
      console.log('='.repeat(80));
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      levels.forEach(level => {
        const count = students.filter(s => s.level === level).length;
        if (count > 0) {
          console.log(`${level}: ${count} students`);
        }
      });
      console.log('='.repeat(80));
      console.log('\n');

      // Simple list of names
      console.log('📝 SIMPLE NAME LIST (Copy-Paste Ready)');
      console.log('='.repeat(80));
      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name}`);
      });
      console.log('='.repeat(80));
      console.log('\n');

      // Export option
      console.log('💾 EXPORT OPTIONS');
      console.log('='.repeat(80));
      console.log('To export this data:');
      console.log('1. JSON format:');
      console.log('   node scripts/get-platinum-ongoing-students.js > platinum-ongoing-students.json');
      console.log('');
      console.log('2. Text format:');
      console.log('   node scripts/get-platinum-ongoing-students.js > platinum-ongoing-students.txt');
      console.log('='.repeat(80));
      console.log('\n');
    }

    // Summary
    console.log('📋 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total PLATINUM Ongoing Students: ${students.length}`);
    console.log(`Subscription: PLATINUM`);
    console.log(`Status: Ongoing`);
    console.log('='.repeat(80));
    console.log('\n');

    console.log('✅ Query complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
getPlatinumOngoingStudents();
