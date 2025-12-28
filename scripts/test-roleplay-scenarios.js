#!/usr/bin/env node

/**
 * Test Role-Play Scenarios
 * 
 * This script tests all modules with role-play scenarios to ensure
 * they have proper data and won't cause "undefined" issues.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function testRolePlayScenarios() {
  try {
    console.log('🧪 Testing Role-Play Scenarios...\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all modules with role-play scenarios
    const rolePlayModules = await LearningModule.find({
      isActive: true,
      'content.rolePlayScenario': { $exists: true }
    }).select('title level content.rolePlayScenario');

    console.log(`📚 Found ${rolePlayModules.length} modules with role-play scenarios:\n`);

    let allValid = true;

    for (const module of rolePlayModules) {
      const scenario = module.content.rolePlayScenario;
      
      console.log(`🎭 ${module.title} (${module.level})`);
      
      // Check for required fields
      const requiredFields = ['situation', 'studentRole', 'aiRole', 'objective'];
      const missingFields = [];
      const undefinedFields = [];
      
      requiredFields.forEach(field => {
        if (!scenario[field]) {
          missingFields.push(field);
        } else if (scenario[field] === 'undefined' || scenario[field] === undefined) {
          undefinedFields.push(field);
        }
      });
      
      if (missingFields.length > 0 || undefinedFields.length > 0) {
        allValid = false;
        console.log('   ❌ Issues found:');
        if (missingFields.length > 0) {
          console.log(`      Missing fields: ${missingFields.join(', ')}`);
        }
        if (undefinedFields.length > 0) {
          console.log(`      Undefined fields: ${undefinedFields.join(', ')}`);
        }
      } else {
        console.log('   ✅ All required fields present and valid');
      }
      
      // Display scenario details
      console.log(`      Situation: "${scenario.situation}"`);
      console.log(`      Student Role: "${scenario.studentRole}"`);
      console.log(`      AI Role: "${scenario.aiRole}"`);
      console.log(`      Objective: "${scenario.objective?.substring(0, 80)}${scenario.objective?.length > 80 ? '...' : ''}"`);
      
      console.log('');
    }

    // Test the specific scenario that was causing issues
    console.log('🔍 Testing C1 Module Specifically:\n');
    
    const c1Module = await LearningModule.findOne({
      title: 'Academic Writing and Research - C1',
      level: 'C1'
    });

    if (c1Module?.content?.rolePlayScenario) {
      const scenario = c1Module.content.rolePlayScenario;
      
      console.log('📋 C1 Module Role-Play Test:');
      console.log(`   Title: ${c1Module.title}`);
      console.log(`   Situation: "${scenario.situation}"`);
      console.log(`   Student Role: "${scenario.studentRole}"`);
      console.log(`   AI Role: "${scenario.aiRole}"`);
      console.log(`   Objective: "${scenario.objective}"`);
      
      // Simulate the AI tutor prompt generation
      const promptTest = `Welcome to the Role Play Session! You will be the ${scenario.studentRole}, I will be the ${scenario.aiRole}. Say 'Let's start' to begin or 'stop' to end the session.`;
      
      console.log('\n🤖 Simulated AI Introduction:');
      console.log(`   "${promptTest}"`);
      
      // Check for undefined in the prompt
      if (promptTest.includes('undefined')) {
        console.log('   ❌ STILL HAS UNDEFINED VALUES!');
        allValid = false;
      } else {
        console.log('   ✅ No undefined values in AI introduction');
      }
    } else {
      console.log('❌ C1 module not found or missing role-play scenario');
      allValid = false;
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   Total Role-Play Modules: ${rolePlayModules.length}`);
    console.log(`   Status: ${allValid ? '✅ ALL VALID' : '❌ ISSUES FOUND'}`);
    
    if (allValid) {
      console.log('\n🎉 All role-play scenarios are properly configured!');
      console.log('🚀 The AI tutor should now work correctly without "undefined" messages.');
    } else {
      console.log('\n⚠️ Some role-play scenarios need attention.');
      console.log('🔧 Please fix the issues listed above.');
    }

    // Test prompt generation for each module
    console.log('\n🧪 Testing AI Prompt Generation:\n');
    
    for (const module of rolePlayModules.slice(0, 3)) { // Test first 3 modules
      const scenario = module.content.rolePlayScenario;
      
      console.log(`🎭 ${module.title}:`);
      
      // Simulate the OpenAI service prompt building
      const mockPrompt = `ROLE-PLAY SCENARIO:
- Situation: ${scenario.situation}
- Your Role: ${scenario.aiRole}
- Student Role: ${scenario.studentRole}
- Objective: ${scenario.objective}

I will be the ${scenario.aiRole} and you will be the ${scenario.studentRole}`;

      console.log('   Generated Prompt Preview:');
      console.log(`   "${mockPrompt.substring(0, 150)}..."`);
      
      if (mockPrompt.includes('undefined')) {
        console.log('   ❌ Contains undefined values');
      } else {
        console.log('   ✅ Clean prompt generation');
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error testing role-play scenarios:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testRolePlayScenarios();