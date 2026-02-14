// scripts/debug-dhanushya-access.js
// Debug script to check what modules Dhanushya can see

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const LearningModule = require('../models/LearningModule');
const StudentProgress = require('../models/StudentProgress');
const { getAccessibleLevels, canAccessModule } = require('../utils/levelAccessControl');

async function debugDhanushyaAccess() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Dhanushya
    const student = await User.findOne({ name: /Dhanushya/i }).lean();
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log('='.repeat(60));
    console.log('STUDENT INFORMATION');
    console.log('='.repeat(60));
    console.log(`Name: ${student.name}`);
    console.log(`RegNo: ${student.regNo}`);
    console.log(`Email: ${student.email}`);
    console.log(`Level: ${student.level}`);
    console.log(`Medium: ${student.medium?.join(', ')}`);
    console.log(`Status: ${student.studentStatus}`);

    // Check accessible levels
    const accessibleLevels = getAccessibleLevels(student.level);
    console.log(`\n✅ Can access levels: ${accessibleLevels.join(', ')}`);

    // Get all published modules
    console.log('\n' + '='.repeat(60));
    console.log('ALL PUBLISHED MODULES');
    console.log('='.repeat(60));

    const allModules = await LearningModule.find({
      isActive: true,
      isDeleted: { $ne: true },
      visibleToStudents: true
    }).select('title level nativeLanguage category').lean();

    console.log(`\nTotal published modules: ${allModules.length}\n`);

    // Check each module
    allModules.forEach(module => {
      const canAccess = canAccessModule(student.level, module.level);
      const matchesMedium = student.medium?.includes(module.nativeLanguage);
      const icon = canAccess && matchesMedium ? '✅' : '❌';
      
      console.log(`${icon} ${module.title}`);
      console.log(`   Level: ${module.level} | Medium: ${module.nativeLanguage} | Category: ${module.category}`);
      console.log(`   Can Access: ${canAccess} | Matches Medium: ${matchesMedium}`);
      console.log('');
    });

    // Get modules that should be accessible
    console.log('='.repeat(60));
    console.log('MODULES DHANUSHYA SHOULD SEE');
    console.log('='.repeat(60));

    const accessibleModules = await LearningModule.find({
      isActive: true,
      isDeleted: { $ne: true },
      visibleToStudents: true,
      level: { $in: accessibleLevels },
      nativeLanguage: { $in: student.medium }
    }).select('title level category').lean();

    console.log(`\n✅ ${accessibleModules.length} modules should be accessible:\n`);
    
    accessibleModules.forEach(module => {
      console.log(`📚 ${module.title}`);
      console.log(`   Level: ${module.level} | Category: ${module.category}`);
    });

    // Check student progress
    console.log('\n' + '='.repeat(60));
    console.log('STUDENT PROGRESS');
    console.log('='.repeat(60));

    const progress = await StudentProgress.find({
      studentId: student._id
    }).populate('moduleId', 'title level').lean();

    if (progress.length === 0) {
      console.log('\n⚠️ No progress records found - Student has not enrolled in any modules');
    } else {
      console.log(`\n📊 Progress in ${progress.length} modules:\n`);
      progress.forEach(p => {
        console.log(`📚 ${p.moduleId?.title || 'Unknown'}`);
        console.log(`   Status: ${p.status}`);
        console.log(`   Progress: ${p.progressPercentage}%`);
        console.log('');
      });
    }

    // Simulate API call
    console.log('='.repeat(60));
    console.log('SIMULATING API CALL');
    console.log('='.repeat(60));

    const apiFilter = {
      isActive: true,
      isDeleted: { $ne: true },
      visibleToStudents: true,
      level: { $in: accessibleLevels },
      nativeLanguage: { $in: student.medium }
    };

    console.log('\nAPI Filter:', JSON.stringify(apiFilter, null, 2));

    const apiModules = await LearningModule.find(apiFilter)
      .select('title level category nativeLanguage visibleToStudents')
      .lean();

    console.log(`\n✅ API would return ${apiModules.length} modules\n`);

    // Check specific module (Lektion 1)
    console.log('='.repeat(60));
    console.log('CHECKING SPECIFIC MODULE: Lektion 1');
    console.log('='.repeat(60));

    const lektion1 = await LearningModule.findOne({
      title: /Lektion 1.*Begrüßungen/i
    }).lean();

    if (lektion1) {
      console.log(`\n📚 Module: ${lektion1.title}`);
      console.log(`   Level: ${lektion1.level}`);
      console.log(`   Native Language: ${lektion1.nativeLanguage}`);
      console.log(`   Visible to Students: ${lektion1.visibleToStudents}`);
      console.log(`   Is Active: ${lektion1.isActive}`);
      console.log(`   Is Deleted: ${lektion1.isDeleted || false}`);
      
      const canAccessLektion1 = canAccessModule(student.level, lektion1.level);
      const matchesMedium = student.medium?.includes(lektion1.nativeLanguage);
      
      console.log(`\n   ✅ Student Level (${student.level}) can access Module Level (${lektion1.level}): ${canAccessLektion1}`);
      console.log(`   ✅ Student Medium (${student.medium?.join(', ')}) matches Module Medium (${lektion1.nativeLanguage}): ${matchesMedium}`);
      
      if (canAccessLektion1 && matchesMedium && lektion1.visibleToStudents) {
        console.log(`\n   ✅ SHOULD BE ACCESSIBLE`);
      } else {
        console.log(`\n   ❌ SHOULD NOT BE ACCESSIBLE`);
        if (!canAccessLektion1) console.log(`      Reason: Level mismatch`);
        if (!matchesMedium) console.log(`      Reason: Medium mismatch`);
        if (!lektion1.visibleToStudents) console.log(`      Reason: Not visible to students`);
      }

      // Check if student has progress for this module
      const moduleProgress = await StudentProgress.findOne({
        studentId: student._id,
        moduleId: lektion1._id
      }).lean();

      console.log(`\n   📊 Student Progress: ${moduleProgress ? moduleProgress.status : 'Not Enrolled'}`);
    } else {
      console.log('\n❌ Lektion 1 module not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

debugDhanushyaAccess();
