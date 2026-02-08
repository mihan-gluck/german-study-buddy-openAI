// scripts/create-test-users.js for local development

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust path if needed

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/Updated-Gluck-Portal", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const plainPassword = 'Test@123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 1) Create Admin + Teacher first
    const baseUsers = [
      {
        name: 'Local Admin',
        regNo: 'AD001',
        email: 'local.admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        medium: [], // ok for admin
      },
      {
        name: 'Local Teacher',
        regNo: 'T001',
        email: 'local.teacher@test.com',
        password: hashedPassword,
        role: 'TEACHER',
        medium: ['EN'],       // required for TEACHER
        assignedCourses: [],  // can fill later
        assignedBatches: [],
        isActive: true,
      },
    ];

    // Clean existing
    await User.deleteMany({
      email: { $in: baseUsers.map(u => u.email) },
    });

    const [admin, teacher] = await User.insertMany(baseUsers);

    // 2) Now create Student, with all required fields
    await User.deleteOne({ email: 'local.student@test.com' });

    const student = new User({
      name: 'Local Student',
      regNo: 'STU001',
      email: 'local.student@test.com',
      password: hashedPassword,
      role: 'STUDENT',
      subscription: 'SILVER',    // required
      level: 'A1',               // required (must match your allowed enum)
      batch: 'BATCH1',           // required
      medium: ['EN'],            // required
      studentStatus: 'UNCERTAIN',// required
      assignedTeacher: teacher._id, // required for STUDENT
      isActive: true,
    });

    await student.save();

    console.log('✅ Test users created successfully.');
    console.log('Use this password in UI:', plainPassword);
    console.log('Admin:', admin.email);
    console.log('Teacher:', teacher.email);
    console.log('Student:', student.email);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating test users:', err);
    process.exit(1);
  }
}

run();
