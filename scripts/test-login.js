// scripts/test-login.js
// Test login functionality

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Dhanushya
    const student = await User.findOne({ regNo: 'STUD033' });
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log('='.repeat(60));
    console.log('STUDENT LOGIN INFORMATION');
    console.log('='.repeat(60));
    console.log(`Name: ${student.name}`);
    console.log(`RegNo: ${student.regNo}`);
    console.log(`Email: ${student.email}`);
    console.log(`Role: ${student.role}`);
    console.log(`Status: ${student.studentStatus}`);
    console.log(`\nPassword Hash: ${student.password.substring(0, 20)}...`);

    // Test common passwords
    const testPasswords = [
      'Student033@2026',  // Current year - credentials resent today!
      'Student033@2025',  // Generated password format
      'Student033@2024',
      'Stud033@2024',
      'STUD033@2024',
      'stud033@2024',
      'Stud033',
      'STUD033',
      'password',
      'Password123',
      'Dhanushya@2024'
    ];

    console.log('\n' + '='.repeat(60));
    console.log('TESTING PASSWORDS');
    console.log('='.repeat(60));

    for (const testPassword of testPasswords) {
      const isMatch = await bcrypt.compare(testPassword, student.password);
      const icon = isMatch ? '✅' : '❌';
      console.log(`${icon} ${testPassword}: ${isMatch ? 'CORRECT' : 'incorrect'}`);
      
      if (isMatch) {
        console.log(`\n🎉 FOUND CORRECT PASSWORD: ${testPassword}`);
        break;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log(`\nTo login, use:`);
    console.log(`RegNo: ${student.regNo}`);
    console.log(`Password: (check above for correct password)`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

testLogin();
