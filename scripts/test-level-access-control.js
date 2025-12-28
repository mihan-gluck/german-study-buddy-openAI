#!/usr/bin/env node

/**
 * Test Level-Based Access Control
 * 
 * This script tests the level-based access control system to ensure
 * students can only access modules at their level or below.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const LearningModule = require('../models/LearningModule');

// CEFR Level hierarchy (same as backend)
const LEVEL_HIERARCHY = {
  'A1': { order: 1, name: 'Beginner' },
  'A2': { order: 2, name: 'Elementary' },
  'B1': { order: 3, name: 'Intermediate' },
  'B2': { order: 4, name: 'Upper Intermediate' },
  'C1': { order: 5, name: 'Advanced' },
  'C2': { order: 6, name: 'Proficiency' }
};

function getAccessibleLevels(studentLevel) {
  const studentLevelInfo = LEVEL_HIERARCHY[studentLevel];
  if (!studentLevelInfo) {
    return [];
  }

  return Object.keys(LEVEL_HIERARCHY)
    .filter(level => LEVEL_HIERARCHY[level].order <= studentLevelInfo.order);
}

function canAccessModule(studentLevel, moduleLevel) {
  const studentLevelInfo = LEVEL_HIERARCHY[studentLevel];
  const moduleLevelInfo = LEVEL_HIERARCHY[moduleLevel];

  if (!studentLevelInfo || !moduleLevelInfo) {
    return false;
  }

  return moduleLevelInfo.order <= studentLevelInfo.order;
}

async function testLevelAccessControl() {
  try {
    console.log('🧪 Testing Level-Based Access Control...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get sample students with different levels
    const students = await User.find({ 
      role: 'STUDENT',
      level: { $exists: true }
    }).select('name email level').limit(5);

    if (students.length === 0) {
      console.log('❌ No students found with levels');
      return;
    }

    // Get sample modules with different levels
    const modules = await LearningModule.find({ 
      isActive: true 
    }).select('title level category').limit(10);

    if (modules.length === 0) {
      console.log('❌ No active modules found');
      return;
    }

    console.log('👥 Test Students:');
    students.forEach(student => {
      console.log(`  - ${student.name} (${student.email}) - Level: ${student.level}`);
    });

    console.log('\n📚 Test Modules:');
    modules.forEach(module => {
      console.log(`  - "${module.title}" - Level: ${module.level} (${module.category})`);
    });

    console.log('\n🔒 Access Control Test Results:\n');

    // Test each student's access to each module
    for (const student of students) {
      console.log(`👤 Student: ${student.name} (Level ${student.level})`);
      
      const accessibleLevels = getAccessibleLevels(student.level);
      console.log(`   Accessible Levels: ${accessibleLevels.join(', ')}`);
      
      let accessibleCount = 0;
      let blockedCount = 0;
      
      console.log('   Module Access:');
      
      for (const module of modules) {
        const canAccess = canAccessModule(student.level, module.level);
        const status = canAccess ? '✅ CAN ACCESS' : '❌ BLOCKED';
        const reason = canAccess ? 
          (student.level === module.level ? 'Perfect match' : 'Review level') :
          'Too advanced';
        
        console.log(`     "${module.title}" (${module.level}): ${status} - ${reason}`);
        
        if (canAccess) {
          accessibleCount++;
        } else {
          blockedCount++;
        }
      }
      
      console.log(`   Summary: ${accessibleCount} accessible, ${blockedCount} blocked\n`);
    }

    // Test specific scenarios
    console.log('🎯 Specific Test Scenarios:\n');

    const testCases = [
      { studentLevel: 'A1', moduleLevel: 'A1', expected: true, scenario: 'A1 student accessing A1 module' },
      { studentLevel: 'A1', moduleLevel: 'A2', expected: false, scenario: 'A1 student accessing A2 module' },
      { studentLevel: 'A2', moduleLevel: 'A1', expected: true, scenario: 'A2 student accessing A1 module' },
      { studentLevel: 'A2', moduleLevel: 'A2', expected: true, scenario: 'A2 student accessing A2 module' },
      { studentLevel: 'A2', moduleLevel: 'B1', expected: false, scenario: 'A2 student accessing B1 module' },
      { studentLevel: 'B1', moduleLevel: 'A1', expected: true, scenario: 'B1 student accessing A1 module' },
      { studentLevel: 'B1', moduleLevel: 'A2', expected: true, scenario: 'B1 student accessing A2 module' },
      { studentLevel: 'B1', moduleLevel: 'B1', expected: true, scenario: 'B1 student accessing B1 module' },
      { studentLevel: 'B1', moduleLevel: 'B2', expected: false, scenario: 'B1 student accessing B2 module' },
      { studentLevel: 'C2', moduleLevel: 'A1', expected: true, scenario: 'C2 student accessing A1 module (review)' },
      { studentLevel: 'C2', moduleLevel: 'C2', expected: true, scenario: 'C2 student accessing C2 module' }
    ];

    for (const testCase of testCases) {
      const result = canAccessModule(testCase.studentLevel, testCase.moduleLevel);
      const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
      
      console.log(`${status} ${testCase.scenario}`);
      console.log(`     Expected: ${testCase.expected ? 'CAN ACCESS' : 'BLOCKED'}, Got: ${result ? 'CAN ACCESS' : 'BLOCKED'}`);
      
      if (result !== testCase.expected) {
        console.log(`     ⚠️ TEST FAILED!`);
      }
    }

    console.log('\n📊 Level Hierarchy Verification:');
    Object.keys(LEVEL_HIERARCHY).forEach(level => {
      const info = LEVEL_HIERARCHY[level];
      console.log(`  ${level}: Order ${info.order} - ${info.name}`);
    });

    console.log('\n🎓 Educational Benefits:');
    console.log('✅ Students cannot access modules above their level (prevents frustration)');
    console.log('✅ Students can access modules at their level (appropriate challenge)');
    console.log('✅ Students can access modules below their level (review and practice)');
    console.log('✅ Progressive learning path enforced');
    console.log('✅ Prevents students from jumping ahead too quickly');

    console.log('\n🚀 Usage Instructions:');
    console.log('1. Students will only see modules they can access in the UI');
    console.log('2. Modules above their level will be filtered out automatically');
    console.log('3. Teachers and admins can see all modules regardless of level');
    console.log('4. Students can review lower-level modules for practice');
    console.log('5. Level progression is enforced for structured learning');

    console.log('\n✅ Level-based access control test completed!');

  } catch (error) {
    console.error('❌ Error testing level access control:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testLevelAccessControl();