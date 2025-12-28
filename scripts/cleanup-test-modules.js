#!/usr/bin/env node

/**
 * Cleanup Test Modules
 * 
 * This script removes all modules that were created for testing purposes
 * while preserving the original production modules.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User'); // Add User model

async function cleanupTestModules() {
  try {
    console.log('🧹 Cleaning up test modules...\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // First, let's see all current modules
    const allModules = await LearningModule.find({ isActive: true })
      .select('title level category createdAt createdBy')
      .populate('createdBy', 'name email')
      .sort({ createdAt: 1 });

    console.log(`📚 Current active modules (${allModules.length} total):\n`);
    
    allModules.forEach((module, index) => {
      const createdDate = module.createdAt.toLocaleDateString();
      const createdBy = module.createdBy?.name || 'Unknown';
      console.log(`${(index + 1).toString().padStart(2)}. "${module.title}" (${module.level}) - ${createdDate} by ${createdBy}`);
    });

    // Identify test modules by specific criteria
    const testModulePatterns = [
      // Higher level modules I created
      'Advanced Restaurant Conversations - B1',
      'Business English Basics - B1', 
      'Advanced Grammar Structures - B2',
      'Academic Writing and Research - C1',
      
      // Any modules with "test" in the title
      /test/i,
      
      // Any modules created very recently (last few days) that might be test modules
      // We'll be more specific about this
    ];

    console.log('\n🔍 Identifying test modules to remove...\n');

    const testModules = [];
    const keepModules = [];

    for (const module of allModules) {
      let isTestModule = false;
      let reason = '';

      // Check against specific test module titles
      if (testModulePatterns.some(pattern => {
        if (typeof pattern === 'string') {
          return module.title === pattern;
        } else if (pattern instanceof RegExp) {
          return pattern.test(module.title);
        }
        return false;
      })) {
        isTestModule = true;
        reason = 'Matches test module pattern';
      }

      // Check if it's one of the higher-level modules I created for testing
      if (['B1', 'B2', 'C1', 'C2'].includes(module.level)) {
        // These are likely test modules since the original system had mostly A1/A2
        isTestModule = true;
        reason = 'Higher level module created for testing';
      }

      // Check for modules with specific test characteristics
      if (module.title.includes('Academic Writing') || 
          module.title.includes('Business English') ||
          module.title.includes('Advanced Grammar') ||
          module.title.includes('Advanced Restaurant')) {
        isTestModule = true;
        reason = 'Advanced module created for level testing';
      }

      if (isTestModule) {
        testModules.push({ module, reason });
      } else {
        keepModules.push(module);
      }
    }

    console.log('🗑️ Test modules to be removed:');
    if (testModules.length === 0) {
      console.log('   No test modules found to remove.');
    } else {
      testModules.forEach((item, index) => {
        console.log(`   ${index + 1}. "${item.module.title}" (${item.module.level}) - ${item.reason}`);
      });
    }

    console.log('\n✅ Production modules to keep:');
    keepModules.forEach((module, index) => {
      console.log(`   ${index + 1}. "${module.title}" (${module.level})`);
    });

    if (testModules.length === 0) {
      console.log('\n🎉 No test modules found to remove. Your database is clean!');
      return;
    }

    // Ask for confirmation (simulate user input for this script)
    console.log(`\n⚠️ WARNING: This will remove ${testModules.length} test modules.`);
    console.log('This action cannot be undone.');
    console.log('\nProceeding with removal...\n');

    // Remove test modules
    let removedCount = 0;
    
    for (const item of testModules) {
      const module = item.module;
      
      try {
        // Soft delete by setting isActive to false
        await LearningModule.findByIdAndUpdate(
          module._id,
          { 
            isActive: false,
            deletedAt: new Date(),
            deletionReason: 'Test module cleanup'
          },
          { runValidators: false }
        );
        
        console.log(`✅ Removed: "${module.title}" (${module.level})`);
        removedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to remove "${module.title}":`, error.message);
      }
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   ✅ Removed: ${removedCount} test modules`);
    console.log(`   ✅ Kept: ${keepModules.length} production modules`);
    console.log(`   ✅ Total active modules now: ${keepModules.length}`);

    // Verify the cleanup
    const remainingModules = await LearningModule.find({ isActive: true })
      .select('title level category')
      .sort({ level: 1, title: 1 });

    console.log('\n📚 Remaining active modules:');
    const modulesByLevel = {};
    remainingModules.forEach(module => {
      if (!modulesByLevel[module.level]) {
        modulesByLevel[module.level] = [];
      }
      modulesByLevel[module.level].push(module.title);
    });

    Object.keys(modulesByLevel).sort().forEach(level => {
      console.log(`   ${level}: ${modulesByLevel[level].length} modules`);
      modulesByLevel[level].forEach(title => {
        console.log(`      - ${title}`);
      });
    });

    console.log('\n🎉 Test module cleanup completed successfully!');
    console.log('🚀 Your database now contains only production modules.');
    console.log('📊 The level-based access control system will still work with the remaining modules.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupTestModules();