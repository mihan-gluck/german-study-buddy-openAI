// scripts/proposed-standard-completion.js
// Proposed completion logic for standard modules

function checkStandardCompletion(module, progress) {
  const completionCriteria = {
    // 1. All exercises completed with passing score
    exercisesCompleted: checkExerciseCompletion(module, progress),
    
    // 2. Learning objectives mastered
    objectivesMastered: checkObjectivesMastery(module, progress),
    
    // 3. Vocabulary retention
    vocabularyMastery: checkVocabularyMastery(module, progress),
    
    // 4. Minimum performance score
    performanceScore: calculatePerformanceScore(progress),
    
    // 5. Consistent progress over time
    consistentProgress: checkProgressConsistency(progress)
  };
  
  // Standard completion logic
  const isCompleted = (
    completionCriteria.exercisesCompleted >= 1.0 &&      // 100% exercises completed
    completionCriteria.objectivesMastered >= 0.8 &&      // 80% objectives mastered
    completionCriteria.vocabularyMastery >= 0.7 &&       // 70% vocabulary retained
    completionCriteria.performanceScore >= 70            // 70% overall score
  );
  
  return {
    isCompleted,
    completionRate: calculateOverallCompletion(completionCriteria),
    details: completionCriteria
  };
}

function checkExerciseCompletion(module, progress) {
  const totalExercises = module.content.exercises.length;
  if (totalExercises === 0) return 1; // No exercises = completed
  
  const completedExercises = progress.exercisesCompleted.filter(ex => 
    ex.isCompleted && ex.bestScore >= 60 // Must pass with 60% or higher
  ).length;
  
  return completedExercises / totalExercises;
}

function checkObjectivesMastery(module, progress) {
  const totalObjectives = module.learningObjectives.length;
  if (totalObjectives === 0) return 1; // No objectives = completed
  
  const masteredObjectives = progress.objectivesCompleted.filter(obj => 
    obj.masteryLevel === 'intermediate' || obj.masteryLevel === 'advanced'
  ).length;
  
  return masteredObjectives / totalObjectives;
}

function checkVocabularyMastery(module, progress) {
  const totalVocabulary = module.content.allowedVocabulary.length;
  if (totalVocabulary === 0) return 1; // No vocabulary = completed
  
  // Check vocabulary through exercise performance
  const vocabularyExercises = progress.exercisesCompleted.filter(ex => 
    ex.exerciseType === 'translation' || ex.exerciseType === 'multiple-choice'
  );
  
  const passedVocabExercises = vocabularyExercises.filter(ex => ex.bestScore >= 70).length;
  
  return vocabularyExercises.length > 0 ? 
    passedVocabExercises / vocabularyExercises.length : 1;
}

function calculatePerformanceScore(progress) {
  if (progress.maxPossibleScore === 0) return 100; // No scoring = perfect
  return Math.round((progress.totalScore / progress.maxPossibleScore) * 100);
}

function checkProgressConsistency(progress) {
  // Check if student has been consistently engaging
  const minimumSessions = 2;
  const minimumTimeSpent = 10; // minutes
  
  return (
    progress.sessionsCount >= minimumSessions &&
    progress.timeSpent >= minimumTimeSpent
  );
}

// Example standard completion check
const standardExample = {
  exercises: { completed: 5, total: 5, averageScore: 85 },
  objectives: { mastered: 3, total: 4 },
  vocabulary: { learned: 8, total: 12 },
  overallScore: 78,
  sessions: 3,
  timeSpent: 25
};

console.log("Standard completion:", checkStandardCompletion(standardExample));