#!/usr/bin/env node

/**
 * Reactivate Modules for Testing
 * 
 * This script reactivates some modules to test the level-based access control system.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function reactivateModules() {
  try {
    console.log('🔄 Reactivating Modules for Testing...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all inactive modules
    const inactiveModules = await LearningModule.find({ isActive: false });
    
    console.log(`📋 Found ${inactiveModules.length} inactive modules\n`);

    // Reactivate all modules for testing
    const result = await LearningModule.updateMany(
      { isActive: false },
      { 
        $set: { 
          isActive: true,
          reactivatedAt: new Date(),
          reactivatedFor: 'Level access control testing'
        }
      }
    );

    console.log(`✅ Reactivated ${result.modifiedCount} modules\n`);

    // Verify reactivation
    const activeModules = await LearningModule.find({ isActive: true }).select('title level category');
    
    console.log('📚 Now Active Modules:');
    activeModules.forEach(module => {
      console.log(`   - "${module.title}" (Level: ${module.level}, Category: ${module.category})`);
    });

    // Group by level for testing
    console.log('\n📊 Active Modules by Level:');
    const levelGroups = {};
    activeModules.forEach(module => {
      if (!levelGroups[module.level]) {
        levelGroups[module.level] = [];
      }
      levelGroups[module.level].push(module);
    });

    Object.keys(levelGroups).sort().forEach(level => {
      console.log(`   ${level}: ${levelGroups[level].length} modules`);
      levelGroups[level].forEach(module => {
        console.log(`     - ${module.title}`);
      });
    });

    console.log('\n🎯 Perfect for Level Access Testing:');
    console.log('✅ A1 modules: Students at A1 can access these');
    console.log('✅ A2 modules: Students at A2 can access A1 + A2');
    console.log('✅ B1+ modules: Higher level students can access all lower levels');

    console.log('\n🚀 Ready to test level-based access control!');

  } catch (error) {
    console.error('❌ Error reactivating modules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the reactivation
reactivateModules();