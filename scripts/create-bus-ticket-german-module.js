// Create a comprehensive German module: Buying bus tickets at a bus stop
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function createBusTicketGermanModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the teacher
    const teacher = await User.findOne({ regNo: 'TEA001' });
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }
    
    console.log('👤 Creating German bus ticket module for teacher:', teacher.name);

    // Create a comprehensive German module about buying bus tickets
    const busTicketModule = new LearningModule({
      title: "Busfahrkarten kaufen an der Haltestelle",
      description: "Lernen Sie, wie man Busfahrkarten an deutschen Haltestellen kauft. Dieses Modul behandelt wichtige Vokabeln, höfliche Ausdrücke und praktische Situationen für den öffentlichen Nahverkehr in Deutschland.",
      
      targetLanguage: "German",
      nativeLanguage: "English", 
      level: "A2",
      category: "Conversation",
      difficulty: "Intermediate",
      estimatedDuration: 45,
      
      content: {
        learningObjectives: [
          "Vokabular für öffentliche Verkehrsmittel verstehen und verwenden",
          "Höflich nach Fahrkartenpreisen und Verbindungen fragen",
          "Busfahrkarten erfolgreich kaufen können",
          "Sich an Bushaltestellen orientieren und zurechtfinden",
          "Typische Gespräche mit Busfahrern und anderen Fahrgästen führen"
        ],
        
        vocabulary: [
          {
            german: "die Bushaltestelle",
            english: "bus stop",
            pronunciation: "dee BOOS-hal-te-shtel-le",
            example: "Wo ist die nächste Bushaltestelle?"
          },
          {
            german: "die Fahrkarte",
            english: "ticket",
            pronunciation: "dee FAHR-kar-te",
            example: "Ich brauche eine Fahrkarte zum Hauptbahnhof."
          },
          {
            german: "der Fahrkartenverkauf",
            english: "ticket sales",
            pronunciation: "der FAHR-kar-ten-fer-kowf",
            example: "Der Fahrkartenverkauf ist am Automaten."
          },
          {
            german: "der Fahrschein",
            english: "travel ticket",
            pronunciation: "der FAHR-shine",
            example: "Haben Sie einen gültigen Fahrschein?"
          },
          {
            german: "die Einzelfahrkarte",
            english: "single ticket",
            pronunciation: "dee AIN-tsel-fahr-kar-te",
            example: "Eine Einzelfahrkarte kostet 2,80 Euro."
          },
          {
            german: "die Tageskarte",
            english: "day ticket",
            pronunciation: "dee TA-ges-kar-te",
            example: "Mit der Tageskarte kann ich den ganzen Tag fahren."
          },
          {
            german: "der Fahrplan",
            english: "timetable/schedule",
            pronunciation: "der FAHR-plan",
            example: "Schauen Sie im Fahrplan nach der Abfahrtszeit."
          },
          {
            german: "die Haltestelle",
            english: "stop",
            pronunciation: "dee HAL-te-shtel-le",
            example: "An welcher Haltestelle muss ich aussteigen?"
          },
          {
            german: "umsteigen",
            english: "to change/transfer",
            pronunciation: "OOM-shtai-gen",
            example: "Sie müssen am Marktplatz umsteigen."
          },
          {
            german: "der Busfahrer",
            english: "bus driver",
            pronunciation: "der BOOS-fah-rer",
            example: "Fragen Sie den Busfahrer nach dem Weg."
          },
          {
            german: "das Kleingeld",
            english: "small change",
            pronunciation: "das KLINE-gelt",
            example: "Haben Sie Kleingeld für die Fahrkarte?"
          },
          {
            german: "der Automat",
            english: "vending machine",
            pronunciation: "der ow-to-MAHT",
            example: "Kaufen Sie die Fahrkarte am Automaten."
          },
          {
            german: "entwerten",
            english: "to validate",
            pronunciation: "ent-VER-ten",
            example: "Vergessen Sie nicht, Ihre Fahrkarte zu entwerten!"
          },
          {
            german: "die Verbindung",
            english: "connection",
            pronunciation: "dee fer-BIN-dung",
            example: "Gibt es eine direkte Verbindung zum Flughafen?"
          },
          {
            german: "die Abfahrt",
            english: "departure",
            pronunciation: "dee AP-fahrt",
            example: "Die nächste Abfahrt ist um 14:30 Uhr."
          }
        ],
        
        exercises: [
          {
            type: "multiple-choice",
            question: "Was brauchen Sie, um mit dem Bus zu fahren?",
            options: ["Eine Fahrkarte", "Einen Führerschein", "Eine Kreditkarte", "Ein Handy"],
            correctAnswer: "Eine Fahrkarte",
            explanation: "Um mit dem Bus zu fahren, braucht man eine gültige Fahrkarte oder einen Fahrschein."
          },
          {
            type: "multiple-choice", 
            question: "Wo können Sie normalerweise Busfahrkarten kaufen?",
            options: ["Nur beim Busfahrer", "Am Automaten oder beim Busfahrer", "Nur im Internet", "Nur am Bahnhof"],
            correctAnswer: "Am Automaten oder beim Busfahrer",
            explanation: "Busfahrkarten kann man meist am Automaten an der Haltestelle oder direkt beim Busfahrer kaufen."
          },
          {
            type: "translation",
            question: "Übersetzen Sie ins Deutsche: 'Where is the next bus stop?'",
            correctAnswer: "Wo ist die nächste Bushaltestelle?",
            explanation: "'Where is the next bus stop?' heißt auf Deutsch 'Wo ist die nächste Bushaltestelle?'"
          },
          {
            type: "fill-blank",
            question: "Entschuldigung, ich brauche eine _____ zum Hauptbahnhof.",
            correctAnswer: "Fahrkarte",
            explanation: "Man braucht eine 'Fahrkarte' um mit dem Bus zu fahren."
          },
          {
            type: "multiple-choice",
            question: "Was bedeutet 'umsteigen'?",
            options: ["Aussteigen", "Einsteigen", "Den Bus wechseln", "Fahrkarte kaufen"],
            correctAnswer: "Den Bus wechseln", 
            explanation: "'Umsteigen' bedeutet, von einem Bus in einen anderen Bus zu wechseln."
          },
          {
            type: "translation",
            question: "Wie sagt man 'day ticket' auf Deutsch?",
            correctAnswer: "Tageskarte",
            explanation: "Eine 'day ticket' heißt auf Deutsch 'Tageskarte'."
          }
        ],
        
        rolePlayScenario: {
          situation: "Fahrkartenkauf an einer deutschen Bushaltestelle",
          setting: "Sie stehen an einer Bushaltestelle in Deutschland und möchten eine Fahrkarte kaufen. Es gibt einen Fahrkartenautomaten, aber Sie sind unsicher und fragen andere Fahrgäste um Hilfe.",
          studentRole: "Tourist/Reisender",
          aiRole: "Hilfsbereiter deutscher Fahrgast",
          objective: "Erfolgreich eine Busfahrkarte kaufen und Informationen über die Fahrt erhalten",
          conversationFlow: [
            "Höflich um Hilfe bitten",
            "Nach dem Fahrkartenpreis fragen", 
            "Den Automaten bedienen lernen",
            "Nach der richtigen Buslinie fragen",
            "Sich für die Hilfe bedanken"
          ],
          allowedVocabulary: [
            "Entschuldigung", "Können Sie mir helfen?", "Fahrkarte", "Automat", 
            "Wie viel kostet?", "Welcher Bus?", "Hauptbahnhof", "Danke schön",
            "Kleingeld", "entwerten", "umsteigen", "Haltestelle"
          ]
        },
        
        culturalNotes: [
          "In Deutschland muss man Fahrkarten vor der Fahrt kaufen und oft selbst entwerten.",
          "Schwarzfahren (ohne gültige Fahrkarte fahren) kostet mindestens 60 Euro Strafe.",
          "Viele Deutsche sind hilfsbereit, wenn Touristen höflich um Hilfe bitten.",
          "Tageskarten sind oft günstiger als mehrere Einzelfahrkarten.",
          "In größeren Städten gibt es meist Fahrkartenautomaten an den Haltestellen."
        ]
      },
      
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
        teachingStyle: "Praktisch orientiert mit vielen Alltagsbeispielen und kulturellen Hinweisen"
      },
      
      createdBy: teacher._id,
      isActive: true,
      tags: ["Deutsch", "Öffentlicher Verkehr", "Bus", "Fahrkarten", "Alltag", "A2", "Praktisch"]
    });

    await busTicketModule.save();
    
    console.log('✅ German bus ticket module created successfully!');
    console.log('📋 Module details:', {
      id: busTicketModule._id,
      title: busTicketModule.title,
      description: busTicketModule.description.substring(0, 100) + '...',
      targetLanguage: busTicketModule.targetLanguage,
      level: busTicketModule.level,
      difficulty: busTicketModule.difficulty,
      vocabularyCount: busTicketModule.content?.vocabulary?.length || 0,
      exerciseCount: busTicketModule.content?.exercises?.length || 0,
      hasRolePlay: !!busTicketModule.content?.rolePlayScenario,
      tags: busTicketModule.tags || []
    });
    
    console.log('\n🔍 German content analysis:');
    console.log('📝 Title:', busTicketModule.title);
    console.log('📖 Description starts with:', busTicketModule.description.substring(0, 80) + '...');
    console.log('🎯 Learning objectives (first 2):');
    busTicketModule.content.learningObjectives.slice(0, 2).forEach((obj, i) => {
      console.log(`   ${i + 1}. ${obj}`);
    });
    console.log('📚 Sample vocabulary:');
    busTicketModule.content.vocabulary.slice(0, 3).forEach((vocab, i) => {
      console.log(`   ${i + 1}. ${vocab.german} = ${vocab.english}`);
    });
    console.log('❓ Sample exercise question:', busTicketModule.content.exercises[0].question);
    console.log('🎭 Role-play situation:', busTicketModule.content.rolePlayScenario.situation);
    console.log('🤖 AI personality:', busTicketModule.aiTutorConfig.personality);
    console.log('🏷️ Tags:', busTicketModule.tags.join(', '));
    
    console.log('\n✅ Complete German module created with:');
    console.log(`   - ${busTicketModule.content.vocabulary.length} German vocabulary items`);
    console.log(`   - ${busTicketModule.content.exercises.length} exercises in German`);
    console.log(`   - 1 role-play scenario in German`);
    console.log(`   - ${busTicketModule.content.culturalNotes.length} cultural notes`);
    console.log(`   - AI tutor configured in German`);
    
    console.log('\n🎉 The module is ready for teacher testing!');
    console.log('🔗 Module ID for testing:', busTicketModule._id);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createBusTicketGermanModule();