// scripts/check-users.js

const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('../models/User');
    
    const teachers = await User.find({ role: 'TEACHER' }).limit(3);
    console.log('🧑‍🏫 Teachers found:');
    teachers.forEach(teacher => {
      console.log(`  - ${teacher.regNo} (${teacher.email}) - Role: ${teacher.role}`);
    });
    
    const students = await User.find({ role: 'STUDENT' }).limit(3);
    console.log('\n🎓 Students found:');
    students.forEach(student => {
      console.log(`  - ${student.regNo} (${student.email}) - Role: ${student.role}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();