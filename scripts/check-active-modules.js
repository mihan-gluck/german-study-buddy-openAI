// Check which modules are currently active vs inactive
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function checkActiveModules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all modules (active and inactive)
    const allModules = await LearningModule.find({}).populate('createdBy', 'name regNo');
    const activeModules = allModules.filter(m => m.isActive);
    const inactiveModules = allModules.filter(m => !m.isActive);
    
    console.log('📊 MODULE STATUS OVERVIEW:');
    console.log(`Total modules: ${allModules.length}`);
    console.log(`Active modules: ${activeModules.length}`);
    console.log(`Inactive modules: ${inactiveModules.length}`);
    
    console.log('\n✅ ACTIVE MODULES (Students can enroll):');
    if (activeModules.length === 0) {
      console.log('❌ NO ACTIVE MODULES FOUND! This is why enrollment fails.');
    } else {
      activeModules.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title}`);
        console.log(`   ID: ${module._id}`);
        console.log(`   Created by: ${module.createdBy?.name || 'Unknown'} (${module.createdBy?.regNo || 'Unknown'})`);
        console.log(`   Level: ${module.level} | Category: ${module.category}`);
        console.log(`   Target: ${module.targetLanguage} | Native: ${module.nativeLanguage}`);
        console.log('');
      });
    }
    
    if (inactiveModules.length > 0) {
      console.log('\n❌ INACTIVE MODULES (Students cannot enroll):');
      inactiveModules.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (DELETED)`);
        console.log(`   ID: ${module._id}`);
        console.log(`   Created by: ${module.createdBy?.name || 'Unknown'}`);
        console.log('');
      });
    }
    
    console.log('\n🔍 DIAGNOSIS:');
    if (activeModules.length === 0) {
      console.log('❌ PROBLEM: No active modules available for enrollment');
      console.log('💡 SOLUTION: Reactivate modules or create new ones');
    } else {
      console.log('✅ Active modules are available for enrollment');
      console.log('🔍 If enrollment still fails, check:');
      console.log('   - Student login credentials');
      console.log('   - Module ID being used');
      console.log('   - Backend server logs');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkActiveModules();