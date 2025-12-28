#!/usr/bin/env node

/**
 * Create Higher Level Modules
 * 
 * This script creates B1, B2, and C1 level modules to better test
 * the level-based access control system.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function createHigherLevelModules() {
  try {
    console.log('📚 Creating Higher Level Modules...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a teacher to assign as creator
    const teacher = await User.findOne({ role: 'TEACHER' });
    if (!teacher) {
      console.log('❌ No teacher found');
      return;
    }

    console.log('👨‍🏫 Using teacher:', teacher.name);

    // B1 Level Modules
    const b1Modules = [
      {
        title: 'Advanced Restaurant Conversations - B1',
        description: 'Complex restaurant scenarios including complaints, special requests, and detailed discussions about food preferences.',
        targetLanguage: 'English',
        nativeLanguage: 'German',
        level: 'B1',
        category: 'Conversation',
        difficulty: 'Intermediate',
        estimatedDuration: 45,
        learningObjectives: [
          {
            objective: 'Handle complex restaurant situations',
            description: 'Learn to make complaints, special requests, and detailed food discussions'
          }
        ],
        content: {
          introduction: 'Advanced restaurant conversations for intermediate learners',
          keyTopics: ['complaints', 'special requests', 'food preferences'],
          allowedVocabulary: [
            { word: 'complaint', translation: 'Beschwerde', category: 'restaurant' },
            { word: 'allergic', translation: 'allergisch', category: 'health' },
            { word: 'recommendation', translation: 'Empfehlung', category: 'restaurant' }
          ],
          examples: [],
          exercises: [
            {
              type: 'conversation',
              question: 'How would you complain about cold food?',
              correctAnswer: 'Excuse me, my food is cold. Could you please warm it up?',
              explanation: 'Polite complaint with solution request',
              points: 2
            }
          ]
        },
        aiTutorConfig: {
          personality: 'patient intermediate-level English tutor',
          focusAreas: ['complex conversations', 'polite complaints'],
          helpfulPhrases: ['I would like to...', 'Could you please...'],
          commonMistakes: ['too direct complaints'],
          culturalNotes: ['politeness in complaints']
        },
        tags: ['B1', 'intermediate', 'restaurant', 'complaints'],
        createdBy: teacher._id,
        isActive: true
      },
      {
        title: 'Business English Basics - B1',
        description: 'Introduction to business English including meetings, emails, and professional conversations.',
        targetLanguage: 'English',
        nativeLanguage: 'German',
        level: 'B1',
        category: 'Vocabulary',
        difficulty: 'Intermediate',
        estimatedDuration: 50,
        learningObjectives: [
          {
            objective: 'Learn business vocabulary',
            description: 'Master essential business English terms and phrases'
          }
        ],
        content: {
          introduction: 'Essential business English for intermediate learners',
          keyTopics: ['meetings', 'emails', 'presentations'],
          allowedVocabulary: [
            { word: 'agenda', translation: 'Tagesordnung', category: 'business' },
            { word: 'deadline', translation: 'Frist', category: 'business' },
            { word: 'presentation', translation: 'Präsentation', category: 'business' }
          ],
          examples: [],
          exercises: [
            {
              type: 'multiple-choice',
              question: 'What do you call a list of topics for a meeting?',
              options: ['Agenda', 'Schedule', 'Calendar', 'Timeline'],
              correctAnswer: 'Agenda',
              explanation: 'An agenda lists the topics to be discussed in a meeting',
              points: 1
            }
          ]
        },
        aiTutorConfig: {
          personality: 'professional business English tutor',
          focusAreas: ['business vocabulary', 'formal language'],
          helpfulPhrases: ['I would like to propose...', 'According to the agenda...'],
          commonMistakes: ['informal language in business'],
          culturalNotes: ['business etiquette']
        },
        tags: ['B1', 'business', 'professional', 'vocabulary'],
        createdBy: teacher._id,
        isActive: true
      }
    ];

    // B2 Level Modules
    const b2Modules = [
      {
        title: 'Advanced Grammar Structures - B2',
        description: 'Complex grammar including subjunctive mood, advanced conditionals, and sophisticated sentence structures.',
        targetLanguage: 'English',
        nativeLanguage: 'German',
        level: 'B2',
        category: 'Grammar',
        difficulty: 'Advanced',
        estimatedDuration: 60,
        learningObjectives: [
          {
            objective: 'Master advanced grammar',
            description: 'Learn complex grammatical structures for fluent communication'
          }
        ],
        content: {
          introduction: 'Advanced grammar for upper-intermediate learners',
          keyTopics: ['subjunctive', 'conditionals', 'complex sentences'],
          allowedVocabulary: [
            { word: 'subjunctive', translation: 'Konjunktiv', category: 'grammar' },
            { word: 'conditional', translation: 'Bedingungssatz', category: 'grammar' }
          ],
          examples: [],
          exercises: [
            {
              type: 'fill-blank',
              question: 'If I _____ rich, I would travel the world.',
              correctAnswer: 'were',
              explanation: 'Subjunctive mood in unreal conditional sentences',
              points: 2
            }
          ]
        },
        aiTutorConfig: {
          personality: 'expert grammar tutor for advanced students',
          focusAreas: ['complex grammar', 'nuanced language'],
          helpfulPhrases: ['If I were...', 'Had I known...'],
          commonMistakes: ['mixing conditional types'],
          culturalNotes: ['formal vs informal usage']
        },
        tags: ['B2', 'advanced', 'grammar', 'conditionals'],
        createdBy: teacher._id,
        isActive: true
      }
    ];

    // C1 Level Module
    const c1Modules = [
      {
        title: 'Academic Writing and Research - C1',
        description: 'Advanced academic writing skills including research papers, citations, and scholarly discourse.',
        targetLanguage: 'English',
        nativeLanguage: 'German',
        level: 'C1',
        category: 'Writing',
        difficulty: 'Advanced',
        estimatedDuration: 90,
        learningObjectives: [
          {
            objective: 'Master academic writing',
            description: 'Develop skills for scholarly writing and research'
          }
        ],
        content: {
          introduction: 'Advanced academic writing for proficient learners',
          keyTopics: ['research', 'citations', 'academic style'],
          allowedVocabulary: [
            { word: 'methodology', translation: 'Methodik', category: 'academic' },
            { word: 'hypothesis', translation: 'Hypothese', category: 'academic' },
            { word: 'bibliography', translation: 'Bibliographie', category: 'academic' }
          ],
          examples: [],
          exercises: [
            {
              type: 'essay',
              question: 'Write a thesis statement for a research paper on climate change.',
              correctAnswer: 'Sample thesis statement about climate change impacts',
              explanation: 'A strong thesis statement presents a clear argument',
              points: 5
            }
          ]
        },
        aiTutorConfig: {
          personality: 'scholarly academic writing mentor',
          focusAreas: ['academic style', 'research skills'],
          helpfulPhrases: ['According to research...', 'The evidence suggests...'],
          commonMistakes: ['informal tone in academic writing'],
          culturalNotes: ['academic conventions']
        },
        tags: ['C1', 'academic', 'writing', 'research'],
        createdBy: teacher._id,
        isActive: true
      }
    ];

    // Create all modules
    const allModules = [...b1Modules, ...b2Modules, ...c1Modules];
    
    console.log(`📝 Creating ${allModules.length} higher-level modules...\n`);

    for (const moduleData of allModules) {
      const module = new LearningModule(moduleData);
      await module.save();
      console.log(`✅ Created: "${module.title}" (${module.level})`);
    }

    console.log('\n📊 Module Creation Summary:');
    console.log(`   B1 Modules: ${b1Modules.length}`);
    console.log(`   B2 Modules: ${b2Modules.length}`);
    console.log(`   C1 Modules: ${c1Modules.length}`);
    console.log(`   Total Created: ${allModules.length}`);

    // Verify total modules by level
    const modulesByLevel = await LearningModule.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📚 Total Active Modules by Level:');
    modulesByLevel.forEach(level => {
      console.log(`   ${level._id}: ${level.count} modules`);
    });

    console.log('\n🎯 Perfect for Testing Level Access Control:');
    console.log('✅ A1 students: Can access A1 modules only');
    console.log('✅ A2 students: Can access A1 + A2 modules');
    console.log('✅ B1 students: Can access A1 + A2 + B1 modules');
    console.log('✅ B2 students: Can access A1 + A2 + B1 + B2 modules');
    console.log('✅ C1+ students: Can access all modules');

    console.log('\n🚀 Ready for comprehensive level access testing!');

  } catch (error) {
    console.error('❌ Error creating higher level modules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the creation
createHigherLevelModules();