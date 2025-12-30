// scripts/enhanced-completion-system.js
// Enhanced completion system for both module types

class ModuleCompletionSystem {
  
  static async checkModuleCompletion(moduleId, studentId, sessionData = null) {
    const LearningModule = require('../models/LearningModule');
    const StudentProgress = require('../models/StudentProgress');
    
    const module = await LearningModule.findById(moduleId);
    const progress = await StudentProgress.findOne({ studentId, moduleId });
    
    if (!module || !progress) {
      throw new Error('Module or progress not found');
    }
    
    // Determine module type
    const isRolePlay = !!module.content?.rolePlayScenario?.situation;
    
    let completionResult;
    
    if (isRolePlay) {
      completionResult = this.checkRolePlayCompletion(module, progress, sessionData);
    } else {
      completionResult = this.checkStandardCompletion(module, progress);
    }
    
    // Update progress if completed
    if (completionResult.isCompleted && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();
      progress.progressPercentage = 100;
      await progress.save();
      
      console.log(`✅ Module "${module.title}" completed by student ${studentId}`);
    }
    
    return completionResult;
  }
  
  // ROLE-PLAY COMPLETION LOGIC
  static checkRolePlayCompletion(module, progress, sessionData) {
    const scenario = module.content.rolePlayScenario;
    
    if (!sessionData) {
      // If no session data, fall back to exercise completion
      return this.checkBasicCompletion(module, progress);
    }
    
    const criteria = {
      // 1. Conversation flow completion
      conversationFlow: this.assessConversationFlow(sessionData, scenario),
      
      // 2. Vocabulary usage
      vocabularyUsage: this.assessVocabularyUsage(sessionData, module.content.allowedVocabulary),
      
      // 3. Scenario objective achievement
      objectiveAchieved: this.assessObjectiveAchievement(sessionData, scenario),
      
      // 4. Interaction quality
      interactionQuality: this.assessInteractionQuality(sessionData),
      
      // 5. Time investment
      timeInvestment: this.assessTimeInvestment(sessionData, module.estimatedDuration)
    };
    
    // Role-play completion formula
    const completionScore = (
      criteria.conversationFlow * 0.3 +
      criteria.vocabularyUsage * 0.25 +
      (criteria.objectiveAchieved ? 0.25 : 0) +
      criteria.interactionQuality * 0.1 +
      criteria.timeInvestment * 0.1
    );
    
    const isCompleted = completionScore >= 0.75; // 75% threshold
    
    return {
      isCompleted,
      completionScore: Math.round(completionScore * 100),
      type: 'role-play',
      criteria,
      feedback: this.generateRolePlayFeedback(criteria, isCompleted)
    };
  }
  
  // STANDARD COMPLETION LOGIC
  static checkStandardCompletion(module, progress) {
    const criteria = {
      // 1. Exercise completion with quality
      exerciseCompletion: this.assessExerciseCompletion(module, progress),
      
      // 2. Learning objectives mastery
      objectiveMastery: this.assessObjectiveMastery(module, progress),
      
      // 3. Knowledge retention
      knowledgeRetention: this.assessKnowledgeRetention(progress),
      
      // 4. Performance consistency
      performanceConsistency: this.assessPerformanceConsistency(progress),
      
      // 5. Time investment
      timeInvestment: this.assessTimeInvestmentStandard(progress, module.estimatedDuration)
    };
    
    // Standard completion formula
    const completionScore = (
      criteria.exerciseCompletion * 0.4 +
      criteria.objectiveMastery * 0.3 +
      criteria.knowledgeRetention * 0.15 +
      criteria.performanceConsistency * 0.1 +
      criteria.timeInvestment * 0.05
    );
    
    const isCompleted = completionScore >= 0.8; // 80% threshold
    
    return {
      isCompleted,
      completionScore: Math.round(completionScore * 100),
      type: 'standard',
      criteria,
      feedback: this.generateStandardFeedback(criteria, isCompleted)
    };
  }
  
  // ROLE-PLAY ASSESSMENT METHODS
  static assessConversationFlow(sessionData, scenario) {
    if (!scenario.conversationFlow || scenario.conversationFlow.length === 0) return 1;
    
    const studentMessages = sessionData.messages.filter(m => m.role === 'student');
    const conversationText = studentMessages.map(m => m.content.toLowerCase()).join(' ');
    
    let stagesCompleted = 0;
    scenario.conversationFlow.forEach(stage => {
      const stageKeywords = stage.toLowerCase().split(' ');
      const stageDiscussed = stageKeywords.some(keyword => 
        conversationText.includes(keyword)
      );
      if (stageDiscussed) stagesCompleted++;
    });
    
    return Math.min(stagesCompleted / scenario.conversationFlow.length, 1);
  }
  
  static assessVocabularyUsage(sessionData, allowedVocabulary) {
    if (!allowedVocabulary || allowedVocabulary.length === 0) return 1;
    
    const studentText = sessionData.messages
      .filter(m => m.role === 'student')
      .map(m => m.content.toLowerCase())
      .join(' ');
    
    let vocabularyUsed = 0;
    allowedVocabulary.forEach(vocab => {
      if (studentText.includes(vocab.word.toLowerCase())) {
        vocabularyUsed++;
      }
    });
    
    return Math.min(vocabularyUsed / allowedVocabulary.length, 1);
  }
  
