// Script to check how many students have received their portal credentials
// Shows detailed statistics about credential emails sent

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkCredentialsSent() {
  try {
    console.log('📊 Checking Student Portal Credentials Status\n');
    console.log('='.repeat(80));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get all students
    const allStudents = await User.find({ role: 'STUDENT' }).sort({ createdAt: -1 });
    
    console.log(`📋 Total Students in System: ${allStudents.length}\n`);
    console.log('='.repeat(80));
    console.log('\n');

    // Categorize students
    const credentialsSent = allStudents.filter(s => s.lastCredentialsEmailSent);
    const credentialsNotSent = allStudents.filter(s => !s.lastCredentialsEmailSent);
    
    // Statistics
    console.log('📊 CREDENTIALS STATISTICS');
    console.log('='.repeat(80));
    console.log(`✅ Credentials Sent:     ${credentialsSent.length} students (${((credentialsSent.length / allStudents.length) * 100).toFixed(1)}%)`);
    console.log(`❌ Credentials Not Sent: ${credentialsNotSent.length} students (${((credentialsNotSent.length / allStudents.length) * 100).toFixed(1)}%)`);
    console.log('='.repeat(80));
    console.log('\n');

    // Breakdown by time period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const sentToday = credentialsSent.filter(s => new Date(s.lastCredentialsEmailSent) >= today);
    const sentThisWeek = credentialsSent.filter(s => new Date(s.lastCredentialsEmailSent) >= thisWeek);
    const sentThisMonth = credentialsSent.filter(s => new Date(s.lastCredentialsEmailSent) >= thisMonth);
    const sentThisYear = credentialsSent.filter(s => new Date(s.lastCredentialsEmailSent) >= thisYear);

    console.log('📅 CREDENTIALS SENT BY TIME PERIOD');
    console.log('='.repeat(80));
    console.log(`📆 Today:      ${sentToday.length} students`);
    console.log(`📆 This Week:  ${sentThisWeek.length} students`);
    console.log(`📆 This Month: ${sentThisMonth.length} students`);
    console.log(`📆 This Year:  ${sentThisYear.length} students`);
    console.log('='.repeat(80));
    console.log('\n');

    // Breakdown by subscription
    const silverSent = credentialsSent.filter(s => s.subscription === 'SILVER');
    const platinumSent = credentialsSent.filter(s => s.subscription === 'PLATINUM');
    const noSubSent = credentialsSent.filter(s => !s.subscription);

    console.log('💎 CREDENTIALS SENT BY SUBSCRIPTION');
    console.log('='.repeat(80));
    console.log(`🥈 SILVER:   ${silverSent.length} students`);
    console.log(`👑 PLATINUM: ${platinumSent.length} students`);
    console.log(`❓ No Sub:   ${noSubSent.length} students`);
    console.log('='.repeat(80));
    console.log('\n');

    // Breakdown by level
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    console.log('📚 CREDENTIALS SENT BY LEVEL');
    console.log('='.repeat(80));
    levels.forEach(level => {
      const count = credentialsSent.filter(s => s.level === level).length;
      console.log(`${level}: ${count} students`);
    });
    console.log('='.repeat(80));
    console.log('\n');

    // Recent credentials sent (last 10)
    if (credentialsSent.length > 0) {
      console.log('🕐 RECENTLY SENT CREDENTIALS (Last 10)');
      console.log('='.repeat(80));
      
      const recentlySent = credentialsSent
        .sort((a, b) => new Date(b.lastCredentialsEmailSent) - new Date(a.lastCredentialsEmailSent))
        .slice(0, 10);
      
      recentlySent.forEach((student, index) => {
        const sentDate = new Date(student.lastCredentialsEmailSent);
        const formattedDate = sentDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        console.log(`${index + 1}. ${student.name} (${student.regNo})`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Level: ${student.level} | Subscription: ${student.subscription || 'None'}`);
        console.log(`   Sent: ${formattedDate}`);
        console.log('');
      });
      console.log('='.repeat(80));
      console.log('\n');
    }

    // Students who never received credentials
    if (credentialsNotSent.length > 0) {
      console.log('⚠️  STUDENTS WHO NEVER RECEIVED CREDENTIALS');
      console.log('='.repeat(80));
      console.log(`Total: ${credentialsNotSent.length} students\n`);
      
      if (credentialsNotSent.length <= 20) {
        // Show all if 20 or fewer
        credentialsNotSent.forEach((student, index) => {
          const createdDate = new Date(student.createdAt);
          const daysAgo = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
          
          console.log(`${index + 1}. ${student.name} (${student.regNo})`);
          console.log(`   Email: ${student.email}`);
          console.log(`   Level: ${student.level} | Subscription: ${student.subscription || 'None'}`);
          console.log(`   Created: ${createdDate.toLocaleDateString()} (${daysAgo} days ago)`);
          console.log('');
        });
      } else {
        // Show first 10 if more than 20
        console.log('Showing first 10 students:\n');
        credentialsNotSent.slice(0, 10).forEach((student, index) => {
          const createdDate = new Date(student.createdAt);
          const daysAgo = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
          
          console.log(`${index + 1}. ${student.name} (${student.regNo})`);
          console.log(`   Email: ${student.email}`);
          console.log(`   Level: ${student.level} | Subscription: ${student.subscription || 'None'}`);
          console.log(`   Created: ${createdDate.toLocaleDateString()} (${daysAgo} days ago)`);
          console.log('');
        });
        console.log(`... and ${credentialsNotSent.length - 10} more students`);
      }
      console.log('='.repeat(80));
      console.log('\n');
    }

    // Export options
    console.log('💾 EXPORT OPTIONS');
    console.log('='.repeat(80));
    console.log('To export detailed data, you can:');
    console.log('1. Export students with credentials sent:');
    console.log('   node scripts/export-credentials-sent.js --sent');
    console.log('');
    console.log('2. Export students without credentials:');
    console.log('   node scripts/export-credentials-sent.js --not-sent');
    console.log('');
    console.log('3. Export all students with status:');
    console.log('   node scripts/export-credentials-sent.js --all');
    console.log('='.repeat(80));
    console.log('\n');

    // Summary
    console.log('📋 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Students:           ${allStudents.length}`);
    console.log(`Credentials Sent:         ${credentialsSent.length} (${((credentialsSent.length / allStudents.length) * 100).toFixed(1)}%)`);
    console.log(`Credentials Not Sent:     ${credentialsNotSent.length} (${((credentialsNotSent.length / allStudents.length) * 100).toFixed(1)}%)`);
    console.log(`Sent Today:               ${sentToday.length}`);
    console.log(`Sent This Week:           ${sentThisWeek.length}`);
    console.log(`Sent This Month:          ${sentThisMonth.length}`);
    console.log('='.repeat(80));

    console.log('\n✅ Analysis complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
checkCredentialsSent();
