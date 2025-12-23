// scripts/verify-tamil-module.js
// Verify the Tamil Restaurant module was created correctly

const mongoose = require('mongoose');
require('dotenv').config();

const LearningModule = require('../models/LearningModule');

async function verifyTamilModule() {
  try {
    console.log('🔍 Verifying Tamil Restaurant module...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the Tamil restaurant module
    const tamilModule = await LearningModule.findOne({
      title: 'Restaurant Conversation - English Practice',
      targetLanguage: 'English',
      nativeLanguage: 'Tamil'
    });

    if (!tamilModule) {
      console.log('❌ Tamil Restaurant module not found!');
      return;
    }

    console.log('✅ Tamil Restaurant module found!');
    console.log('\n📋 Module Details:');
    console.log(`- ID: ${tamilModule._id}`);
    console.log(`- Title: ${tamilModule.title}`);
    console.log(`- Target Language: ${tamilModule.targetLanguage}`);
    console.log(`- Native Language: ${tamilModule.nativeLanguage}`);
    console.log(`- Level: ${tamilModule.level}`);
    console.log(`- Category: ${tamilModule.category}`);
    console.log(`- Duration: ${tamilModule.estimatedDuration} minutes`);
    console.log(`- Active: ${tamilModule.isActive}`);
    
    console.log('\n🎭 Role-Play Scenario:');
    console.log(`- Situation: ${tamilModule.content.rolePlayScenario.situation}`);
    console.log(`- Student Role: ${tamilModule.content.rolePlayScenario.studentRole}`);
    console.log(`- AI Role: ${tamilModule.content.rolePlayScenario.aiRole}`);
    console.log(`- Setting: ${tamilModule.content.rolePlayScenario.setting}`);
    
    console.log('\n📚 Content Summary:');
    console.log(`- Vocabulary words: ${tamilModule.content.allowedVocabulary.length}`);
    console.log(`- Grammar structures: ${tamilModule.content.allowedGrammar.length}`);
    console.log(`- Conversation stages: ${tamilModule.content.conversationFlow.length}`);
    console.log(`- Learning objectives: ${tamilModule.learningObjectives.length}`);
    
    console.log('\n🎯 Learning Objectives:');
    tamilModule.learningObjectives.forEach((obj, index) => {
      console.log(`${index + 1}. ${obj.objective}`);
    });
    
    console.log('\n📝 Sample Vocabulary (first 10):');
    tamilModule.content.allowedVocabulary.slice(0, 10).forEach((vocab, index) => {
      console.log(`${index + 1}. ${vocab.word} (${vocab.translation}) - ${vocab.category}`);
    });
    
    console.log('\n🗣️ Conversation Stages:');
    tamilModule.content.conversationFlow.forEach((stage, index) => {
      console.log(`${index + 1}. ${stage.stage}`);
    });
    
    console.log('\n🎉 Module verification completed successfully!');
    console.log('\n🚀 Ready to test:');
    console.log('1. Go to: http://localhost:4200/learning-modules');
    console.log('2. Look for: "Restaurant Conversation - English Practice"');
    console.log('3. Check that it shows "Tamil → English"');
    console.log('4. Start a session and try: "Hello, can I have the menu please?"');

  } catch (error) {
    console.error('❌ Error verifying module:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the verification
if (require.main === module) {
  verifyTamilModule();
}

module.exports = verifyTamilModule;