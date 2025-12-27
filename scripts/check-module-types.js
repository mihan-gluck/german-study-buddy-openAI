// scripts/check-module-types.js

const mongoose = require('mongoose');
require('dotenv').config();

async function checkModuleTypes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const LearningModule = require('../models/LearningModule');
    
    // Get all modules and check their types
    const modules = await LearningModule.find({}).sort({ createdAt: -1 });
    
    console.log('📊 Module Type Analysis:');
    console.log('Total modules:', modules.length);
    
    let rolePlayCount = 0;
    let standardCount = 0;
    
    console.log('\n📋 Module List:');
    modules.forEach((module, i) => {
      const hasRolePlay = !!module.content?.rolePlayScenario;
      const hasValidRolePlay = hasRolePlay && module.content.rolePlayScenario.situation;
      const type = hasValidRolePlay ? 'Role-Play' : 'Standard';
      
      if (hasValidRolePlay) rolePlayCount++;
      else standardCount++;
      
      console.log(`  ${i+1}. "${module.title}"`);
      console.log(`     Type: ${type}`);
      console.log(`     Level: ${module.level} | Category: ${module.category}`);
      
      if (hasValidRolePlay) {
        console.log(`     Scenario: ${module.content.rolePlayScenario.situation}`);
        console.log(`     Roles: ${module.content.rolePlayScenario.studentRole} vs ${module.content.rolePlayScenario.aiRole}`);
      }
      
      console.log(`     Vocabulary: ${module.content?.allowedVocabulary?.length || 0} words`);
      console.log(`     Exercises: ${module.content?.exercises?.length || 0} exercises`);
      console.log('');
    });
    
    console.log('📈 Summary:');
    console.log(`  Role-Play modules: ${rolePlayCount}`);
    console.log(`  Standard modules: ${standardCount}`);
    
    if (rolePlayCount > 0 && standardCount === 0) {
      console.log('\n⚠️  ALL MODULES ARE ROLE-PLAY TYPE!');
      console.log('This suggests the AI generation system is always creating role-play modules.');
    } else if (standardCount > 0 && rolePlayCount === 0) {
      console.log('\n📚 ALL MODULES ARE STANDARD TYPE');
    } else {
      console.log('\n✅ Mixed module types found - system supports both');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkModuleTypes();