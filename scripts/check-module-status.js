#!/usr/bin/env node

/**
 * Check Module Status
 * 
 * This script checks the status of all modules in the database.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function checkModuleStatus() {
  try {
    console.log('🔍 Checking Module Status...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all modules
    const allModules = await LearningModule.find({}).select('title level isActive createdAt');
    
    console.log(`📊 Total modules in database: ${allModules.length}\n`);

    if (allModules.length === 0) {
      console.log('❌ No modules found in database');
      return;
    }

    // Group by status
    const activeModules = allModules.filter(m => m.isActive);
    const inactiveModules = allModules.filter(m => !m.isActive);

    console.log('✅ Active Modules:');
    if (activeModules.length === 0) {
      console.log('   No active modules found');
    } else {
      activeModules.forEach(module => {
        console.log(`   - "${module.title}" (Level: ${module.level})`);
      });
    }

    console.log('\n❌ Inactive Modules:');
    if (inactiveModules.length === 0) {
      console.log('   No inactive modules found');
    } else {
      inactiveModules.forEach(module => {
        console.log(`   - "${module.title}" (Level: ${module.level})`);
      });
    }

    // Group by level
    console.log('\n📚 Modules by Level:');
    const levelGroups = {};
    allModules.forEach(module => {
      if (!levelGroups[module.level]) {
        levelGroups[module.level] = [];
      }
      levelGroups[module.level].push(module);
    });

    Object.keys(levelGroups).sort().forEach(level => {
      const modules = levelGroups[level];
      const activeCount = modules.filter(m => m.isActive).length;
      console.log(`   ${level}: ${modules.length} total (${activeCount} active)`);
    });

    // If we have inactive modules, offer to reactivate them
    if (inactiveModules.length > 0) {
      console.log('\n💡 To reactivate modules for testing:');
      console.log('   Run the following MongoDB commands:');
      inactiveModules.forEach(module => {
        console.log(`   db.learningmodules.updateOne({_id: ObjectId("${module._id}")}, {$set: {isActive: true}})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking module status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkModuleStatus();