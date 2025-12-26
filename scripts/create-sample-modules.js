// scripts/create-sample-modules.js
// This script creates sample learning modules to demonstrate the system

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createSampleModules() {
  try {
    console.log('🚀 Creating sample learning modules...');

    // Find a teacher to assign as creator
    const teacher = await User.findOne({ role: 'TEACHER' });
    if (!teacher) {
      console.error('❌ No teacher found. Please create a teacher first.');
      return;
    }

    // Sample Module 1: German Greetings (A1 Level)
    const greetingsModule = new LearningModule({
      title: "German Greetings and Introductions",
      description: "Master essential German greetings and learn to introduce yourself confidently in various social situations. Perfect for beginners starting their German journey.",
      level: "A1",
      category: "Conversation",
      difficulty: "Beginner",
      estimatedDuration: 30,
      
      learningObjectives: [
        {
          objective: "Master basic greetings",
          description: "Learn and practice Hallo, Guten Tag, Guten Morgen, Guten Abend, and when to use each"
        },
        {
          objective: "Practice self-introduction",
          description: "Learn to say your name and ask others using 'Ich heiße...' and 'Wie heißt du?'"
        },
        {
          objective: "Understand formal vs informal",
          description: "Know when to use 'Sie' vs 'du' in different social contexts"
        }
      ],
      
      prerequisites: [],
      
      content: {
        introduction: "Guten Tag! Welcome to your first German conversation module. Greetings are the foundation of every conversation. In this module, you'll learn the most important German greetings and how to introduce yourself like a native speaker. We'll cover both formal and informal situations, so you'll be prepared for any social context.",
        
        keyTopics: [
          "Formal greetings (Sie form)",
          "Informal greetings (du form)", 
          "Time-specific greetings",
          "Basic introductions",
          "Cultural etiquette",
          "Common responses"
        ],
        
        examples: [
          {
            german: "Guten Tag! Wie heißen Sie?",
            english: "Good day! What is your name?",
            explanation: "Formal greeting with name inquiry - use with strangers, older people, or professional settings"
          },
          {
            german: "Hallo! Ich heiße Maria. Und du?",
            english: "Hello! My name is Maria. And you?",
            explanation: "Informal introduction - use with friends, peers, or casual settings"
          },
          {
            german: "Freut mich, Sie kennenzulernen!",
            english: "Nice to meet you!",
            explanation: "Polite response after being introduced - shows good manners"
          }
        ],
        
        exercises: [
          {
            type: "multiple-choice",
            question: "How do you say 'Good morning' in German?",
            options: ["Guten Tag", "Guten Morgen", "Guten Abend", "Gute Nacht"],
            correctAnswer: "Guten Morgen",
            explanation: "Guten Morgen is used until around 10-11 AM",
            points: 1
          },
          {
            type: "translation",
            question: "Translate: 'My name is Peter'",
            correctAnswer: "Ich heiße Peter",
            explanation: "Use 'Ich heiße...' for introducing yourself",
            points: 2
          }
        ]
      },
      
      aiTutorConfig: {
        personality: "friendly and patient German tutor who encourages practice and corrects pronunciation gently",
        focusAreas: [
          "Correct pronunciation of greetings",
          "When to use formal vs informal",
          "Cultural context and etiquette",
          "Common pronunciation mistakes",
          "Natural conversation flow"
        ],
        commonMistakes: [
          "Mixing formal and informal in same conversation",
          "Using wrong greeting for time of day",
          "Forgetting to respond to greetings"
        ],
        helpfulPhrases: [
          "Hallo! Wie geht's?",
          "Guten Tag! Wie heißen Sie?", 
          "Ich heiße Maria. Und Sie?",
          "Freut mich, Sie kennenzulernen!",
          "Auf Wiedersehen!",
          "Tschüss!"
        ],
        culturalNotes: [
          "Germans shake hands when meeting for the first time",
          "Use 'Sie' with people you don't know well",
          "Eye contact is important during greetings"
        ]
      },
      
      createdBy: teacher._id,
      tags: ["A1", "beginner", "greetings", "conversation", "essential", "introduction", "formal", "informal"],
      isActive: true
    });

    // Sample Module 2: German Numbers (A1 Level)
    const numbersModule = new LearningModule({
      title: "German Numbers 1-100",
      description: "Learn to count in German from 1 to 100. Master pronunciation, spelling, and practical usage of numbers in everyday situations like shopping, telling time, and giving personal information.",
      level: "A1", 
      category: "Vocabulary",
      difficulty: "Beginner",
      estimatedDuration: 45,
      
      learningObjectives: [
        {
          objective: "Count from 1-20",
          description: "Master the basic numbers and their pronunciation"
        },
        {
          objective: "Learn tens (20, 30, 40, etc.)",
          description: "Understand the pattern for multiples of ten"
        },
        {
          objective: "Combine numbers 21-99",
          description: "Learn the German number combination system"
        },
        {
          objective: "Use numbers practically",
          description: "Apply numbers in real situations like prices, ages, phone numbers"
        }
      ],
      
      prerequisites: ["Basic German pronunciation"],
      
      content: {
        introduction: "Numbers are everywhere! Whether you're shopping, telling your age, or giving your phone number, you'll need German numbers. This module will teach you everything from 1 to 100 with clear pronunciation guides and practical examples.",
        
        keyTopics: [
          "Numbers 1-12 (unique forms)",
          "Numbers 13-19 (teen pattern)",
          "Multiples of 10 (20, 30, 40...)",
          "Compound numbers (21-99)",
          "Pronunciation rules",
          "Practical usage"
        ],
        
        examples: [
          {
            german: "Ich bin dreiundzwanzig Jahre alt.",
            english: "I am twenty-three years old.",
            explanation: "Note how German says 'three-and-twenty' instead of 'twenty-three'"
          },
          {
            german: "Das kostet fünfundvierzig Euro.",
            english: "That costs forty-five euros.",
            explanation: "Useful for shopping - remember the 'und' (and) between units and tens"
          }
        ],
        
        exercises: [
          {
            type: "multiple-choice",
            question: "How do you say '27' in German?",
            options: ["siebenundzwanzig", "zwanzigunsieben", "siebenzehn", "zwanzig"],
            correctAnswer: "siebenundzwanzig",
            explanation: "German numbers reverse the order: seven-and-twenty",
            points: 1
          }
        ]
      },
      
      aiTutorConfig: {
        personality: "patient and methodical tutor who breaks down complex number patterns into simple steps",
        focusAreas: [
          "Correct pronunciation of compound numbers",
          "Understanding the 'und' pattern",
          "Practical number usage",
          "Common number mistakes"
        ],
        commonMistakes: [
          "Forgetting 'und' in compound numbers",
          "Wrong order (saying twenty-seven instead of seven-and-twenty)",
          "Confusing similar sounding numbers"
        ],
        helpfulPhrases: [
          "eins, zwei, drei...",
          "Wie alt bist du?",
          "Ich bin ... Jahre alt",
          "Was kostet das?",
          "Das kostet ... Euro"
        ],
        culturalNotes: [
          "Germans often use hand gestures when counting",
          "Phone numbers are usually given in pairs",
          "Prices include 'Euro' and 'Cent'"
        ]
      },
      
      createdBy: teacher._id,
      tags: ["A1", "beginner", "numbers", "vocabulary", "counting", "practical", "shopping"],
      isActive: true
    });

    // Sample Module 3: German Present Tense (A2 Level)
    const presentTenseModule = new LearningModule({
      title: "German Present Tense Verbs",
      description: "Master the German present tense with regular and irregular verbs. Learn conjugation patterns, common verbs, and how to form sentences in present tense.",
      level: "A2",
      category: "Grammar", 
      difficulty: "Intermediate",
      estimatedDuration: 60,
      
      learningObjectives: [
        {
          objective: "Conjugate regular verbs",
          description: "Master the standard conjugation pattern for regular verbs"
        },
        {
          objective: "Learn irregular verbs",
          description: "Memorize common irregular verbs like sein, haben, werden"
        },
        {
          objective: "Form present tense sentences",
          description: "Create grammatically correct sentences using present tense"
        }
      ],
      
      prerequisites: ["Basic German vocabulary", "Personal pronouns"],
      
      content: {
        introduction: "The present tense is the foundation of German grammar. In this module, you'll learn how to conjugate verbs and form sentences that describe current actions, habits, and general truths.",
        
        keyTopics: [
          "Regular verb conjugation pattern",
          "Irregular verbs (sein, haben, werden)",
          "Stem-changing verbs",
          "Modal verbs introduction", 
          "Word order in present tense",
          "Common present tense expressions"
        ],
        
        examples: [
          {
            german: "Ich lerne Deutsch.",
            english: "I am learning German.",
            explanation: "Regular verb 'lernen' conjugated for 'ich'"
          },
          {
            german: "Sie hat einen Hund.",
            english: "She has a dog.",
            explanation: "Irregular verb 'haben' - notice the form changes to 'hat'"
          }
        ],
        
        exercises: [
          {
            type: "fill-blank",
            question: "Ich _____ gerne Pizza. (essen)",
            correctAnswer: "esse",
            explanation: "Essen is irregular - ich esse, du isst, er/sie/es isst",
            points: 2
          }
        ]
      },
      
      aiTutorConfig: {
        personality: "systematic grammar tutor who explains patterns clearly and provides lots of practice",
        focusAreas: [
          "Verb conjugation patterns",
          "Irregular verb forms",
          "Sentence structure",
          "Common grammar mistakes"
        ],
        commonMistakes: [
          "Using infinitive instead of conjugated form",
          "Wrong verb endings",
          "Confusing irregular verb forms"
        ],
        helpfulPhrases: [
          "Ich bin, du bist, er/sie/es ist",
          "Ich habe, du hast, er/sie/es hat",
          "Was machst du?",
          "Ich arbeite, ich lerne, ich spiele"
        ],
        culturalNotes: [
          "German verbs change more than English verbs",
          "Memorizing irregular verbs is essential",
          "Present tense can express future in German"
        ]
      },
      
      createdBy: teacher._id,
      tags: ["A2", "intermediate", "grammar", "verbs", "present-tense", "conjugation"],
      isActive: true
    });

    // Save all modules
    await greetingsModule.save();
    console.log('✅ Created: German Greetings and Introductions');
    
    await numbersModule.save();
    console.log('✅ Created: German Numbers 1-100');
    
    await presentTenseModule.save();
    console.log('✅ Created: German Present Tense Verbs');

    console.log('\n🎉 Sample modules created successfully!');
    console.log('\n📋 Summary:');
    console.log('- 3 modules created');
    console.log('- Levels: A1 (2 modules), A2 (1 module)');
    console.log('- Categories: Conversation, Vocabulary, Grammar');
    console.log('- All modules include examples, exercises, and AI tutor config');
    console.log('\n🚀 You can now:');
    console.log('1. View modules at: http://localhost:4200/learning-modules');
    console.log('2. Edit modules as teacher or admin');
    console.log('3. Students can enroll and practice with AI tutor');

  } catch (error) {
    console.error('❌ Error creating sample modules:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
if (require.main === module) {
  createSampleModules();
}

module.exports = createSampleModules;