// scripts/test-regno-year-pattern.js
// Test if existing students use RegNo@year pattern

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function testRegNoYearPattern() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const students = await User.find({ role: 'STUDENT' })
      .select('name email regNo password registeredAt')
      .lean();

    console.log('🔍 TESTING RegNo@year PATTERN');
    console.log('='.repeat(80));
    console.log(`Total Students: ${students.length}\n`);

    // Test different year formats
    const years = ['2024', '2025', '2026', '24', '25', '26'];
    
    for (const year of years) {
      console.log(`Testing Pattern: RegNo@${year}`);
      
      let matches = 0;
      const sampleMatches = [];
      
      for (const student of students) {
        const testPassword = `${student.regNo}@${year}`;
        const isMatch = await bcrypt.compare(testPassword, student.password);
        
        if (isMatch) {
          matches++;
          if (sampleMatches.length < 5) {
            sampleMatches.push({
              name: student.name,
              regNo: student.regNo,
              password: testPassword,
              registeredAt: student.registeredAt
            });
          }
        }
      }
      
      if (matches > 0) {
        console.log(`   ✅ FOUND ${matches} MATCHES!`);
        console.log(`   📊 Match Rate: ${((matches / students.length) * 100).toFixed(1)}%`);
        console.log(`   📋 Sample Matches:`);
        sampleMatches.forEach(match => {
          const regDate = new Date(match.registeredAt).toLocaleDateString();
          console.log(`      - ${match.name}`);
          console.log(`        RegNo: ${match.regNo}`);
          console.log(`        Password: ${match.password}`);
          console.log(`        Registered: ${regDate}`);
          console.log('');
        });
      } else {
        console.log(`   ❌ No matches\n`);
      }
    }

    console.log('='.repeat(80));
    console.log('\n📋 PASSWORD FORMAT EXAMPLES:\n');
    console.log('For new students from Monday.com, use this format:\n');
    console.log('Format: RegNo@year\n');
    console.log('Examples:');
    console.log('   Student RegNo: STUD050');
    console.log('   Registration Year: 2025');
    console.log('   Password: STUD050@2025\n');
    console.log('   Student RegNo: STUD051');
    console.log('   Registration Year: 2025');
    console.log('   Password: STUD051@2025\n');
    console.log('   Student RegNo: STUD052');
    console.log('   Registration Year: 2025');
    console.log('   Password: STUD052@2025\n');
    console.log('='.repeat(80));
    console.log('\n💡 IMPLEMENTATION:\n');
    console.log('In the Monday.com sync script, we will:');
    console.log('1. Get student RegNo from Monday.com');
    console.log('2. Get current year (2025)');
    console.log('3. Generate password: RegNo@year');
    console.log('4. Hash the password');
    console.log('5. Store in MongoDB');
    console.log('6. Send welcome email with password\n');
    console.log('Code example:');
    console.log('```javascript');
    console.log('const currentYear = new Date().getFullYear(); // 2025');
    console.log('const password = `${student.regNo}@${currentYear}`;');
    console.log('// Example: STUD050@2025');
    console.log('```\n');
    console.log('='.repeat(80));

    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testRegNoYearPattern();
