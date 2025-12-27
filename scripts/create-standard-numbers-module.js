// scripts/create-standard-numbers-module.js

const mongoose = require('mongoose');
require('dotenv').config();

async function createStandardNumbersModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const LearningModule = require('../models/LearningModule');
    const User = require('../models/User');
    
    // Find a teacher to assign as creator
    const teacher = await User.findOne({ role: 'TEACHER' });
    if (!teacher) {
      console.log('❌ No teacher found');
      return;
    }
    
    // Create a proper STANDARD numbers module
    const standardNumbersModule = new LearningModule({
      title: "Numbers 1-10 - Standard Learning",
      description: "Learn to recognize, pronounce, and use numbers 1 to 10 in English through structured lessons and exercises.",
      targetLanguage: "English",
      nativeLanguage: "Tamil",
      level: "A1",
      category: "Vocabulary", // Changed from Conversation to Vocabulary
      difficulty: "Beginner",
      estimatedDuration: 25,
      
      learningObjectives: [
        {
          objective: "Recognize numbers 1-10 in written form",
          description: "Students will be able to identify and read numbers one through ten"
        },
        {
          objective: "Pronounce numbers correctly",
          description: "Students will practice correct pronunciation of each number"
        },
        {
          objective: "Use numbers in basic sentences",
          description: "Students will form simple sentences using numbers"
        }
      ],
      
      content: {
        introduction: "Welcome to the Numbers 1-10 learning module. In this lesson, you will master the basic numbers in English through vocabulary practice, pronunciation exercises, and practical applications.",
        
        keyTopics: [
          "Number recognition",
          "Number pronunciation", 
          "Counting sequences",
          "Using numbers in sentences"
        ],
        
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
          { word: "count", translation: "எண்ணு", category: "General" }
        ],
        
        allowedGrammar: [
          {
            structure: "Cardinal numbers",
            examples: ["one book", "two cats", "three apples"],
            level: "A1"
          },
          {
            structure: "Number questions",
            examples: ["How many?", "What number?", "How old?"],
            level: "A1"
          }
        ],
        
        examples: [
          {
            english: "I have three books",
            tamil: "என்னிடம் மூன்று புத்தகங்கள் உள்ளன",
            explanation: "Using 'three' to describe quantity"
          },
          {
            english: "She is seven years old",
            tamil: "அவள் ஏழு வயது",
            explanation: "Using numbers to express age"
          },
          {
            english: "Count from one to ten",
            tamil: "ஒன்றிலிருந்து பத்து வரை எண்ணுங்கள்",
            explanation: "Counting sequence practice"
          }
        ],
        
        exercises: [
          {
            type: "multiple-choice",
            question: "What number comes after 'seven'?",
            options: ["six", "eight", "nine", "ten"],
            correctAnswer: "eight",
            explanation: "Eight comes after seven in the counting sequence",
            points: 1
          },
          {
            type: "fill-blank",
            question: "Complete the sequence: one, two, three, ___",
            correctAnswer: "four",
            explanation: "Four is the next number in the sequence",
            points: 1
          },
          {
            type: "translation",
            question: "Translate to English: ஐந்து",
            correctAnswer: "five",
            explanation: "ஐந்து means 'five' in English",
            points: 1
          },
          {
            type: "multiple-choice",
            question: "How do you write the number 'ten' in digits?",
            options: ["01", "10", "100", "11"],
            correctAnswer: "10",
            explanation: "Ten is written as 10 in digits",
            points: 1
          },
          {
            type: "fill-blank",
            question: "I have ___ fingers on one hand. (5)",
            correctAnswer: "five",
            explanation: "Humans have five fingers on each hand",
            points: 1
          }
        ]
        
        // NOTE: NO rolePlayScenario - this is a STANDARD module
      },
      
      aiTutorConfig: {
        personality: "Patient and systematic numbers teacher who focuses on clear learning progression",
        focusAreas: [
          "Number recognition",
          "Pronunciation accuracy", 
          "Sequential counting",
          "Practical number usage"
        ],
        helpfulPhrases: [
          "Let's practice counting together",
          "Can you identify this number?",
          "Great job with pronunciation!",
          "Let's use this number in a sentence"
        ],
        commonMistakes: [
          "Confusing 'three' pronunciation with 'tree'",
          "Mixing up number order in sequences",
          "Difficulty with 'eight' pronunciation"
        ],
        culturalNotes: [
          "English numbers are used in many international contexts",
          "Counting on fingers varies by culture",
          "Numbers are essential for daily communication"
        ]
      },
      
      tags: ["numbers", "vocabulary", "basic", "counting", "a1"],
      createdBy: teacher._id,
      isActive: true,
      totalEnrollments: 0,
      averageCompletionTime: 0,
      averageScore: 0,
      version: 1,
      updateHistory: []
    });
    
    await standardNumbersModule.save();
    
    console.log('✅ Standard Numbers Module Created!');
    console.log('   Title:', standardNumbersModule.title);
    console.log('   Type: STANDARD (no role-play scenario)');
    console.log('   Category:', standardNumbersModule.category);
    console.log('   Vocabulary:', standardNumbersModule.content.allowedVocabulary.length, 'words');
    console.log('   Exercises:', standardNumbersModule.content.exercises.length, 'exercises');
    console.log('   Has Role-Play:', !!standardNumbersModule.content.rolePlayScenario);
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createStandardNumbersModule();