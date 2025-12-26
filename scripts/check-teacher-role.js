// Check teacher role and permissions
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkTeacherRole() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the teacher user
    const teacher = await User.findOne({ regNo: 'TEA001' });
    
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }
    
    console.log('👤 Teacher details:', {
      regNo: teacher.regNo,
      name: teacher.name,
      role: teacher.role,
      subscription: teacher.subscription,
      email: teacher.email,
      _id: teacher._id
    });
    
    // Check if role is exactly 'TEACHER'
    console.log('🔍 Role check:', {
      role: teacher.role,
      isTeacher: teacher.role === 'TEACHER',
      roleType: typeof teacher.role
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkTeacherRole();