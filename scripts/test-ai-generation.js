// scripts/test-ai-generation.js

const axios = require('axios');

async function testAIGeneration() {
  try {
    console.log('🧪 Testing AI Module Generation API...');
    
    // Test data
    const testData = {
      targetLanguage: 'English',
      nativeLanguage: 'Tamil',
      level: 'A1',
      category: 'Conversation',
      difficulty: 'Beginner',
      description: 'A module about ordering food in a restaurant, including greetings, menu vocabulary, asking questions about dishes, and paying the bill.',
      estimatedDuration: 30,
      moduleType: 'roleplay',
      generateVocabulary: true,
      generateExercises: true,
      generateConversation: true,
      generateCulturalNotes: true
    };
    
    // Create axios instance with cookie support
    const axiosInstance = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:4000'
    });
    
    // First, we need to login to get a valid token
    console.log('🔐 Logging in as teacher...');
    const loginResponse = await axiosInstance.post('/api/auth/login', {
      regNo: 'TEA001',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    
    // Now test the AI generation
    console.log('🤖 Calling AI generation endpoint...');
    const response = await axiosInstance.post('/api/ai/generate-module', testData);
    
    console.log('✅ AI Generation successful!');
    console.log('📋 Generated Module:', {
      title: response.data.title,
      description: response.data.description.substring(0, 100) + '...',
      vocabularyCount: response.data.content?.allowedVocabulary?.length || 0,
      exerciseCount: response.data.content?.exercises?.length || 0,
      hasRolePlay: !!response.data.content?.rolePlayScenario
    });
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Authentication failed - check login credentials');
    } else if (error.response?.status === 403) {
      console.log('💡 Permission denied - user might not have TEACHER/ADMIN role');
    } else if (error.response?.status === 500) {
      console.log('💡 Server error - check OpenAI API key and server logs');
    }
  }
}

// Run the test
testAIGeneration();