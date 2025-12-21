// scripts/create-restaurant-modules.js
// Create two restaurant role-play modules: English practice and German practice

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function createRestaurantModules() {
  try {
    console.log('🍽️ Creating restaurant role-play modules...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find admin user to set as creator
    const adminUser = await User.findOne({ role: 'ADMIN' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please create admin user first.');
    }
    
    // Module 1: English Practice (for German speakers)
    const englishModule = new LearningModule({
      title: 'Restaurant Conversation - English Practice',
      description: 'Practice ordering food in English at a restaurant. Perfect for German speakers learning English.',
      targetLanguage: 'English',
      nativeLanguage: 'German',
      level: 'A2',
      category: 'Conversation',
      difficulty: 'Intermediate',
      estimatedDuration: 20,
      
      learningObjectives: [
        { objective: 'Order food and drinks in English', description: 'Learn to communicate with restaurant staff' },
        { objective: 'Use polite expressions', description: 'Practice please, thank you, excuse me' },
        { objective: 'Ask questions about menu items', description: 'What do you recommend? How much is...?' },
        { objective: 'Handle the bill', description: 'Ask for and pay the check' }
      ],
      
      prerequisites: ['Basic English greetings', 'Numbers 1-100'],
      
      content: {
        introduction: 'Welcome to the English restaurant role-play! You are a customer at a nice restaurant, and I will be your waiter. Let\'s practice ordering food using only the vocabulary and grammar we\'ve learned.',
        
        // Role-play specific content
        rolePlayScenario: {
          situation: 'At a restaurant',
          studentRole: 'Customer',
          aiRole: 'Waiter',
          setting: 'A cozy restaurant in London. It\'s dinner time and you\'re hungry!',
          objective: 'Order a complete meal (appetizer, main course, drink) and ask for the bill'
        },
        
        // Vocabulary constraints - ONLY these words allowed
        allowedVocabulary: [
          { word: 'Hello', translation: 'Hallo', category: 'greetings' },
          { word: 'Good evening', translation: 'Guten Abend', category: 'greetings' },
          { word: 'Thank you', translation: 'Danke', category: 'politeness' },
          { word: 'Please', translation: 'Bitte', category: 'politeness' },
          { word: 'Excuse me', translation: 'Entschuldigung', category: 'politeness' },
          { word: 'Menu', translation: 'Speisekarte', category: 'restaurant' },
          { word: 'Order', translation: 'Bestellen', category: 'restaurant' },
          { word: 'I would like', translation: 'Ich möchte', category: 'ordering' },
          { word: 'Can I have', translation: 'Kann ich haben', category: 'ordering' },
          { word: 'What do you recommend', translation: 'Was empfehlen Sie', category: 'asking' },
          { word: 'How much', translation: 'Wie viel', category: 'asking' },
          { word: 'Bill', translation: 'Rechnung', category: 'payment' },
          { word: 'Check', translation: 'Rechnung', category: 'payment' },
          { word: 'Water', translation: 'Wasser', category: 'drinks' },
          { word: 'Coffee', translation: 'Kaffee', category: 'drinks' },
          { word: 'Tea', translation: 'Tee', category: 'drinks' },
          { word: 'Juice', translation: 'Saft', category: 'drinks' },
          { word: 'Soup', translation: 'Suppe', category: 'food' },
          { word: 'Salad', translation: 'Salat', category: 'food' },
          { word: 'Chicken', translation: 'Hähnchen', category: 'food' },
          { word: 'Fish', translation: 'Fisch', category: 'food' },
          { word: 'Pasta', translation: 'Nudeln', category: 'food' },
          { word: 'Pizza', translation: 'Pizza', category: 'food' },
          { word: 'Bread', translation: 'Brot', category: 'food' },
          { word: 'Delicious', translation: 'Lecker', category: 'adjectives' },
          { word: 'Hot', translation: 'Heiß', category: 'adjectives' },
          { word: 'Cold', translation: 'Kalt', category: 'adjectives' },
          { word: 'Ready', translation: 'Fertig', category: 'adjectives' }
        ],
        
        // Grammar constraints - ONLY these structures allowed
        allowedGrammar: [
          {
            structure: 'Simple present tense',
            examples: ['I want pizza', 'The soup is hot', 'This tastes good'],
            level: 'A2'
          },
          {
            structure: 'Modal verbs (can, would)',
            examples: ['Can I have water?', 'I would like chicken', 'Would you recommend the fish?'],
            level: 'A2'
          },
          {
            structure: 'Questions with What and How',
            examples: ['What do you recommend?', 'How much is the pizza?', 'What\'s in the salad?'],
            level: 'A2'
          },
          {
            structure: 'Polite expressions',
            examples: ['Please bring me...', 'Thank you very much', 'Excuse me, waiter'],
            level: 'A2'
          }
        ],
        
        // Conversation flow
        conversationFlow: [
          {
            stage: 'greeting',
            aiPrompts: ['Good evening! Welcome to our restaurant!', 'Hello! Do you have a reservation?'],
            expectedResponses: ['Good evening', 'Hello', 'Thank you'],
            helpfulPhrases: ['Good evening', 'Hello']
          },
          {
            stage: 'ordering_drinks',
            aiPrompts: ['What would you like to drink?', 'Can I start you with something to drink?'],
            expectedResponses: ['I would like water', 'Can I have coffee?', 'What do you recommend?'],
            helpfulPhrases: ['I would like', 'Can I have']
          },
          {
            stage: 'ordering_food',
            aiPrompts: ['Are you ready to order?', 'What would you like to eat?'],
            expectedResponses: ['I would like chicken', 'Can I have the pasta?', 'What do you recommend?'],
            helpfulPhrases: ['I would like', 'Can I have', 'What do you recommend']
          },
          {
            stage: 'payment',
            aiPrompts: ['How was everything?', 'Would you like the bill?'],
            expectedResponses: ['Delicious, thank you', 'Can I have the bill?', 'How much is it?'],
            helpfulPhrases: ['Can I have the bill', 'How much']
          }
        ]
      },
      
      // AI Tutor Configuration
      aiTutorConfig: {
        personality: 'friendly and patient English tutor',
        focusAreas: ['Restaurant vocabulary', 'Polite expressions', 'Ordering food', 'Basic conversation'],
        commonMistakes: ['Forgetting please/thank you', 'Wrong word order in questions'],
        helpfulPhrases: ['I would like...', 'Can I have...?', 'What do you recommend?', 'How much is...?'],
        culturalNotes: ['British vs American English differences', 'Tipping culture', 'Restaurant etiquette']
      },
      
      createdBy: adminUser._id,
      isActive: true,
      tags: ['role-play', 'restaurant', 'english', 'conversation', 'beginner']
    });
    
    // Module 2: German Practice (for English speakers)
    const germanModule = new LearningModule({
      title: 'Restaurant Conversation - German Practice',
      description: 'Practice ordering food in German at a restaurant. Perfect for English speakers learning German.',
      targetLanguage: 'German',
      nativeLanguage: 'English',
      level: 'A2',
      category: 'Conversation',
      difficulty: 'Intermediate',
      estimatedDuration: 20,
      
      learningObjectives: [
        { objective: 'Order food and drinks in German', description: 'Learn to communicate with German restaurant staff' },
        { objective: 'Use polite German expressions', description: 'Practice bitte, danke, entschuldigung' },
        { objective: 'Ask questions about menu items', description: 'Was empfehlen Sie? Wie viel kostet...?' },
        { objective: 'Handle the bill in German', description: 'Ask for and pay the Rechnung' }
      ],
      
      prerequisites: ['Basic German greetings', 'Numbers 1-100', 'Basic German articles'],
      
      content: {
        introduction: 'Willkommen zum deutschen Restaurant-Rollenspiel! You are a customer at a nice German restaurant, and I will be your waiter. Let\'s practice ordering food in German using only the vocabulary and grammar we\'ve learned.',
        
        // Role-play specific content
        rolePlayScenario: {
          situation: 'In einem deutschen Restaurant',
          studentRole: 'Kunde/Kundin (Customer)',
          aiRole: 'Kellner/Kellnerin (Waiter)',
          setting: 'Ein gemütliches Restaurant in Berlin. Es ist Abendessenszeit und Sie haben Hunger!',
          objective: 'Order a complete meal (Vorspeise, Hauptgang, Getränk) and ask for the bill (Rechnung)'
        },
        
        // German vocabulary constraints
        allowedVocabulary: [
          { word: 'Hallo', translation: 'Hello', category: 'greetings' },
          { word: 'Guten Abend', translation: 'Good evening', category: 'greetings' },
          { word: 'Danke', translation: 'Thank you', category: 'politeness' },
          { word: 'Bitte', translation: 'Please/You\'re welcome', category: 'politeness' },
          { word: 'Entschuldigung', translation: 'Excuse me', category: 'politeness' },
          { word: 'Speisekarte', translation: 'Menu', category: 'restaurant' },
          { word: 'bestellen', translation: 'to order', category: 'restaurant' },
          { word: 'Ich möchte', translation: 'I would like', category: 'ordering' },
          { word: 'Kann ich haben', translation: 'Can I have', category: 'ordering' },
          { word: 'Was empfehlen Sie', translation: 'What do you recommend', category: 'asking' },
          { word: 'Wie viel kostet', translation: 'How much costs', category: 'asking' },
          { word: 'Rechnung', translation: 'Bill', category: 'payment' },
          { word: 'bezahlen', translation: 'to pay', category: 'payment' },
          { word: 'Wasser', translation: 'Water', category: 'drinks' },
          { word: 'Kaffee', translation: 'Coffee', category: 'drinks' },
          { word: 'Tee', translation: 'Tea', category: 'drinks' },
          { word: 'Saft', translation: 'Juice', category: 'drinks' },
          { word: 'Suppe', translation: 'Soup', category: 'food' },
          { word: 'Salat', translation: 'Salad', category: 'food' },
          { word: 'Hähnchen', translation: 'Chicken', category: 'food' },
          { word: 'Fisch', translation: 'Fish', category: 'food' },
          { word: 'Nudeln', translation: 'Pasta', category: 'food' },
          { word: 'Pizza', translation: 'Pizza', category: 'food' },
          { word: 'Brot', translation: 'Bread', category: 'food' },
          { word: 'lecker', translation: 'delicious', category: 'adjectives' },
          { word: 'heiß', translation: 'hot', category: 'adjectives' },
          { word: 'kalt', translation: 'cold', category: 'adjectives' },
          { word: 'fertig', translation: 'ready', category: 'adjectives' }
        ],
        
        // German grammar constraints
        allowedGrammar: [
          {
            structure: 'Present tense verbs',
            examples: ['Ich möchte Pizza', 'Die Suppe ist heiß', 'Das schmeckt gut'],
            level: 'A2'
          },
          {
            structure: 'Modal verbs (können, möchten)',
            examples: ['Kann ich Wasser haben?', 'Ich möchte Hähnchen', 'Können Sie den Fisch empfehlen?'],
            level: 'A2'
          },
          {
            structure: 'Questions with Was and Wie',
            examples: ['Was empfehlen Sie?', 'Wie viel kostet die Pizza?', 'Was ist im Salat?'],
            level: 'A2'
          },
          {
            structure: 'Polite expressions',
            examples: ['Bringen Sie mir bitte...', 'Vielen Dank', 'Entschuldigung, Herr Ober'],
            level: 'A2'
          }
        ],
        
        // German conversation flow
        conversationFlow: [
          {
            stage: 'Begrüßung',
            aiPrompts: ['Guten Abend! Willkommen in unserem Restaurant!', 'Hallo! Haben Sie reserviert?'],
            expectedResponses: ['Guten Abend', 'Hallo', 'Danke'],
            helpfulPhrases: ['Guten Abend', 'Hallo']
          },
          {
            stage: 'Getränke bestellen',
            aiPrompts: ['Was möchten Sie trinken?', 'Kann ich Ihnen etwas zu trinken bringen?'],
            expectedResponses: ['Ich möchte Wasser', 'Kann ich Kaffee haben?', 'Was empfehlen Sie?'],
            helpfulPhrases: ['Ich möchte', 'Kann ich haben']
          },
          {
            stage: 'Essen bestellen',
            aiPrompts: ['Sind Sie bereit zu bestellen?', 'Was möchten Sie essen?'],
            expectedResponses: ['Ich möchte Hähnchen', 'Kann ich die Nudeln haben?', 'Was empfehlen Sie?'],
            helpfulPhrases: ['Ich möchte', 'Kann ich haben', 'Was empfehlen Sie']
          },
          {
            stage: 'Bezahlen',
            aiPrompts: ['Wie war alles?', 'Möchten Sie die Rechnung?'],
            expectedResponses: ['Lecker, danke', 'Kann ich die Rechnung haben?', 'Wie viel kostet es?'],
            helpfulPhrases: ['Kann ich die Rechnung haben', 'Wie viel kostet']
          }
        ]
      },
      
      // AI Tutor Configuration for German
      aiTutorConfig: {
        personality: 'friendly and patient German tutor',
        focusAreas: ['Restaurant vocabulary', 'German politeness', 'Ordering food', 'Basic German conversation'],
        commonMistakes: ['Forgetting articles (der/die/das)', 'Wrong verb position', 'Formal vs informal address'],
        helpfulPhrases: ['Ich möchte...', 'Kann ich... haben?', 'Was empfehlen Sie?', 'Wie viel kostet...?'],
        culturalNotes: ['German dining etiquette', 'Tipping in Germany', 'Formal address in restaurants']
      },
      
      createdBy: adminUser._id,
      isActive: true,
      tags: ['role-play', 'restaurant', 'german', 'conversation', 'beginner']
    });
    
    // Save both modules
    await englishModule.save();
    console.log('✅ Created: English Restaurant Practice Module');
    
    await germanModule.save();
    console.log('✅ Created: German Restaurant Practice Module');
    
    console.log('🎉 Restaurant modules created successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- English Practice: For German speakers learning English');
    console.log('- German Practice: For English speakers learning German');
    console.log('- Both modules: Restaurant scenario, Customer vs Waiter');
    console.log('- Same vocabulary constraints but in different languages');
    console.log('- Perfect for testing speech recognition in both languages');
    console.log('');
    console.log('🚀 Ready to test at: http://localhost:4200/learning-modules');
    
  } catch (error) {
    console.error('❌ Error creating restaurant modules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the creation
createRestaurantModules();