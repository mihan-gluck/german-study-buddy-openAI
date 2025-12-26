// Create a German module directly in database to test German content handling
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function createGermanModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the teacher
    const teacher = await User.findOne({ regNo: 'TEA001' });
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }
    
    console.log('👤 Creating module for teacher:', teacher.name);

    // Create a module entirely in German
    const germanModule = new LearningModule({
      title: "Deutsche Begrüßungen und Höflichkeit",
      description: "Lernen Sie grundlegende deutsche Begrüßungen und höfliche Ausdrücke für den Alltag. Perfekt für Anfänger.",
      
      targetLanguage: "German",
      nativeLanguage: "English", 
      level: "A1",
      category: "Conversation", // Changed from "Greetings" to valid enum value
      difficulty: "Beginner", // Added required field
      estimatedDuration: 30,
      
      content: {
        learningObjectives: [
          "Deutsche Begrüßungen verstehen und verwenden",
          "Höfliche Ausdrücke im Alltag anwenden", 
          "Sich auf Deutsch vorstellen können"
        ],
        
        vocabulary: [
          {
            german: "Guten Morgen",
            english: "Good morning",
            pronunciation: "GOO-ten MOR-gen",
            example: "Guten Morgen, Herr Schmidt!"
          },
          {
            german: "Wie geht es Ihnen?",
            english: "How are you? (formal)",
            pronunciation: "vee gayt es EE-nen", 
            example: "Wie geht es Ihnen heute?"
          },
          {
            german: "Danke schön",
            english: "Thank you very much",
            pronunciation: "DAN-ke shern",
            example: "Danke schön für Ihre Hilfe!"
          },
          {
            german: "Entschuldigung", 
            english: "Excuse me / Sorry",
            pronunciation: "ent-SHUL-di-gung",
            example: "Entschuldigung, wo ist der Bahnhof?"
          }
        ],
        
        exercises: [
          {
            type: "multiple-choice",
            question: "Wie sagt man 'Good morning' auf Deutsch?",
            options: ["Guten Tag", "Guten Morgen", "Guten Abend", "Hallo"],
            correctAnswer: "Guten Morgen",
            explanation: "'Guten Morgen' ist die korrekte deutsche Übersetzung für 'Good morning'."
          },
          {
            type: "translation", 
            question: "Übersetzen Sie ins Deutsche: 'How are you?'",
            correctAnswer: "Wie geht es Ihnen?",
            explanation: "Die höfliche Form von 'How are you?' ist 'Wie geht es Ihnen?' auf Deutsch."
          }
        ],
        
        rolePlayScenario: {
          situation: "Erste Begegnung in einem deutschen Büro",
          setting: "Sie treffen einen neuen Kollegen im Büro",
          studentRole: "Neuer Mitarbeiter", 
          aiRole: "Deutscher Kollege",
          objective: "Sich höflich vorstellen und ein kurzes Gespräch führen",
          conversationFlow: [
            "Begrüßung austauschen",
            "Sich vorstellen", 
            "Höfliche Fragen stellen",
            "Verabschiedung"
          ]
        }
      },
      
      aiTutorConfig: {
        personality: "freundlicher und geduldiger deutscher Sprachlehrer",
        focusAreas: ["Deutsche Aussprache", "Höflichkeitsformen", "Grundwortschatz"],
        helpfulPhrases: [
          "Können Sie das bitte wiederholen?",
          "Wie spricht man das aus?", 
          "Was bedeutet das auf Englisch?"
        ]
      },
      
      createdBy: teacher._id,
      isActive: true,
      tags: ["Deutsch", "Begrüßungen", "Höflichkeit", "Anfänger", "A1"]
    });

    await germanModule.save();
    
    console.log('✅ German module created successfully!');
    console.log('📋 Module details:', {
      id: germanModule._id,
      title: germanModule.title,
      description: germanModule.description,
      targetLanguage: germanModule.targetLanguage,
      vocabularyCount: germanModule.content?.vocabulary?.length || 0,
      exerciseCount: germanModule.content?.exercises?.length || 0,
      hasRolePlay: !!germanModule.content?.rolePlayScenario,
      tags: germanModule.tags || []
    });
    
    console.log('\n🔍 Content analysis:');
    console.log('- Title in German:', germanModule.title);
    console.log('- Description in German:', germanModule.description);
    console.log('- Learning objectives in German:', germanModule.content.learningObjectives);
    console.log('- Exercise questions in German:', germanModule.content.exercises.map(ex => ex.question));
    console.log('- Role-play scenario in German:', germanModule.content.rolePlayScenario.situation);
    console.log('- AI tutor personality in German:', germanModule.aiTutorConfig.personality);
    console.log('- Tags in German:', germanModule.tags);
    
    console.log('\n✅ The system successfully stores and handles German content in all fields!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createGermanModule();