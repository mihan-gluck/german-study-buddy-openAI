#!/usr/bin/env node

/**
 * Fix C1 Module Role-Play Scenario
 * 
 * The C1 module has undefined role-play scenario fields, causing the AI tutor
 * to say "You will be the undefined, I will be the undefined". This script
 * fixes the role-play scenario data.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function fixC1ModuleRolePlay() {
  try {
    console.log('🔧 Fixing C1 Module Role-Play Scenario...\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the C1 module
    const c1Module = await LearningModule.findOne({ 
      title: 'Academic Writing and Research - C1',
      level: 'C1' 
    });

    if (!c1Module) {
      console.log('❌ C1 module not found');
      return;
    }

    console.log('📚 Found C1 module:', c1Module.title);
    console.log('🔍 Current role-play scenario:');
    console.log('   Situation:', c1Module.content?.rolePlayScenario?.situation);
    console.log('   Student Role:', c1Module.content?.rolePlayScenario?.studentRole);
    console.log('   AI Role:', c1Module.content?.rolePlayScenario?.aiRole);
    console.log('   Objective:', c1Module.content?.rolePlayScenario?.objective);

    // Update the role-play scenario with proper academic content
    const updateResult = await LearningModule.updateOne(
      { 
        title: 'Academic Writing and Research - C1',
        level: 'C1' 
      },
      {
        $set: {
          'content.rolePlayScenario': {
            situation: 'Academic conference presentation and Q&A session',
            setting: 'You are at an international academic conference presenting your research paper to fellow academics and researchers',
            studentRole: 'Research Presenter',
            aiRole: 'Conference Moderator and Audience Member',
            objective: 'Present your research findings clearly, defend your methodology, and answer academic questions professionally using advanced academic vocabulary'
          }
        }
      }
    );

    console.log('\n🔄 Update operation result:');
    console.log('   Matched:', updateResult.matchedCount);
    console.log('   Modified:', updateResult.modifiedCount);

    // Verify the fix
    const updatedModule = await LearningModule.findOne({ 
      title: 'Academic Writing and Research - C1',
      level: 'C1' 
    });

    if (updatedModule?.content?.rolePlayScenario) {
      console.log('\n✅ Verification - Role-play scenario successfully fixed:');
      console.log('   Situation:', updatedModule.content.rolePlayScenario.situation);
      console.log('   Setting:', updatedModule.content.rolePlayScenario.setting);
      console.log('   Student Role:', updatedModule.content.rolePlayScenario.studentRole);
      console.log('   AI Role:', updatedModule.content.rolePlayScenario.aiRole);
      console.log('   Objective:', updatedModule.content.rolePlayScenario.objective);
    } else {
      console.log('\n❌ Fix verification failed');
    }

    // Also check and fix other higher-level modules if they have the same issue
    console.log('\n🔍 Checking other higher-level modules...');

    const otherModules = await LearningModule.find({
      level: { $in: ['B1', 'B2'] },
      'content.rolePlayScenario': { $exists: true }
    });

    for (const module of otherModules) {
      const scenario = module.content.rolePlayScenario;
      const hasUndefinedFields = !scenario.situation || !scenario.studentRole || !scenario.aiRole;
      
      if (hasUndefinedFields) {
        console.log(`\n🔧 Fixing ${module.title} (${module.level})...`);
        
        let fixedScenario = {};
        
        if (module.level === 'B1') {
          if (module.title.includes('Restaurant')) {
            fixedScenario = {
              situation: 'Dining at an upscale restaurant with complex requests',
              setting: 'You are at a fine dining restaurant and need to make special dietary requests and handle service issues',
              studentRole: 'Restaurant Customer',
              aiRole: 'Restaurant Server and Manager',
              objective: 'Successfully navigate complex restaurant interactions including complaints, special requests, and detailed food discussions'
            };
          } else if (module.title.includes('Business')) {
            fixedScenario = {
              situation: 'Business meeting and presentation scenario',
              setting: 'You are in a professional business meeting discussing projects and making presentations',
              studentRole: 'Business Professional',
              aiRole: 'Colleague and Meeting Facilitator',
              objective: 'Participate effectively in business discussions using professional vocabulary and formal language structures'
            };
          }
        } else if (module.level === 'B2') {
          fixedScenario = {
            situation: 'Advanced grammar tutoring session',
            setting: 'You are in an advanced language class focusing on complex grammatical structures',
            studentRole: 'Advanced Language Student',
            aiRole: 'Grammar Instructor',
            objective: 'Master complex grammatical structures including subjunctive mood, advanced conditionals, and sophisticated sentence constructions'
          };
        }
        
        if (Object.keys(fixedScenario).length > 0) {
          await LearningModule.updateOne(
            { _id: module._id },
            { $set: { 'content.rolePlayScenario': fixedScenario } }
          );
          console.log(`   ✅ Fixed ${module.title}`);
        }
      } else {
        console.log(`   ✅ ${module.title} (${module.level}) - Already has proper role-play scenario`);
      }
    }

    console.log('\n🎉 All role-play scenarios have been fixed!');
    console.log('\n📋 Summary:');
    console.log('✅ C1 Module: Academic conference presentation scenario');
    console.log('✅ B1 Modules: Restaurant and business scenarios');
    console.log('✅ B2 Module: Advanced grammar tutoring scenario');
    console.log('\n🚀 The AI tutor should now properly introduce role-play sessions!');

  } catch (error) {
    console.error('❌ Error fixing C1 module role-play scenario:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixC1ModuleRolePlay();