// scripts/create-tamil-restaurant-module.js
// Create a Restaurant Conversation module for Tamil speakers learning English

const mongoose = require('mongoose');
require('dotenv').config();

const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function createTamilRestaurantModule() {
  try {
    console.log('🍽️ Creating Restaurant Conversation module for Tamil speakers...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/german-study-buddy');
    console.log('✅ Connected to MongoDB');

    // Find any user to assign as creator (admin, teacher, or any user)
    let creatorUser = await User.findOne({ role: 'admin' });
    if (!creatorUser) {
      creatorUser = await User.findOne({ role: 'teacher' });
    }
    if (!creatorUser) {
      creatorUser = await User.findOne();
    }
    
    if (!creatorUser) {
      console.error('❌ No users found. Please create a user first.');
      process.exit(1);
    }
    
    console.log(`✅ Using user: ${creatorUser.name} (${creatorUser.role}) as creator`);

    // Restaurant Conversation Module for Tamil speakers learning English
    const tamilRestaurantModule = new LearningModule({
      title: 'Restaurant Conversation - English Practice',
      description: 'Practice ordering food in English at a restaurant. Perfect for Tamil speakers learning English. Learn essential restaurant vocabulary and polite expressions.',
      
      targetLanguage: 'English',
      nativeLanguage: 'Tamil',
      level: 'A2',
      category: 'Conversation',
      difficulty: 'Beginner',
      estimatedDuration: 25,
      
      learningObjectives: [
        { 
          objective: 'Order food and drinks in English', 
          description: 'Learn to communicate effectively with restaurant staff in English' 
        },
        { 
          objective: 'Use polite expressions and restaurant etiquette', 
          description: 'Practice please, thank you, excuse me, and other courteous phrases' 
        },
        { 
          objective: 'Ask questions about menu items', 
          description: 'Learn to ask "What do you recommend?", "How much is...?", "What\'s in this dish?"' 
        },
        { 
          objective: 'Handle payment and tipping', 
          description: 'Practice asking for the bill and understanding payment options' 
        }
      ],
      
      prerequisites: ['Basic English greetings', 'Numbers 1-100', 'Basic food vocabulary'],
      
      content: {
        introduction: 'Welcome to the English restaurant role-play! நீங்கள் ஒரு உணவகத்தில் வாடிக்கையாளராக இருக்கிறீர்கள், நான் உங்கள் பணியாளராக இருப்பேன். Let\'s practice ordering food using only the vocabulary and grammar we\'ve learned. இந்த பயிற்சியில் நீங்கள் கற்றுக்கொள்வீர்கள்: உணவு ஆர்டர் செய்வது, கேள்விகள் கேட்பது, மற்றும் பணம் செலுத்துவது.',
        
        // Role-play specific content
        rolePlayScenario: {
          situation: 'At a restaurant',
          studentRole: 'Customer (வாடிக்கையாளர்)',
          aiRole: 'Waiter/Waitress (பணியாளர்)',
          setting: 'A popular restaurant in Chennai that serves both Indian and international cuisine. It\'s lunch time and you\'re hungry!',
          objective: 'Order a complete meal (appetizer, main course, drink) and ask for the bill'
        },
        
        // Comprehensive vocabulary for Tamil speakers
        allowedVocabulary: [
          // Greetings & Politeness
          { word: 'Hello', translation: 'வணக்கம்', category: 'greetings' },
          { word: 'Good morning', translation: 'காலை வணக்கம்', category: 'greetings' },
          { word: 'Good afternoon', translation: 'மதிய வணக்கம்', category: 'greetings' },
          { word: 'Good evening', translation: 'மாலை வணக்கம்', category: 'greetings' },
          { word: 'Please', translation: 'தயவுசெய்து', category: 'politeness' },
          { word: 'Thank you', translation: 'நன்றி', category: 'politeness' },
          { word: 'Excuse me', translation: 'மன்னிக்கவும்', category: 'politeness' },
          { word: 'Sorry', translation: 'மன்னிக்கவும்', category: 'politeness' },
          
          // Restaurant basics
          { word: 'Menu', translation: 'உணவு பட்டியல்', category: 'restaurant' },
          { word: 'Table', translation: 'மேசை', category: 'restaurant' },
          { word: 'Chair', translation: 'நாற்காலி', category: 'restaurant' },
          { word: 'Order', translation: 'ஆர்டர்', category: 'restaurant' },
          { word: 'Bill', translation: 'பில்', category: 'restaurant' },
          { word: 'Receipt', translation: 'ரசீது', category: 'restaurant' },
          { word: 'Tip', translation: 'டிப்', category: 'restaurant' },
          
          // Ordering expressions
          { word: 'I would like', translation: 'எனக்கு வேண்டும்', category: 'ordering' },
          { word: 'Can I have', translation: 'எனக்கு கிடைக்குமா', category: 'ordering' },
          { word: 'I want', translation: 'எனக்கு வேண்டும்', category: 'ordering' },
          { word: 'May I have', translation: 'எனக்கு தர முடியுமா', category: 'ordering' },
          
          // Food categories
          { word: 'Appetizer', translation: 'முன்னுணவு', category: 'food' },
          { word: 'Starter', translation: 'முன்னுணவு', category: 'food' },
          { word: 'Main course', translation: 'முக்கிய உணவு', category: 'food' },
          { word: 'Dessert', translation: 'இனிப்பு', category: 'food' },
          { word: 'Soup', translation: 'சூப்', category: 'food' },
          { word: 'Salad', translation: 'சாலட்', category: 'food' },
          
          // Common foods
          { word: 'Rice', translation: 'சாதம்', category: 'food' },
          { word: 'Bread', translation: 'ரொட்டி', category: 'food' },
          { word: 'Chicken', translation: 'கோழி', category: 'food' },
          { word: 'Fish', translation: 'மீன்', category: 'food' },
          { word: 'Vegetarian', translation: 'சைவம்', category: 'food' },
          { word: 'Non-vegetarian', translation: 'அசைவம்', category: 'food' },
          { word: 'Spicy', translation: 'காரம்', category: 'food' },
          { word: 'Mild', translation: 'குறைவான காரம்', category: 'food' },
          
          // Drinks
          { word: 'Water', translation: 'தண்ணீர்', category: 'drinks' },
          { word: 'Coffee', translation: 'காபி', category: 'drinks' },
          { word: 'Tea', translation: 'டீ', category: 'drinks' },
          { word: 'Juice', translation: 'ஜூஸ்', category: 'drinks' },
          { word: 'Soft drink', translation: 'குளிர்பானம்', category: 'drinks' },
          
          // Questions
          { word: 'What', translation: 'என்ன', category: 'questions' },
          { word: 'How much', translation: 'எவ்வளவு', category: 'questions' },
          { word: 'Which', translation: 'எது', category: 'questions' },
          { word: 'Where', translation: 'எங்கே', category: 'questions' },
          
          // Useful phrases
          { word: 'Recommend', translation: 'பரிந்துரை', category: 'phrases' },
          { word: 'Popular', translation: 'பிரபலமான', category: 'phrases' },
          { word: 'Special', translation: 'சிறப்பு', category: 'phrases' },
          { word: 'Fresh', translation: 'புதிய', category: 'phrases' },
          { word: 'Delicious', translation: 'சுவையான', category: 'phrases' },
          
          // Payment
          { word: 'Cash', translation: 'பணம்', category: 'payment' },
          { word: 'Card', translation: 'கார்டு', category: 'payment' },
          { word: 'Change', translation: 'மாற்று பணம்', category: 'payment' }
        ],
        
        // Grammar structures appropriate for A2 level
        allowedGrammar: [
          {
            structure: 'Simple Present Tense',
            examples: ['I like rice', 'This tastes good', 'The food is spicy'],
            level: 'A2'
          },
          {
            structure: 'Modal Verbs (can, would, may)',
            examples: ['Can I have the menu?', 'I would like some water', 'May I order now?'],
            level: 'A2'
          },
          {
            structure: 'Question Formation',
            examples: ['What do you recommend?', 'How much is this?', 'Where is the restroom?'],
            level: 'A2'
          },
          {
            structure: 'Polite Requests',
            examples: ['Could you please...?', 'Would you mind...?', 'Excuse me, can you...?'],
            level: 'A2'
          }
        ],
        
        // Conversation flow for restaurant scenario
        conversationFlow: [
          {
            stage: 'greeting',
            aiPrompts: [
              'Good afternoon! Welcome to our restaurant!',
              'Hello! How many people are dining today?',
              'Good evening! Do you have a reservation?'
            ],
            expectedResponses: [
              'Good afternoon',
              'Hello',
              'Thank you',
              'Table for two, please',
              'No reservation'
            ],
            helpfulPhrases: [
              'Good afternoon',
              'Table for [number], please',
              'No, we don\'t have a reservation'
            ]
          },
          {
            stage: 'seating',
            aiPrompts: [
              'Please follow me to your table',
              'Here is your table. Is this okay?',
              'Would you like to sit by the window?'
            ],
            expectedResponses: [
              'Thank you',
              'This is perfect',
              'Yes, please',
              'Can we sit somewhere else?'
            ],
            helpfulPhrases: [
              'This is perfect, thank you',
              'Can we sit by the window?',
              'Do you have a quieter table?'
            ]
          },
          {
            stage: 'menu',
            aiPrompts: [
              'Here is your menu. Can I get you something to drink?',
              'Would you like to start with some appetizers?',
              'Do you need a few minutes to decide?'
            ],
            expectedResponses: [
              'Can I have water, please?',
              'I would like some coffee',
              'Yes, a few minutes please',
              'What do you recommend?'
            ],
            helpfulPhrases: [
              'Can I have the menu, please?',
              'What do you recommend?',
              'I would like...',
              'Can I have...'
            ]
          },
          {
            stage: 'ordering',
            aiPrompts: [
              'Are you ready to order?',
              'What would you like for your main course?',
              'How would you like that cooked?',
              'Would you like rice or bread with that?'
            ],
            expectedResponses: [
              'I would like the chicken curry',
              'Can I have fish and rice?',
              'What\'s in this dish?',
              'Is this spicy?',
              'I\'m vegetarian'
            ],
            helpfulPhrases: [
              'I would like...',
              'Can I have...',
              'What do you recommend?',
              'Is this dish spicy?',
              'I\'m vegetarian',
              'What\'s in this dish?'
            ]
          },
          {
            stage: 'during_meal',
            aiPrompts: [
              'How is everything?',
              'Is the food to your liking?',
              'Can I get you anything else?',
              'Would you like some dessert?'
            ],
            expectedResponses: [
              'Everything is delicious',
              'The food is very good',
              'Can I have more water?',
              'What desserts do you have?',
              'No, thank you'
            ],
            helpfulPhrases: [
              'Everything is delicious',
              'The food is very good',
              'Can I have more water, please?',
              'What desserts do you have?'
            ]
          },
          {
            stage: 'payment',
            aiPrompts: [
              'Would you like the bill?',
              'How would you like to pay?',
              'Cash or card?',
              'Here is your receipt'
            ],
            expectedResponses: [
              'Can I have the bill, please?',
              'I\'ll pay by card',
              'Cash, please',
              'Thank you'
            ],
            helpfulPhrases: [
              'Can I have the bill, please?',
              'I\'ll pay by card',
              'Cash, please',
              'Keep the change',
              'Thank you for the excellent service'
            ]
          }
        ],
        
        keyTopics: [
          'Restaurant vocabulary',
          'Ordering food and drinks',
          'Polite expressions',
          'Asking questions about menu',
          'Payment and tipping',
          'Food preferences (vegetarian, spicy level)',
          'Basic restaurant etiquette'
        ],
        
        examples: [
          {
            english: 'Can I have the menu, please?',
            german: 'தயவுசெய்து மெனு தர முடியுமா?', // Tamil translation
            explanation: 'Polite way to ask for the menu'
          },
          {
            english: 'I would like chicken curry with rice.',
            german: 'எனக்கு சாதத்துடன் கோழி கறி வேண்டும்.',
            explanation: 'How to order a main dish'
          },
          {
            english: 'What do you recommend?',
            german: 'நீங்கள் என்ன பரிந்துரைக்கிறீர்கள்?',
            explanation: 'Asking for waiter\'s recommendation'
          },
          {
            english: 'Is this dish spicy?',
            german: 'இந்த உணவு காரமானதா?',
            explanation: 'Asking about spice level'
          },
          {
            english: 'Can I have the bill, please?',
            german: 'தயவுசெய்து பில் தர முடியுமா?',
            explanation: 'Asking for the bill politely'
          }
        ],
        
        exercises: [
          {
            type: 'role-play',
            question: 'Practice the complete restaurant experience from greeting to payment',
            options: [],
            correctAnswer: 'Use allowed vocabulary and grammar structures',
            explanation: 'Stay in character as a customer and use only the provided words and structures',
            points: 10
          }
        ]
      },
      
      aiTutorConfig: {
        personality: 'friendly and patient restaurant waiter who understands Tamil culture and helps Tamil speakers learn English',
        focusAreas: [
          'Restaurant vocabulary only',
          'Polite English expressions',
          'Simple present tense and modal verbs',
          'Natural restaurant conversation flow',
          'Cultural differences in dining etiquette'
        ],
        commonMistakes: [
          'Forgetting to use "please" and "thank you"',
          'Direct translation from Tamil word order',
          'Using "I want" instead of "I would like"',
          'Confusion between "can" and "may"'
        ],
        helpfulPhrases: [
          'I would like... (எனக்கு வேண்டும்)',
          'Can I have...? (எனக்கு கிடைக்குமா?)',
          'What do you recommend? (என்ன பரிந்துரைக்கிறீர்கள்?)',
          'How much is...? (எவ்வளவு?)',
          'Excuse me... (மன்னிக்கவும்...)'
        ],
        culturalNotes: [
          'In English-speaking countries, it\'s important to say "please" and "thank you"',
          'Tipping is common in restaurants (10-15% in most countries)',
          'You can ask for recommendations from the waiter',
          'It\'s polite to wait to be seated in formal restaurants',
          'Unlike in Tamil culture, splitting the bill is common among friends'
        ]
      },
      
      createdBy: creatorUser._id,
      isActive: true,
      tags: ['role-play', 'restaurant', 'english', 'conversation', 'tamil', 'beginner', 'A2']
    });

    // Save the module
    await tamilRestaurantModule.save();
    console.log('✅ Created: Restaurant Conversation - English Practice (for Tamil speakers)');

    console.log('\n🎉 Tamil Restaurant module created successfully!');
    console.log('\n📋 Module Details:');
    console.log('- Title: Restaurant Conversation - English Practice');
    console.log('- Target Language: English');
    console.log('- Native Language: Tamil');
    console.log('- Level: A2 (Beginner)');
    console.log('- Student Role: Customer (வாடிக்கையாளர்)');
    console.log('- AI Role: Waiter/Waitress (பணியாளர்)');
    console.log('- Vocabulary: 50+ restaurant-related words with Tamil translations');
    console.log('- Grammar: Simple present, modal verbs, questions, polite requests');
    
    console.log('\n🎯 Learning Objectives:');
    console.log('1. Order food and drinks in English');
    console.log('2. Use polite expressions and restaurant etiquette');
    console.log('3. Ask questions about menu items');
    console.log('4. Handle payment and tipping');
    
    console.log('\n🚀 Test it:');
    console.log('1. Go to: http://localhost:4200/learning-modules');
    console.log('2. Find: "Restaurant Conversation - English Practice"');
    console.log('3. Start the role-play session');
    console.log('4. Try saying: "Hello, can I have the menu please?"');
    console.log('5. Practice ordering: "I would like chicken curry with rice"');
    
    console.log('\n💡 Tamil Phrases to Try:');
    console.log('- "வணக்கம்" → "Hello"');
    console.log('- "எனக்கு வேண்டும்" → "I would like"');
    console.log('- "எவ்வளவு?" → "How much?"');
    console.log('- "நன்றி" → "Thank you"');

  } catch (error) {
    console.error('❌ Error creating Tamil restaurant module:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createTamilRestaurantModule();
}

module.exports = createTamilRestaurantModule;