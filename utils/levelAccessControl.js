// utils/levelAccessControl.js
// Centralized level-based access control for learning modules
// Single source of truth for CEFR level hierarchy and access logic

/**
 * CEFR Level hierarchy (lower order = easier level)
 * This defines the progression of language proficiency levels
 */
const LEVEL_HIERARCHY = {
  'A1': { order: 1, name: 'Beginner' },
  'A2': { order: 2, name: 'Elementary' },
  'B1': { order: 3, name: 'Intermediate' },
  'B2': { order: 4, name: 'Upper Intermediate' },
  'C1': { order: 5, name: 'Advanced' },
  'C2': { order: 6, name: 'Proficiency' }
};

/**
 * Get levels that a student can access (their level and below)
 * Students can access modules at their current level or any lower level
 * 
 * @param {string} studentLevel - The student's current CEFR level (A1-C2)
 * @returns {string[]} Array of accessible level codes
 * 
 * @example
 * getAccessibleLevels('B1') // Returns: ['A1', 'A2', 'B1']
 */
function getAccessibleLevels(studentLevel) {
  const studentLevelInfo = LEVEL_HIERARCHY[studentLevel];
  if (!studentLevelInfo) {
    return []; // Invalid level
  }

  return Object.keys(LEVEL_HIERARCHY)
    .filter(level => LEVEL_HIERARCHY[level].order <= studentLevelInfo.order);
}

/**
 * Get recommended levels for a student (current level and one below)
 * These are the optimal levels for the student to practice
 * 
 * @param {string} studentLevel - The student's current CEFR level (A1-C2)
 * @returns {string[]} Array of recommended level codes
 * 
 * @example
 * getRecommendedLevels('B1') // Returns: ['A2', 'B1']
 */
function getRecommendedLevels(studentLevel) {
  const studentLevelInfo = LEVEL_HIERARCHY[studentLevel];
  if (!studentLevelInfo) {
    return [];
  }

  const recommendedOrders = [studentLevelInfo.order];
  if (studentLevelInfo.order > 1) {
    recommendedOrders.push(studentLevelInfo.order - 1);
  }

  return Object.keys(LEVEL_HIERARCHY)
    .filter(level => recommendedOrders.includes(LEVEL_HIERARCHY[level].order));
}

/**
 * Check if a student can access a module based on level
 * Students can access modules at their level or below
 * 
 * @param {string} studentLevel - The student's current CEFR level
 * @param {string} moduleLevel - The module's CEFR level
 * @returns {boolean} True if student can access the module
 * 
 * @example
 * canAccessModule('B1', 'A2') // Returns: true (B1 student can access A2 module)
 * canAccessModule('A1', 'B1') // Returns: false (A1 student cannot access B1 module)
 */
function canAccessModule(studentLevel, moduleLevel) {
  const studentLevelInfo = LEVEL_HIERARCHY[studentLevel];
  const moduleLevelInfo = LEVEL_HIERARCHY[moduleLevel];

  if (!studentLevelInfo || !moduleLevelInfo) {
    return false; // Invalid levels
  }

  // Student can access modules at their level or below
  return moduleLevelInfo.order <= studentLevelInfo.order;
}

/**
 * Get detailed access status for a module
 * Provides information about why a module is accessible or not
 * 
 * @param {string} studentLevel - The student's current CEFR level
 * @param {string} moduleLevel - The module's CEFR level
 * @returns {Object} Access status object with canAccess, reason, and levelDifference
 * 
 * @example
 * getModuleAccessStatus('B1', 'B1')
 * // Returns: { canAccess: true, reason: 'Perfect match for your level', levelDifference: 0 }
 * 
 * getModuleAccessStatus('A1', 'B1')
 * // Returns: { canAccess: false, reason: 'Too advanced - requires Intermediate level', levelDifference: 2 }
 */
function getModuleAccessStatus(studentLevel, moduleLevel) {
  const studentLevelInfo = LEVEL_HIERARCHY[studentLevel];
  const moduleLevelInfo = LEVEL_HIERARCHY[moduleLevel];

  if (!studentLevelInfo || !moduleLevelInfo) {
    return {
      canAccess: false,
      reason: 'Invalid level information',
      levelDifference: 0
    };
  }

  const levelDifference = moduleLevelInfo.order - studentLevelInfo.order;

  if (levelDifference <= 0) {
    return {
      canAccess: true,
      reason: levelDifference === 0 ? 'Perfect match for your level' : 'Good for review and practice',
      levelDifference
    };
  } else {
    return {
      canAccess: false,
      reason: `Too advanced - requires ${moduleLevelInfo.name} level`,
      levelDifference
    };
  }
}

/**
 * Get level information by level code
 * 
 * @param {string} levelCode - CEFR level code (A1-C2)
 * @returns {Object|null} Level info object or null if invalid
 */
function getLevelInfo(levelCode) {
  return LEVEL_HIERARCHY[levelCode] || null;
}

/**
 * Get all available levels in order
 * 
 * @returns {string[]} Array of all level codes in ascending order
 */
function getAllLevels() {
  return Object.keys(LEVEL_HIERARCHY).sort((a, b) => 
    LEVEL_HIERARCHY[a].order - LEVEL_HIERARCHY[b].order
  );
}

/**
 * Check if a level code is valid
 * 
 * @param {string} levelCode - Level code to validate
 * @returns {boolean} True if valid CEFR level
 */
function isValidLevel(levelCode) {
  return LEVEL_HIERARCHY.hasOwnProperty(levelCode);
}

/**
 * Get the next level in progression
 * 
 * @param {string} currentLevel - Current CEFR level
 * @returns {string|null} Next level code or null if at max level
 */
function getNextLevel(currentLevel) {
  const currentInfo = LEVEL_HIERARCHY[currentLevel];
  if (!currentInfo) return null;
  
  const nextOrder = currentInfo.order + 1;
  return Object.keys(LEVEL_HIERARCHY).find(
    level => LEVEL_HIERARCHY[level].order === nextOrder
  ) || null;
}

/**
 * Get the previous level in progression
 * 
 * @param {string} currentLevel - Current CEFR level
 * @returns {string|null} Previous level code or null if at min level
 */
function getPreviousLevel(currentLevel) {
  const currentInfo = LEVEL_HIERARCHY[currentLevel];
  if (!currentInfo) return null;
  
  const prevOrder = currentInfo.order - 1;
  return Object.keys(LEVEL_HIERARCHY).find(
    level => LEVEL_HIERARCHY[level].order === prevOrder
  ) || null;
}

// Export all functions and constants
module.exports = {
  LEVEL_HIERARCHY,
  getAccessibleLevels,
  getRecommendedLevels,
  canAccessModule,
  getModuleAccessStatus,
  getLevelInfo,
  getAllLevels,
  isValidLevel,
  getNextLevel,
  getPreviousLevel
};
