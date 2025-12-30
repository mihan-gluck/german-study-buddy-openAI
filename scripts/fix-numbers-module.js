// scripts/fix-numbers-module.js

const mongoose = require('mongoose');
require('dotenv').config();

async function fixNumbersModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const LearningModule = require('../models/LearningModule');
    
    // Find the numbers module
    const module = await LearningModule.findOne({ 
      title: { $regex: /numbers.*1.*10/i } 
    }).sort({ createdAt: -1 });
    
    if (!module) {
      console.log('❌ Numbers module not found');
      return;
    }
    
    console.log('🔍 Found module to fix:', module.title);
    
    // Fix the module content
    const fixedContent = {
      ...module.content,
      
      // Add proper vocabulary for numbers 1-10
      allowedVocabulary: [
        { word: "one", translation: "ஒன்று", category: "Numbers" },
        { word: "two", translation: "இரண்டு", category: "Numbers" },
        { word: "three", translation: "மூன்று", category: "Numbers" },
        { word: "four", translation: "நான்கு", category: "Numbers" },
        { word: "five", translation: "ஐந்து", category: "Numbers" },
        { word: "six", translation: "ஆறு", category: "Numbers" },
        { word: "seven", translation: "ஏழு", category: "Numbers" },
        { word: "eight", translation: "எட்டு", category: "Numbers" },
        { word: "nine", translation: "ஒன்பது", category: "Numbers" },
        { word: "ten", translation: "பத்து", category: "Numbers" },
        { word: "number", translation: "எண்", category: "General" },
        { word: "count", translation: "எண்ணு", category: "General" },
        { word: "how many", translation: "எத்தனை", category: "Questions" }
      ],
      
      // Add proper grammar structures
      allowedGrammar: [
        {
          structure: "Simple counting",
          examples: ["I have one apple", "There are two cats", "Count to ten"],
          level: "A1"
        },
        {
          structure: "Number questions",
          examples: ["How many books?", "What number is this?", "Can you count?"],
          level: "A1"
        },
        {
          structure: "Basic sentences with numbers",
          examples: ["I am five years old", "There are three dogs", "I want two cookies"],
          level: "A1"
        }
      ],
      
      // Fix role-play scenario
      rolePlayScenario: {
        situation: "Learning to count and use numbers",
        studentRole: "Student learning numbers",
        aiRole: "Patient counting teacher",
        setting: "A friendly classroom environment",
        objective: "Practice counting from 1 to 10 and using numbers in simple sentences",
        conversationFlow: [
          "Greeting and introduction to numbers",
          "Counting practice 1-5",
          "Counting practice 6-10", 
          "Using numbers in sentences",
          "Number recognition games",
          "Review and celebration"
        ]
      },
      
      // Keep existing exercises but ensure they're working
      exercises: module.content.exercises || [
        {
          type: "multiple-choice",
          question: "How do you say '5' in English?",
          options: ["Four", "Five", "Six", "Seven"],
          correctAnswer: "Five",
          explanation: "Five is the English word for the number 5",
          points: 1
        },
        {
          type: "fill-blank",
          question: "Fill in the blank: I have ___ apples. (3)",
          correctAnswer: "three",
          explanation: "Three is the English word for the number 3",
          points: 1
        },
        {
          type: "translation",
          question: "Translate to English: எட்டு",
          correctAnswer: "Eight",
          explanation: "எட்டு means 'eight' in English",
          points: 1
        },
        {
          type: "conversation",
          question: "Practice counting: Say the numbers from 1 to 5",
          correctAnswer: "one, two, three, four, five",
          explanation: "Great counting practice!",
          points: 2
        },
        {
          type: "role-play",
          question: "Ask the teacher: 'How many fingers do I have?'",
          correctAnswer: "How many fingers do I have?",
          explanation: "Perfect question formation!",
          points: 1
        }
      ]
    };
    
    // Update AI tutor config for numbers
    const fixedAiTutorConfig = {
      personality: "Patient and encouraging numbers teacher who makes counting fun",
      focusAreas: ["Number recognition", "Counting skills", "Number pronunciation", "Using numbers in sentences"],
      helpfulPhrases: [
        "Let's count together!",
        "What number comes next?",
        "Can you show me with your fingers?",
        "Great counting!",
        "Let's practice that number again"
      ],
      commonMistakes: [
        "Confusing 'three' and 'tree'",
        "Mixing up number order",
        "Pronunciation of 'eight' and 'ate'"
      ],
      culturalNotes: [
        "In English, we count on our fingers starting with the thumb",
        "Numbers are used everywhere in daily life",
        "Counting songs help remember number sequences"
      ]
    };
    
    // Update the module
    await LearningModule.findByIdAndUpdate(module._id, {
      content: fixedContent,
      aiTutorConfig: fixedAiTutorConfig,
      // Ensure it's marked as updated
      updatedAt: new Date()
    });
    
    console.log('✅ Numbers module fixed successfully!');
    console.log('📚 Added vocabulary words:', fixedContent.allowedVocabulary.length);
    console.log('📝 Total exercises:', fixedContent.exercises.length);
    console.log('🎭 Role-play scenario:', fixedContent.rolePlayScenario.situation);
    
    // Verify the fix
    const updatedModule = await LearningModule.findById(module._id);
    console.log('\n🔍 Verification:');
    console.log('  Vocabulary count:', updatedModule.content.allowedVocabulary.length);
    console.log('  Has role-play scenario:', !!updatedModule.content.rolePlayScenario.situation);
    console.log('  Exercise count:', updatedModule.content.exercises.length);
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error fixing module:', error.message);
    process.exit(1);
  }
}

fixNumbersModule();