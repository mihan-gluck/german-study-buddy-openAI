// scripts/test-ai-generation-types.js

const axios = require('axios');

async function testAIGenerationTypes() {
  try {
    console.log('🧪 Testing AI Generation for Different Module Types...');
    
    // Create axios instance with cookie support
    const axiosInstance = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:4000'
    });
    
    // First, login as teacher
    console.log('🔐 Logging in as teacher...');
    await axiosInstance.post('/api/auth/login', {
      regNo: 'TEA001',
      password: 'password123'
    });
    
    console.log('✅ Login successful\n');
    
    // Test 1: Standard Module
    console.log('📚 Test 1: Creating STANDARD module...');
    const standardData = {
      targetLanguage: 'English',
      nativeLanguage: 'Tamil',
      level: 'A1',
      category: 'Grammar',
      difficulty: 'Beginner',
      description: 'A module about basic English grammar rules including present tense, articles, and sentence structure.',
      estimatedDuration: 30,
      moduleType: 'standard', // EXPLICITLY STANDARD
      generateVocabulary: true,
      generateExercises: true,
      generateConversation: false,
      generateCulturalNotes: false
    };
    
    const standardResponse = await axiosInstance.post('/api/ai/generate-module', standardData);
    
    console.log('✅ Standard module generated:');
    console.log('   Title:', standardResponse.data.title);
    console.log('   Module Type Requested:', standardData.moduleType);
    console.log('   Has Role-Play Scenario:', !!standardResponse.data.content?.rolePlayScenario);
    console.log('   Vocabulary Count:', standardResponse.data.content?.allowedVocabulary?.length || 0);
    console.log('   Exercise Count:', standardResponse.data.content?.exercises?.length || 0);
    
    // Test 2: Role-Play Module
    console.log('\\n🎭 Test 2: Creating ROLE-PLAY module...');
    const roleplayData = {
      targetLanguage: 'English',
      nativeLanguage: 'Tamil',
      level: 'A2',
      category: 'Conversation',
      difficulty: 'Intermediate',
      description: 'A module about shopping for clothes, including asking for sizes, colors, prices, and trying on clothes.',
      estimatedDuration: 45,
      moduleType: 'roleplay', // EXPLICITLY ROLEPLAY
      generateVocabulary: true,
      generateExercises: true,
      generateConversation: true,
      generateCulturalNotes: true
    };
    
    const roleplayResponse = await axiosInstance.post('/api/ai/generate-module', roleplayData);
    
    console.log('✅ Role-play module generated:');
    console.log('   Title:', roleplayResponse.data.title);
    console.log('   Module Type Requested:', roleplayData.moduleType);
    console.log('   Has Role-Play Scenario:', !!roleplayResponse.data.content?.rolePlayScenario);
    if (roleplayResponse.data.content?.rolePlayScenario) {
      console.log('   Scenario:', roleplayResponse.data.content.rolePlayScenario.situation);
      console.log('   Student Role:', roleplayResponse.data.content.rolePlayScenario.studentRole);
      console.log('   AI Role:', roleplayResponse.data.content.rolePlayScenario.aiRole);
    }
    console.log('   Vocabulary Count:', roleplayResponse.data.content?.allowedVocabulary?.length || 0);
    console.log('   Exercise Count:', roleplayResponse.data.content?.exercises?.length || 0);
    
    // Analysis
    console.log('\\n🔍 Analysis:');
    const standardHasRolePlay = !!standardResponse.data.content?.rolePlayScenario;
    const roleplayHasRolePlay = !!roleplayResponse.data.content?.rolePlayScenario;
    
    if (!standardHasRolePlay && roleplayHasRolePlay) {
      console.log('✅ CORRECT: Standard module has no role-play, Role-play module has role-play');
    } else if (standardHasRolePlay && roleplayHasRolePlay) {
      console.log('❌ PROBLEM: Both modules have role-play scenarios (should only be role-play type)');
    } else if (!standardHasRolePlay && !roleplayHasRolePlay) {
      console.log('❌ PROBLEM: Neither module has role-play scenario (role-play type should have one)');
    } else {
      console.log('❌ UNEXPECTED: Standard has role-play but role-play doesn\'t');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Authentication failed - check login credentials');
    } else if (error.response?.status === 403) {
      console.log('💡 Permission denied - user might not have TEACHER role');
    } else if (error.response?.status === 500) {
      console.log('💡 Server error - check OpenAI API key and server logs');
    }
  }
}

// Run the test
testAIGenerationTypes();