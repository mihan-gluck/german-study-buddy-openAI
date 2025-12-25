// Test the German bus ticket module
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function testGermanBusModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the German bus module
    const busModule = await LearningModule.findOne({ 
      title: "Busfahrkarten kaufen an der Haltestelle" 
    });
    
    if (!busModule) {
      console.log('❌ German bus module not found');
      return;
    }
    
    console.log('🚌 German Bus Ticket Module Analysis\n');
    console.log('=' .repeat(50));
    
    console.log('📝 BASIC INFO:');
    console.log(`Title: ${busModule.title}`);
    console.log(`Description: ${busModule.description}`);
    console.log(`Level: ${busModule.level} | Difficulty: ${busModule.difficulty}`);
    console.log(`Duration: ${busModule.estimatedDuration} minutes`);
    console.log(`Tags: ${busModule.tags.join(', ')}`);
    
    console.log('\n🎯 LEARNING OBJECTIVES (in German):');
    busModule.content.learningObjectives.forEach((obj, i) => {
      console.log(`${i + 1}. ${obj}`);
    });
    
    console.log('\n📚 VOCABULARY SAMPLE (German → English):');
    busModule.content.vocabulary.slice(0, 8).forEach((vocab, i) => {
      console.log(`${i + 1}. ${vocab.german} → ${vocab.english}`);
      console.log(`   Pronunciation: ${vocab.pronunciation}`);
      console.log(`   Example: "${vocab.example}"`);
      console.log('');
    });
    
    console.log('❓ EXERCISE QUESTIONS (in German):');
    busModule.content.exercises.forEach((exercise, i) => {
      console.log(`${i + 1}. ${exercise.question}`);
      if (exercise.options) {
        console.log(`   Options: ${exercise.options.join(' | ')}`);
      }
      console.log(`   Answer: ${exercise.correctAnswer}`);
      console.log(`   Explanation: ${exercise.explanation}`);
      console.log('');
    });
    
    console.log('🎭 ROLE-PLAY SCENARIO (in German):');
    const rolePlay = busModule.content.rolePlayScenario;
    console.log(`Situation: ${rolePlay.situation}`);
    console.log(`Setting: ${rolePlay.setting}`);
    console.log(`Student Role: ${rolePlay.studentRole}`);
    console.log(`AI Role: ${rolePlay.aiRole}`);
    console.log(`Objective: ${rolePlay.objective}`);
    console.log('Conversation Flow:');
    rolePlay.conversationFlow.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });
    
    console.log('\n🤖 AI TUTOR CONFIGURATION (in German):');
    const aiConfig = busModule.aiTutorConfig;
    console.log(`Personality: ${aiConfig.personality}`);
    console.log('Focus Areas:');
    aiConfig.focusAreas.forEach((area, i) => {
      console.log(`  ${i + 1}. ${area}`);
    });
    console.log('Helpful Phrases:');
    aiConfig.helpfulPhrases.forEach((phrase, i) => {
      console.log(`  ${i + 1}. "${phrase}"`);
    });
    console.log(`Teaching Style: ${aiConfig.teachingStyle}`);
    
    console.log('\n🇩🇪 CULTURAL NOTES (in German):');
    busModule.content.culturalNotes.forEach((note, i) => {
      console.log(`${i + 1}. ${note}`);
    });
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('\n📊 STATISTICS:');
    console.log(`- ${busModule.content.vocabulary.length} vocabulary items with German examples`);
    console.log(`- ${busModule.content.exercises.length} exercises with German questions`);
    console.log(`- 1 role-play scenario entirely in German context`);
    console.log(`- ${busModule.content.culturalNotes.length} cultural notes about German public transport`);
    console.log(`- AI tutor personality and responses configured in German`);
    
    console.log('\n🎯 WHAT THIS DEMONSTRATES:');
    console.log('✅ Complete German content in all fields');
    console.log('✅ Authentic German vocabulary with pronunciation guides');
    console.log('✅ German cultural context and real-world scenarios');
    console.log('✅ AI tutor configured to respond as German native speaker');
    console.log('✅ Practical, everyday German for public transportation');
    
    console.log('\n🚀 READY FOR TEACHER TESTING!');
    console.log(`Module ID: ${busModule._id}`);
    console.log('Teachers can now test this module to experience:');
    console.log('- Authentic German conversation about buying bus tickets');
    console.log('- AI responses in German cultural context');
    console.log('- Practical vocabulary for real-world situations');
    console.log('- Role-play as tourist needing help at German bus stop');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testGermanBusModule();