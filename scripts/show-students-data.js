// scripts/show-students-data.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function showStudentsData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Fetch all students
    const students = await User.find({ role: 'STUDENT' })
      .populate('assignedTeacher', 'name email regNo')
      .sort({ createdAt: -1 })
      .lean();

    console.log('📊 STUDENT DATA SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Students: ${students.length}\n`);

    // Group by status
    const statusGroups = students.reduce((acc, student) => {
      const status = student.studentStatus || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Students by Status:');
    Object.entries(statusGroups).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    console.log('');

    // Group by level
    const levelGroups = students.reduce((acc, student) => {
      const level = student.level || 'UNKNOWN';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    console.log('📚 Students by Level:');
    Object.entries(levelGroups).forEach(([level, count]) => {
      console.log(`   ${level}: ${count}`);
    });
    console.log('');

    // Group by subscription
    const subscriptionGroups = students.reduce((acc, student) => {
      const sub = student.subscription || 'UNKNOWN';
      acc[sub] = (acc[sub] || 0) + 1;
      return acc;
    }, {});

    console.log('💳 Students by Subscription:');
    Object.entries(subscriptionGroups).forEach(([sub, count]) => {
      console.log(`   ${sub}: ${count}`);
    });
    console.log('');

    // Group by batch
    const batchGroups = students.reduce((acc, student) => {
      const batch = student.batch || 'UNKNOWN';
      acc[batch] = (acc[batch] || 0) + 1;
      return acc;
    }, {});

    console.log('👥 Students by Batch:');
    Object.entries(batchGroups).forEach(([batch, count]) => {
      console.log(`   ${batch}: ${count}`);
    });
    console.log('\n');

    console.log('📋 DETAILED STUDENT LIST');
    console.log('='.repeat(80));
    console.log('');

    // Display each student
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name}`);
      console.log(`   📧 Email: ${student.email}`);
      console.log(`   🆔 Reg No: ${student.regNo}`);
      console.log(`   📚 Level: ${student.level}`);
      console.log(`   👥 Batch: ${student.batch}`);
      console.log(`   💳 Subscription: ${student.subscription}`);
      console.log(`   📊 Status: ${student.studentStatus}`);
      console.log(`   🌐 Medium: ${student.medium ? (Array.isArray(student.medium) ? student.medium.join(', ') : student.medium) : 'N/A'}`);
      console.log(`   👨‍🏫 Teacher: ${student.assignedTeacher ? student.assignedTeacher.name : 'Not Assigned'}`);
      console.log(`   ✅ Active: ${student.isActive ? 'Yes' : 'No'}`);
      console.log(`   📅 Registered: ${student.registeredAt ? new Date(student.registeredAt).toLocaleDateString() : 'N/A'}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log(`\n✅ Total: ${students.length} students displayed\n`);

    // Export to JSON file
    const fs = require('fs');
    const exportData = students.map(student => ({
      name: student.name,
      email: student.email,
      regNo: student.regNo,
      level: student.level,
      batch: student.batch,
      subscription: student.subscription,
      status: student.studentStatus,
      medium: student.medium,
      teacher: student.assignedTeacher ? student.assignedTeacher.name : null,
      teacherEmail: student.assignedTeacher ? student.assignedTeacher.email : null,
      isActive: student.isActive,
      registeredAt: student.registeredAt
    }));

    fs.writeFileSync(
      'students-export.json',
      JSON.stringify(exportData, null, 2)
    );
    console.log('💾 Data exported to: students-export.json\n');

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showStudentsData();