  static assessObjectiveAchievement(sessionData, scenario) {
    const objective = scenario.objective.toLowerCase();
    const conversationText = sessionData.messages.map(m => m.content.toLowerCase()).join(' ');
    
    // Simple keyword matching for common objectives
    const objectiveKeywords = objective.split(' ').filter(word => word.length > 3);
    const keywordsFound = objectiveKeywords.filter(keyword => 
      conversationText.includes(keyword)
    ).length;
    
    return keywordsFound >= Math.ceil(objectiveKeywords.length * 0.5);
  }
  
  static assessInteractionQuality(sessionData) {
    const studentMessages = sessionData.messages.filter(m => m.role === 'student');
    
    if (studentMessages.length < 3) return 0.3; // Too few interactions
    if (studentMessages.length >= 10) return 1.0; // Great interaction
    
    return studentMessages.length / 10; // Scale based on message count
  }
  
  static assessTimeInvestment(sessionData, estimatedDuration) {
    const actualDuration = sessionData.duration || 0; // in minutes
    const expectedDuration = estimatedDuration || 30;
    
    if (actualDuration >= expectedDuration * 0.7) return 1.0; // 70% of expected time
    if (actualDuration >= expectedDuration * 0.5) return 0.7; // 50% of expected time
    if (actualDuration >= expectedDuration * 0.3) return 0.4; // 30% of expected time
    
    return 0.2; // Less than 30%
  }
  
  // STANDARD ASSESSMENT METHODS
  static assessExerciseCompletion(module, progress) {
    const totalExercises = module.content.exercises.length;
    if (totalExercises === 0) return 1;
    
    const completedExercises = progress.exercisesCompleted.filter(ex => 
      ex.isCompleted && ex.bestScore >= 60
    ).length;
    
    return completedExercises / totalExercises;
  }
  
  static assessObjectiveMastery(module, progress) {
    const totalObjectives = module.learningObjectives.length;
    if (totalObjectives === 0) return 1;
    
    const masteredObjectives = progress.objectivesCompleted.filter(obj => 
      obj.masteryLevel !== 'basic'
    ).length;
    
    return masteredObjectives / totalObjectives;
  }
  
  static assessKnowledgeRetention(progress) {
    if (progress.totalScore === 0 || progress.maxPossibleScore === 0) return 1;
    
    const performanceScore = progress.totalScore / progress.maxPossibleScore;
    return Math.min(performanceScore, 1);
  }
  
  static assessPerformanceConsistency(progress) {
    const hasMultipleSessions = progress.sessionsCount >= 2;
    const hasReasonableTime = progress.timeSpent >= 15; // 15 minutes minimum
    const hasGoodStreak = progress.bestStreak >= 2;
    
    let consistencyScore = 0;
    if (hasMultipleSessions) consistencyScore += 0.4;
    if (hasReasonableTime) consistencyScore += 0.4;
    if (hasGoodStreak) consistencyScore += 0.2;
    
    return consistencyScore;
  }
  
  static assessTimeInvestmentStandard(progress, estimatedDuration) {
    const actualTime = progress.timeSpent || 0;
    const expectedTime = estimatedDuration || 30;
    
    if (actualTime >= expectedTime * 0.8) return 1.0;
    if (actualTime >= expectedTime * 0.6) return 0.8;
    if (actualTime >= expectedTime * 0.4) return 0.6;
    
    return 0.3;
  }
  
  // FEEDBACK GENERATION
  static generateRolePlayFeedback(criteria, isCompleted) {
    const feedback = [];
    
    if (isCompleted) {
      feedback.push("🎉 Congratulations! You've successfully completed this role-play scenario.");
    } else {
      feedback.push("📚 Keep practicing! Here's how to improve:");
    }
    
    if (criteria.conversationFlow < 0.7) {
      feedback.push("💬 Try to cover more conversation topics in the scenario");
    }
    
    if (criteria.vocabularyUsage < 0.6) {
      feedback.push("📝 Use more of the provided vocabulary words");
    }
    
    if (!criteria.objectiveAchieved) {
      feedback.push("🎯 Focus on achieving the main scenario objective");
    }
    
    return feedback.join(' ');
  }
  
  static generateStandardFeedback(criteria, isCompleted) {
    const feedback = [];
    
    if (isCompleted) {
      feedback.push("🎓 Excellent work! You've mastered this module.");
    } else {
      feedback.push("📖 Continue learning! Areas to focus on:");
    }
    
    if (criteria.exerciseCompletion < 0.8) {
      feedback.push("📝 Complete more exercises with better scores");
    }
    
    if (criteria.objectiveMastery < 0.7) {
      feedback.push("🎯 Work on mastering the learning objectives");
    }
    
    if (criteria.knowledgeRetention < 0.7) {
      feedback.push("🧠 Review and practice to improve retention");
    }
    
    return feedback.join(' ');
  }
  
  // FALLBACK METHOD
  static checkBasicCompletion(module, progress) {
    const totalExercises = module.content.exercises.length;
    const completedExercises = progress.exercisesCompleted.filter(ex => ex.isCompleted).length;
    
    const isCompleted = totalExercises > 0 ? completedExercises === totalExercises : true;
    
    return {
      isCompleted,
      completionScore: isCompleted ? 100 : Math.round((completedExercises / totalExercises) * 100),
      type: 'basic',
      feedback: isCompleted ? 
        "✅ All exercises completed!" : 
        `📚 Complete ${totalExercises - completedExercises} more exercises`
    };
  }
}

module.exports = ModuleCompletionSystem;