# Learning Modules - Code Duplication Analysis

## 🔍 Analysis Date: February 7, 2026

---

## ✅ Summary

Found **significant code duplication** in level-based access control functions across multiple files.

---

## 🔴 Critical Duplications Found

### 1. Level Access Control Functions

**Duplicated in 5 locations:**

1. **`routes/learningModules.js`** (Lines 760-820)
   - `getAccessibleLevels()`
   - `getRecommendedLevels()`
   - `canAccessModule()`
   - `getModuleAccessStatus()`
   - `LEVEL_HIERARCHY` constant

2. **`src/app/services/level-access.service.ts`** (Lines 1-150)
   - `getAccessibleLevels()`
   - `getRecommendedLevels()`
   - `canAccessModule()`
   - `getModuleAccessStatus()`
   - `LEVEL_HIERARCHY` constant
   - **This is the CORRECT centralized service**

3. **`src/app/services/learning-modules.service.ts`** (Lines 299-302)
   - Wrapper function that calls `level-access.service.ts`
   - **This is GOOD - delegates to centralized service**

4. **`scripts/test-complete-level-system.js`** (Lines 25-50)
   - Duplicate implementation for testing
   - **Should import from shared location**

5. **`scripts/test-level-access-control.js`** (Lines 25-50)
   - Duplicate implementation for testing
   - **Should import from shared location**

---

## 📊 Duplication Details

### LEVEL_HIERARCHY Constant

**Duplicated 4 times:**

```javascript
const LEVEL_HIERARCHY = {
  'A1': { order: 1, name: 'Beginner' },
  'A2': { order: 2, name: 'Elementary' },
  'B1': { order: 3, name: 'Intermediate' },
  'B2': { order: 4, name: 'Upper Intermediate' },
  'C1': { order: 5, name: 'Advanced' },
  'C2': { order: 6, name: 'Proficiency' }
};
```

**Locations:**
1. `routes/learningModules.js` (Line 745)
2. `scripts/test-complete-level-system.js` (Line 17)
3. `scripts/test-level-access-control.js` (Line 17)
4. `src/app/services/level-access.service.ts` (Line 10) ✅ **CORRECT LOCATION**

### getAccessibleLevels() Function

**Duplicated 4 times:**

```javascript
function getAccessibleLevels(studentLevel) {
  const studentLevelInfo = LEVEL_HIERARCHY[studentLevel];
  if (!studentLevelInfo) return [];
  
  return Object.keys(LEVEL_HIERARCHY)
    .filter(level => LEVEL_HIERARCHY[level].order <= studentLevelInfo.order);
}
```

**Locations:**
1. `routes/learningModules.js` (Line 760)
2. `scripts/test-complete-level-system.js` (Line 25)
3. `scripts/test-level-access-control.js` (Line 25)
4. `src/app/services/level-access.service.ts` (Line 46) ✅ **CORRECT LOCATION**

### getRecommendedLevels() Function

**Duplicated 4 times:**

```javascript
function getRecommendedLevels(studentLevel) {
  const studentLevelInfo = LEVEL_HIERARCHY[studentLevel];
  if (!studentLevelInfo) return [];
  
  const recommendedOrders = [studentLevelInfo.order];
  if (studentLevelInfo.order > 1) {
    recommendedOrders.push(studentLevelInfo.order - 1);
  }
  
  return Object.keys(LEVEL_HIERARCHY)
    .filter(level => recommendedOrders.includes(LEVEL_HIERARCHY[level].order));
}
```

**Locations:**
1. `routes/learningModules.js` (Line 772)
2. `scripts/test-complete-level-system.js` (Line 33)
3. `scripts/test-level-access-control.js` (Line 33)
4. `src/app/services/level-access.service.ts` (Line 58) ✅ **CORRECT LOCATION**

### canAccessModule() Function

**Duplicated 3 times:**

```javascript
function canAccessModule(studentLevel, moduleLevel) {
  const studentLevelInfo = LEVEL_HIERARCHY[studentLevel];
  const moduleLevelInfo = LEVEL_HIERARCHY[moduleLevel];
  
  if (!studentLevelInfo || !moduleLevelInfo) return false;
  
  return moduleLevelInfo.order <= studentLevelInfo.order;
}
```

**Locations:**
1. `routes/learningModules.js` (Line 786)
2. `scripts/test-complete-level-system.js` (Line 45)
3. `src/app/services/level-access.service.ts` (Line 72) ✅ **CORRECT LOCATION**

### getModuleAccessStatus() Function

**Duplicated 2 times:**

```javascript
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
```

**Locations:**
1. `routes/learningModules.js` (Line 798)
2. `src/app/services/level-access.service.ts` (Line 86) ✅ **CORRECT LOCATION**

---

## 🎯 Recommended Solution

### Backend (Node.js)

**Create a shared utility file:**

