// scripts/create-roleplay-sample.js
// Create a sample role-play module to demonstrate the constrained AI system

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createRolePlaySample() {
  try {
    console.log('🎭 Creating sample role-play module...');

    // Find a teacher to assign as creator
    const teacher = await User.findOne({ role: 'TEACHER' });
    if (!teacher) {
      console.error('❌ No teacher found. Please create a teacher first.');
      return;
    }

    // Sample Role-Play Module: Restaurant Conversation
    const restaurantRolePlay = new LearningModule({
      title: "Restaurant Conversation - Ordering Food",
      description: "Practice ordering food at a restaurant. You are a customer, and the AI is your waiter. Use only the provided vocabulary and grammar structures.",
      targetLanguage: "English",
      nativeLanguage: "German",
      level: "A2",
      category: "Conversation",
      difficulty: "Beginner",
      estimatedDuration: 15,
      
      learningObjectives: [
        {
          objective: "Order food and drinks in English",
          description: "Practice using restaurant vocabulary and polite expressions"
        },
        {
          objective: "Ask questions about menu items",
          description: "Learn to inquire about ingredients, prices, and recommendations"
        },
        {
          objective: "Handle the bill and payment",
          description: "Practice asking for the check and discussing payment"
        }
      ],
      
      prerequisites: ["Basic English greetings", "Numbers 1-100"],
      
      content: {
        introduction: "Welcome to the restaurant role-play! You are a customer at a nice restaurant, and I will be your waiter. Let's practice ordering food using only the vocabulary and grammar we've learned.",
        
        // Role-play specific content
        rolePlayScenario: {
          situation: "At a restaurant",
          studentRole: "Customer",
          aiRole: "Waiter",
          setting: "A cozy restaurant in downtown. It's dinner time and you're hungry!",
          objective: "Order a complete meal (appetizer, main course, drink) and ask for the bill"
        },
        
        // Vocabulary constraints - ONLY these words allowed
        allowedVocabulary: [
          { word: "Hello", translation: "Hallo", category: "greetings" },
          { word: "Good evening", translation: "Guten Abend", category: "greetings" },
          { word: "Thank you", translation: "Danke", category: "politeness" },
          { word: "Please", translation: "Bitte", category: "politeness" },
          { word: "Excuse me", translation: "Entschuldigung", category: "politeness" },
          { word: "Menu", translation: "Speisekarte", category: "restaurant" },
          { word: "Order", translation: "Bestellen", category: "restaurant" },
          { word: "I would like", translation: "Ich möchte", category: "ordering" },
          { word: "Can I have", translation: "Kann ich haben", category: "ordering" },
          { word: "What do you recommend", translation: "Was empfehlen Sie", category: "asking" },
          { word: "How much", translation: "Wie viel", category: "asking" },
          { word: "Bill", translation: "Rechnung", category: "payment" },
          { word: "Check", translation: "Rechnung", category: "payment" },
          { word: "Water", translation: "Wasser", category: "drinks" },
          { word: "Coffee", translation: "Kaffee", category: "drinks" },
          { word: "Tea", translation: "Tee", category: "drinks" },
          { word: "Juice", translation: "Saft", category: "drinks" },
          { word: "Soup", translation: "Suppe", category: "food" },
          { word: "Salad", translation: "Salat", category: "food" },
          { word: "Chicken", translation: "Hähnchen", category: "food" },
          { word: "Fish", translation: "Fisch", category: "food" },
          { word: "Pasta", translation: "Nudeln", category: "food" },
          { word: "Pizza", translation: "Pizza", category: "food" },
          { word: "Bread", translation: "Brot", category: "food" },
          { word: "Delicious", translation: "Lecker", category: "adjectives" },
          { word: "Hot", translation: "Heiß", category: "adjectives" },
          { word: "Cold", translation: "Kalt", category: "adjectives" },
          { word: "Ready", translation: "Fertig", category: "adjectives" }
        ],
        
        // Grammar constraints - ONLY these structures allowed
        allowedGrammar: [
          {
            structure: "Simple present tense",
            examples: ["I want pizza", "The soup is hot", "This tastes good"],
            level: "A2"
          },
          {
            structure: "Modal verbs (can, would)",
            examples: ["Can I have water?", "I would like chicken", "Would you recommend the fish?"],
            level: "A2"
          },
          {
            structure: "Questions with 'What' and 'How'",
            examples: ["What do you recommend?", "How much is the pizza?", "What's in the salad?"],
            level: "A2"
          },
          {
            structure: "Polite expressions",
            examples: ["Please bring me...", "Thank you very much", "Excuse me, waiter"],
            level: "A2"
          }
        ],
        
        // Optional conversation flow
        conversationFlow: [
          {
            stage: "greeting",
            aiPrompts: ["Good evening! Welcome to our restaurant!", "Hello! Do you have a reservation?"],
            expectedResponses: ["Good evening", "Hello", "Thank you"],
            helpfulPhrases: ["Good evening", "Hello"]
          },
          {
            stage: "seating",
            aiPrompts: ["Right this way, please", "Here's your table", "Can I bring you the menu?"],
            expectedResponses: ["Thank you", "Yes, please"],
            helpfulPhrases: ["Thank you", "Yes, please"]
          },
          {
            stage: "ordering_drinks",
            aiPrompts: ["What would you like to drink?", "Can I start you with something to drink?"],
            expectedResponses: ["I would like water", "Can I have coffee?", "What do you recommend?"],
            helpfulPhrases: ["I would like", "Can I have"]
          },
          {
            stage: "ordering_food",
            aiPrompts: ["Are you ready to order?", "What would you like to eat?", "Do you need more time?"],
            expectedResponses: ["I would like chicken", "Can I have the pasta?", "What do you recommend?"],
            helpfulPhrases: ["I would like", "Can I have", "What do you recommend"]
          },
          {
            stage: "during_meal",
            aiPrompts: ["How is everything?", "Is the food good?", "Do you need anything else?"],
            expectedResponses: ["It's delicious", "Very good", "Can I have more water?"],
            helpfulPhrases: ["Delicious", "Very good", "Can I have"]
          },
          {
            stage: "payment",
            aiPrompts: ["Would you like the check?", "How would you like to pay?"],
            expectedResponses: ["Yes, please", "Can I have the bill?", "How much is it?"],
            helpfulPhrases: ["Can I have the bill", "How much"]
          }
        ],
        
        keyTopics: ["Restaurant vocabulary", "Ordering food", "Polite expressions"],
        examples: [
          {
            german: "Ich möchte bitte die Speisekarte.",
            english: "I would like the menu, please.",
            explanation: "Polite way to ask for the menu using 'I would like' + 'please'"
          },
          {
            german: "Können Sie mir das Hähnchen empfehlen?",
            english: "Can you recommend the chicken?",
            explanation: "Using 'Can you recommend' to ask for suggestions"
          },
          {
            german: "Die Rechnung, bitte.",
            english: "The bill, please.",
            explanation: "Simple way to ask for the check"
          }
        ],
        
        exercises: [
          {
            type: "role-play",
            question: "Practice ordering at a restaurant",
            correctAnswer: "Use allowed vocabulary and grammar",
            explanation: "Stay in character and use only the provided words and structures",
            points: 5
          }
        ]
      },
      
      aiTutorConfig: {
        personality: "friendly restaurant waiter who is patient with customers learning English",
        focusAreas: [
          "Restaurant vocabulary only",
          "Polite ordering expressions",
          "Simple present and modal verbs",
          "Natural restaurant conversation flow"
        ],
        commonMistakes: [
          "Using vocabulary outside the allowed list",
          "Complex grammar structures",
          "Forgetting polite expressions"
        ],
        helpfulPhrases: [
          "I would like...",
          "Can I have...?",
          "What do you recommend?",
          "How much is...?",
          "The bill, please"
        ],
        culturalNotes: [
          "In English-speaking countries, it's polite to say 'please' and 'thank you'",
          "Tipping is common in restaurants (15-20%)",
          "You can ask for recommendations from the waiter"
        ]
      },
      
      createdBy: teacher._id,
      tags: ["A2", "role-play", "restaurant", "conversation", "constrained", "vocabulary"],
      isActive: true
    });

    // Save the module
    await restaurantRolePlay.save();
    console.log('✅ Created: Restaurant Role-Play Module');

    console.log('\n🎉 Role-play module created successfully!');
    console.log('\n📋 Module Details:');
    console.log('- Title: Restaurant Conversation - Ordering Food');
    console.log('- Target Language: English');
    console.log('- Student Role: Customer');
    console.log('- AI Role: Waiter');
    console.log('- Vocabulary: 28 allowed words only');
    console.log('- Grammar: 4 specific structures only');
    console.log('- Conversation Flow: 6 stages defined');
    
    console.log('\n🎭 How it works:');
    console.log('1. Student plays customer, AI plays waiter');
    console.log('2. AI can ONLY use the 28 allowed vocabulary words');
    console.log('3. AI focuses ONLY on the 4 allowed grammar structures');
    console.log('4. Conversation follows the restaurant scenario');
    console.log('5. AI stays in character as a waiter throughout');
    
    console.log('\n🚀 Test it:');
    console.log('1. Go to: http://localhost:4200/learning-modules');
    console.log('2. Find: "Restaurant Conversation - Ordering Food"');
    console.log('3. Start the role-play session');
    console.log('4. Try saying: "Hello, can I have the menu?"');
    console.log('5. AI will respond as a waiter using only allowed vocabulary!');

  } catch (error) {
    console.error('❌ Error creating role-play module:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
if (require.main === module) {
  createRolePlaySample();
}

module.exports = createRolePlaySample;