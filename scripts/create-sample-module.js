// scripts/create-sample-module.js
// Script to create sample learning modules for testing

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create a sample admin user if not exists
    let adminUser = await User.findOne({ email: 'admin@germanbuddy.com' });
    if (!adminUser) {
      adminUser = new User({
        name: 'Admin User',
        regNo: 'ADMIN001',
        email: 'admin@germanbuddy.com',
        password: '$2a$10$example.hash.for.password123', // In real app, hash properly
        role: 'ADMIN'
      });
      await adminUser.save();
      console.log('✅ Created admin user');
    }

    // Create sample learning modules
    const sampleModules = [
      {
        title: 'German Articles - Der, Die, Das',
        description: 'Learn the basics of German articles and how to use them correctly with nouns.',
        level: 'A1',
        category: 'Grammar',
        difficulty: 'Beginner',
        estimatedDuration: 30,
        learningObjectives: [
          {
            objective: 'Understand German articles',
            description: 'Learn when to use der, die, and das'
          },
          {
            objective: 'Practice with common nouns',
            description: 'Apply articles to everyday German words'
          }
        ],
        prerequisites: ['Basic German alphabet'],
        content: {
          introduction: 'German has three articles: der (masculine), die (feminine), and das (neuter). Learning these is essential for German grammar.',
          keyTopics: [
            'Masculine nouns (der)',
            'Feminine nouns (die)', 
            'Neuter nouns (das)',
            'Common patterns and rules'
          ],
          examples: [
            {
              german: 'der Mann',
              english: 'the man',
              explanation: 'Mann is masculine, so we use der'
            },
            {
              german: 'die Frau',
              english: 'the woman', 
              explanation: 'Frau is feminine, so we use die'
            },
            {
              german: 'das Kind',
              english: 'the child',
              explanation: 'Kind is neuter, so we use das'
            }
          ],
          exercises: [
            {
              type: 'multiple-choice',
              question: 'Choose the correct article for "Haus" (house):',
              options: ['der', 'die', 'das'],
              correctAnswer: 'das',
              explanation: 'Haus is neuter, so we use das Haus',
              points: 1
            },
            {
              type: 'multiple-choice', 
              question: 'Choose the correct article for "Auto" (car):',
              options: ['der', 'die', 'das'],
              correctAnswer: 'das',
              explanation: 'Auto is neuter, so we use das Auto',
              points: 1
            },
            {
              type: 'fill-blank',
              question: 'Complete: ___ Katze (the cat)',
              correctAnswer: 'die',
              explanation: 'Katze is feminine, so we use die Katze',
              points: 1
            }
          ]
        },
        aiTutorConfig: {
          personality: 'friendly and encouraging German grammar tutor',
          focusAreas: ['German articles', 'noun gender', 'basic grammar'],
          commonMistakes: ['Confusing der/die/das', 'Not memorizing noun genders'],
          helpfulPhrases: ['der Mann', 'die Frau', 'das Kind', 'das Haus'],
          culturalNotes: ['German noun genders must be memorized', 'Articles change in different cases']
        },
        createdBy: adminUser._id,
        tags: ['beginner', 'grammar', 'articles', 'A1']
      },
      {
        title: 'Basic German Greetings',
        description: 'Learn essential German greetings and polite expressions for everyday conversations.',
        level: 'A1',
        category: 'Conversation',
        difficulty: 'Beginner',
        estimatedDuration: 20,
        learningObjectives: [
          {
            objective: 'Master basic greetings',
            description: 'Learn formal and informal German greetings'
          },
          {
            objective: 'Practice pronunciation',
            description: 'Correct pronunciation of common phrases'
          }
        ],
        prerequisites: [],
        content: {
          introduction: 'Greetings are the foundation of German conversation. Learn the most important phrases to start any interaction.',
          keyTopics: [
            'Formal greetings',
            'Informal greetings',
            'Time-specific greetings',
            'Polite responses'
          ],
          examples: [
            {
              german: 'Guten Morgen',
              english: 'Good morning',
              explanation: 'Used until about 10 AM'
            },
            {
              german: 'Hallo',
              english: 'Hello',
              explanation: 'Informal greeting, used anytime'
            },
            {
              german: 'Wie geht es Ihnen?',
              english: 'How are you? (formal)',
              explanation: 'Polite way to ask about someone\'s wellbeing'
            }
          ],
          exercises: [
            {
              type: 'multiple-choice',
              question: 'How do you say "Good evening" in German?',
              options: ['Guten Morgen', 'Guten Tag', 'Guten Abend'],
              correctAnswer: 'Guten Abend',
              explanation: 'Guten Abend is used in the evening',
              points: 1
            },
            {
              type: 'conversation',
              question: 'Respond to: "Wie geht es dir?"',
              correctAnswer: 'Gut, danke',
              explanation: 'A polite response meaning "Good, thank you"',
              points: 1
            }
          ]
        },
        aiTutorConfig: {
          personality: 'warm and patient conversation partner',
          focusAreas: ['pronunciation', 'conversation flow', 'cultural context'],
          commonMistakes: ['Mixing formal/informal', 'Wrong time greetings'],
          helpfulPhrases: ['Guten Tag', 'Hallo', 'Wie geht es dir?', 'Danke'],
          culturalNotes: ['Germans value punctuality', 'Formal vs informal address is important']
        },
        createdBy: adminUser._id,
        tags: ['beginner', 'conversation', 'greetings', 'A1']
      }
    ];

    // Insert sample modules
    for (const moduleData of sampleModules) {
      const existingModule = await LearningModule.findOne({ title: moduleData.title });
      if (!existingModule) {
        const module = new LearningModule(moduleData);
        await module.save();
        console.log(`✅ Created module: ${moduleData.title}`);
      } else {
        console.log(`⚠️ Module already exists: ${moduleData.title}`);
      }
    }

    console.log('🎉 Sample data creation completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to http://localhost:4200/signup');
    console.log('2. Create a STUDENT account');
    console.log('3. Login and go to /learning-modules');
    console.log('4. Click "Start Practice" on any module to chat with the AI bot!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createSampleData();