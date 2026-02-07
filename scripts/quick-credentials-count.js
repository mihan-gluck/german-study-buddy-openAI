// Quick script to show credentials count - Fast and simple
// Usage: node scripts/quick-credentials-count.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function quickCount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Get counts
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const credentialsSent = await User.countDocuments({ 
      role: 'STUDENT', 
      lastCredentialsEmailSent: { $exists: true, $ne: null } 
    });
    const credentialsNotSent = totalStudents - credentialsSent;
    const percentage = ((credentialsSent / totalStudents) * 100).toFixed(1);

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sentToday = await User.countDocuments({
      role: 'STUDENT',
      lastCredentialsEmailSent: { $gte: today }
    });

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('📊 STUDENT PORTAL CREDENTIALS - QUICK COUNT');
    console.log('='.repeat(60));
    console.log(`\n📋 Total Students:        ${totalStudents}`);
    console.log(`✅ Credentials Sent:      ${credentialsSent} (${percentage}%)`);
    console.log(`❌ Credentials Not Sent:  ${credentialsNotSent} (${(100 - percentage).toFixed(1)}%)`);
    console.log(`📆 Sent Today:            ${sentToday}`);
    console.log('\n' + '='.repeat(60) + '\n');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

quickCount();