```javascript
// utils/levelAccessControl.js

const LEVEL_HIERARCHY = {
  'A1': { order: 1, name: 'Beginner' },
  'A2': { order: 2, name: 'Elementary' },
  'B1': { order: 3, name: 'Intermediate' },
  'B2': { order: 4, name: 'Upper Intermediate' },
  'C1': { order: 5, name: 'Advanced' },
  'C2': { order: 6, name: 'Proficiency' }
};

function getAccessibleLevels(studentLevel) {
  // ... implementation
}

function getRecommendedLevels(studentLevel) {
  // ... implementation
}

function canAccessModule(studentLevel, moduleLevel) {
  // ... implementation
}

function getModuleAccessStatus(studentLevel, moduleLevel) {
  // ... implementation
}

module.exports = {
  LEVEL_HIERARCHY,
  getAccessibleLevels,
  getRecommendedLevels,
  canAccessModule,
  getModuleAccessStatus
};
```

**Then update all files to import from this shared location:**

```javascript
// routes/learningModules.js
const { 
  getAccessibleLevels, 
  getRecommendedLevels, 
  canAccessModule, 
  getModuleAccessStatus 
} = require('../utils/levelAccessControl');

// scripts/test-complete-level-system.js
const { 
  getAccessibleLevels, 
  getRecommendedLevels 
} = require('../utils/levelAccessControl');
```

### Frontend (Angular)

**Already centralized correctly!**

- ✅ `src/app/services/level-access.service.ts` is the single source of truth
- ✅ `src/app/services/learning-modules.service.ts` delegates to it
- ✅ Components use the service

**No changes needed on frontend.**

---

## 📈 Impact Analysis

### Lines of Duplicated Code

| Function | Lines per Copy | Total Copies | Total Duplicated Lines |
|----------|----------------|--------------|------------------------|
| LEVEL_HIERARCHY | 8 | 4 | 32 |
| getAccessibleLevels() | 8 | 4 | 32 |
| getRecommendedLevels() | 12 | 4 | 48 |
| canAccessModule() | 8 | 3 | 24 |
| getModuleAccessStatus() | 22 | 2 | 44 |
| **TOTAL** | | | **180 lines** |

### Maintenance Risk

**Current State:**
- ❌ Changes must be made in 4-5 places
- ❌ High risk of inconsistency
- ❌ Difficult to maintain
- ❌ Bug fixes must be replicated

**After Refactoring:**
- ✅ Single source of truth
- ✅ Changes in one place
- ✅ Consistent behavior
- ✅ Easy to maintain

---

## 🔧 Refactoring Steps

### Step 1: Create Shared Utility (Backend)

1. Create `utils/levelAccessControl.js`
2. Move all level access functions there
3. Export all functions

### Step 2: Update Backend Files

1. **`routes/learningModules.js`**
   - Remove duplicate functions (lines 745-820)
   - Add import statement
   - Update function calls

2. **`scripts/test-complete-level-system.js`**
   - Remove duplicate functions (lines 17-50)
   - Add require statement

3. **`scripts/test-level-access-control.js`**
   - Remove duplicate functions (lines 17-50)
   - Add require statement

### Step 3: Test

1. Run all test scripts
2. Test module access in UI
3. Verify level filtering works
4. Check API responses

### Step 4: Commit

```bash
git add utils/levelAccessControl.js
git add routes/learningModules.js
git add scripts/test-*.js
git commit -m "refactor: Centralize level access control functions

- Create shared utils/levelAccessControl.js
- Remove 180 lines of duplicated code
- Single source of truth for level hierarchy
- Easier maintenance and consistency"
```

---

## ⚠️ Other Potential Duplications

### Module Validation

**Location:** `routes/learningModules.js` (Line 680)

```javascript
function fixModuleValidationIssues(module) {
  // ... 80 lines of validation logic
}
```

**Status:** ✅ **No duplication found** - This is only in one place

### Exercise Type Mapping

**Location:** `routes/learningModules.js` (Line 682)

```javascript
const allowedExerciseTypes = ['multiple-choice', 'fill-blank', 'translation', 'conversation', 'essay', 'role-play'];
const exerciseTypeMapping = {
  'sentence-formation': 'fill-blank',
  'word-order': 'fill-blank',
  // ...
};
```

**Status:** ✅ **No duplication found** - This is only in one place

---

## 📝 Summary

### Critical Issues:
1. ❌ **180 lines of duplicated level access control code**
2. ❌ **Functions duplicated in 4-5 locations**
3. ❌ **High maintenance risk**

### Recommended Actions:
1. ✅ Create `utils/levelAccessControl.js`
2. ✅ Refactor backend to use shared utility
3. ✅ Keep frontend as-is (already centralized)
4. ✅ Update test scripts to import shared code

### Priority: **HIGH**

**Reason:** This duplication affects core functionality (level-based access control) and makes maintenance difficult. Any bug fix or enhancement must be replicated in multiple places.

---

## 🎯 Next Steps

1. **Create the shared utility file**
2. **Refactor backend files**
3. **Test thoroughly**
4. **Commit changes**
5. **Update documentation**

---

**Analysis Complete**  
**Date:** February 7, 2026  
**Duplicated Lines:** 180  
**Files Affected:** 5  
**Priority:** HIGH
