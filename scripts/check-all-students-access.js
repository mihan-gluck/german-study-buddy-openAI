// scripts/check-all-students-access.js
// Check module access for ALL students

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const LearningModule = require('../models/LearningModule');
const { getAccessibleLevels, canAccessModule } = require('../utils/levelAccessControl');

async function checkAllStudentsAccess() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all students
    const students = await User.find({ role: 'STUDENT' })
      .select('name email regNo level medium studentStatus')
      .lean();

    console.log('='.repeat(80));
    console.log(`CHECKING MODULE ACCESS FOR ${students.length} STUDENTS`);
    console.log('='.repeat(80));

    // Get all published modules
    const allModules = await LearningModule.find({
      isActive: true,
      isDeleted: { $ne: true },
      visibleToStudents: true
    }).select('title level nativeLanguage').lean();

    console.log(`\nTotal published modules: ${allModules.length}\n`);

    // Track issues
    const issues = [];
    const summary = {
      total: students.length,
      withLevel: 0,
      withoutLevel: 0,
      withMedium: 0,
      withoutMedium: 0,
      canAccessModules: 0,
      cannotAccessModules: 0,
      withdrew: 0
    };

    // Check each student
    for (const student of students) {
      console.log('\n' + '-'.repeat(80));
      console.log(`👤 ${student.name} (${student.regNo})`);
      console.log(`   📧 ${student.email}`);
      console.log(`   📖 Level: ${student.level || '❌ NOT SET'}`);
      console.log(`   🌍 Medium: ${student.medium?.join(', ') || '❌ NOT SET'}`);
      console.log(`   📊 Status: ${student.studentStatus || 'NOT SET'}`);

      // Check if withdrew
      if (student.studentStatus === 'WITHDREW') {
        console.log(`   ⚠️ WITHDREW - Account blocked from login`);
        summary.withdrew++;
        continue;
      }

      // Check level
      if (!student.level) {
        console.log(`   ❌ ISSUE: No level assigned - cannot access any modules`);
        issues.push({
          student: student.name,
          regNo: student.regNo,
          issue: 'No level assigned',
          severity: 'HIGH'
        });
        summary.withoutLevel++;
        continue;
      } else {
        summary.withLevel++;
      }

      // Check medium
      if (!student.medium || student.medium.length === 0) {
        console.log(`   ❌ ISSUE: No medium assigned - cannot see modules in their language`);
        issues.push({
          student: student.name,
          regNo: student.regNo,
          issue: 'No medium assigned',
          severity: 'HIGH'
        });
        summary.withoutMedium++;
        continue;
      } else {
        summary.withMedium++;
      }

      // Get accessible levels
      const accessibleLevels = getAccessibleLevels(student.level);
      console.log(`   ✅ Can access levels: ${accessibleLevels.join(', ')}`);

      // Count accessible modules
      const accessibleModules = allModules.filter(module => {
        const levelMatch = accessibleLevels.includes(module.level);
        const mediumMatch = student.medium.includes(module.nativeLanguage);
        return levelMatch && mediumMatch;
      });

      console.log(`   📚 Accessible modules: ${accessibleModules.length}`);

      if (accessibleModules.length === 0) {
        console.log(`   ⚠️ WARNING: No modules available for this student`);
        issues.push({
          student: student.name,
          regNo: student.regNo,
          issue: `No modules available for ${student.level} level in ${student.medium.join('/')} medium`,
          severity: 'MEDIUM'
        });
        summary.cannotAccessModules++;
      } else {
        summary.canAccessModules++;
        
        // Show breakdown by level
        const breakdown = {};
        accessibleLevels.forEach(level => {
          const count = accessibleModules.filter(m => m.level === level).length;
          if (count > 0) {
            breakdown[level] = count;
          }
        });
        console.log(`   📊 Breakdown: ${Object.entries(breakdown).map(([l, c]) => `${l}:${c}`).join(', ')}`);
      }
    }

    // Print Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nTotal Students: ${summary.total}`);
    console.log(`Withdrew Students: ${summary.withdrew} (blocked from login)`);
    console.log(`\nActive Students: ${summary.total - summary.withdrew}`);
    console.log(`  ✅ With Level: ${summary.withLevel}`);
    console.log(`  ❌ Without Level: ${summary.withoutLevel}`);
    console.log(`  ✅ With Medium: ${summary.withMedium}`);
    console.log(`  ❌ Without Medium: ${summary.withoutMedium}`);
    console.log(`\nModule Access:`);
    console.log(`  ✅ Can access modules: ${summary.canAccessModules}`);
    console.log(`  ⚠️ Cannot access modules: ${summary.cannotAccessModules}`);

    // Print Issues
    if (issues.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log(`ISSUES FOUND: ${issues.length}`);
      console.log('='.repeat(80));

      // Group by severity
      const highSeverity = issues.filter(i => i.severity === 'HIGH');
      const mediumSeverity = issues.filter(i => i.severity === 'MEDIUM');

      if (highSeverity.length > 0) {
        console.log(`\n🔴 HIGH SEVERITY (${highSeverity.length}):`);
        highSeverity.forEach(issue => {
          console.log(`   ❌ ${issue.student} (${issue.regNo}): ${issue.issue}`);
        });
      }

      if (mediumSeverity.length > 0) {
        console.log(`\n🟡 MEDIUM SEVERITY (${mediumSeverity.length}):`);
        mediumSeverity.forEach(issue => {
          console.log(`   ⚠️ ${issue.student} (${issue.regNo}): ${issue.issue}`);
        });
      }

      // Recommendations
      console.log('\n' + '='.repeat(80));
      console.log('RECOMMENDATIONS');
      console.log('='.repeat(80));

      if (summary.withoutLevel > 0) {
        console.log(`\n1. Fix ${summary.withoutLevel} students without level:`);
        console.log(`   - Go to Admin Dashboard`);
        console.log(`   - Find students without level`);
        console.log(`   - Assign appropriate level (A1, A2, B1, B2, C1, C2)`);
      }

      if (summary.withoutMedium > 0) {
        console.log(`\n2. Fix ${summary.withoutMedium} students without medium:`);
        console.log(`   - Go to Admin Dashboard`);
        console.log(`   - Find students without medium`);
        console.log(`   - Assign appropriate medium (English, Tamil, Sinhala, German)`);
      }

      if (summary.cannotAccessModules > 0) {
        console.log(`\n3. Create modules for ${summary.cannotAccessModules} students:`);
        console.log(`   - Check which level/medium combinations need modules`);
        console.log(`   - Create or publish modules for those combinations`);
      }
    } else {
      console.log('\n' + '='.repeat(80));
      console.log('✅ NO ISSUES FOUND - ALL STUDENTS CAN ACCESS MODULES!');
      console.log('='.repeat(80));
    }

    // Module distribution analysis
    console.log('\n' + '='.repeat(80));
    console.log('MODULE DISTRIBUTION ANALYSIS');
    console.log('='.repeat(80));

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const mediums = ['English', 'Tamil', 'Sinhala', 'German'];

    console.log('\nModules by Level and Medium:');
    console.log('Level | English | Tamil | Sinhala | German | Total');
    console.log('-'.repeat(60));

    levels.forEach(level => {
      const counts = mediums.map(medium => {
        return allModules.filter(m => m.level === level && m.nativeLanguage === medium).length;
      });
      const total = counts.reduce((a, b) => a + b, 0);
      console.log(`${level.padEnd(5)} | ${counts.map(c => String(c).padStart(7)).join(' | ')} | ${String(total).padStart(5)}`);
    });

    // Student distribution
    console.log('\n' + '='.repeat(80));
    console.log('STUDENT DISTRIBUTION');
    console.log('='.repeat(80));

    console.log('\nStudents by Level:');
    levels.forEach(level => {
      const count = students.filter(s => s.level === level && s.studentStatus !== 'WITHDREW').length;
      if (count > 0) {
        console.log(`  ${level}: ${count} students`);
      }
    });

    console.log('\nStudents by Medium:');
    mediums.forEach(medium => {
      const count = students.filter(s => s.medium?.includes(medium) && s.studentStatus !== 'WITHDREW').length;
      if (count > 0) {
        console.log(`  ${medium}: ${count} students`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('CHECK COMPLETED');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkAllStudentsAccess();
