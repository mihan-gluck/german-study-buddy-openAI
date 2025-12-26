// Check the actual content structure of the bus module
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function checkBusModuleContent() {
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
    
    console.log('🔍 Raw module structure:');
    console.log('Title:', busModule.title);
    console.log('Content exists:', !!busModule.content);
    console.log('Content keys:', busModule.content ? Object.keys(busModule.content) : 'No content');
    
    if (busModule.content) {
      console.log('\n📋 Content structure:');
      console.log('- learningObjectives:', !!busModule.content.learningObjectives, 
                  busModule.content.learningObjectives ? `(${busModule.content.learningObjectives.length} items)` : '');
      console.log('- vocabulary:', !!busModule.content.vocabulary,
                  busModule.content.vocabulary ? `(${busModule.content.vocabulary.length} items)` : '');
      console.log('- exercises:', !!busModule.content.exercises,
                  busModule.content.exercises ? `(${busModule.content.exercises.length} items)` : '');
      console.log('- rolePlayScenario:', !!busModule.content.rolePlayScenario);
      console.log('- culturalNotes:', !!busModule.content.culturalNotes,
                  busModule.content.culturalNotes ? `(${busModule.content.culturalNotes.length} items)` : '');
      
      if (busModule.content.learningObjectives && busModule.content.learningObjectives.length > 0) {
        console.log('\n🎯 First learning objective:', busModule.content.learningObjectives[0]);
      }
      
      if (busModule.content.vocabulary && busModule.content.vocabulary.length > 0) {
        console.log('\n📚 First vocabulary item:', JSON.stringify(busModule.content.vocabulary[0], null, 2));
      }
      
      if (busModule.content.exercises && busModule.content.exercises.length > 0) {
        console.log('\n❓ First exercise:', JSON.stringify(busModule.content.exercises[0], null, 2));
      }
    }
    
    console.log('\n🤖 AI Tutor Config:');
    console.log('Exists:', !!busModule.aiTutorConfig);
    if (busModule.aiTutorConfig) {
      console.log('Personality:', busModule.aiTutorConfig.personality);
      console.log('Focus Areas:', busModule.aiTutorConfig.focusAreas);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkBusModuleContent();