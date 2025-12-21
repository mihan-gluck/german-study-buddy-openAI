// routes/aiTutor.js

const express = require('express');
const router = express.Router();
const AiTutorSession = require('../models/AiTutorSession');
const LearningModule = require('../models/LearningModule');
const StudentProgress = require('../models/StudentProgress');
const { verifyToken, checkRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const OpenAIService = require('../services/openaiService');

// Initialize OpenAI service
const openaiService = new OpenAIService();

// Enhanced AI Tutor Service using ChatGPT-4o
class AiTutorService {
  static async generateResponse(message, context) {
    // Check if OpenAI is configured
    if (openaiService.isConfigured()) {
      try {
        console.log('🤖 Using OpenAI ChatGPT-4o for response generation');
        return await openaiService.generateTutorResponse({
          message,
          ...context
        });
      } catch (error) {
        console.error('❌ OpenAI service error, falling back to mock:', error);
        return this.generateMockResponse(message, context);
      }
    } else {
      console.warn('⚠️ OpenAI not configured, using mock responses');
      return this.generateMockResponse(message, context);
    }
  }

  static async evaluateAnswer(studentAnswer, correctAnswer, context) {
    // Use OpenAI for intelligent evaluation
    if (openaiService.isConfigured()) {
      try {
        return await openaiService.evaluateGermanAnswer(studentAnswer, correctAnswer, context);
      } catch (error) {
        console.error('OpenAI evaluation error, falling back to simple evaluation:', error);
        return this.simpleMockEvaluation(studentAnswer, correctAnswer);
      }
    } else {
      return this.simpleMockEvaluation(studentAnswer, correctAnswer);
    }
  }

  static async generateExercise(module, difficulty = 'medium', exerciseType = 'multiple-choice') {
    // Use OpenAI to generate dynamic exercises
    if (openaiService.isConfigured()) {
      try {
        return await openaiService.generateExercise(module, difficulty, exerciseType);
      } catch (error) {
        console.error('OpenAI exercise generation error, falling back to mock:', error);
        return this.generateMockExercise(module, exerciseType);
      }
    } else {
      return this.generateMockExercise(module, exerciseType);
    }
  }

  // Fallback mock responses (keep existing implementation as backup)
  static generateMockResponse(message, context) {
    const { module, sessionType } = context;
    
    if (sessionType === 'practice') {
      return this.generatePracticeResponse(message, module);
    } else if (sessionType === 'assessment') {
      return this.generateAssessmentResponse(message, module);
    } else if (sessionType === 'help') {
      return this.generateHelpResponse(message, module);
    } else {
      return this.generateConversationResponse(message, module);
    }
  }
  
  static generatePracticeResponse(message, module) {
    const responses = [
      `Great question! Let's practice this German concept from the ${module.title} module.`,
      `I see you're working on ${module.category}. Let me help you with that.`,
      `Excellent! That's related to our current topic. Here's what you need to know...`,
      `Let's break this down step by step. In German, this concept works like this...`
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      messageType: 'text',
      suggestions: [
        'Can you give me an example?',
        'I need more practice with this',
        'What are common mistakes?'
      ]
    };
  }
  
  static generateAssessmentResponse(message, module) {
    // Generate a random exercise from the module
    if (module.content.exercises && module.content.exercises.length > 0) {
      const exercise = module.content.exercises[Math.floor(Math.random() * module.content.exercises.length)];
      
      return {
        content: `Let's test your understanding: ${exercise.question}`,
        messageType: 'exercise',
        exercise: {
          type: exercise.type,
          question: exercise.question,
          options: exercise.options,
          correctAnswer: exercise.correctAnswer,
          points: exercise.points
        }
      };
    }
    
    return {
      content: 'Let me create a custom exercise for you based on what we\'ve been learning.',
      messageType: 'text'
    };
  }
  
  static generateHelpResponse(message, module) {
    const helpResponses = [
      `I'm here to help! What specific part of ${module.title} are you struggling with?`,
      `No worries, let's work through this together. Can you tell me what's confusing you?`,
      `That's a common question in German learning. Let me explain it clearly...`,
      `Great question! This is an important concept in German. Here's how it works...`
    ];
    
    return {
      content: helpResponses[Math.floor(Math.random() * helpResponses.length)],
      messageType: 'help',
      suggestions: [
        'I don\'t understand the grammar',
        'Can you explain with examples?',
        'What are the rules for this?'
      ]
    };
  }
  
  static generateConversationResponse(message, module) {
    const conversationStarters = [
      `Hallo! Let's practice German conversation. How are you today? (Wie geht es dir heute?)`,
      `Great! Let's have a conversation in German. Tell me about your day in German.`,
      `Wunderbar! Let's practice speaking. What would you like to talk about in German?`,
      `Perfect! Let's start a German conversation. Try to respond in German as much as possible.`
    ];
    
    return {
      content: conversationStarters[Math.floor(Math.random() * conversationStarters.length)],
      messageType: 'conversation',
      suggestions: [
        'Mir geht es gut, danke!',
        'Ich möchte über das Wetter sprechen',
        'Can you help me with pronunciation?'
      ]
    };
  }
  
  static simpleMockEvaluation(studentAnswer, correctAnswer) {
    // Simple evaluation logic - enhance based on exercise type
    const isCorrect = studentAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    let feedback = '';
    if (isCorrect) {
      feedback = 'Excellent! That\'s correct. Well done!';
    } else {
      feedback = `Not quite right. The correct answer is: ${correctAnswer}. Let me explain why...`;
    }
    
    return {
      isCorrect,
      feedback,
      points: isCorrect ? 1 : 0,
      score: isCorrect ? 100 : 0
    };
  }

  static generateMockExercise(module, exerciseType) {
    // Generate a simple mock exercise
    const exercises = {
      'multiple-choice': {
        type: 'multiple-choice',
        question: `Which greeting is appropriate for ${module.level} level?`,
        options: ['Hallo', 'Guten Tag', 'Servus', 'Moin'],
        correctAnswer: module.level === 'A1' ? 'Hallo' : 'Guten Tag',
        explanation: 'This is the most common greeting for this level.',
        points: 1
      },
      'translation': {
        type: 'translation',
        question: 'Translate: "Hello, how are you?"',
        correctAnswer: 'Hallo, wie geht es dir?',
        explanation: 'This is a basic German greeting.',
        points: 2
      }
    };

    return exercises[exerciseType] || exercises['multiple-choice'];
  }
}

// POST /api/ai-tutor/start-session - Start new tutoring session
router.post('/start-session', verifyToken, checkRole(['STUDENT']), async (req, res) => {
  try {
    const { moduleId, sessionType = 'practice' } = req.body;
    const studentId = req.user.id;
    
    // Validate module exists and student is enrolled
    const module = await LearningModule.findById(moduleId);
    if (!module || !module.isActive) {
      return res.status(404).json({ message: 'Module not found or inactive' });
    }
    
    // Debug: Log module content to see what's loaded
    console.log('🔍 Module loaded:', {
      title: module.title,
      hasRolePlayScenario: !!module.content?.rolePlayScenario,
      rolePlayScenario: module.content?.rolePlayScenario
    });
    
    const progress = await StudentProgress.findOne({ studentId, moduleId });
    if (!progress) {
      // Auto-enroll student if not enrolled (for testing)
      const newProgress = new StudentProgress({
        studentId,
        moduleId,
        enrollmentDate: new Date(),
        status: 'in-progress'
      });
      await newProgress.save();
      console.log('📝 Auto-enrolled student in module');
    }
    
    // Create new session
    const sessionId = uuidv4();
    const session = new AiTutorSession({
      sessionId,
      studentId,
      moduleId,
      sessionType,
      context: {
        previousSessions: await AiTutorSession.countDocuments({ studentId, moduleId }),
        currentLevel: module.level,
        strugglingAreas: [], // TODO: Analyze from previous sessions
        strongAreas: [], // TODO: Analyze from previous sessions
        preferredLearningStyle: 'interactive' // TODO: Get from user profile
      }
    });
    
    // Generate welcome message
    const welcomeContext = {
      module,
      studentLevel: module.level,
      sessionType,
      previousMessages: []
    };
    
    let welcomeResponse;
    
    // Check if this is a role-play module
    if (module.content?.rolePlayScenario) {
      // For role-play modules, start with introduction state
      const scenario = module.content.rolePlayScenario;
      
      welcomeResponse = {
        content: `Welcome to the Role-Play Session! You will be the ${scenario.studentRole}, I will be the ${scenario.aiRole}. Say "Let's start" to begin or "stop" to end the session.`,
        messageType: 'role-play-intro',
        metadata: {
          sessionState: 'introduction',
          waitingForTrigger: true,
          // Include all detailed info for visual display
          rolePlayDetails: {
            scenario: scenario.situation,
            setting: scenario.setting || 'A typical situation',
            studentRole: scenario.studentRole,
            aiRole: scenario.aiRole,
            objective: scenario.objective || 'Practice natural conversation',
            allowedVocabulary: module.content.allowedVocabulary || [],
            allowedGrammar: module.content.allowedGrammar || [],
            conversationFlow: module.content.conversationFlow || []
          }
        }
      };
    } else {
      // Regular module welcome
      welcomeResponse = await AiTutorService.generateResponse(
        'start_session',
        welcomeContext
      );
    }
    
    // Add welcome message
    session.messages.push({
      role: 'tutor',
      content: welcomeResponse.content,
      messageType: welcomeResponse.messageType || 'text',
      metadata: welcomeResponse.metadata || {}
    });
    
    await session.save();
    
    res.status(201).json({
      sessionId: session.sessionId,
      message: 'Session started successfully',
      welcomeMessage: session.messages[0],
      suggestions: welcomeResponse.suggestions || []
    });
  } catch (error) {
    console.error('Error starting AI tutor session:', error);
    res.status(500).json({ message: 'Error starting tutoring session' });
  }
});

// POST /api/ai-tutor/send-message - Send message to AI tutor
router.post('/send-message', verifyToken, checkRole(['STUDENT']), async (req, res) => {
  try {
    const { sessionId, message, messageType = 'text', exerciseAnswer } = req.body;
    const studentId = req.user.id;
    
    // Find session
    const session = await AiTutorSession.findOne({ 
      sessionId, 
      studentId,
      status: 'active'
    }).populate('moduleId');
    
    if (!session) {
      return res.status(404).json({ message: 'Active session not found' });
    }
    
    // Add student message
    const studentMessage = {
      role: 'student',
      content: message,
      messageType,
      timestamp: new Date()
    };
    
    if (exerciseAnswer) {
      studentMessage.metadata = { studentAnswer: exerciseAnswer };
    }
    
    session.messages.push(studentMessage);
    
    // Check for role-play session control commands
    const isRolePlayModule = session.moduleId.content?.rolePlayScenario;
    const lowerMessage = message.toLowerCase().trim();
    
    // Check for stop commands
    const stopCommands = ['stop', 'end', 'finish', 'quit', 'exit'];
    if (stopCommands.some(cmd => lowerMessage.includes(cmd))) {
      const stopResponse = {
        content: `Thank you for practicing! You did great in this role-play session. 

**Session Summary:**
- Scenario: ${session.moduleId.content?.rolePlayScenario?.situation || 'Language practice'}
- Your role: ${session.moduleId.content?.rolePlayScenario?.studentRole || 'Student'}
- Practice time: ${Math.round((Date.now() - session.startTime) / 60000)} minutes

Feel free to try this scenario again or explore other modules. Keep up the excellent work! 🎉`,
        messageType: 'role-play-complete',
        metadata: {
          sessionState: 'manually_ended',
          sessionEnded: true
        }
      };
      
      session.messages.push({
        role: 'tutor',
        content: stopResponse.content,
        messageType: stopResponse.messageType,
        timestamp: new Date(),
        metadata: stopResponse.metadata
      });
      
      return res.json({
        message: 'Session ended by student',
        response: session.messages[session.messages.length - 1],
        suggestions: ['Try again', 'Choose different module', 'End session'],
        sessionStats: {
          totalMessages: session.messages.length,
          correctAnswers: session.analytics.correctAnswers,
          incorrectAnswers: session.analytics.incorrectAnswers,
          sessionScore: session.analytics.sessionScore
        }
      });
    }
    
    // Generate AI response
    const context = {
      module: session.moduleId,
      studentLevel: session.moduleId.level,
      sessionType: session.sessionType,
      previousMessages: session.messages.slice(-10) // Last 10 messages for context
    };
    
    let aiResponse;
    
    // Handle exercise answers
    if (messageType === 'exercise_answer' && exerciseAnswer) {
      const lastTutorMessage = session.messages
        .filter(m => m.role === 'tutor' && m.messageType === 'exercise')
        .pop();
      
      if (lastTutorMessage && lastTutorMessage.metadata) {
        const evaluation = await AiTutorService.evaluateAnswer(
          exerciseAnswer,
          lastTutorMessage.metadata.correctAnswer,
          {
            module: session.moduleId,
            exerciseType: lastTutorMessage.metadata.exerciseType || lastTutorMessage.metadata.type,
            question: lastTutorMessage.metadata.question,
            studentLevel: session.moduleId.level
          }
        );
        
        aiResponse = {
          content: evaluation.feedback,
          messageType: 'feedback',
          metadata: {
            isCorrect: evaluation.isCorrect,
            points: evaluation.points,
            score: evaluation.score,
            germanExplanation: evaluation.germanExplanation,
            pronunciation: evaluation.pronunciation
          },
          suggestions: evaluation.suggestions || []
        };
        
        // Update session analytics
        if (evaluation.isCorrect) {
          session.analytics.correctAnswers++;
          session.analytics.sessionScore += evaluation.points;
        } else {
          session.analytics.incorrectAnswers++;
        }
      }
    } else {
      // Generate regular AI response
      aiResponse = await AiTutorService.generateResponse(message, context);
    }
    
    // Add AI response
    const tutorMessage = {
      role: 'tutor',
      content: aiResponse.content,
      messageType: aiResponse.messageType || 'text',
      timestamp: new Date()
    };
    
    if (aiResponse.exercise) {
      tutorMessage.metadata = aiResponse.exercise;
    }
    
    if (aiResponse.metadata) {
      tutorMessage.metadata = { ...tutorMessage.metadata, ...aiResponse.metadata };
    }
    
    session.messages.push(tutorMessage);
    
    // Update session analytics
    session.analytics.totalMessages = session.messages.length;
    
    await session.save();
    
    res.json({
      message: 'Message sent successfully',
      response: tutorMessage,
      suggestions: aiResponse.suggestions || [],
      sessionStats: {
        totalMessages: session.analytics.totalMessages,
        correctAnswers: session.analytics.correctAnswers,
        incorrectAnswers: session.analytics.incorrectAnswers,
        sessionScore: session.analytics.sessionScore
      }
    });
  } catch (error) {
    console.error('Error sending message to AI tutor:', error);
    res.status(500).json({ message: 'Error processing message' });
  }
});

// POST /api/ai-tutor/end-session - End tutoring session
router.post('/end-session', verifyToken, checkRole(['STUDENT']), async (req, res) => {
  try {
    const { sessionId } = req.body;
    const studentId = req.user.id;
    
    const session = await AiTutorSession.findOne({ 
      sessionId, 
      studentId,
      status: 'active'
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Active session not found' });
    }
    
    // End the session
    await session.endSession();
    
    // Update student progress
    const progress = await StudentProgress.findOne({
      studentId,
      moduleId: session.moduleId
    });
    
    if (progress) {
      progress.sessionsCount += 1;
      progress.timeSpent += session.totalDuration || 0;
      progress.totalScore += session.analytics.sessionScore || 0;
      progress.lastSessionDate = new Date();
      
      // Add AI interaction record
      progress.aiInteractions.push({
        sessionId: session.sessionId,
        messageCount: session.analytics.totalMessages,
        topicsDiscussed: session.analytics.topicsDiscussed || [],
        sessionDate: session.startTime,
        sessionDuration: session.totalDuration || 0
      });
      
      await progress.save();
    }
    
    res.json({
      message: 'Session ended successfully',
      sessionSummary: {
        duration: session.totalDuration,
        totalMessages: session.analytics.totalMessages,
        correctAnswers: session.analytics.correctAnswers,
        incorrectAnswers: session.analytics.incorrectAnswers,
        sessionScore: session.analytics.sessionScore,
        engagementLevel: session.analytics.engagementLevel
      }
    });
  } catch (error) {
    console.error('Error ending AI tutor session:', error);
    res.status(500).json({ message: 'Error ending session' });
  }
});

// GET /api/ai-tutor/sessions - Get student's tutoring sessions
router.get('/sessions', verifyToken, checkRole(['STUDENT']), async (req, res) => {
  try {
    const { moduleId, page = 1, limit = 10 } = req.query;
    const studentId = req.user.id;
    
    const filter = { studentId };
    if (moduleId) filter.moduleId = moduleId;
    
    const sessions = await AiTutorSession.find(filter)
      .populate('moduleId', 'title level category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-messages') // Exclude messages for list view
      .lean();
    
    const total = await AiTutorSession.countDocuments(filter);
    
    res.json({
      sessions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching AI tutor sessions:', error);
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

// GET /api/ai-tutor/sessions/:sessionId - Get specific session details
router.get('/sessions/:sessionId', verifyToken, checkRole(['STUDENT']), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studentId = req.user.id;
    
    const session = await AiTutorSession.findOne({ sessionId, studentId })
      .populate('moduleId', 'title level category')
      .lean();
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching AI tutor session:', error);
    res.status(500).json({ message: 'Error fetching session' });
  }
});

// GET /api/ai-tutor/test-connection - Test OpenAI connection (Admin only)
router.get('/test-connection', verifyToken, checkRole(['ADMIN']), async (req, res) => {
  try {
    const result = await openaiService.testConnection();
    res.json({
      configured: openaiService.isConfigured(),
      ...result
    });
  } catch (error) {
    res.status(500).json({
      configured: false,
      success: false,
      message: 'Failed to test OpenAI connection'
    });
  }
});

// POST /api/ai-tutor/generate-exercise - Generate dynamic exercise (Teachers/Admins)
router.post('/generate-exercise', verifyToken, checkRole(['TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { moduleId, difficulty = 'medium', exerciseType = 'multiple-choice' } = req.body;
    
    const module = await LearningModule.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    const exercise = await AiTutorService.generateExercise(module, difficulty, exerciseType);
    
    res.json({
      message: 'Exercise generated successfully',
      exercise
    });
  } catch (error) {
    console.error('Error generating exercise:', error);
    res.status(500).json({ message: 'Error generating exercise' });
  }
});

module.exports = router;