// routes/aiModuleGenerator.js

const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// POST /api/ai/generate-module - Generate module using AI
router.post('/generate-module', verifyToken, checkRole(['TEACHER', 'ADMIN']), async (req, res) => {
  try {
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
    } = req.body;

    console.log('🤖 AI Module Generation Request:', {
      targetLanguage,
      level,
      category,
      description: description.substring(0, 100) + '...'
    });

    // Create AI prompt for module generation
    const prompt = createModuleGenerationPrompt({
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
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert language learning curriculum designer. Create comprehensive, engaging learning modules based on the provided requirements. IMPORTANT: Always respond with ONLY valid JSON format - no markdown, no code blocks, no explanations, just the raw JSON object."
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
    console.log('🤖 AI Response received, length:', aiResponse.length);

    // Parse AI response
    let generatedModule;
    try {
      generatedModule = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      
      // Try to extract JSON from markdown code blocks
      let jsonContent = aiResponse;
      
      // Remove markdown code blocks if present
      if (aiResponse.includes('```json')) {
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
      } else if (aiResponse.includes('```')) {
        const jsonMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
      } else {
        // Try to extract JSON object from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
      }
      
      try {
        generatedModule = JSON.parse(jsonContent);
        console.log('✅ Successfully extracted JSON from AI response');
      } catch (secondParseError) {
        console.error('❌ Failed to parse extracted JSON:', secondParseError);
        throw new Error('Invalid AI response format - could not extract valid JSON');
      }
    }

    // Enhance the generated module with required fields
    const enhancedModule = enhanceGeneratedModule(generatedModule, req.body, req.user.id);

    // Validate the enhanced module before sending
    const validationResult = validateGeneratedModule(enhancedModule);
    if (!validationResult.isValid) {
      console.log('⚠️ Generated module has validation issues:', validationResult.errors);
      // Fix common issues
      const fixedModule = fixModuleValidationIssues(enhancedModule);
      console.log('✅ Module validation issues fixed');
      res.json(fixedModule);
    } else {
      console.log('✅ Module generated successfully:', enhancedModule.title);
      res.json(enhancedModule);
    }

  } catch (error) {
    console.error('❌ Error generating module:', error);
    
    // Provide fallback response
    const fallbackModule = createFallbackModule(req.body, req.user.id);
    
    res.status(200).json(fallbackModule);
  }
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

Please create a complete learning module and respond with ONLY a valid JSON object in this exact format (NO markdown, NO code blocks, JUST the JSON):

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
9. IMPORTANT: Exercise types must be ONLY: "multiple-choice", "fill-blank", "translation", "conversation", "essay", or "role-play"
10. For multiple-choice exercises, provide exactly 4 options
11. Always include correctAnswer and explanation for exercises

Generate the module now:`;
}

// Enhance generated module with required fields
function enhanceGeneratedModule(generatedModule, originalRequest, userId) {
  return {
    ...generatedModule,
    createdBy: userId,
    isActive: true,
    totalEnrollments: 0,
    averageCompletionTime: 0,
    averageScore: 0,
    version: 1,
    updateHistory: [],
    
    // Ensure required fields exist
    prerequisites: generatedModule.prerequisites || [],
    
    // Enhance AI tutor config
    aiTutorConfig: {
      personality: generatedModule.aiTutorConfig?.personality || `friendly and encouraging ${originalRequest.targetLanguage} tutor`,
      focusAreas: generatedModule.aiTutorConfig?.focusAreas || [originalRequest.category],
      helpfulPhrases: generatedModule.aiTutorConfig?.helpfulPhrases || [],
      commonMistakes: generatedModule.aiTutorConfig?.commonMistakes || [],
      culturalNotes: generatedModule.aiTutorConfig?.culturalNotes || []
    },
    
    // Ensure content structure
    content: {
      introduction: generatedModule.content?.introduction || '',
      keyTopics: generatedModule.content?.keyTopics || [],
      allowedVocabulary: generatedModule.content?.allowedVocabulary || [],
      allowedGrammar: generatedModule.content?.allowedGrammar || [],
      examples: generatedModule.content?.examples || [],
      exercises: generatedModule.content?.exercises || [],
      
      // Add role-play scenario if it's a role-play module
      ...(originalRequest.moduleType === 'roleplay' && {
        rolePlayScenario: generateRolePlayScenario(generatedModule, originalRequest)
      })
    }
  };
}

// Generate role-play scenario from module content
function generateRolePlayScenario(generatedModule, originalRequest) {
  const description = originalRequest.description.toLowerCase();
  
  // Extract scenario details from description
  let situation = 'General conversation';
  let studentRole = 'Student';
  let aiRole = 'Native speaker';
  
  if (description.includes('restaurant')) {
    situation = 'At a restaurant';
    studentRole = 'Customer';
    aiRole = 'Waiter/Waitress';
  } else if (description.includes('shop') || description.includes('store')) {
    situation = 'Shopping';
    studentRole = 'Customer';
    aiRole = 'Shop assistant';
  } else if (description.includes('hotel')) {
    situation = 'At a hotel';
    studentRole = 'Guest';
    aiRole = 'Hotel receptionist';
  } else if (description.includes('job') || description.includes('interview')) {
    situation = 'Job interview';
    studentRole = 'Job applicant';
    aiRole = 'Interviewer';
  }
  
  return {
    situation,
    studentRole,
    aiRole,
    setting: `A typical ${situation.toLowerCase()} scenario`,
    objective: `Practice ${originalRequest.targetLanguage} conversation in a ${situation.toLowerCase()} context`
  };
}

// Create fallback module if AI generation fails
function createFallbackModule(requirements, userId) {
  return {
    title: `${requirements.targetLanguage} ${requirements.category} - ${requirements.level}`,
    description: requirements.description,
    targetLanguage: requirements.targetLanguage,
    nativeLanguage: requirements.nativeLanguage,
    level: requirements.level,
    category: requirements.category,
    difficulty: requirements.difficulty,
    estimatedDuration: requirements.estimatedDuration || 30,
    learningObjectives: [
      {
        objective: `Learn basic ${requirements.category.toLowerCase()} skills`,
        description: `Develop fundamental ${requirements.targetLanguage} ${requirements.category.toLowerCase()} abilities`
      }
    ],
    content: {
      introduction: `Welcome to this ${requirements.targetLanguage} ${requirements.category.toLowerCase()} module.`,
      keyTopics: [requirements.category],
      allowedVocabulary: [],
      allowedGrammar: [],
      examples: [],
      exercises: []
    },
    aiTutorConfig: {
      personality: `friendly and encouraging ${requirements.targetLanguage} tutor`,
      focusAreas: [requirements.category],
      helpfulPhrases: [],
      commonMistakes: [],
      culturalNotes: []
    },
    tags: [requirements.level.toLowerCase(), requirements.category.toLowerCase()],
    createdBy: userId,
    isActive: true,
    totalEnrollments: 0,
    averageCompletionTime: 0,
    averageScore: 0,
    version: 1,
    updateHistory: []
  };
}

// Validate generated module against schema requirements
function validateGeneratedModule(module) {
  const errors = [];
  const allowedExerciseTypes = ['multiple-choice', 'fill-blank', 'translation', 'conversation', 'essay', 'role-play'];
  const allowedTargetLanguages = ['English', 'German'];
  const allowedNativeLanguages = ['English', 'Tamil', 'Sinhala'];
  const allowedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const allowedCategories = ['Grammar', 'Vocabulary', 'Conversation', 'Reading', 'Writing', 'Listening'];
  const allowedDifficulties = ['Beginner', 'Intermediate', 'Advanced'];

  // Check required fields
  if (!module.title || module.title.length > 60) {
    errors.push('Title is required and must be under 60 characters');
  }
  
  if (!allowedTargetLanguages.includes(module.targetLanguage)) {
    errors.push(`Invalid target language: ${module.targetLanguage}`);
  }
  
  if (!allowedNativeLanguages.includes(module.nativeLanguage)) {
    errors.push(`Invalid native language: ${module.nativeLanguage}`);
  }
  
  if (!allowedLevels.includes(module.level)) {
    errors.push(`Invalid level: ${module.level}`);
  }
  
  if (!allowedCategories.includes(module.category)) {
    errors.push(`Invalid category: ${module.category}`);
  }
  
  if (!allowedDifficulties.includes(module.difficulty)) {
    errors.push(`Invalid difficulty: ${module.difficulty}`);
  }

  // Check exercises
  if (module.content && module.content.exercises) {
    module.content.exercises.forEach((exercise, index) => {
      if (!allowedExerciseTypes.includes(exercise.type)) {
        errors.push(`Invalid exercise type at index ${index}: ${exercise.type}`);
      }
      
      if (exercise.type === 'multiple-choice' && (!exercise.options || exercise.options.length !== 4)) {
        errors.push(`Multiple choice exercise at index ${index} must have exactly 4 options`);
      }
      
      if (!exercise.question || !exercise.correctAnswer) {
        errors.push(`Exercise at index ${index} missing question or correctAnswer`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Fix common validation issues in generated modules
function fixModuleValidationIssues(module) {
  const allowedExerciseTypes = ['multiple-choice', 'fill-blank', 'translation', 'conversation', 'essay', 'role-play'];
  const exerciseTypeMapping = {
    'sentence-formation': 'fill-blank',
    'word-order': 'fill-blank',
    'matching': 'multiple-choice',
    'true-false': 'multiple-choice',
    'listening': 'conversation',
    'speaking': 'conversation',
    'comprehension': 'translation'
  };

  // Fix title length
  if (module.title && module.title.length > 60) {
    module.title = module.title.substring(0, 57) + '...';
  }

  // Fix exercise types
  if (module.content && module.content.exercises) {
    module.content.exercises = module.content.exercises.map(exercise => {
      if (!allowedExerciseTypes.includes(exercise.type)) {
        const mappedType = exerciseTypeMapping[exercise.type] || 'multiple-choice';
        console.log(`🔧 Fixed exercise type: ${exercise.type} → ${mappedType}`);
        exercise.type = mappedType;
      }
      
      // Ensure multiple choice has 4 options
      if (exercise.type === 'multiple-choice') {
        if (!exercise.options || exercise.options.length < 4) {
          exercise.options = exercise.options || [];
          while (exercise.options.length < 4) {
            exercise.options.push(`Option ${exercise.options.length + 1}`);
          }
        }
        if (exercise.options.length > 4) {
          exercise.options = exercise.options.slice(0, 4);
        }
      }
      
      // Ensure required fields
      exercise.question = exercise.question || 'Sample question';
      exercise.correctAnswer = exercise.correctAnswer || (exercise.options ? exercise.options[0] : 'Sample answer');
      exercise.explanation = exercise.explanation || 'Explanation for the correct answer';
      exercise.points = exercise.points || 1;
      
      return exercise;
    });
  }

  return module;
}

module.exports = router;