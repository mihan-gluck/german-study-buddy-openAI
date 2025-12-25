// Check German modules in the system
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User'); // Add User model

async function checkGermanModules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all German modules
    const germanModules = await LearningModule.find({ 
      targetLanguage: 'German',
      isActive: true 
    }).populate('createdBy', 'name regNo');
    
    console.log(`\n🇩🇪 Found ${germanModules.length} German modules:\n`);
    
    germanModules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`);
      console.log(`   Target: ${module.targetLanguage} | Native: ${module.nativeLanguage}`);
      console.log(`   Level: ${module.level} | Category: ${module.category}`);
      console.log(`   Created by: ${module.createdBy?.name || 'Unknown'}`);
      console.log(`   Description: ${module.description}`);
      
      // Check content structure
      if (module.content) {
        console.log(`   Content includes:`);
        if (module.content.vocabulary) console.log(`     - ${module.content.vocabulary.length} vocabulary items`);
        if (module.content.exercises) console.log(`     - ${module.content.exercises.length} exercises`);
        if (module.content.rolePlayScenario) console.log(`     - Role-play scenario: ${module.content.rolePlayScenario.situation}`);
        if (module.content.allowedVocabulary) console.log(`     - ${module.content.allowedVocabulary.length} allowed vocabulary items`);
      }
      
      // Check AI tutor config
      if (module.aiTutorConfig) {
        console.log(`   AI Tutor Config:`);
        console.log(`     - Personality: ${module.aiTutorConfig.personality || 'Default'}`);
        console.log(`     - Focus Areas: ${module.aiTutorConfig.focusAreas?.join(', ') || 'None'}`);
      }
      
      console.log('');
    });
    
    // Also check English modules for comparison
    const englishModules = await LearningModule.find({ 
      targetLanguage: 'English',
      isActive: true 
    }).populate('createdBy', 'name regNo');
    
    console.log(`\n🇺🇸 Found ${englishModules.length} English modules for comparison:\n`);
    
    englishModules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`);
      console.log(`   Target: ${module.targetLanguage} | Native: ${module.nativeLanguage}`);
      console.log(`   Level: ${module.level} | Category: ${module.category}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkGermanModules();