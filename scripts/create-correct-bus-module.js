// Create the German bus ticket module with correct schema structure
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function createCorrectBusModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the teacher
    const teacher = await User.findOne({ regNo: 'TEA001' });
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }
    
    // Delete the old module if it exists
    await LearningModule.deleteOne({ title: "Busfahrkarten kaufen an der Haltestelle" });
    console.log('🗑️ Removed old module');
    
    console.log('👤 Creating corrected German bus ticket module for teacher:', teacher.name);

    // Create the module with correct schema structure
    const busTicketModule = new LearningModule({
      title: "Busfahrkarten kaufen an der Haltestelle",
      description: "Lernen Sie, wie man Busfahrkarten an deutschen Haltestellen kauft. Dieses Modul behandelt wichtige Vokabeln, höfliche Ausdrücke und praktische Situationen für den öffentlichen Nahverkehr in Deutschland.",
      
      targetLanguage: "German",
      nativeLanguage: "English", 
      level: "A2",
      category: "Conversation",
      difficulty: "Intermediate",
      estimatedDuration: 45,
      
      // Learning objectives with correct structure
      learningObjectives: [
        {
          objective: "Vokabular für öffentliche Verkehrsmittel",
          description: "Verstehen und verwenden wichtiger Begriffe für Busse, Fahrkarten und Haltestellen"
        },
        {
          objective: "Höfliche Kommunikation",
          description: "Höflich nach Fahrkartenpreisen und Verbindungen fragen können"
        },
        {
          objective: "Praktische Fertigkeiten",
          description: "Busfahrkarten erfolgreich kaufen und sich an Haltestellen orientieren"
        },
        {
          objective: "Alltagsgespräche",
          description: "Typische Gespräche mit Busfahrern und anderen Fahrgästen führen"
        }
      ],
      
      content: {
        introduction: "Willkommen zum Modul 'Busfahrkarten kaufen an der Haltestelle'! In diesem Kurs lernen Sie alles Wichtige über den öffentlichen Nahverkehr in Deutschland. Sie werden lernen, wie man Fahrkarten kauft, nach Verbindungen fragt und sich höflich mit anderen Fahrgästen unterhält.",
        
        // Role-play scenario with correct structure
        rolePlayScenario: {
          situation: "Fahrkartenkauf an einer deutschen Bushaltestelle",
          studentRole: "Tourist/Reisender",
          aiRole: "Hilfsbereiter deutscher Fahrgast",
          setting: "Sie stehen an einer Bushaltestelle in Deutschland und möchten eine Fahrkarte kaufen. Es gibt einen Fahrkartenautomaten, aber Sie sind unsicher und fragen andere Fahrgäste um Hilfe.",
          objective: "Erfolgreich eine Busfahrkarte kaufen und Informationen über die Fahrt erhalten"
        },
        
        // Vocabulary with correct structure
        allowedVocabulary: [
          {
            word: "die Bushaltestelle",
            translation: "bus stop",
            category: "transport"
          },
          {
            word: "die Fahrkarte",
            translation: "ticket",
            category: "transport"
          },
          {
            word: "der Fahrkartenverkauf",
            translation: "ticket sales",
            category: "transport"
          },
          {
            word: "der Fahrschein",
            translation: "travel ticket",
            category: "transport"
          },
          {
            word: "die Einzelfahrkarte",
            translation: "single ticket",
            category: "transport"
          },
          {
            word: "die Tageskarte",
            translation: "day ticket",
            category: "transport"
          },
          {
            word: "der Fahrplan",
            translation: "timetable/schedule",
            category: "transport"
          },
          {
            word: "die Haltestelle",
            translation: "stop",
            category: "transport"
          },
          {
            word: "umsteigen",
            translation: "to change/transfer",
            category: "transport"
          },
          {
            word: "der Busfahrer",
            translation: "bus driver",
            category: "transport"
          },
          {
            word: "das Kleingeld",
            translation: "small change",
            category: "money"
          },
          {
            word: "der Automat",
            translation: "vending machine",
            category: "transport"
          },
          {
            word: "entwerten",
            translation: "to validate",
            category: "transport"
          },
          {
            word: "die Verbindung",
            translation: "connection",
            category: "transport"
          },
          {
            word: "die Abfahrt",
            translation: "departure",
            category: "transport"
          },
          {
            word: "Entschuldigung",
            translation: "Excuse me",
            category: "politeness"
          },
          {
            word: "Können Sie mir helfen?",
            translation: "Can you help me?",
            category: "politeness"
          },
          {
            word: "Wie viel kostet das?",
            translation: "How much does it cost?",
            category: "questions"
          },
          {
            word: "Welcher Bus fährt zum...?",
            translation: "Which bus goes to...?",
            category: "questions"
          },
          {
            word: "Vielen Dank",
            translation: "Thank you very much",
            category: "politeness"
          }
        ],
        
        // Grammar constraints
        allowedGrammar: [
          {
            structure: "Höfliche Fragen mit 'Können Sie...?'",
            examples: ["Können Sie mir helfen?", "Können Sie mir sagen, wo...?"],
            level: "A2"
          },
          {
            structure: "W-Fragen (Wo, Wie, Welcher)",
            examples: ["Wo ist die Haltestelle?", "Wie viel kostet das?", "Welcher Bus fährt zum Bahnhof?"],
            level: "A2"
          },
          {
            structure: "Modalverben (müssen, können)",
            examples: ["Ich muss umsteigen", "Kann ich hier eine Fahrkarte kaufen?"],
            level: "A2"
          }
        ],
        
        // Conversation flow
        conversationFlow: [
          {
            stage: "Begrüßung und Hilfe erbitten",
            aiPrompts: ["Guten Tag! Kann ich Ihnen helfen?"],
            expectedResponses: ["Entschuldigung, können Sie mir helfen?"],
            helpfulPhrases: ["Entschuldigung", "Können Sie mir bitte helfen?"]
          },
          {
            stage: "Nach Fahrkarten fragen",
            aiPrompts: ["Was möchten Sie denn wissen?"],
            expectedResponses: ["Ich brauche eine Fahrkarte zum Hauptbahnhof"],
            helpfulPhrases: ["Ich brauche eine Fahrkarte", "Wie viel kostet das?"]
          },
          {
            stage: "Automaten erklären",
            aiPrompts: ["Der Automat ist ganz einfach zu bedienen"],
            expectedResponses: ["Können Sie mir zeigen, wie das funktioniert?"],
            helpfulPhrases: ["Wie funktioniert das?", "Können Sie mir das zeigen?"]
          },
          {
            stage: "Dank und Verabschiedung",
            aiPrompts: ["Gern geschehen! Gute Fahrt!"],
            expectedResponses: ["Vielen Dank für Ihre Hilfe!"],
            helpfulPhrases: ["Vielen Dank", "Auf Wiedersehen"]
          }
        ],
        
        keyTopics: [
          "Öffentlicher Nahverkehr in Deutschland",
          "Fahrkartenkauf am Automaten",
          "Höfliche Kommunikation mit Fremden",
          "Orientierung an Bushaltestellen",
          "Deutsche Verkehrsbegriffe"
        ],
        
        examples: [
          {
            german: "Entschuldigung, können Sie mir helfen?",
            english: "Excuse me, can you help me?",
            explanation: "Höfliche Art, um Hilfe zu bitten"
          },
          {
            german: "Ich brauche eine Fahrkarte zum Hauptbahnhof.",
            english: "I need a ticket to the main station.",
            explanation: "So fragt man nach einer Fahrkarte zu einem bestimmten Ziel"
          },
          {
            german: "Wie funktioniert dieser Automat?",
            english: "How does this machine work?",
            explanation: "Nützliche Frage, wenn man Hilfe beim Automaten braucht"
          }
        ],
        
        exercises: [
          {
            type: "multiple-choice",
            question: "Was brauchen Sie, um mit dem Bus zu fahren?",
            options: ["Eine Fahrkarte", "Einen Führerschein", "Eine Kreditkarte", "Ein Handy"],
            correctAnswer: "Eine Fahrkarte",
            explanation: "Um mit dem Bus zu fahren, braucht man eine gültige Fahrkarte oder einen Fahrschein.",
            points: 1
          },
          {
            type: "multiple-choice", 
            question: "Wo können Sie normalerweise Busfahrkarten kaufen?",
            options: ["Nur beim Busfahrer", "Am Automaten oder beim Busfahrer", "Nur im Internet", "Nur am Bahnhof"],
            correctAnswer: "Am Automaten oder beim Busfahrer",
            explanation: "Busfahrkarten kann man meist am Automaten an der Haltestelle oder direkt beim Busfahrer kaufen.",
            points: 1
          },
          {
            type: "translation",
            question: "Übersetzen Sie ins Deutsche: 'Where is the next bus stop?'",
            correctAnswer: "Wo ist die nächste Bushaltestelle?",
            explanation: "'Where is the next bus stop?' heißt auf Deutsch 'Wo ist die nächste Bushaltestelle?'",
            points: 2
          },
          {
            type: "fill-blank",
            question: "Entschuldigung, ich brauche eine _____ zum Hauptbahnhof.",
            correctAnswer: "Fahrkarte",
            explanation: "Man braucht eine 'Fahrkarte' um mit dem Bus zu fahren.",
            points: 1
          },
          {
            type: "multiple-choice",
            question: "Was bedeutet 'umsteigen'?",
            options: ["Aussteigen", "Einsteigen", "Den Bus wechseln", "Fahrkarte kaufen"],
            correctAnswer: "Den Bus wechseln", 
            explanation: "'Umsteigen' bedeutet, von einem Bus in einen anderen Bus zu wechseln.",
            points: 1
          },
          {
            type: "translation",
            question: "Wie sagt man 'day ticket' auf Deutsch?",
            correctAnswer: "Tageskarte",
            explanation: "Eine 'day ticket' heißt auf Deutsch 'Tageskarte'.",
            points: 2
          }
        ]
      },
      
      // AI tutor config with cultural notes in the right place
      aiTutorConfig: {
        personality: "geduldiger und hilfsbereiter deutscher Muttersprachler, der gerne Touristen hilft",
        focusAreas: [
          "Höfliche Umgangsformen im öffentlichen Verkehr",
          "Praktisches Vokabular für Alltagssituationen", 
          "Deutsche Aussprache von Verkehrsbegriffen",
          "Kulturelle Besonderheiten des deutschen ÖPNV"
        ],
        helpfulPhrases: [
          "Entschuldigung, können Sie mir helfen?",
          "Wo kann ich eine Fahrkarte kaufen?",
          "Wie funktioniert dieser Automat?",
          "Welcher Bus fährt zum...?",
          "Muss ich umsteigen?",
          "Vielen Dank für Ihre Hilfe!"
        ],
        culturalNotes: [
          "In Deutschland muss man Fahrkarten vor der Fahrt kaufen und oft selbst entwerten.",
          "Schwarzfahren (ohne gültige Fahrkarte fahren) kostet mindestens 60 Euro Strafe.",
          "Viele Deutsche sind hilfsbereit, wenn Touristen höflich um Hilfe bitten.",
          "Tageskarten sind oft günstiger als mehrere Einzelfahrkarten.",
          "In größeren Städten gibt es meist Fahrkartenautomaten an den Haltestellen."
        ]
      },
      
      createdBy: teacher._id,
      isActive: true,
      tags: ["Deutsch", "Öffentlicher Verkehr", "Bus", "Fahrkarten", "Alltag", "A2", "Praktisch"]
    });

    await busTicketModule.save();
    
    console.log('✅ Corrected German bus ticket module created successfully!');
    console.log('📋 Module ID:', busTicketModule._id);
    console.log('📝 Title:', busTicketModule.title);
    console.log('📖 Description:', busTicketModule.description.substring(0, 100) + '...');
    
    console.log('\n📊 Content Statistics:');
    console.log(`- ${busTicketModule.learningObjectives.length} learning objectives`);
    console.log(`- ${busTicketModule.content.allowedVocabulary.length} vocabulary items`);
    console.log(`- ${busTicketModule.content.exercises.length} exercises`);
    console.log(`- ${busTicketModule.content.conversationFlow.length} conversation stages`);
    console.log(`- ${busTicketModule.aiTutorConfig.culturalNotes.length} cultural notes`);
    
    console.log('\n🎯 Sample Content (in German):');
    console.log('Learning Objective:', busTicketModule.learningObjectives[0].objective);
    console.log('Vocabulary:', busTicketModule.content.allowedVocabulary[0].word, '=', busTicketModule.content.allowedVocabulary[0].translation);
    console.log('Exercise Question:', busTicketModule.content.exercises[0].question);
    console.log('Role-play Situation:', busTicketModule.content.rolePlayScenario.situation);
    
    console.log('\n🎉 Module ready for teacher testing!');
    console.log('Teachers can now experience authentic German bus ticket conversations!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createCorrectBusModule();