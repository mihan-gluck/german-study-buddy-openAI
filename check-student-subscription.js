// check-student-subscription.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkStudent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const student = await User.findOne({ regNo: 'STUD042' });
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }
    
    console.log('📋 Student Details:');
    console.log('   Name:', student.name);
    console.log('   RegNo:', student.regNo);
    console.log('   Email:', student.email);
    console.log('   Role:', student.role);
    console.log('   Subscription:', student.subscription);
    console.log('   Level:', student.level);
    console.log('   Status:', student.studentStatus);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

checkStudent();
