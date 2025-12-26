// scripts/create-english-modules.js
// Create sample English learning modules for testing

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createEnglishModules() {
  try {
    console.log('🚀 Creating sample English learning modules...');

    // Find a teacher to assign as creator
    const teacher = await User.findOne({ role: 'TEACHER' });
    if (!teacher) {
      console.error('❌ No teacher found. Please create a teacher first.');
      return;
    }

    // Sample Module 1: English Greetings (A1 Level)
    const englishGreetingsModule = new LearningModule({
      title: "English Greetings and Introductions",
      description: "Master essential English greetings and learn to introduce yourself confidently in various social situations. Perfect for beginners starting their English journey.",
      targetLanguage: "English",
      nativeLanguage: "German", // For German speakers learning English
      level: "A1",
      category: "Conversation",
      difficulty: "Beginner",
      estimatedDuration: 30,
      
      learningObjectives: [
        {
          objective: "Master basic English greetings",
          description: "Learn and practice Hello, Hi, Good morning, Good afternoon, Good evening, and when to use each"
        },
        {
          objective: "Practice self-introduction in English",
          description: "Learn to say your name and ask others using 'My name is...' and 'What's your name?'"
        },
        {
          objective: "Understand formal vs informal English",
          description: "Know when to use formal greetings vs casual ones in different social contexts"
        }
      ],
      
      prerequisites: [],
      
      content: {
        introduction: "Hello! Welcome to your first English conversation module. Greetings are the foundation of every conversation. In this module, you'll learn the most important English greetings and how to introduce yourself like a native speaker. We'll cover both formal and informal situations, so you'll be prepared for any social context.",
        
        keyTopics: [
          "Formal greetings (business settings)",
          "Informal greetings (friends and family)", 
          "Time-specific greetings",
          "Basic introductions",
          "Social etiquette",
          "Common responses"
        ],
        
        examples: [
          {
            german: "Guten Tag! Wie heißen Sie?",
            english: "Good day! What is your name?",
            explanation: "Formal greeting with name inquiry - use in business or professional settings"
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
            question: "How do you say 'Good morning' in English?",
            options: ["Good day", "Good morning", "Good evening", "Good night"],
            correctAnswer: "Good morning",
            explanation: "Good morning is used until around 12 PM",
            points: 1
          },
          {
            type: "translation",
            question: "Translate: 'Mein Name ist Peter'",
            correctAnswer: "My name is Peter",
            explanation: "Use 'My name is...' for introducing yourself in English",
            points: 2
          }
        ]
      },
      
      aiTutorConfig: {
        personality: "friendly and patient English tutor who encourages practice and corrects pronunciation gently",
        focusAreas: [
          "Correct pronunciation of English greetings",
          "When to use formal vs informal language",
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
          "Hello! How are you?",
          "Good morning! What's your name?", 
          "My name is Maria. And you?",
          "Nice to meet you!",
          "Goodbye!",
          "See you later!"
        ],
        culturalNotes: [
          "Americans often shake hands when meeting for the first time",
          "Eye contact is important during greetings",
          "Small talk is common after greetings"
        ]
      },
      
      createdBy: teacher._id,
      tags: ["A1", "beginner", "greetings", "conversation", "essential", "introduction", "formal", "informal"],
      isActive: true
    });

    // Sample Module 2: English Numbers (A1 Level)
    const englishNumbersModule = new LearningModule({
      title: "English Numbers 1-100",
      description: "Learn to count in English from 1 to 100. Master pronunciation, spelling, and practical usage of numbers in everyday situations like shopping, telling time, and giving personal information.",
      targetLanguage: "English",
      nativeLanguage: "German",
      level: "A1", 
      category: "Vocabulary",
      difficulty: "Beginner",
      estimatedDuration: 45,
      
      learningObjectives: [
        {
          objective: "Count from 1-20 in English",
          description: "Master the basic numbers and their pronunciation"
        },
        {
          objective: "Learn tens (20, 30, 40, etc.)",
          description: "Understand the pattern for multiples of ten"
        },
        {
          objective: "Combine numbers 21-99",
          description: "Learn the English number combination system"
        },
        {
          objective: "Use numbers practically",
          description: "Apply numbers in real situations like prices, ages, phone numbers"
        }
      ],
      
      prerequisites: ["Basic English pronunciation"],
      
      content: {
        introduction: "Numbers are everywhere! Whether you're shopping, telling your age, or giving your phone number, you'll need English numbers. This module will teach you everything from 1 to 100 with clear pronunciation guides and practical examples.",
        
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
            explanation: "English says 'twenty-three' in the normal order (tens first, then units)"
          },
          {
            german: "Das kostet fünfundvierzig Dollar.",
            english: "That costs forty-five dollars.",
            explanation: "Useful for shopping - English numbers follow the tens-units pattern"
          }
        ],
        
        exercises: [
          {
            type: "multiple-choice",
            question: "How do you say '27' in English?",
            options: ["twenty-seven", "seven-twenty", "seventeen", "twenty"],
            correctAnswer: "twenty-seven",
            explanation: "English numbers follow tens-units order: twenty-seven",
            points: 1
          }
        ]
      },
      
      aiTutorConfig: {
        personality: "patient and methodical English tutor who breaks down complex number patterns into simple steps",
        focusAreas: [
          "Correct pronunciation of English numbers",
          "Understanding the tens-units pattern",
          "Practical number usage",
          "Common number mistakes"
        ],
        commonMistakes: [
          "Confusing thirteen and thirty",
          "Wrong pronunciation of 'th' sounds",
          "Mixing up similar sounding numbers"
        ],
        helpfulPhrases: [
          "one, two, three...",
          "How old are you?",
          "I am ... years old",
          "How much does it cost?",
          "It costs ... dollars"
        ],
        culturalNotes: [
          "Americans often use fingers when counting",
          "Phone numbers are usually given in groups",
          "Prices include 'dollars' and 'cents'"
        ]
      },
      
      createdBy: teacher._id,
      tags: ["A1", "beginner", "numbers", "vocabulary", "counting", "practical", "shopping"],
      isActive: true
    });

    // Sample Module 3: English Present Tense (A2 Level)
    const englishPresentTenseModule = new LearningModule({
      title: "English Present Tense Verbs",
      description: "Master the English present tense with regular and irregular verbs. Learn conjugation patterns, common verbs, and how to form sentences in present tense.",
      targetLanguage: "English",
      nativeLanguage: "German",
      level: "A2",
      category: "Grammar", 
      difficulty: "Intermediate",
      estimatedDuration: 60,
      
      learningObjectives: [
        {
          objective: "Conjugate regular English verbs",
          description: "Master the standard conjugation pattern for regular verbs in present tense"
        },
        {
          objective: "Learn irregular English verbs",
          description: "Memorize common irregular verbs like be, have, do, go"
        },
        {
          objective: "Form present tense sentences",
          description: "Create grammatically correct English sentences using present tense"
        }
      ],
      
      prerequisites: ["Basic English vocabulary", "Personal pronouns"],
      
      content: {
        introduction: "The present tense is the foundation of English grammar. In this module, you'll learn how to conjugate verbs and form sentences that describe current actions, habits, and general truths in English.",
        
        keyTopics: [
          "Regular verb conjugation pattern",
          "Irregular verbs (be, have, do, go)",
          "Third person singular -s rule",
          "Question formation with do/does", 
          "Negative sentences with don't/doesn't",
          "Common present tense expressions"
        ],
        
        examples: [
          {
            german: "Ich lerne Englisch.",
            english: "I learn English.",
            explanation: "Regular verb 'learn' - no change for 'I'"
          },
          {
            german: "Sie hat einen Hund.",
            english: "She has a dog.",
            explanation: "Irregular verb 'have' - changes to 'has' for third person singular"
          }
        ],
        
        exercises: [
          {
            type: "fill-blank",
            question: "She _____ pizza every Friday. (eat)",
            correctAnswer: "eats",
            explanation: "Regular verbs add -s for third person singular: she eats",
            points: 2
          }
        ]
      },
      
      aiTutorConfig: {
        personality: "systematic English grammar tutor who explains patterns clearly and provides lots of practice",
        focusAreas: [
          "Verb conjugation patterns",
          "Third person singular rule",
          "Question and negative formation",
          "Common grammar mistakes"
        ],
        commonMistakes: [
          "Forgetting -s for third person singular",
          "Using wrong auxiliary verbs",
          "Confusing irregular verb forms"
        ],
        helpfulPhrases: [
          "I am, you are, he/she/it is",
          "I have, you have, he/she/it has",
          "What do you do?",
          "I work, I study, I play"
        ],
        culturalNotes: [
          "English verbs change less than German verbs",
          "Present tense can express future in English",
          "Contractions are common in spoken English"
        ]
      },
      
      createdBy: teacher._id,
      tags: ["A2", "intermediate", "grammar", "verbs", "present-tense", "conjugation"],
      isActive: true
    });

    // Save all modules
    await englishGreetingsModule.save();
    console.log('✅ Created: English Greetings and Introductions');
    
    await englishNumbersModule.save();
    console.log('✅ Created: English Numbers 1-100');
    
    await englishPresentTenseModule.save();
    console.log('✅ Created: English Present Tense Verbs');

    console.log('\n🎉 English learning modules created successfully!');
    console.log('\n📋 Summary:');
    console.log('- 3 English modules created');
    console.log('- Target Language: English');
    console.log('- Native Language: German (for German speakers)');
    console.log('- Levels: A1 (2 modules), A2 (1 module)');
    console.log('- Categories: Conversation, Vocabulary, Grammar');
    console.log('- All modules include examples, exercises, and AI tutor config');
    console.log('\n🚀 You can now:');
    console.log('1. View modules at: http://localhost:4200/learning-modules');
    console.log('2. Filter by Target Language: English');
    console.log('3. Test the AI tutor with English learning');
    console.log('4. Compare German vs English learning experiences');

  } catch (error) {
    console.error('❌ Error creating English modules:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
if (require.main === module) {
  createEnglishModules();
}

module.exports = createEnglishModules;