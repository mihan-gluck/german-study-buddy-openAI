// scripts/analyze-password-pattern.js
// This script tries to identify the password pattern used for existing students

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function analyzePasswordPattern() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all students
    const students = await User.find({ role: 'STUDENT' })
      .select('name email regNo password')
      .lean();

    console.log('🔍 ANALYZING PASSWORD PATTERNS');
    console.log('='.repeat(80));
    console.log(`Total Students: ${students.length}\n`);

    // Common password patterns to test
    const patterns = [
      // Pattern 1: RegNo only (e.g., "STUD024")
      (student) => student.regNo,
      
      // Pattern 2: RegNo lowercase (e.g., "stud024")
      (student) => student.regNo.toLowerCase(),
      
      // Pattern 3: RegNo + @Gluck (e.g., "STUD024@Gluck")
      (student) => `${student.regNo}@Gluck`,
      
      // Pattern 4: RegNo + @gluck (e.g., "STUD024@gluck")
      (student) => `${student.regNo}@gluck`,
      
      // Pattern 5: First name + RegNo (e.g., "Silmy024")
      (student) => {
        const firstName = student.name.split(' ')[0];
        const regNumber = student.regNo.replace(/[^0-9]/g, '');
        return `${firstName}${regNumber}`;
      },
      
      // Pattern 6: Email prefix (e.g., "silmymohamed444")
      (student) => student.email.split('@')[0],
      
      // Pattern 7: Welcome2024!
      () => 'Welcome2024!',
      
      // Pattern 8: Gluck2024
      () => 'Gluck2024',
      
      // Pattern 9: Student@123
      () => 'Student@123',
      
      // Pattern 10: RegNo number only (e.g., "024")
      (student) => student.regNo.replace(/[^0-9]/g, ''),
    ];

    const patternNames = [
      'RegNo (e.g., STUD024)',
      'RegNo lowercase (e.g., stud024)',
      'RegNo@Gluck (e.g., STUD024@Gluck)',
      'RegNo@gluck (e.g., STUD024@gluck)',
      'FirstName + Number (e.g., Silmy024)',
      'Email prefix (e.g., silmymohamed444)',
      'Welcome2024!',
      'Gluck2024',
      'Student@123',
      'Number only (e.g., 024)',
    ];

    console.log('🧪 Testing Common Password Patterns...\n');

    // Test each pattern
    for (let i = 0; i < patterns.length; i++) {
      const patternFunc = patterns[i];
      const patternName = patternNames[i];
      
      console.log(`Testing Pattern ${i + 1}: ${patternName}`);
      
      let matches = 0;
      const sampleMatches = [];
      
      for (const student of students) {
        try {
          const testPassword = patternFunc(student);
          const isMatch = await bcrypt.compare(testPassword, student.password);
          
          if (isMatch) {
            matches++;
            if (sampleMatches.length < 3) {
              sampleMatches.push({
                name: student.name,
                regNo: student.regNo,
                password: testPassword
              });
            }
          }
        } catch (error) {
          // Skip if pattern generation fails
        }
      }
      
      if (matches > 0) {
        console.log(`   ✅ FOUND ${matches} MATCHES!`);
        console.log(`   📊 Match Rate: ${((matches / students.length) * 100).toFixed(1)}%`);
        console.log(`   📋 Sample Matches:`);
        sampleMatches.forEach(match => {
          console.log(`      - ${match.name} (${match.regNo}) → Password: "${match.password}"`);
        });
        console.log('');
      } else {
        console.log(`   ❌ No matches`);
        console.log('');
      }
    }

    console.log('='.repeat(80));
    console.log('\n💡 RECOMMENDATIONS:\n');
    console.log('If no pattern was found above, it means:');
    console.log('1. Passwords were randomly generated');
    console.log('2. Passwords were manually set by students');
    console.log('3. Pattern is more complex than tested\n');
    console.log('For Monday.com sync, you have 3 options:\n');
    console.log('Option 1: Use a standard pattern (e.g., RegNo@Gluck)');
    console.log('   - Easy to remember');
    console.log('   - Consistent format');
    console.log('   - Example: STUD050@Gluck\n');
    console.log('Option 2: Use temporary password (e.g., Welcome2024!)');
    console.log('   - Same for all new students');
    console.log('   - Force password change on first login');
    console.log('   - Example: Welcome2024!\n');
    console.log('Option 3: Generate random passwords');
    console.log('   - Most secure');
    console.log('   - Send via email');
    console.log('   - Example: aB3$xY9#mK2@\n');
    console.log('='.repeat(80));

    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

analyzePasswordPattern();
