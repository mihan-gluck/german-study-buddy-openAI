// routes/studentProgress.js

const express = require('express');
const router = express.Router();
const StudentProgress = require('../models/StudentProgress');
const LearningModule = require('../models/LearningModule');
const AiTutorSession = require('../models/AiTutorSession');
const mongoose = require('mongoose');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/student-progress - Get student's progress across all modules
// ✅ Allow both STUDENT and TEACHER (for testing modules)
router.get('/', verifyToken, checkRole(['STUDENT', 'TEACHER']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, level, category } = req.query;
    
    // Build aggregation pipeline
    const pipeline = [
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: 'learningmodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'module'
        }
      },
      { $unwind: '$module' },
      { $match: { 'module.isActive': true } }
    ];
    
    // Add filters
    if (status) pipeline.push({ $match: { status } });
    if (level) pipeline.push({ $match: { 'module.level': level } });
    if (category) pipeline.push({ $match: { 'module.category': category } });
    
    // Sort by last accessed
    pipeline.push({ $sort: { lastAccessedAt: -1 } });
    
    const progress = await StudentProgress.aggregate(pipeline);
    
    // Calculate overall statistics
    const stats = {
      totalModules: progress.length,
      completedModules: progress.filter(p => p.status === 'completed').length,
      inProgressModules: progress.filter(p => p.status === 'in-progress').length,
      totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      averageScore: progress.length > 0 
        ? Math.round(progress.reduce((sum, p) => sum + p.progressPercentage, 0) / progress.length)
        : 0,
      totalSessions: progress.reduce((sum, p) => sum + (p.sessionsCount || 0), 0)
    };
    
    res.json({ progress, stats });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ message: 'Error fetching progress data' });
  }
});

// GET /api/student-progress/level-progression - Get student's level progression
router.get('/level-progression', verifyToken, checkRole(['STUDENT', 'TEACHER']), async (req, res) => {
  try {
    const User = require('../models/User');
    const studentId = req.user.id;
    
    const student = await User.findById(studentId).select('level languageLevelOpted courseStartDates courseCompletionDates').lean();
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentLevelIndex = allLevels.indexOf(student.level);
    
    // Determine which levels to show based on languageLevelOpted
    let displayLevels;
    const opted = (student.languageLevelOpted || '').trim();
    
    if (!opted) {
      // Default: A1 to B2
      displayLevels = ['A1', 'A2', 'B1', 'B2'];
    } else if (opted.includes('-')) {
      // Range like "A1-B2", "A2-B2", "A1-A2"
      const [startLevel, endLevel] = opted.split('-');
      const startIdx = allLevels.indexOf(startLevel);
      const endIdx = allLevels.indexOf(endLevel);
      if (startIdx >= 0 && endIdx >= 0 && endIdx >= startIdx) {
        displayLevels = allLevels.slice(startIdx, endIdx + 1);
      } else {
        displayLevels = ['A1', 'A2', 'B1', 'B2'];
      }
    } else {
      // Single level like "A1" or "B2"
      const optedIdx = allLevels.indexOf(opted);
      if (optedIdx >= 0) {
        // If current level is higher than opted level, show up to current level
        if (currentLevelIndex > optedIdx) {
          displayLevels = allLevels.slice(0, currentLevelIndex + 1);
        } else {
          // Show from A1 to opted level
          displayLevels = allLevels.slice(0, optedIdx + 1);
        }
      } else {
        displayLevels = ['A1', 'A2', 'B1', 'B2'];
      }
    }
    
    // Ensure current level is always included
    if (!displayLevels.includes(student.level)) {
      const currentIdx = allLevels.indexOf(student.level);
      if (currentIdx >= 0) {
        // Extend display levels to include current level
        const lastDisplayIdx = allLevels.indexOf(displayLevels[displayLevels.length - 1]);
        if (currentIdx > lastDisplayIdx) {
          displayLevels = allLevels.slice(allLevels.indexOf(displayLevels[0]), currentIdx + 1);
        }
      }
    }
    
    // Determine target level (last level in the display range)
    const targetLevel = displayLevels[displayLevels.length - 1];
    
    const levelProgression = displayLevels.map((level, index) => {
      const startDateKey = `${level}StartDate`;
      const completionDateKey = `${level}CompletionDate`;
      
      const startDate = student.courseStartDates?.[startDateKey];
      const completedDate = student.courseCompletionDates?.[completionDateKey];
      const levelIndex = allLevels.indexOf(level);
      
      let status = 'not-started';
      let duration = null;
      
      if (completedDate) {
        status = 'completed';
        if (startDate) {
          const diffTime = Math.abs(new Date(completedDate).getTime() - new Date(startDate).getTime());
          duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        }
      } else if (startDate) {
        status = 'in-progress';
      } else if (levelIndex < currentLevelIndex) {
        status = 'completed';
      } else if (levelIndex === currentLevelIndex) {
        status = 'in-progress';
      }
      
      return {
        level,
        status,
        startDate,
        completedDate,
        duration
      };
    });
    
    res.json({
      currentLevel: student.level,
      targetLevel,
      levelProgression
    });
  } catch (error) {
    console.error('Error fetching level progression:', error);
    res.status(500).json({ message: 'Error fetching level progression' });
  }
});

function getNextLevel(currentLevel) {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(currentLevel);
  if (currentIndex >= 0 && currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  return currentLevel; // Already at highest level
}

// GET /api/student-progress/:moduleId - Get progress for specific module
// ✅ Allow both STUDENT and TEACHER (for testing modules)
router.get('/:moduleId', verifyToken, checkRole(['STUDENT', 'TEACHER']), async (req, res) => {
  try {
    const { moduleId } = req.params;
    const studentId = req.user.id;
    
    const progress = await StudentProgress.findOne({ studentId, moduleId })
      .populate('moduleId')
      .populate('teacherFeedback.providedBy', 'name email')
      .lean();
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found for this module' });
    }
    
    // Get recent AI sessions for this module
    const recentSessions = await AiTutorSession.find({
      studentId,
      moduleId,
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('sessionType analytics startTime totalDuration')
    .lean();
    
    progress.recentSessions = recentSessions;
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching module progress:', error);
    res.status(500).json({ message: 'Error fetching module progress' });
  }
});

// PUT /api/student-progress/:moduleId/exercise - Update exercise completion
// ✅ Allow both STUDENT and TEACHER (for testing modules)
router.put('/:moduleId/exercise', verifyToken, checkRole(['STUDENT', 'TEACHER']), async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { exerciseIndex, score, isCompleted } = req.body;
    const studentId = req.user.id;
    
    const progress = await StudentProgress.findOne({ studentId, moduleId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    // Find or create exercise completion record
    let exerciseProgress = progress.exercisesCompleted.find(
      ex => ex.exerciseIndex === exerciseIndex
    );
    
    if (!exerciseProgress) {
      exerciseProgress = {
        exerciseIndex,
        attempts: 0,
        bestScore: 0,
        isCompleted: false
      };
      progress.exercisesCompleted.push(exerciseProgress);
    }
    
    // Update exercise progress
    exerciseProgress.attempts += 1;
    exerciseProgress.bestScore = Math.max(exerciseProgress.bestScore, score || 0);
    exerciseProgress.lastAttemptDate = new Date();
    
    if (isCompleted) {
      exerciseProgress.isCompleted = true;
    }
    
    // Update total score
    progress.totalScore += score || 0;
    
    // Recalculate progress percentage
    progress.calculateProgress();
    
    // Update streak
    if (isCompleted && score > 0) {
      progress.currentStreak += 1;
      progress.bestStreak = Math.max(progress.bestStreak, progress.currentStreak);
    } else if (score === 0) {
      progress.currentStreak = 0;
    }
    
    // Check if module is completed
    const module = await LearningModule.findById(moduleId);
    const totalExercises = module.content.exercises.length;
    const completedExercises = progress.exercisesCompleted.filter(ex => ex.isCompleted).length;
    
    if (completedExercises === totalExercises && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();
    }
    
    await progress.save();
    
    res.json({
      message: 'Exercise progress updated',
      progress: {
        progressPercentage: progress.progressPercentage,
        currentStreak: progress.currentStreak,
        totalScore: progress.totalScore,
        status: progress.status
      }
    });
  } catch (error) {
    console.error('Error updating exercise progress:', error);
    res.status(500).json({ message: 'Error updating exercise progress' });
  }
});

// PUT /api/student-progress/:moduleId/notes - Update student notes
// ✅ Allow both STUDENT and TEACHER (for testing modules)
router.put('/:moduleId/notes', verifyToken, checkRole(['STUDENT', 'TEACHER']), async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { notes } = req.body;
    const studentId = req.user.id;
    
    const progress = await StudentProgress.findOneAndUpdate(
      { studentId, moduleId },
      { studentNotes: notes },
      { new: true }
    );
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    res.json({ message: 'Notes updated successfully' });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ message: 'Error updating notes' });
  }
});

// GET /api/student-progress/analytics/dashboard - Get dashboard analytics
// ✅ Allow both STUDENT and TEACHER (for testing modules)
router.get('/analytics/dashboard', verifyToken, checkRole(['STUDENT', 'TEACHER']), async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get progress data
    const progressData = await StudentProgress.find({ studentId })
      .populate('moduleId', 'title level category')
      .lean();
    
    // Get recent sessions
    const recentSessions = await AiTutorSession.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('moduleId', 'title')
      .select('sessionType analytics startTime totalDuration')
      .lean();
    
    // Calculate analytics
    const analytics = {
      overview: {
        totalModules: progressData.filter(p => p.moduleId).length, // Only count valid modules
        completedModules: progressData.filter(p => p.status === 'completed' && p.moduleId).length,
        inProgressModules: progressData.filter(p => p.status === 'in-progress' && p.moduleId).length,
        totalTimeSpent: progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        totalSessions: progressData.reduce((sum, p) => sum + (p.sessionsCount || 0), 0)
      },
      
      progressByLevel: progressData.reduce((acc, p) => {
        // Skip progress records with null or missing moduleId
        if (!p.moduleId || !p.moduleId.level) return acc;
        
        const level = p.moduleId.level;
        if (!acc[level]) acc[level] = { total: 0, completed: 0 };
        acc[level].total += 1;
        if (p.status === 'completed') acc[level].completed += 1;
        return acc;
      }, {}),
      
      progressByCategory: progressData.reduce((acc, p) => {
        // Skip progress records with null or missing moduleId
        if (!p.moduleId || !p.moduleId.category) return acc;
        
        const category = p.moduleId.category;
        if (!acc[category]) acc[category] = { total: 0, completed: 0 };
        acc[category].total += 1;
        if (p.status === 'completed') acc[category].completed += 1;
        return acc;
      }, {}),
      
      weeklyActivity: await getWeeklyActivity(studentId),
      
      recentSessions: recentSessions.map(session => ({
        moduleTitle: session.moduleId.title,
        sessionType: session.sessionType,
        duration: session.totalDuration,
        score: session.analytics.sessionScore,
        date: session.startTime
      })),
      
      streakData: {
        currentStreak: Math.max(...progressData.map(p => p.currentStreak || 0)),
        bestStreak: Math.max(...progressData.map(p => p.bestStreak || 0))
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Helper function to get weekly activity
async function getWeeklyActivity(studentId) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const sessions = await AiTutorSession.find({
    studentId,
    startTime: { $gte: oneWeekAgo }
  }).select('startTime totalDuration').lean();
  
  const weeklyData = {};
  // Use consistent day names (starting with Monday for better UX)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Initialize all days with zero values
  days.forEach(day => {
    weeklyData[day] = { sessions: 0, timeSpent: 0 };
  });
  
  // Aggregate session data by day
  sessions.forEach(session => {
    const dayIndex = session.startTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Convert Sunday=0 to Sunday=6 for our Monday-first array
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    const dayName = days[adjustedIndex];
    
    weeklyData[dayName].sessions += 1;
    weeklyData[dayName].timeSpent += session.totalDuration || 0;
  });
  
  return weeklyData;
}

// GET /api/student-progress/teacher/:studentId - Get student progress (Teachers/Admins)
router.get('/teacher/:studentId', verifyToken, checkRole(['TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const progress = await StudentProgress.find({ studentId })
      .populate('moduleId', 'title level category')
      .populate('studentId', 'name email level')
      .sort({ lastAccessedAt: -1 })
      .lean();
    
    // Get recent AI sessions
    const recentSessions = await AiTutorSession.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('moduleId', 'title')
      .select('sessionType analytics startTime totalDuration')
      .lean();
    
    res.json({ progress, recentSessions });
  } catch (error) {
    console.error('Error fetching student progress for teacher:', error);
    res.status(500).json({ message: 'Error fetching student progress' });
  }
});

// POST /api/student-progress/:moduleId/feedback - Add teacher feedback
router.post('/:moduleId/feedback', verifyToken, checkRole(['TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { studentId, feedback, rating } = req.body;
    const teacherId = req.user.id;
    
    const progress = await StudentProgress.findOne({ studentId, moduleId });
    if (!progress) {
      return res.status(404).json({ message: 'Student progress not found' });
    }
    
    progress.teacherFeedback.push({
      feedback,
      rating,
      providedBy: teacherId,
      providedAt: new Date()
    });
    
    await progress.save();
    
    res.json({ message: 'Feedback added successfully' });
  } catch (error) {
    console.error('Error adding teacher feedback:', error);
    res.status(500).json({ message: 'Error adding feedback' });
  }
});

module.exports = router;