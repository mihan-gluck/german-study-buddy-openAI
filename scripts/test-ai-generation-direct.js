// scripts/test-ai-generation-direct.js

const OpenAI = require('openai');
require('dotenv').config();

// Import the AI generation functions from our route
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create AI prompt for module generation
function createModuleGenerationPrompt(requirements) {
  const {
    targetLanguage,
    nativeLanguage,
    level,
    category,
    difficulty,
    description,
    estimatedDuration,
    moduleType,
    generateVocabulary,
    generateExercises,
    generateConversation,
    generateCulturalNotes
  } = requirements;

  return `Create a comprehensive ${targetLanguage} learning module with the following requirements:

TARGET LANGUAGE: ${targetLanguage}
NATIVE LANGUAGE: ${nativeLanguage}
LEVEL: ${level}
CATEGORY: ${category}
DIFFICULTY: ${difficulty}
DURATION: ${estimatedDuration} minutes
MODULE TYPE: ${moduleType}

DESCRIPTION: ${description}

GENERATION OPTIONS:
- Generate Vocabulary: ${generateVocabulary}
- Generate Exercises: ${generateExercises}
- Generate Conversation: ${generateConversation}
- Generate Cultural Notes: ${generateCulturalNotes}

Please create a complete learning module and respond with ONLY a valid JSON object in this exact format:

{
  "title": "Module title (max 60 characters)",
  "description": "Detailed module description",
  "targetLanguage": "${targetLanguage}",
  "nativeLanguage": "${nativeLanguage}",
  "level": "${level}",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "estimatedDuration": ${estimatedDuration},
  "learningObjectives": [
    {
      "objective": "Learning objective 1",
      "description": "Detailed description"
    }
  ],
  "content": {
    "introduction": "Engaging introduction text",
    "keyTopics": ["topic1", "topic2", "topic3"],
    "allowedVocabulary": [
      {
        "word": "${targetLanguage} word",
        "translation": "${nativeLanguage} translation",
        "category": "category"
      }
    ],
    "allowedGrammar": [
      {
        "structure": "Grammar structure name",
        "examples": ["example1", "example2"],
        "level": "${level}"
      }
    ],
    "examples": [
      {
        "${targetLanguage.toLowerCase()}": "${targetLanguage} example",
        "${nativeLanguage.toLowerCase()}": "${nativeLanguage} translation",
        "explanation": "Grammar/usage explanation"
      }
    ],
    "exercises": [
      {
        "type": "multiple-choice",
        "question": "Exercise question",
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": "correct option",
        "explanation": "Why this is correct",
        "points": 1
      }
    ]
  },
  "aiTutorConfig": {
    "personality": "AI tutor personality description",
    "focusAreas": ["area1", "area2", "area3"],
    "helpfulPhrases": ["phrase1", "phrase2", "phrase3"],
    "commonMistakes": ["mistake1", "mistake2"],
    "culturalNotes": ["note1", "note2"]
  },
  "tags": ["tag1", "tag2", "tag3"]
}

REQUIREMENTS:
1. Generate 15-25 vocabulary words with accurate translations
2. Create 3-5 learning objectives
3. Include 5-8 practical exercises of different types
4. Add 3-5 conversation examples
5. Include cultural context if requested
6. Make content appropriate for ${level} level
7. Focus on practical, real-world usage
8. Ensure all content is accurate and pedagogically sound

Generate the module now:`;
}

async function testAIGenerationDirect() {
  try {
    console.log('🧪 Testing AI Module Generation Logic...');
    
    // Test data
    const testData = {
      targetLanguage: 'English',
      nativeLanguage: 'Tamil',
      level: 'A1',
      category: 'Conversation',
      difficulty: 'Beginner',
      description: 'A module about ordering food in a restaurant, including greetings, menu vocabulary, asking questions about dishes, and paying the bill.',
      estimatedDuration: 30,
      moduleType: 'roleplay',
      generateVocabulary: true,
      generateExercises: true,
      generateConversation: true,
      generateCulturalNotes: true
    };
    
    console.log('🤖 Creating AI prompt...');
    const prompt = createModuleGenerationPrompt(testData);
    
    console.log('📤 Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert language learning curriculum designer. Create comprehensive, engaging learning modules based on the provided requirements. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('📥 AI Response received, length:', aiResponse.length);

    // Parse AI response
    let generatedModule;
    try {
      generatedModule = JSON.parse(aiResponse);
    } catch (parseError) {
      console.log('⚠️ Trying to extract JSON from response...');
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedModule = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid AI response format');
      }
    }

    console.log('✅ AI Generation successful!');
    console.log('📋 Generated Module:', {
      title: generatedModule.title,
      description: generatedModule.description.substring(0, 100) + '...',
      vocabularyCount: generatedModule.content?.allowedVocabulary?.length || 0,
      exerciseCount: generatedModule.content?.exercises?.length || 0,
      objectivesCount: generatedModule.learningObjectives?.length || 0
    });
    
    // Show some vocabulary examples
    if (generatedModule.content?.allowedVocabulary?.length > 0) {
      console.log('📚 Sample Vocabulary:');
      generatedModule.content.allowedVocabulary.slice(0, 5).forEach((vocab, index) => {
        console.log(`  ${index + 1}. ${vocab.word} - ${vocab.translation}`);
      });
    }
    
    return generatedModule;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

// Run the test
testAIGenerationDirect();