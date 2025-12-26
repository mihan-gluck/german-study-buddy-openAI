// Test creating a module entirely in German
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

// Create axios instance with cookie support
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testGermanModuleCreation() {
  console.log('🧪 Testing German Module Creation...\n');

  try {
    // Step 1: Login as teacher
    console.log('1️⃣ Logging in as teacher...');
    const loginResponse = await apiClient.post('/auth/login', {
      regNo: 'TEA001',
      password: 'password123'
    });
    
    console.log('✅ Teacher login successful');
    console.log('👤 User:', loginResponse.data.user.name, '- Role:', loginResponse.data.user.role);

    // Step 2: Create a module entirely in German
    console.log('\n2️⃣ Creating module entirely in German...');
    
    const germanModuleData = {
      // Basic info in German
      title: "Deutsche Begrüßungen und Höflichkeit",
      description: "Lernen Sie grundlegende deutsche Begrüßungen und höfliche Ausdrücke für den Alltag. Perfekt für Anfänger.",
      
      // Language settings
      targetLanguage: "German",
      nativeLanguage: "English",
      level: "A1",
      category: "Greetings",
      estimatedDuration: 30,
      
      // Content in German
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
        
        // Role-play scenario in German
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
      
      // AI tutor config in German
      aiTutorConfig: {
        personality: "freundlicher und geduldiger deutscher Sprachlehrer",
        focusAreas: ["Deutsche Aussprache", "Höflichkeitsformen", "Grundwortschatz"],
        helpfulPhrases: [
          "Können Sie das bitte wiederholen?",
          "Wie spricht man das aus?",
          "Was bedeutet das auf Englisch?"
        ]
      }
    };

    const moduleResponse = await apiClient.post('/learning-modules', germanModuleData);
    
    console.log('✅ German module created successfully!');
    console.log('📋 Module details:', {
      id: moduleResponse.data._id,
      title: moduleResponse.data.title,
      description: moduleResponse.data.description,
      targetLanguage: moduleResponse.data.targetLanguage,
      vocabularyCount: moduleResponse.data.content?.vocabulary?.length || 0,
      exerciseCount: moduleResponse.data.content?.exercises?.length || 0,
      hasRolePlay: !!moduleResponse.data.content?.rolePlayScenario
    });

    // Step 3: Test the German module with AI
    console.log('\n3️⃣ Testing AI interaction with German module...');
    
    const sessionResponse = await apiClient.post('/ai-tutor/start-teacher-test', {
      moduleId: moduleResponse.data._id,
      sessionType: 'teacher-test'
    });
    
    console.log('✅ German module test session started!');
    console.log('🤖 Welcome message:', sessionResponse.data.welcomeMessage?.content || 'No welcome message');

    // Step 4: Send a German message to test AI response
    console.log('\n4️⃣ Sending German message to AI...');
    
    const messageResponse = await apiClient.post('/ai-tutor/send-message', {
      sessionId: sessionResponse.data.sessionId,
      message: 'Guten Tag! Ich möchte Deutsch lernen.',
      messageType: 'text'
    });
    
    console.log('✅ AI responded to German message!');
    console.log('🤖 AI Response:', messageResponse.data.response?.content || 'No response');
    console.log('💡 Suggestions:', messageResponse.data.suggestions || []);

    console.log('\n🎉 German module creation and testing completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during testing:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

// Run the test
testGermanModuleCreation();