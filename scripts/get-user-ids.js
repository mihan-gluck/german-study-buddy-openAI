#!/usr/bin/env node

/**
 * Get User IDs and Details
 * 
 * This script retrieves all user information including MongoDB ObjectIds
 * for web app access and testing purposes.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function getUserIds() {
  try {
    console.log('🔍 Retrieving User IDs and Details...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('_id name email regNo role subscription level batch isActive');

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👥 All Users with IDs:\n');
    console.log('┌─────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│                                USER DETAILS                                         │');
    console.log('├─────────────────────────────────────────────────────────────────────────────────────┤');

    // Group users by role
    const admins = users.filter(u => u.role === 'ADMIN');
    const teachers = users.filter(u => u.role === 'TEACHER');
    const students = users.filter(u => u.role === 'STUDENT');

    // Display Admins
    if (admins.length > 0) {
      console.log('│ 👑 ADMINS:                                                                          │');
      admins.forEach(user => {
        console.log(`│   ID: ${user._id}                                    │`);
        console.log(`│   Name: ${user.name?.padEnd(30) || 'N/A'.padEnd(30)}                                                │`);
        console.log(`│   Email: ${user.email?.padEnd(40) || 'N/A'.padEnd(40)}                                     │`);
        console.log(`│   RegNo: ${user.regNo || 'N/A'}                                                                │`);
        console.log('├─────────────────────────────────────────────────────────────────────────────────────┤');
      });
    }

    // Display Teachers
    if (teachers.length > 0) {
      console.log('│ 👨‍🏫 TEACHERS:                                                                        │');
      teachers.forEach(user => {
        console.log(`│   ID: ${user._id}                                    │`);
        console.log(`│   Name: ${user.name?.padEnd(30) || 'N/A'.padEnd(30)}                                                │`);
        console.log(`│   Email: ${user.email?.padEnd(40) || 'N/A'.padEnd(40)}                                     │`);
        console.log(`│   RegNo: ${user.regNo || 'N/A'}                                                                │`);
        console.log('├─────────────────────────────────────────────────────────────────────────────────────┤');
      });
    }

    // Display Students
    if (students.length > 0) {
      console.log('│ 🎓 STUDENTS:                                                                        │');
      students.forEach(user => {
        console.log(`│   ID: ${user._id}                                    │`);
        console.log(`│   Name: ${user.name?.padEnd(30) || 'N/A'.padEnd(30)}                                                │`);
        console.log(`│   Email: ${user.email?.padEnd(40) || 'N/A'.padEnd(40)}                                     │`);
        console.log(`│   RegNo: ${user.regNo || 'N/A'}                                                                │`);
        console.log(`│   Subscription: ${user.subscription || 'N/A'}   Level: ${user.level || 'N/A'}                                        │`);
        console.log('├─────────────────────────────────────────────────────────────────────────────────────┤');
      });
    }

    console.log('└─────────────────────────────────────────────────────────────────────────────────────┘');

    // Create a clean list for easy copying
    console.log('\n📋 CLEAN LIST FOR EASY COPYING:\n');
    
    console.log('🔑 LOGIN CREDENTIALS:');
    users.forEach(user => {
      console.log(`\n${user.role}: ${user.name || 'Unknown'}`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: password123`);
      if (user.regNo) console.log(`  RegNo: ${user.regNo}`);
      if (user.subscription) console.log(`  Subscription: ${user.subscription}`);
      if (user.level) console.log(`  Level: ${user.level}`);
    });

    // Check if the sample users exist
    console.log('\n🔍 CHECKING FOR SAMPLE USERS:');
    const sampleEmails = [
      'admin@germanbuddy.com',
      'teacher@germanbuddy.com', 
      'student.platinum@germanbuddy.com',
      'student.silver@germanbuddy.com'
    ];

    for (const email of sampleEmails) {
      const user = users.find(u => u.email === email);
      if (user) {
        console.log(`✅ ${email} - ID: ${user._id}`);
      } else {
        console.log(`❌ ${email} - NOT FOUND`);
      }
    }

    console.log('\n💡 If sample users are missing, run: node scripts/create-sample-users.js');

  } catch (error) {
    console.error('❌ Error retrieving user IDs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
getUserIds();