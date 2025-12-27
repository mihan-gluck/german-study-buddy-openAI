// scripts/test-numbers-module-simple.js

const mongoose = require('mongoose');
require('dotenv').config();

async function testNumbersModuleDirectly() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const LearningModule = require('../models/LearningModule');
    const AiTutorSession = require('../models/AiTutorSession');
    const { v4: uuidv4 } = require('uuid');
    
    // Find the numbers module
    const module = await LearningModule.findOne({ 
      title: { $regex: /numbers.*1.*10/i } 
    }).sort({ createdAt: -1 });
    
    if (!module) {
      console.log('❌ Numbers module not found');
      return;
    }
    
    console.log('🔍 Testing Numbers Module:', module.title);
    console.log('   Vocabulary count:', module.content?.allowedVocabulary?.length || 0);
    console.log('   Exercise count:', module.content?.exercises?.length || 0);
    console.log('   Has role-play:', !!module.content?.rolePlayScenario?.situation);
    
    // Test role-play scenario structure
    if (module.content?.rolePlayScenario) {
      const scenario = module.content.rolePlayScenario;
      console.log('\n🎭 Role-Play Scenario Test:');
      console.log('   Situation:', scenario.situation || '❌ MISSING');
      console.log('   Student Role:', scenario.studentRole || '❌ MISSING');
      console.log('   AI Role:', scenario.aiRole || '❌ MISSING');
      console.log('   Setting:', scenario.setting || '❌ MISSING');
      console.log('   Objective:', scenario.objective || '❌ MISSING');
    }
    
    // Test vocabulary content
    console.log('\n📚 Vocabulary Test:');
    if (module.content?.allowedVocabulary?.length > 0) {
      const numberWords = module.content.allowedVocabulary.filter(word => 
        /\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(word.word)
      );
      console.log('   Number words found:', numberWords.length, '/ 10');
      console.log('   Sample words:', numberWords.slice(0, 3).map(w => `${w.word} = ${w.translation}`).join(', '));
      
      if (numberWords.length >= 10) {
        console.log('   ✅ All numbers 1-10 present');
      } else {
        console.log('   ❌ Missing some numbers');
      }
    } else {
      console.log('   ❌ No vocabulary found');
    }
    
    // Test exercises
    console.log('\n📝 Exercise Test:');
    if (module.content?.exercises?.length > 0) {
      console.log('   Total exercises:', module.content.exercises.length);
      module.content.exercises.forEach((exercise, i) => {
        console.log(`   ${i+1}. ${exercise.type}: "${exercise.question}"`);
        if (exercise.type === 'multiple-choice' && exercise.options) {
          console.log(`      Options: ${exercise.options.length} (${exercise.options.length === 4 ? '✅' : '❌'})`);
        }
        console.log(`      Answer: "${exercise.correctAnswer}" ${exercise.correctAnswer ? '✅' : '❌'}`);
      });
    } else {
      console.log('   ❌ No exercises found');
    }
    
    // Test AI tutor config
    console.log('\n🤖 AI Tutor Config Test:');
    const config = module.aiTutorConfig;
    if (config) {
      console.log('   Personality:', config.personality ? '✅' : '❌');
      console.log('   Focus Areas:', config.focusAreas?.length || 0, 'areas');
      console.log('   Helpful Phrases:', config.helpfulPhrases?.length || 0, 'phrases');
      console.log('   Common Mistakes:', config.commonMistakes?.length || 0, 'mistakes');
    } else {
      console.log('   ❌ No AI tutor config found');
    }
    
    // Simulate session creation (without API)
    console.log('\n🧪 Session Simulation Test:');
    const sessionId = uuidv4();
    
    // Test welcome message generation for role-play
    if (module.content?.rolePlayScenario) {
      const scenario = module.content.rolePlayScenario;
      const welcomeMessage = `Welcome to the Role-Play Session! You will be the ${scenario.studentRole}, I will be the ${scenario.aiRole}. Say "Let's start" to begin or "stop" to end the session.`;
      
      console.log('   Welcome message generated:', welcomeMessage.length > 0 ? '✅' : '❌');
      console.log('   Message preview:', welcomeMessage.substring(0, 80) + '...');
      
      // Test role-play metadata
      const metadata = {
        sessionState: 'introduction',
        waitingForTrigger: true,
        rolePlayDetails: {
          scenario: scenario.situation,
          setting: scenario.setting || 'A typical situation',
          studentRole: scenario.studentRole,
          aiRole: scenario.aiRole,
          objective: scenario.objective || 'Practice natural conversation',
          allowedVocabulary: module.content.allowedVocabulary || [],
          allowedGrammar: module.content.allowedGrammar || []
        }
      };
      
      console.log('   Role-play metadata complete:', Object.keys(metadata.rolePlayDetails).length >= 6 ? '✅' : '❌');
      console.log('   Vocabulary available for AI:', metadata.rolePlayDetails.allowedVocabulary.length, 'words');
    }
    
    // Overall assessment
    console.log('\n🎯 Overall Module Assessment:');
    const issues = [];
    
    if (!module.content?.allowedVocabulary || module.content.allowedVocabulary.length < 10) {
      issues.push('Insufficient vocabulary');
    }
    
    if (!module.content?.exercises || module.content.exercises.length < 3) {
      issues.push('Insufficient exercises');
    }
    
    if (!module.content?.rolePlayScenario?.situation) {
      issues.push('Broken role-play scenario');
    }
    
    if (!module.aiTutorConfig?.personality) {
      issues.push('Missing AI tutor configuration');
    }
    
    if (issues.length === 0) {
      console.log('   ✅ Module is ready for testing!');
      console.log('   ✅ All components are properly configured');
      console.log('   ✅ Should work correctly with AI tutor system');
    } else {
      console.log('   ❌ Issues found:');
      issues.forEach(issue => console.log(`      - ${issue}`));
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testNumbersModuleDirectly();