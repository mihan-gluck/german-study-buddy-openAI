// scripts/create-sample-users.js
// Script to create sample users for testing the AI tutoring system

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createSampleUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Hash password for sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // First, create teacher and admin users
    const teacherData = {
      name: 'Dr. Hans Teacher',
      regNo: 'TEA001',
      email: 'teacher@germanbuddy.com',
      password: hashedPassword,
      role: 'TEACHER',
      medium: ['Online', 'Interactive', 'Classroom'],
      assignedBatches: ['Batch-2024-A', 'Batch-2024-B'],
      isActive: true,
      registeredAt: new Date()
    };

    const adminData = {
      name: 'Admin User',
      regNo: 'ADM001',
      email: 'admin@germanbuddy.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      registeredAt: new Date()
    };

    // Create teacher first
    let teacher = await User.findOne({ email: teacherData.email });
    if (!teacher) {
      teacher = new User(teacherData);
      await teacher.save();
      console.log(`✅ Created TEACHER: ${teacherData.name} (${teacherData.email})`);
    } else {
      console.log(`⚠️ Teacher already exists: ${teacherData.email}`);
    }

    // Create admin
    let admin = await User.findOne({ email: adminData.email });
    if (!admin) {
      admin = new User(adminData);
      await admin.save();
      console.log(`✅ Created ADMIN: ${adminData.name} (${adminData.email})`);
    } else {
      console.log(`⚠️ Admin already exists: ${adminData.email}`);
    }

    // Now create students with assigned teacher
    const studentUsers = [
      {
        name: 'Max Platinum Student',
        regNo: 'STU001',
        email: 'student.platinum@germanbuddy.com',
        password: hashedPassword,
        role: 'STUDENT',
        subscription: 'PLATINUM',
        level: 'B1',
        batch: 'Batch-2024-A',
        medium: ['Online', 'Interactive'],
        studentStatus: 'ONGOING',
        assignedTeacher: teacher._id,
        isActive: true,
        registeredAt: new Date(),
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: 'Anna Silver Student',
        regNo: 'STU002',
        email: 'student.silver@germanbuddy.com',
        password: hashedPassword,
        role: 'STUDENT',
        subscription: 'SILVER',
        level: 'A2',
        batch: 'Batch-2024-B',
        medium: ['Online'],
        studentStatus: 'ONGOING',
        assignedTeacher: teacher._id,
        isActive: true,
        registeredAt: new Date(),
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    ];

    // Create student users
    for (const userData of studentUsers) {
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { regNo: userData.regNo }
        ]
      });

      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created ${userData.role}: ${userData.name} (${userData.email})`);
        console.log(`   📋 Subscription: ${userData.subscription}`);
        console.log(`   📚 Level: ${userData.level}`);
        console.log(`   🎓 Batch: ${userData.batch}`);
        console.log(`   👨‍🏫 Teacher: ${teacher.name}`);
      } else {
        console.log(`⚠️ User already exists: ${userData.email}`);
      }
    }

    console.log('\n🎉 Sample users created successfully!');
    console.log('\n👥 Test Accounts Created:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                     LOGIN CREDENTIALS                       │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 🥇 PLATINUM STUDENT                                        │');
    console.log('│    Email: student.platinum@germanbuddy.com                 │');
    console.log('│    Password: password123                                    │');
    console.log('│    Level: B1 | Subscription: PLATINUM                      │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 🥈 SILVER STUDENT                                          │');
    console.log('│    Email: student.silver@germanbuddy.com                   │');
    console.log('│    Password: password123                                    │');
    console.log('│    Level: A2 | Subscription: SILVER                        │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 👨‍🏫 TEACHER                                                │');
    console.log('│    Email: teacher@germanbuddy.com                          │');
    console.log('│    Password: password123                                    │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 👑 ADMIN                                                   │');
    console.log('│    Email: admin@germanbuddy.com                            │');
    console.log('│    Password: password123                                    │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    
    console.log('\n🚀 Quick Start Guide:');
    console.log('1. Go to: http://localhost:4200/login');
    console.log('2. Login with any of the accounts above');
    console.log('3. PLATINUM STUDENT gets full access to AI tutoring');
    console.log('4. Go to /learning-modules and start chatting with the AI bot!');
    console.log('\n💡 The Platinum student has B1 level access and premium features!');

  } catch (error) {
    console.error('❌ Error creating sample users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

createSampleUsers();