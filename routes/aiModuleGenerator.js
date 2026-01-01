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
      
      // Role-play specific fields
      rolePlaySituation,
      rolePlaySetting,
      studentRole,
      aiRole,
      rolePlayObjective,
      aiPersonality,
      studentGuidance,
      
      // Generation options
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

    // Add debugging to check for undefined values
    console.log('🔍 Checking enhanced module for undefined values...');
    const undefinedFields = findUndefinedFields(enhancedModule);
    if (undefinedFields.length > 0) {
      console.log('⚠️ Found undefined fields in enhanced module:', undefinedFields);
    }

    // Validate the enhanced module before sending
    const validationResult = validateGeneratedModule(enhancedModule);
    if (!validationResult.isValid) {
      console.log('⚠️ Generated module has validation issues:', validationResult.errors);
      // Fix common issues
      const fixedModule = fixModuleValidationIssues(enhancedModule);
      console.log('✅ Module validation issues fixed');
      
      // Final check for undefined values after fixing
      const finalUndefinedFields = findUndefinedFields(fixedModule);
      if (finalUndefinedFields.length > 0) {
        console.log('❌ Still have undefined fields after fixing:', finalUndefinedFields);
      }
      
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
    rolePlaySituation,
    rolePlaySetting,
    studentRole,
    aiRole,
    rolePlayObjective,
    aiPersonality,
    studentGuidance,
    generateVocabulary,
    generateExercises,
    generateConversation,
    generateCulturalNotes
  } = requirements;

  const basePrompt = `Create a comprehensive ${targetLanguage} learning module with the following requirements:

TARGET LANGUAGE: ${targetLanguage}
NATIVE LANGUAGE: ${nativeLanguage}
LEVEL: ${level}
CATEGORY: ${category}
DIFFICULTY: ${difficulty}
DURATION: ${estimatedDuration} minutes
MODULE TYPE: ${moduleType}

DESCRIPTION: ${description}`;

  // Add role-play specific information if it's a role-play module
  const rolePlayInfo = moduleType === 'roleplay' ? `

ROLE-PLAY SCENARIO:
- Student Role: ${studentRole || 'Student'}
- AI Role: ${aiRole || 'Tutor'}

IMPORTANT: Based on these roles and the module description, you should intelligently generate:
- A realistic situation/scenario that fits these roles
- Appropriate setting details
- Clear objective for the role-play
- AI personality that matches the AI role
- Student guidance appropriate for the student role
- Multiple AI opening lines for conversation variety
- Suggested student responses to help them start
- Conversation flow stages that make sense for this scenario` : '';

  const generationOptions = `

GENERATION OPTIONS:
- Generate Vocabulary: ${generateVocabulary}
- Generate Exercises: ${generateExercises}
- Generate Conversation: ${generateConversation}
- Generate Cultural Notes: ${generateCulturalNotes}`;

  // Different JSON structure for role-play vs standard modules
  const jsonStructure = moduleType === 'roleplay' ? `
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
    "rolePlayScenario": {
      "situation": "Generate appropriate situation based on the roles",
      "setting": "Generate detailed setting description",
      "studentRole": "${studentRole || 'Student'}",
      "aiRole": "${aiRole || 'Tutor'}",
      "objective": "Generate clear objective for this role-play",
      "aiPersonality": "Generate personality that fits the AI role",
      "studentGuidance": "Generate guidance appropriate for the student role",
      "aiOpeningLines": ["Generate 3-5 opening lines", "that fit the AI role", "and scenario"],
      "suggestedStudentResponses": ["Generate 3-5 responses", "that help students start", "the conversation"]
    },
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
    "conversationFlow": [
      {
        "stage": "Generate stage name",
        "aiPrompts": ["Generate AI prompts for this stage"],
        "expectedResponses": ["Generate expected student responses"],
        "helpfulPhrases": ["Generate helpful phrases"]
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
        "type": "role-play",
        "question": "Role-play exercise description",
        "options": [],
        "correctAnswer": "",
        "explanation": "Role-play guidance",
        "points": 1
      }
    ]
  },
  "aiTutorConfig": {
    "personality": "Generate personality based on AI role",
    "focusAreas": ["Role-play conversation", "Situational vocabulary", "Natural dialogue flow"],
    "helpfulPhrases": ["Generate phrases relevant to the scenario"],
    "commonMistakes": ["Generate common mistakes for this scenario"],
    "culturalNotes": ["Generate cultural notes if relevant"],
    "rolePlayInstructions": {
      "aiRole": "${aiRole || 'Tutor'}",
      "aiPersonality": "Generate detailed AI personality",
      "openingLines": ["Generate opening lines"],
      "studentRole": "${studentRole || 'Student'}",
      "studentGuidance": "Generate detailed student guidance",
      "suggestedResponses": ["Generate suggested responses"]
    }
  },
  "tags": ["role-play", "${level.toLowerCase()}", "${category.toLowerCase()}"]
}` : `
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
}`;

  const requirements_text = moduleType === 'roleplay' ? `

REQUIREMENTS FOR ROLE-PLAY MODULE:
1. INTELLIGENTLY GENERATE scenario details based on the student and AI roles
2. CREATE realistic situation that makes sense for these roles (e.g., if student=Customer and AI=Waiter, generate restaurant scenario)
3. GENERATE appropriate setting description that fits the situation
4. CREATE clear objective that matches what these roles would realistically do together
5. DEVELOP AI personality that authentically represents the AI role
6. WRITE student guidance that helps them understand their role and reduces anxiety
7. GENERATE 3-5 varied AI opening lines that fit the role and scenario
8. CREATE 3-5 helpful student response suggestions to get them started
9. DESIGN conversation flow stages that naturally progress through the scenario
10. INCLUDE 10-20 vocabulary words relevant to the specific scenario
11. ENSURE all content is appropriate for ${level} level
12. FOCUS on practical, real-world conversation for these specific roles
13. MAKE the role-play engaging and educational

IMPORTANT: Use your intelligence to create a cohesive, realistic scenario based on just the two roles provided!` : `
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
11. Always include correctAnswer and explanation for exercises`;

  return basePrompt + rolePlayInfo + generationOptions + `

Please create a complete learning module and respond with ONLY a valid JSON object in this exact format (NO markdown, NO code blocks, JUST the JSON):
` + jsonStructure + requirements_text + `

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
      personality: generatedModule.aiTutorConfig?.personality || originalRequest.aiPersonality || `friendly and encouraging ${originalRequest.targetLanguage} tutor`,
      focusAreas: generatedModule.aiTutorConfig?.focusAreas || [originalRequest.category],
      helpfulPhrases: generatedModule.aiTutorConfig?.helpfulPhrases || [],
      commonMistakes: generatedModule.aiTutorConfig?.commonMistakes || [],
      culturalNotes: generatedModule.aiTutorConfig?.culturalNotes || [],
      
      // Add role-play instructions if it's a role-play module
      ...(originalRequest.moduleType === 'roleplay' && {
        rolePlayInstructions: {
          aiRole: originalRequest.aiRole || 'Tutor',
          aiPersonality: originalRequest.aiPersonality || 'Friendly and encouraging tutor',
          openingLines: generatedModule.aiTutorConfig?.rolePlayInstructions?.openingLines || 
                       generatedModule.content?.rolePlayScenario?.aiOpeningLines || [],
          studentRole: originalRequest.studentRole || 'Student',
          studentGuidance: originalRequest.studentGuidance || 'Be natural and don\'t worry about making mistakes',
          suggestedResponses: generatedModule.aiTutorConfig?.rolePlayInstructions?.suggestedResponses || 
                             generatedModule.content?.rolePlayScenario?.suggestedStudentResponses || []
        }
      })
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
  // For AI-assisted creation, the AI should have generated all the details
  // We just need to extract them from the generated content
  if (generatedModule.content?.rolePlayScenario) {
    return {
      situation: generatedModule.content.rolePlayScenario.situation,
      setting: generatedModule.content.rolePlayScenario.setting,
      studentRole: originalRequest.studentRole || generatedModule.content.rolePlayScenario.studentRole,
      aiRole: originalRequest.aiRole || generatedModule.content.rolePlayScenario.aiRole,
      objective: generatedModule.content.rolePlayScenario.objective,
      aiPersonality: generatedModule.content.rolePlayScenario.aiPersonality,
      studentGuidance: generatedModule.content.rolePlayScenario.studentGuidance,
      aiOpeningLines: generatedModule.content.rolePlayScenario.aiOpeningLines || [],
      suggestedStudentResponses: generatedModule.content.rolePlayScenario.suggestedStudentResponses || []
    };
  }
  
  // Fallback: Generate basic scenario from roles if AI didn't provide details
  const studentRole = originalRequest.studentRole || 'Student';
  const aiRole = originalRequest.aiRole || 'Tutor';
  
  // Intelligent scenario generation based on roles
  let situation = 'General conversation';
  let setting = 'A friendly learning environment';
  
  if (aiRole.toLowerCase().includes('waiter') || aiRole.toLowerCase().includes('server')) {
    situation = 'At a restaurant';
    setting = 'A busy restaurant with authentic cuisine';
  } else if (aiRole.toLowerCase().includes('shop') || aiRole.toLowerCase().includes('sales')) {
    situation = 'Shopping';
    setting = 'A popular retail store';
  } else if (aiRole.toLowerCase().includes('hotel') || aiRole.toLowerCase().includes('reception')) {
    situation = 'At a hotel';
    setting = 'A hotel lobby with reception desk';
  } else if (aiRole.toLowerCase().includes('interview') || aiRole.toLowerCase().includes('employer')) {
    situation = 'Job interview';
    setting = 'A professional office environment';
  } else if (aiRole.toLowerCase().includes('doctor') || aiRole.toLowerCase().includes('medical')) {
    situation = 'Medical consultation';
    setting = 'A doctor\'s office or clinic';
  }
  
  return {
    situation,
    setting,
    studentRole,
    aiRole,
    objective: `Practice ${originalRequest.targetLanguage} conversation between ${studentRole} and ${aiRole}`,
    aiPersonality: `Professional and helpful ${aiRole} who is patient with language learners`,
    studentGuidance: `You are playing the role of ${studentRole}. Be natural, ask questions if you don't understand, and don't worry about making mistakes.`,
    aiOpeningLines: [],
    suggestedStudentResponses: []
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

  // Ensure required fields are not undefined
  module.title = module.title || 'Generated Module';
  module.description = module.description || 'AI-generated learning module';
  module.targetLanguage = module.targetLanguage || 'English';
  module.nativeLanguage = module.nativeLanguage || 'English';
  module.level = module.level || 'A1';
  module.category = module.category || 'Conversation';
  module.difficulty = module.difficulty || 'Beginner';
  module.estimatedDuration = module.estimatedDuration || 30;

  // Ensure content structure exists
  if (!module.content) {
    module.content = {};
  }
  module.content.introduction = module.content.introduction || 'Welcome to this learning module.';
  module.content.keyTopics = module.content.keyTopics || [];
  module.content.allowedVocabulary = module.content.allowedVocabulary || [];
  module.content.allowedGrammar = module.content.allowedGrammar || [];
  module.content.examples = module.content.examples || [];
  module.content.exercises = module.content.exercises || [];

  // Ensure learning objectives exist
  if (!module.learningObjectives || module.learningObjectives.length === 0) {
    module.learningObjectives = [
      {
        objective: `Learn ${module.category.toLowerCase()} skills`,
        description: `Develop ${module.level} level abilities`
      }
    ];
  }

  // Ensure AI tutor config exists
  if (!module.aiTutorConfig) {
    module.aiTutorConfig = {};
  }
  module.aiTutorConfig.personality = module.aiTutorConfig.personality || `friendly ${module.targetLanguage} tutor`;
  module.aiTutorConfig.focusAreas = module.aiTutorConfig.focusAreas || [module.category];
  module.aiTutorConfig.helpfulPhrases = module.aiTutorConfig.helpfulPhrases || [];
  module.aiTutorConfig.commonMistakes = module.aiTutorConfig.commonMistakes || [];
  module.aiTutorConfig.culturalNotes = module.aiTutorConfig.culturalNotes || [];

  // Ensure tags exist
  module.tags = module.tags || [module.level.toLowerCase(), module.category.toLowerCase()];

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

// Helper function to find undefined fields recursively
function findUndefinedFields(obj, path = '') {
  const undefinedFields = [];
  
  if (obj === null || obj === undefined) {
    return [path || 'root'];
  }
  
  if (typeof obj !== 'object') {
    return [];
  }
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value === undefined) {
      undefinedFields.push(currentPath);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      undefinedFields.push(...findUndefinedFields(value, currentPath));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item === undefined) {
          undefinedFields.push(`${currentPath}[${index}]`);
        } else if (item !== null && typeof item === 'object') {
          undefinedFields.push(...findUndefinedFields(item, `${currentPath}[${index}]`));
        }
      });
    }
  }
  
  return undefinedFields;
}

module.exports = router;