#!/usr/bin/env node

/**
 * List Current Modules in Database
 * 
 * This script shows all learning modules currently available in the application
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function listCurrentModules() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📚 Fetching all learning modules...');
    const modules = await LearningModule.find({})
      .select('title level category targetLanguage nativeLanguage createdBy isActive createdAt')
      .sort({ level: 1, title: 1 });

    if (modules.length === 0) {
      console.log('❌ No modules found in database');
      return;
    }

    console.log(`\n📊 Found ${modules.length} modules:\n`);

    // Group by level
    const modulesByLevel = {};
    modules.forEach(module => {
      if (!modulesByLevel[module.level]) {
        modulesByLevel[module.level] = [];
      }
      modulesByLevel[module.level].push(module);
    });

    // Display by level
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    levels.forEach(level => {
      if (modulesByLevel[level]) {
        console.log(`\n🎯 ${level} Level (${modulesByLevel[level].length} modules):`);
        console.log('─'.repeat(50));
        
        modulesByLevel[level].forEach((module, index) => {
          const status = module.isActive ? '✅' : '❌';
          const date = new Date(module.createdAt).toLocaleDateString();
          console.log(`${index + 1}. ${status} ${module.title}`);
          console.log(`   📂 Category: ${module.category}`);
          console.log(`   🌍 Languages: ${module.targetLanguage} ← ${module.nativeLanguage}`);
          console.log(`   📅 Created: ${date}`);
          console.log(`   🆔 ID: ${module._id}`);
          console.log('');
        });
      }
    });

    // Summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log('─'.repeat(30));
    
    const activeModules = modules.filter(m => m.isActive).length;
    const inactiveModules = modules.filter(m => !m.isActive).length;
    
    console.log(`Total Modules: ${modules.length}`);
    console.log(`Active: ${activeModules}`);
    console.log(`Inactive: ${inactiveModules}`);
    
    // By level breakdown
    console.log('\nBy Level:');
    levels.forEach(level => {
      const count = modulesByLevel[level] ? modulesByLevel[level].length : 0;
      if (count > 0) {
        console.log(`  ${level}: ${count} modules`);
      }
    });

    // By category breakdown
    const categories = {};
    modules.forEach(module => {
      categories[module.category] = (categories[module.category] || 0) + 1;
    });
    
    console.log('\nBy Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} modules`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the script
listCurrentModules();