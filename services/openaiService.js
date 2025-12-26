// services/openaiService.js
// OpenAI ChatGPT-4o Integration for German Language Tutoring

const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1500;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
  }

  /**
   * Generate AI tutor response using ChatGPT-4o
   */
  async generateTutorResponse(context) {
    try {
      const { message, module, sessionType, previousMessages, studentLevel } = context;
      
      const systemPrompt = this.buildSystemPrompt(module, sessionType, studentLevel);
      const conversationHistory = this.buildConversationHistory(previousMessages);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
        // Removed response_format to fix the error
      });

      // Parse response - try JSON first, fallback to plain text
      let response;
      try {
        const content = completion.choices[0].message.content;
        
        // Check if response is wrapped in ```json blocks
        if (content.includes('```json')) {
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            response = JSON.parse(jsonMatch[1]);
          } else {
            throw new Error('JSON block found but could not extract');
          }
        } else {
          // Try to parse as direct JSON
          response = JSON.parse(content);
        }
      } catch (error) {
        // If not JSON, create a simple response object
        const content = completion.choices[0].message.content
          .replace(/```json\s*/, '')
          .replace(/\s*```/, '')
          .trim();
          
        response = {
          content: content,
          messageType: 'text',
          suggestions: [],
          metadata: {}
        };
      }
      
      return {
        content: response.content,
        messageType: response.messageType || 'text',
        suggestions: response.suggestions || [],
        exercise: response.exercise || null,
        metadata: response.metadata || {}
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getFallbackResponse(context);
    }
  }

  /**
   * Evaluate student's answer using AI
   */
  async evaluateGermanAnswer(studentAnswer, correctAnswer, context) {
    try {
      const { module, exerciseType, question } = context;
      const targetLang = module.targetLanguage || 'German';
      const nativeLang = module.nativeLanguage || 'English';
      
      const evaluationPrompt = `
        As a ${targetLang} language expert, evaluate this student's answer:
        
        Question: ${question}
        Correct Answer: ${correctAnswer}
        Student Answer: ${studentAnswer}
        Exercise Type: ${exerciseType}
        Module: ${module.title} (${module.level})
        Target Language: ${targetLang}
        Native Language: ${nativeLang}
        
        Provide evaluation in JSON format:
        {
          "isCorrect": boolean,
          "score": number (0-100),
          "feedback": "detailed feedback in ${nativeLang}",
          "${targetLang.toLowerCase()}Explanation": "explanation in ${targetLang} if appropriate",
          "suggestions": ["suggestion1", "suggestion2"],
          "commonMistake": "if this is a common mistake, explain it in ${nativeLang}",
          "pronunciation": "pronunciation tips if relevant"
        }
      `;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: `You are an expert ${targetLang} language teacher providing detailed feedback in ${nativeLang}.` },
          { role: 'user', content: evaluationPrompt }
        ],
        max_tokens: 800,
        temperature: 0.3 // Lower temperature for more consistent evaluation
        // Removed response_format to fix the error
      });

      // Parse response - try JSON first, fallback to simple evaluation
      let evaluation;
      try {
        evaluation = JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        // If not JSON, create a simple evaluation
        const content = completion.choices[0].message.content;
        const isCorrect = content.toLowerCase().includes('correct') || content.toLowerCase().includes('right');
        evaluation = {
          isCorrect,
          score: isCorrect ? 100 : 0,
          feedback: content,
          suggestions: []
        };
      }
      
      return {
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback,
        targetLanguageExplanation: evaluation[`${targetLang.toLowerCase()}Explanation`],
        suggestions: evaluation.suggestions || [],
        commonMistake: evaluation.commonMistake,
        pronunciation: evaluation.pronunciation,
        points: evaluation.isCorrect ? 1 : 0
      };
    } catch (error) {
      console.error('OpenAI Evaluation Error:', error);
      return this.getFallbackEvaluation(studentAnswer, correctAnswer);
    }
  }

  /**
   * Generate dynamic exercises using AI
   */
  async generateExercise(module, difficulty, exerciseType = 'multiple-choice') {
    try {
      const targetLang = module.targetLanguage || 'German';
      const nativeLang = module.nativeLanguage || 'English';
      
      const exercisePrompt = `
        Create a ${targetLang} language exercise for:
        
        Module: ${module.title}
        Target Language: ${targetLang}
        Native Language: ${nativeLang} (for instructions)
        Level: ${module.level}
        Category: ${module.category}
        Difficulty: ${difficulty}
        Exercise Type: ${exerciseType}
        Key Topics: ${module.content.keyTopics?.join(', ') || `General ${targetLang}`}
        
        Generate exercise in JSON format:
        {
          "type": "${exerciseType}",
          "question": "exercise question in ${nativeLang}",
          "${targetLang.toLowerCase()}Text": "${targetLang} text if applicable",
          "options": ["option1", "option2", "option3", "option4"] (for multiple choice),
          "correctAnswer": "correct answer",
          "explanation": "why this is correct (in ${nativeLang})",
          "difficulty": "${difficulty}",
          "points": number,
          "hints": ["hint1", "hint2"] (in ${nativeLang}),
          "culturalNote": "cultural context if relevant to ${targetLang}-speaking countries"
        }
      `;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: `You are a ${targetLang} language teacher creating educational exercises. Provide instructions in ${nativeLang} and examples in ${targetLang}.` },
          { role: 'user', content: exercisePrompt }
        ],
        max_tokens: 1000,
        temperature: 0.8 // Higher creativity for exercise generation
        // Removed response_format to fix the error
      });

      // Parse response - try JSON first, fallback to simple exercise
      let exercise;
      try {
        exercise = JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        // If not JSON, create a simple exercise
        exercise = this.getFallbackExercise(module, exerciseType);
      }
      return exercise;
    } catch (error) {
      console.error('OpenAI Exercise Generation Error:', error);
      return this.getFallbackExercise(module, exerciseType);
    }
  }

  /**
   * Convert text to speech using OpenAI TTS
   */
  async textToSpeech(text, voice = 'alloy') {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        input: text,
        speed: 0.9 // Slightly slower for language learning
      });

      return mp3.body; // Returns audio stream
    } catch (error) {
      console.error('OpenAI TTS Error:', error);
      return null;
    }
  }

  /**
   * Convert speech to text using OpenAI Whisper
   */
  async speechToText(audioBuffer, language = 'de') {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioBuffer,
        model: 'whisper-1',
        language: language,
        response_format: 'json',
        temperature: 0.2 // Lower temperature for more accurate transcription
      });

      return {
        text: transcription.text,
        confidence: transcription.confidence || 0.9
      };
    } catch (error) {
      console.error('OpenAI Whisper Error:', error);
      return { text: '', confidence: 0 };
    }
  }

  /**
   * Build system prompt based on context
   */
  buildSystemPrompt(module, sessionType, studentLevel) {
    const targetLang = module.targetLanguage || 'German';
    const nativeLang = module.nativeLanguage || 'English';
    
    // Check if this is a role-play module
    const isRolePlay = module.content?.rolePlayScenario;
    
    if (isRolePlay) {
      return this.buildRolePlaySystemPrompt(module, sessionType, studentLevel, targetLang, nativeLang);
    }
    
    // Regular module prompt (existing code)
    const basePrompt = `You are an expert ${targetLang} language tutor with years of experience teaching ${targetLang} to international students. You are patient, encouraging, and adapt your teaching style to each student's needs.

Current Context:
- Target Language: ${targetLang} (language being learned)
- Native Language: ${nativeLang} (language for explanations)
- Module: ${module.title}
- Level: ${module.level} 
- Category: ${module.category}
- Session Type: ${sessionType}
- Student Level: ${studentLevel}

Module Details:
- Description: ${module.description}
- Key Topics: ${module.content.keyTopics?.join(', ') || `General ${targetLang}`}
- Learning Objectives: ${module.learningObjectives?.map(obj => obj.objective).join(', ') || 'Language practice'}

AI Tutor Personality: ${module.aiTutorConfig?.personality || `friendly and encouraging ${targetLang} tutor`}
Focus Areas: ${module.aiTutorConfig?.focusAreas?.join(', ') || `general ${targetLang} skills`}
Helpful Phrases: ${module.aiTutorConfig?.helpfulPhrases?.join(', ') || `basic ${targetLang} phrases`}

Instructions:
1. Always respond in a helpful, encouraging manner
2. Provide explanations in ${nativeLang} but include ${targetLang} examples
3. Correct mistakes gently and explain why in ${nativeLang}
4. Offer cultural context when relevant to ${targetLang}-speaking countries
5. Adapt difficulty to student's level
6. Use the module's focus areas to guide your responses
7. Include pronunciation tips when helpful (use phonetic spelling or IPA)
8. Provide practical examples students can use in real ${targetLang} conversations

Language-Specific Guidelines:
${this.getLanguageSpecificGuidelines(targetLang, nativeLang)}

Response Format:
Always respond with valid JSON in this format:
{
  "content": "your main response text in ${nativeLang}",
  "messageType": "text|exercise|feedback|hint|correction|encouragement",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "exercise": null or exercise object if generating one,
  "metadata": {
    "${targetLang.toLowerCase()}Phrase": "relevant ${targetLang} phrase if applicable",
    "pronunciation": "pronunciation guide if needed",
    "culturalNote": "cultural context if relevant"
  }
}`;

    // Add session-specific instructions
    switch (sessionType) {
      case 'practice':
        return basePrompt + `\n\nSession Focus: Interactive practice with exercises and immediate feedback. Create engaging practice opportunities for ${targetLang} learning.`;
      
      case 'conversation':
        return basePrompt + `\n\nSession Focus: Free-form ${targetLang} conversation. Encourage the student to speak ${targetLang} as much as possible. Correct mistakes naturally within the conversation flow.`;
      
      case 'assessment':
        return basePrompt + `\n\nSession Focus: Testing and evaluation of ${targetLang} skills. Create exercises to assess the student's understanding. Provide detailed feedback on performance.`;
      
      case 'help':
        return basePrompt + `\n\nSession Focus: Answering questions and providing explanations about ${targetLang}. Be thorough in your explanations and provide multiple examples.`;
      
      case 'review':
        return basePrompt + `\n\nSession Focus: Reviewing previous ${targetLang} topics and reinforcing learning. Help consolidate knowledge and identify areas for improvement.`;
      
      default:
        return basePrompt;
    }
  }

  /**
   * Build role-play specific system prompt with constraints
   */
  buildRolePlaySystemPrompt(module, sessionType, studentLevel, targetLang, nativeLang) {
    const scenario = module.content.rolePlayScenario;
    const allowedVocab = module.content.allowedVocabulary || [];
    const allowedGrammar = module.content.allowedGrammar || [];
    const conversationFlow = module.content.conversationFlow || [];

    const rolePlayPrompt = `🎭 ROLE-PLAY LANGUAGE TUTOR - SESSION MANAGER

ROLE-PLAY SCENARIO:
- Situation: ${scenario.situation}
- Setting: ${scenario.setting || 'Not specified'}
- Your Role: ${scenario.aiRole}
- Student Role: ${scenario.studentRole}
- Objective: ${scenario.objective || 'Practice natural conversation'}

SESSION STATES - FOLLOW THIS FLOW:

1. INTRODUCTION STATE (when session starts):
   - Explain the role-play scenario in ${nativeLang}
   - Describe the situation and setting
   - Clearly state: "I will be the ${scenario.aiRole} and you will be the ${scenario.studentRole}"
   - Explain the objective: "${scenario.objective}"
   - List the vocabulary constraints (show 5-8 key words as examples)
   - Ask student to say "Let's start" or "Begin" to start the role-play
   - DO NOT start role-playing until student says the trigger words

2. ROLE-PLAY STATE (after student says "Let's start" or "Begin"):
   - Switch to character as ${scenario.aiRole}
   - RESPOND ONLY IN ${targetLang} (the language being learned)
   - Use ONLY the allowed vocabulary and grammar
   - Follow the conversation flow stages
   - Stay in character throughout
   - Track progress toward the objective

3. COMPLETION STATE (when objective is achieved):
   - Recognize when the role-play objective is completed
   - Break character and congratulate the student in ${nativeLang}
   - Summarize what was accomplished
   - Ask if they want to practice again or end the session

4. MANUAL STOP (if student says "stop", "end", "finish", "quit"):
   - Break character immediately
   - Thank them for practicing
   - Provide encouragement
   - End the session gracefully

VOCABULARY CONSTRAINTS (CRITICAL - ONLY USE THESE):
${allowedVocab.map(v => `${v.word} (${v.translation})`).join(', ')}

GRAMMAR CONSTRAINTS (CRITICAL - ONLY USE THESE):
${allowedGrammar.map(g => `${g.structure}: ${g.examples.join(', ')}`).join(' | ')}

CONVERSATION FLOW STAGES:
${conversationFlow.length > 0 ? 
  conversationFlow.map((flow, index) => 
    `Stage ${index + 1} "${flow.stage}": AI says: ${flow.aiPrompts.join(' OR ')}. Student should: ${flow.expectedResponses.join(' OR ')}`
  ).join('\n') 
  : 'No specific flow - let conversation develop naturally within constraints'}

IMPORTANT: Always respond in plain text, not JSON format. Be natural and conversational.

LANGUAGE INSTRUCTIONS:
- INTRODUCTION STATE: Respond in ${nativeLang} (for explanations)
- ROLE-PLAY STATE: Respond ONLY in ${targetLang} (the language being learned)
- COMPLETION STATE: Respond in ${nativeLang} (for congratulations)

CRITICAL RULES:
1. START in INTRODUCTION state - explain everything before role-playing
2. WAIT for "Let's start" or "Begin" before switching to role-play
3. DURING ROLE-PLAY: Use ONLY ${targetLang} language and allowed vocabulary/grammar
4. DETECT when objective is completed and switch to completion state
5. RESPOND to stop words ("stop", "end", "finish", "quit") immediately
6. STAY in character during active role-play state
7. TRACK progress toward the objective throughout the session

Remember: You are managing a structured role-play session with clear states and transitions!`;

    return rolePlayPrompt;
  }

  /**
   * Build conversation history for context
   */
  buildConversationHistory(previousMessages) {
    if (!previousMessages || previousMessages.length === 0) {
      return [];
    }

    // Convert messages to OpenAI format, keeping last 10 messages for context
    return previousMessages.slice(-10).map(msg => ({
      role: msg.role === 'tutor' ? 'assistant' : 'user',
      content: msg.content
    }));
  }

  /**
   * Fallback response when OpenAI fails
   */
  getFallbackResponse(context) {
    const { sessionType, module } = context;
    
    const fallbackResponses = {
      practice: `Let's practice some German! I'm here to help you with ${module.title}. What would you like to work on?`,
      conversation: `Hallo! Let's have a German conversation. Try to speak as much German as you can!`,
      assessment: `I'll help you test your knowledge of ${module.title}. Are you ready for some questions?`,
      help: `I'm here to help you understand German better. What specific topic would you like me to explain?`,
      review: `Let's review what you've learned in ${module.title}. What topic should we start with?`
    };

    return {
      content: fallbackResponses[sessionType] || fallbackResponses.practice,
      messageType: 'text',
      suggestions: [
        'Can you help me with pronunciation?',
        'I need practice with grammar',
        'Let\'s do some exercises'
      ]
    };
  }

  /**
   * Fallback evaluation when OpenAI fails
   */
  getFallbackEvaluation(studentAnswer, correctAnswer) {
    const isCorrect = studentAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect 
        ? 'Correct! Well done!' 
        : `Not quite right. The correct answer is: ${correctAnswer}`,
      points: isCorrect ? 1 : 0
    };
  }

  /**
   * Fallback exercise when OpenAI fails
   */
  getFallbackExercise(module, exerciseType) {
    return {
      type: exerciseType,
      question: `Practice question for ${module.title}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'This is a practice exercise.',
      points: 1
    };
  }

  /**
   * Get language-specific teaching guidelines
   */
  getLanguageSpecificGuidelines(targetLang, nativeLang) {
    const guidelines = {
      'German': `
- Focus on German grammar rules (cases, verb conjugations, word order)
- Emphasize pronunciation of umlauts (ä, ö, ü) and ß
- Explain German cultural context and formality levels (Sie vs du)
- Include compound words and their formation
- Mention regional variations when relevant`,
      
      'English': `
- Focus on English grammar (tenses, articles, prepositions)
- Emphasize pronunciation differences and silent letters
- Explain cultural context and formality levels
- Include phrasal verbs and idiomatic expressions
- Mention British vs American English differences when relevant`,
      
      'Spanish': `
- Focus on Spanish grammar (gender, verb conjugations, subjunctive)
- Emphasize pronunciation of rolled R and accent marks
- Explain cultural context across Spanish-speaking countries
- Include formal vs informal address (tú vs usted)
- Mention regional variations when relevant`,
      
      'French': `
- Focus on French grammar (gender, verb conjugations, liaisons)
- Emphasize pronunciation of nasal sounds and silent letters
- Explain cultural context and formality levels (tu vs vous)
- Include accent marks and their importance
- Mention francophone cultural differences when relevant`,
      
      'Italian': `
- Focus on Italian grammar (gender, verb conjugations, articles)
- Emphasize pronunciation and double consonants
- Explain cultural context and regional variations
- Include formal vs informal address (tu vs Lei)
- Mention Italian cultural nuances when relevant`,
      
      'Portuguese': `
- Focus on Portuguese grammar (gender, verb conjugations, articles)
- Emphasize pronunciation differences from Spanish
- Explain cultural context (Brazilian vs European Portuguese)
- Include formal vs informal address
- Mention regional variations when relevant`,
      
      'Dutch': `
- Focus on Dutch grammar (word order, verb conjugations)
- Emphasize pronunciation of unique Dutch sounds
- Explain cultural context in Netherlands and Belgium
- Include formal vs informal address (je vs u)
- Mention regional variations when relevant`,
      
      'Swedish': `
- Focus on Swedish grammar (definite articles, verb conjugations)
- Emphasize pronunciation and pitch accent
- Explain cultural context and Swedish social norms
- Include formal vs informal address (du vs ni)
- Mention regional variations when relevant`
    };
    
    return guidelines[targetLang] || `
- Focus on ${targetLang} grammar and pronunciation
- Provide cultural context relevant to ${targetLang}-speaking regions
- Explain formality levels and social conventions
- Include practical examples for real-world use`;
  }

  /**
   * Check if OpenAI is properly configured
   */
  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * Test OpenAI connection
   */
  async testConnection() {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });
      
      return { success: true, message: 'OpenAI connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = OpenAIService;