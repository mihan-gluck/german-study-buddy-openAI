// scripts/test-student-module-access.js
// Test script to verify students can access modules based on their language level

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const LearningModule = require('../models/LearningModule');
const { getAccessibleLevels, canAccessModule, getModuleAccessStatus } = require('../utils/levelAccessControl');

async function testStudentModuleAccess() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check level access control logic
    console.log('='.repeat(60));
    console.log('TEST 1: Level Access Control Logic');
    console.log('='.repeat(60));
    
    const testLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    
    testLevels.forEach(level => {
      const accessible = getAccessibleLevels(level);
      console.log(`\n📚 Student Level: ${level}`);
      console.log(`   ✅ Can access: ${accessible.join(', ')}`);
      console.log(`   ❌ Cannot access: ${testLevels.filter(l => !accessible.includes(l)).join(', ') || 'None'}`);
    });

    // Test 2: Check actual students and their module access
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Actual Students Module Access');
    console.log('='.repeat(60));

    const students = await User.find({ role: 'STUDENT' })
      .select('name email regNo level medium')
      .limit(10)
      .lean();

    if (students.length === 0) {
      console.log('\n⚠️ No students found in database');
    } else {
      console.log(`\n📊 Testing ${students.length} students:\n`);

      for (const student of students) {
        console.log(`\n👤 Student: ${student.name} (${student.regNo})`);
        console.log(`   📧 Email: ${student.email}`);
        console.log(`   📖 Level: ${student.level}`);
        console.log(`   🌍 Medium: ${student.medium?.join(', ') || 'Not set'}`);

        // Get accessible levels for this student
        const accessibleLevels = getAccessibleLevels(student.level);
        console.log(`   ✅ Can access levels: ${accessibleLevels.join(', ')}`);

        // Count modules available for this student
        const availableModules = await LearningModule.countDocuments({
          isActive: true,
          isDeleted: { $ne: true },
          visibleToStudents: true,
          level: { $in: accessibleLevels },
          nativeLanguage: { $in: student.medium || [] }
        });

        const totalModules = await LearningModule.countDocuments({
          isActive: true,
          isDeleted: { $ne: true },
          visibleToStudents: true
        });

        console.log(`   📚 Available modules: ${availableModules} out of ${totalModules} total`);

        // Show breakdown by level
        const modulesByLevel = {};
        for (const level of accessibleLevels) {
          const count = await LearningModule.countDocuments({
            isActive: true,
            isDeleted: { $ne: true },
            visibleToStudents: true,
            level: level,
            nativeLanguage: { $in: student.medium || [] }
          });
          modulesByLevel[level] = count;
        }

        console.log(`   📊 Breakdown by level:`);
        Object.entries(modulesByLevel).forEach(([level, count]) => {
          console.log(`      ${level}: ${count} modules`);
        });
      }
    }

    // Test 3: Check module visibility settings
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: Module Visibility Analysis');
    console.log('='.repeat(60));

    const totalModules = await LearningModule.countDocuments({
      isActive: true,
      isDeleted: { $ne: true }
    });

    const visibleModules = await LearningModule.countDocuments({
      isActive: true,
      isDeleted: { $ne: true },
      visibleToStudents: true
    });

    const hiddenModules = totalModules - visibleModules;

    console.log(`\n📊 Module Visibility Status:`);
    console.log(`   Total active modules: ${totalModules}`);
    console.log(`   ✅ Visible to students: ${visibleModules}`);
    console.log(`   🔒 Hidden (draft): ${hiddenModules}`);

    // Breakdown by level
    console.log(`\n📊 Visible Modules by Level:`);
    for (const level of testLevels) {
      const count = await LearningModule.countDocuments({
        isActive: true,
        isDeleted: { $ne: true },
        visibleToStudents: true,
        level: level
      });
      console.log(`   ${level}: ${count} modules`);
    }

    // Test 4: Check for potential access issues
    console.log('\n' + '='.repeat(60));
    console.log('TEST 4: Potential Access Issues');
    console.log('='.repeat(60));

    const studentsWithoutLevel = await User.countDocuments({
      role: 'STUDENT',
      $or: [
        { level: { $exists: false } },
        { level: null },
        { level: '' }
      ]
    });

    const studentsWithoutMedium = await User.countDocuments({
      role: 'STUDENT',
      $or: [
        { medium: { $exists: false } },
        { medium: null },
        { medium: { $size: 0 } }
      ]
    });

    console.log(`\n⚠️ Students without level: ${studentsWithoutLevel}`);
    console.log(`⚠️ Students without medium: ${studentsWithoutMedium}`);

    if (studentsWithoutLevel > 0) {
      const problematicStudents = await User.find({
        role: 'STUDENT',
        $or: [
          { level: { $exists: false } },
          { level: null },
          { level: '' }
        ]
      }).select('name email regNo level').limit(5);

      console.log(`\n❌ Students without level (showing first 5):`);
      problematicStudents.forEach(s => {
        console.log(`   - ${s.name} (${s.regNo}) - Level: ${s.level || 'NOT SET'}`);
      });
    }

    if (studentsWithoutMedium > 0) {
      const problematicStudents = await User.find({
        role: 'STUDENT',
        $or: [
          { medium: { $exists: false } },
          { medium: null },
          { medium: { $size: 0 } }
        ]
      }).select('name email regNo medium').limit(5);

      console.log(`\n❌ Students without medium (showing first 5):`);
      problematicStudents.forEach(s => {
        console.log(`   - ${s.name} (${s.regNo}) - Medium: ${s.medium || 'NOT SET'}`);
      });
    }

    // Test 5: Sample access checks
    console.log('\n' + '='.repeat(60));
    console.log('TEST 5: Sample Module Access Checks');
    console.log('='.repeat(60));

    const sampleModules = await LearningModule.find({
      isActive: true,
      isDeleted: { $ne: true },
      visibleToStudents: true
    }).select('title level category').limit(5).lean();

    if (sampleModules.length > 0 && students.length > 0) {
      const sampleStudent = students[0];
      console.log(`\n👤 Testing access for: ${sampleStudent.name} (Level: ${sampleStudent.level})\n`);

      sampleModules.forEach(module => {
        const accessStatus = getModuleAccessStatus(sampleStudent.level, module.level);
        const icon = accessStatus.canAccess ? '✅' : '❌';
        console.log(`${icon} ${module.title}`);
        console.log(`   Level: ${module.level} | Category: ${module.category}`);
        console.log(`   ${accessStatus.reason}`);
        console.log('');
      });
    }

    // Summary and Recommendations
    console.log('='.repeat(60));
    console.log('SUMMARY & RECOMMENDATIONS');
    console.log('='.repeat(60));

    console.log('\n✅ Access Control System Status:');
    console.log(`   - Level-based access control: IMPLEMENTED`);
    console.log(`   - Visibility control: IMPLEMENTED`);
    console.log(`   - Medium/Language filtering: IMPLEMENTED`);

    if (studentsWithoutLevel > 0 || studentsWithoutMedium > 0) {
      console.log('\n⚠️ Issues Found:');
      if (studentsWithoutLevel > 0) {
        console.log(`   - ${studentsWithoutLevel} students missing level assignment`);
        console.log(`     → These students cannot access any modules`);
      }
      if (studentsWithoutMedium > 0) {
        console.log(`   - ${studentsWithoutMedium} students missing medium assignment`);
        console.log(`     → These students may not see modules in their language`);
      }
      console.log('\n💡 Recommendation: Update student profiles to include level and medium');
    } else {
      console.log('\n✅ No issues found - all students have proper level and medium assignments');
    }

    if (hiddenModules > 0) {
      console.log(`\n📝 Note: ${hiddenModules} modules are in draft mode (not visible to students)`);
      console.log(`   → Teachers/Admins can publish them when ready`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETED');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the test
testStudentModuleAccess();
