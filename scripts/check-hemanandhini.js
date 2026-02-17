// scripts/check-hemanandhini.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkHemanandhini() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by name
    const user = await User.findOne({ 
      name: { $regex: /hemanandhini/i } 
    }).select('name email regNo role medium assignedCourses assignedBatches');

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n👤 User Details:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Reg No:', user.regNo);
    console.log('Role:', user.role);
    console.log('Medium:', user.medium);
    console.log('Assigned Courses:', user.assignedCourses);
    console.log('Assigned Batches:', user.assignedBatches);

    // Check if she appears in teacher queries
    const teacherQuery = await User.find({
      role: { $in: ['TEACHER', 'TEACHER_ADMIN'] }
    }).select('name role');

    console.log('\n📋 All Teachers and Teacher Admins:');
    teacherQuery.forEach(t => {
      console.log(`- ${t.name} (${t.role})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkHemanandhini();
