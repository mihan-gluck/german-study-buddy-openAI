// scripts/test-ai-validation.js

const axios = require('axios');

async function testAIValidation() {
  try {
    console.log('🧪 Testing AI Module Generation with Validation...');
    
    // Test data
    const testData = {
      targetLanguage: 'English',
      nativeLanguage: 'Tamil',
      level: 'A1',
      category: 'Conversation',
      difficulty: 'Beginner',
      description: 'A simple restaurant conversation module for testing validation.',
      estimatedDuration: 20,
      moduleType: 'standard',
      generateVocabulary: true,
      generateExercises: true,
      generateConversation: true,
      generateCulturalNotes: false
    };
    
    // Create axios instance with cookie support
    const axiosInstance = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:4000'
    });
    
    // Login as teacher
    console.log('🔐 Logging in as teacher...');
    await axiosInstance.post('/api/auth/login', {
      regNo: 'TEA001',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    
    // Test AI generation
    console.log('🤖 Testing AI generation with validation...');
    const response = await axiosInstance.post('/api/ai/generate-module', testData);
    
    console.log('✅ AI Generation successful!');
    
    // Validate the response structure
    const module = response.data;
    console.log('📋 Generated Module Validation:');
    console.log(`  Title: ${module.title} (${module.title.length} chars)`);
    console.log(`  Target Language: ${module.targetLanguage}`);
    console.log(`  Level: ${module.level}`);
    console.log(`  Category: ${module.category}`);
    console.log(`  Vocabulary Count: ${module.content?.allowedVocabulary?.length || 0}`);
    console.log(`  Exercise Count: ${module.content?.exercises?.length || 0}`);
    
    // Check exercise types
    if (module.content?.exercises) {
      console.log('🔍 Exercise Types:');
      module.content.exercises.forEach((exercise, index) => {
        console.log(`  ${index + 1}. ${exercise.type} - "${exercise.question.substring(0, 50)}..."`);
      });
    }
    
    // Now test saving the module
    console.log('\n💾 Testing module save...');
    const saveResponse = await axiosInstance.post('/api/learning-modules', module);
    
    console.log('✅ Module saved successfully!');
    console.log(`📝 Saved Module ID: ${saveResponse.data._id}`);
    
    return saveResponse.data;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.errors) {
      console.log('📋 Validation Errors:');
      Object.keys(error.response.data.errors).forEach(field => {
        console.log(`  - ${field}: ${error.response.data.errors[field].message}`);
      });
    }
  }
}

// Run the test
testAIValidation();