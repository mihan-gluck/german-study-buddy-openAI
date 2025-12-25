// routes/aiTutor.js - Minimal working version

const express = require('express');
const router = express.Router();
const AiTutorSession = require('../models/AiTutorSession');
const LearningModule = require('../models/LearningModule');
const { verifyToken, checkRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// POST /api/ai-tutor/start-teacher-test - Start teacher test session (TEACHERS/ADMINS ONLY)
router.post('/start-teacher-test', verifyToken, checkRole(['TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { moduleId, sessionType = 'teacher-test' } = req.body;
    const teacherId = req.user.id;
    
    console.log('🧪 Teacher test session requested:', { 
      moduleId, 
      teacherId, 
      sessionType 
    });
    
    // Validate moduleId format
    if (!moduleId || typeof moduleId !== 'string' || moduleId.length !== 24) {
      console.log('❌ Invalid moduleId format:', { moduleId });
      return res.status(400).json({ message: `Invalid module ID format: ${moduleId}` });
    }
    
    // Validate module exists
    const module = await LearningModule.findById(moduleId);
    if (!module || !module.isActive) {
      console.log('❌ Module not found:', { moduleId, found: !!module, active: module?.isActive });
      return res.status(404).json({ message: 'Module not found or inactive' });
    }
    
    // Check if teacher can test this module (either created by them or they're admin)
    if (req.user.role === 'TEACHER' && module.createdBy.toString() !== teacherId) {
      return res.status(403).json({ message: 'You can only test modules you created' });
    }
    
    console.log('🔍 Module loaded for teacher test:', {
      title: module.title,
      createdBy: module.createdBy
    });
    
    // Create new test session
    const sessionId = uuidv4();
    const session = new AiTutorSession({
      sessionId,
      studentId: teacherId, // Use teacher ID as student ID for test
      moduleId,
      sessionType,
      isTestSession: true, // Mark as test session
      context: {
        previousSessions: 0,
        currentLevel: module.level,
        strugglingAreas: [],
        strongAreas: [],
        preferredLearningStyle: 'interactive',
        isTeacherTest: true
      }
    });
    
    await session.save();
    
    console.log('✅ Teacher test session created:', sessionId);
    
    res.json({
      sessionId,
      module: {
        _id: module._id,
        title: module.title,
        description: module.description,
        level: module.level,
        category: module.category,
        targetLanguage: module.targetLanguage,
        nativeLanguage: module.nativeLanguage,
        content: module.content,
        aiTutorConfig: module.aiTutorConfig
      },
      sessionType,
      isTestSession: true,
      message: 'Teacher test session started successfully'
    });
  } catch (error) {
    console.error('❌ Error starting teacher test session:', error);
    res.status(500).json({ message: 'Error starting teacher test session' });
  }
});

// POST /api/ai-tutor/send-message - Send message to AI tutor
router.post('/send-message', verifyToken, async (req, res) => {
  try {
    const { sessionId, message, messageType = 'text' } = req.body;
    const userId = req.user.id;
    
    // Find session
    const session = await AiTutorSession.findOne({ 
      sessionId, 
      studentId: userId,
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
    
    session.messages.push(studentMessage);
    
    // Generate simple AI response
    const aiResponse = {
      role: 'tutor',
      content: `Thank you for your message: "${message}". This is a test response for the teacher testing feature.`,
      messageType: 'text',
      timestamp: new Date()
    };
    
    session.messages.push(aiResponse);
    await session.save();
    
    res.json({
      message: 'Message sent successfully',
      response: aiResponse,
      suggestions: ['Continue conversation', 'Ask a question', 'End session']
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error processing message' });
  }
});

// POST /api/ai-tutor/end-session - End tutoring session
router.post('/end-session', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;
    
    const session = await AiTutorSession.findOne({ 
      sessionId, 
      studentId: userId,
      status: 'active'
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Active session not found' });
    }
    
    session.status = 'completed';
    session.endTime = new Date();
    await session.save();
    
    res.json({
      message: 'Session ended successfully',
      summary: {
        duration: Math.round((session.endTime - session.startTime) / 60000),
        totalMessages: session.messages.length
      }
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ message: 'Error ending session' });
  }
});

module.exports = router;