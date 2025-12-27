// scripts/proposed-roleplay-completion.js
// Proposed completion logic for role-play modules

function checkRolePlayCompletion(module, session, progress) {
  const scenario = module.content.rolePlayScenario;
  
  // Role-play completion criteria
  const completionCriteria = {
    // 1. Conversation flow completed
    conversationStagesCompleted: checkConversationFlow(session, scenario),
    
    // 2. Key vocabulary used
    vocabularyUsageRate: calculateVocabularyUsage(session, module.content.allowedVocabulary),
    
    // 3. Scenario objective achieved
    objectiveAchieved: checkScenarioObjective(session, scenario),
    
    // 4. Minimum interaction time
    minimumTimeSpent: session.duration >= (module.estimatedDuration * 0.7), // 70% of estimated time
    
    // 5. Natural conversation flow
    conversationQuality: assessConversationQuality(session)
  };
  
  // Role-play completion logic
  const isCompleted = (
    completionCriteria.conversationStagesCompleted >= 0.8 && // 80% of conversation flow
    completionCriteria.vocabularyUsageRate >= 0.6 &&         // Used 60% of vocabulary
    completionCriteria.objectiveAchieved &&                  // Main objective achieved
    completionCriteria.minimumTimeSpent                      // Spent enough time
  );
  
  return {
    isCompleted,
    completionRate: calculateOverallCompletion(completionCriteria),
    details: completionCriteria
  };
}

function checkConversationFlow(session, scenario) {
  if (!scenario.conversationFlow) return 1; // No flow defined = completed
  
  const flowStages = scenario.conversationFlow;
  const messages = session.messages.filter(m => m.role === 'student');
  
  // Check how many conversation stages were covered
  let stagesCompleted = 0;
  
  flowStages.forEach(stage => {
    const stageKeywords = extractKeywords(stage);
    const stageDiscussed = messages.some(msg => 
      stageKeywords.some(keyword => 
        msg.content.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    if (stageDiscussed) stagesCompleted++;
  });
  
  return stagesCompleted / flowStages.length;
}

function calculateVocabularyUsage(session, allowedVocabulary) {
  if (!allowedVocabulary || allowedVocabulary.length === 0) return 1;
  
  const studentMessages = session.messages
    .filter(m => m.role === 'student')
    .map(m => m.content.toLowerCase())
    .join(' ');
  
  let vocabularyUsed = 0;
  
  allowedVocabulary.forEach(vocabItem => {
    if (studentMessages.includes(vocabItem.word.toLowerCase())) {
      vocabularyUsed++;
    }
  });
  
  return vocabularyUsed / allowedVocabulary.length;
}

function checkScenarioObjective(session, scenario) {
  // Check if the main objective was achieved based on conversation content
  const objective = scenario.objective.toLowerCase();
  const conversation = session.messages.map(m => m.content.toLowerCase()).join(' ');
  
  // Simple keyword matching for objective achievement
  if (objective.includes('order') && objective.includes('food')) {
    return conversation.includes('order') || conversation.includes('like') || conversation.includes('want');
  }
  
  if (objective.includes('buy') && objective.includes('ticket')) {
    return conversation.includes('ticket') || conversation.includes('buy') || conversation.includes('purchase');
  }
  
  // Default: if conversation is substantial, objective is likely achieved
  return session.messages.filter(m => m.role === 'student').length >= 5;
}

// Example role-play completion check
const rolePlayExample = {
  scenario: "Restaurant ordering",
  conversationStages: ["greeting", "ordering", "payment"],
  vocabularyUsed: 15, // out of 25 allowed words
  objectiveAchieved: true, // Successfully ordered food
  timeSpent: 12, // minutes (estimated was 15)
  conversationQuality: "good"
};

console.log("Role-play completion:", checkRolePlayCompletion(rolePlayExample));