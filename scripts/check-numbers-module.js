// scripts/check-numbers-module.js

const mongoose = require('mongoose');
require('dotenv').config();

async function checkNumbersModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const LearningModule = require('../models/LearningModule');
    
    // Find the numbers module
    const module = await LearningModule.findOne({ 
      title: { $regex: /numbers.*1.*10/i } 
    }).sort({ createdAt: -1 });
    
    if (module) {
      console.log('🔍 Found Numbers Module:');
      console.log('Title:', module.title);
      console.log('Description:', module.description?.substring(0, 100) + '...');
      console.log('Level:', module.level);
      console.log('Category:', module.category);
      console.log('Module Type:', module.content?.rolePlayScenario ? 'Role-Play' : 'Standard');
      
      if (module.content?.rolePlayScenario) {
        console.log('\n🎭 Role-Play Scenario:');
        console.log('  Situation:', module.content.rolePlayScenario.situation);
        console.log('  Student Role:', module.content.rolePlayScenario.studentRole);
        console.log('  AI Role:', module.content.rolePlayScenario.aiRole);
        console.log('  Setting:', module.content.rolePlayScenario.setting);
        console.log('  Objective:', module.content.rolePlayScenario.objective);
      }
      
      console.log('\n📚 Vocabulary Analysis:');
      console.log('  Total Words:', module.content?.allowedVocabulary?.length || 0);
      if (module.content?.allowedVocabulary?.length > 0) {
        console.log('  First 10 vocabulary words:');
        module.content.allowedVocabulary.slice(0, 10).forEach((word, i) => {
          console.log(`    ${i+1}. "${word.word}" - "${word.translation}" (${word.category || 'No category'})`);
        });
      }
      
      console.log('\n📝 Exercise Analysis:');
      console.log('  Total Exercises:', module.content?.exercises?.length || 0);
      if (module.content?.exercises?.length > 0) {
        console.log('  Exercise Types:', module.content.exercises.map(ex => ex.type).join(', '));
        console.log('  First 3 exercises:');
        module.content.exercises.slice(0, 3).forEach((exercise, i) => {
          console.log(`    ${i+1}. Type: ${exercise.type}`);
          console.log(`       Question: "${exercise.question}"`);
          if (exercise.options) {
            console.log(`       Options: ${exercise.options.join(', ')}`);
          }
          console.log(`       Answer: "${exercise.correctAnswer}"`);
          console.log('');
        });
      }
      
      console.log('🤖 AI Tutor Configuration:');
      console.log('  Personality:', module.aiTutorConfig?.personality || 'Not set');
      console.log('  Focus Areas:', module.aiTutorConfig?.focusAreas?.join(', ') || 'None');
      console.log('  Helpful Phrases:', module.aiTutorConfig?.helpfulPhrases?.length || 0, 'phrases');
      console.log('  Common Mistakes:', module.aiTutorConfig?.commonMistakes?.length || 0, 'mistakes');
      
      // Check for potential issues
      console.log('\n⚠️ Potential Issues:');
      const issues = [];
      
      if (!module.content?.allowedVocabulary || module.content.allowedVocabulary.length === 0) {
        issues.push('No vocabulary defined');
      }
      
      if (!module.content?.exercises || module.content.exercises.length === 0) {
        issues.push('No exercises defined');
      }
      
      if (module.content?.rolePlayScenario && (!module.content.allowedVocabulary || module.content.allowedVocabulary.length < 10)) {
        issues.push('Role-play module has insufficient vocabulary');
      }
      
      // Check if vocabulary is actually about numbers
      const hasNumberVocab = module.content?.allowedVocabulary?.some(word => 
        /\b(one|two|three|four|five|six|seven|eight|nine|ten|1|2|3|4|5|6|7|8|9|10)\b/i.test(word.word)
      );
      
      if (!hasNumberVocab) {
        issues.push('Vocabulary does not contain numbers 1-10');
      }
      
      if (issues.length === 0) {
        console.log('  ✅ No obvious issues found');
      } else {
        issues.forEach(issue => console.log(`  ❌ ${issue}`));
      }
      
    } else {
      console.log('❌ Numbers module not found');
      
      // Let's check what modules exist
      const allModules = await LearningModule.find({}).sort({ createdAt: -1 }).limit(5);
      console.log('\n📋 Recent modules:');
      allModules.forEach((mod, i) => {
        console.log(`  ${i+1}. "${mod.title}" (${mod.level}, ${mod.category})`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkNumbersModule();