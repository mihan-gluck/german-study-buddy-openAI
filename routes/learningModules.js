// routes/learningModules.js

const express = require('express');
const router = express.Router();
const LearningModule = require('../models/LearningModule');
const StudentProgress = require('../models/StudentProgress');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/learning-modules - Get all modules (with filtering)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { level, category, difficulty, targetLanguage, nativeLanguage, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    if (level) filter.level = level;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (targetLanguage) filter.targetLanguage = targetLanguage;
    if (nativeLanguage) filter.nativeLanguage = nativeLanguage;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // For students, also get their progress
    const modules = await LearningModule.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    // If user is a student, include progress data
    if (req.user.role === 'STUDENT') {
      const moduleIds = modules.map(m => m._id);
      const progressData = await StudentProgress.find({
        studentId: req.user.id,
        moduleId: { $in: moduleIds }
      }).lean();
      
      // Map progress to modules
      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p.moduleId.toString()] = p;
      });
      
      modules.forEach(module => {
        module.studentProgress = progressMap[module._id.toString()] || null;
      });
    }
    
    const total = await LearningModule.countDocuments(filter);
    
    res.json({
      modules,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Error fetching learning modules' });
  }
});

// GET /api/learning-modules/:id - Get specific module
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const module = await LearningModule.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // If user is a student, include their progress
    if (req.user.role === 'STUDENT') {
      const progress = await StudentProgress.findOne({
        studentId: req.user.id,
        moduleId: req.params.id
      }).lean();
      
      module.studentProgress = progress;
    }
    
    res.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ message: 'Error fetching module' });
  }
});

// POST /api/learning-modules - Create new module (Teachers/Admins only)
router.post('/', verifyToken, checkRole(['TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const moduleData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const module = new LearningModule(moduleData);
    await module.save();
    
    await module.populate('createdBy', 'name email');
    
    res.status(201).json(module);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ message: 'Error creating learning module' });
  }
});

// PUT /api/learning-modules/:id - Update module (Teachers/Admins only)
router.put('/:id', verifyToken, checkRole(['TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Check if user can edit this module
    if (req.user.role === 'TEACHER' && module.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this module' });
    }
    
    // Set update context for tracking
    module._updateContext = {
      userId: req.user.id,
      changes: req.body.changeDescription || 'Module content updated'
    };
    
    // Update module fields
    Object.assign(module, req.body);
    await module.save();
    
    await module.populate('createdBy', 'name email');
    await module.populate('lastUpdatedBy', 'name email');
    
    res.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ message: 'Error updating module' });
  }
});

// DELETE /api/learning-modules/:id - Delete module (Admins only)
router.delete('/:id', verifyToken, checkRole(['ADMIN']), async (req, res) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Soft delete by setting isActive to false
    module.isActive = false;
    await module.save();
    
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ message: 'Error deleting module' });
  }
});

// POST /api/learning-modules/:id/enroll - Enroll student in module
router.post('/:id/enroll', verifyToken, checkRole(['STUDENT']), async (req, res) => {
  try {
    const moduleId = req.params.id;
    const studentId = req.user.id; // Changed from req.user.userId to req.user.id
    
    // Check if module exists
    const module = await LearningModule.findById(moduleId);
    if (!module || !module.isActive) {
      return res.status(404).json({ message: 'Module not found or inactive' });
    }
    
    // Check if already enrolled
    const existingProgress = await StudentProgress.findOne({
      studentId,
      moduleId
    });
    
    if (existingProgress) {
      return res.status(400).json({ message: 'Already enrolled in this module' });
    }
    
    // Create progress record
    const progress = new StudentProgress({
      studentId,
      moduleId,
      status: 'in-progress',
      startedAt: new Date(),
      maxPossibleScore: module.content.exercises.reduce((sum, ex) => sum + ex.points, 0)
    });
    
    await progress.save();
    
    // Update module enrollment count
    module.totalEnrollments += 1;
    await module.save();
    
    res.status(201).json({ message: 'Successfully enrolled in module', progress });
  } catch (error) {
    console.error('Error enrolling in module:', error);
    res.status(500).json({ message: 'Error enrolling in module' });
  }
});

// GET /api/learning-modules/stats/overview - Get module statistics (Teachers/Admins)
router.get('/stats/overview', verifyToken, checkRole(['TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const filter = req.user.role === 'TEACHER' 
      ? { createdBy: req.user.id, isActive: true }
      : { isActive: true };
    
    const totalModules = await LearningModule.countDocuments(filter);
    const totalEnrollments = await LearningModule.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$totalEnrollments' } } }
    ]);
    
    const modulesByLevel = await LearningModule.aggregate([
      { $match: filter },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const modulesByCategory = await LearningModule.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalModules,
      totalEnrollments: totalEnrollments[0]?.total || 0,
      modulesByLevel,
      modulesByCategory
    });
  } catch (error) {
    console.error('Error fetching module stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// GET /api/learning-modules/admin/management - Get all modules with full details for admin management
router.get('/admin/management', verifyToken, checkRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    
    // Build filter
    const filter = {};
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    
    const modules = await LearningModule.find(filter)
      .populate('createdBy', 'name email role')
      .populate('lastUpdatedBy', 'name email role')
      .populate('updateHistory.updatedBy', 'name email role')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await LearningModule.countDocuments(filter);
    
    // Add summary statistics for each module
    const modulesWithStats = modules.map(module => ({
      ...module,
      totalUpdates: module.updateHistory?.length || 0,
      lastUpdateDate: module.updateHistory?.length > 0 
        ? module.updateHistory[module.updateHistory.length - 1].updatedAt 
        : module.createdAt,
      createdByTeacher: module.createdBy?.role === 'TEACHER'
    }));
    
    res.json({
      modules: modulesWithStats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      },
      summary: {
        totalModules: total,
        activeModules: await LearningModule.countDocuments({ isActive: true }),
        inactiveModules: await LearningModule.countDocuments({ isActive: false }),
        teacherCreated: await LearningModule.countDocuments({ 
          createdBy: { $in: await getUserIdsByRole('TEACHER') }
        }),
        adminCreated: await LearningModule.countDocuments({ 
          createdBy: { $in: await getUserIdsByRole('ADMIN') }
        })
      }
    });
  } catch (error) {
    console.error('Error fetching admin module management data:', error);
    res.status(500).json({ message: 'Error fetching module management data' });
  }
});

// GET /api/learning-modules/:id/history - Get update history for a specific module (Admin only)
router.get('/:id/history', verifyToken, checkRole(['ADMIN']), async (req, res) => {
  try {
    const module = await LearningModule.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('lastUpdatedBy', 'name email role')
      .populate('updateHistory.updatedBy', 'name email role')
      .lean();
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json({
      moduleId: module._id,
      title: module.title,
      createdBy: module.createdBy,
      createdAt: module.createdAt,
      currentVersion: module.version,
      lastUpdatedBy: module.lastUpdatedBy,
      lastUpdatedAt: module.updatedAt,
      updateHistory: module.updateHistory || []
    });
  } catch (error) {
    console.error('Error fetching module history:', error);
    res.status(500).json({ message: 'Error fetching module history' });
  }
});

// Helper function to get user IDs by role
async function getUserIdsByRole(role) {
  const User = require('../models/User');
  const users = await User.find({ role }, '_id').lean();
  return users.map(user => user._id);
}

module.exports = router;