// scripts/test-complete-workflow.js

const axios = require('axios');

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Testing Complete AI Module Creation Workflow...\n');
    
    // Test data - simple to avoid complex parsing issues
    const testData = {
      targetLanguage: 'English',
      nativeLanguage: 'Tamil',
      level: 'A1',
      category: 'Vocabulary',
      difficulty: 'Beginner',
      description: 'Basic greetings and introductions for beginners.',
      estimatedDuration: 20,
      moduleType: 'standard',
      generateVocabulary: true,
      generateExercises: true,
      generateConversation: false,
      generateCulturalNotes: false
    };
    
    console.log('📋 Test Configuration:');
    console.log(`  Target Language: ${testData.targetLanguage}`);
    console.log(`  Native Language: ${testData.nativeLanguage}`);
    console.log(`  Level: ${testData.level}`);
    console.log(`  Category: ${testData.category}`);
    console.log(`  Description: ${testData.description}\n`);
    
    // Create axios instance with cookie support
    const axiosInstance = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:4000',
      timeout: 30000 // 30 second timeout
    });
    
    // Step 1: Login
    console.log('🔐 Step 1: Logging in as teacher...');
    const loginResponse = await axiosInstance.post('/api/auth/login', {
      regNo: 'TEA001',
      password: 'password123'
    });
    
    console.log('✅ Login successful\n');
    
    // Step 2: Generate module with AI
    console.log('🤖 Step 2: Generating module with AI...');
    const generateResponse = await axiosInstance.post('/api/ai/generate-module', testData);
    
    const generatedModule = generateResponse.data;
    console.log('✅ AI Generation successful!');
    console.log(`📋 Generated: "${generatedModule.title}"`);
    console.log(`📝 Description: ${generatedModule.description.substring(0, 100)}...`);
    console.log(`📚 Vocabulary: ${generatedModule.content?.allowedVocabulary?.length || 0} words`);
    console.log(`📝 Exercises: ${generatedModule.content?.exercises?.length || 0} exercises\n`);
    
    // Step 3: Validate module structure
    console.log('🔍 Step 3: Validating module structure...');
    const validationChecks = [
      { name: 'Title', check: () => generatedModule.title && generatedModule.title.length <= 60 },
      { name: 'Target Language', check: () => ['English', 'German'].includes(generatedModule.targetLanguage) },
      { name: 'Native Language', check: () => ['English', 'Tamil', 'Sinhala'].includes(generatedModule.nativeLanguage) },
      { name: 'Level', check: () => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(generatedModule.level) },
      { name: 'Category', check: () => ['Grammar', 'Vocabulary', 'Conversation', 'Reading', 'Writing', 'Listening'].includes(generatedModule.category) },
      { name: 'Exercises', check: () => generatedModule.content?.exercises?.length > 0 },
      { name: 'Exercise Types', check: () => {
        const allowedTypes = ['multiple-choice', 'fill-blank', 'translation', 'conversation', 'essay', 'role-play'];
        return generatedModule.content?.exercises?.every(ex => allowedTypes.includes(ex.type));
      }}
    ];
    
    let allValid = true;
    validationChecks.forEach(check => {
      const isValid = check.check();
      console.log(`  ${isValid ? '✅' : '❌'} ${check.name}: ${isValid ? 'VALID' : 'INVALID'}`);
      if (!isValid) allValid = false;
    });
    
    if (!allValid) {
      console.log('\n❌ Module validation failed - cannot proceed with save test');
      return false;
    }
    
    console.log('✅ All validation checks passed\n');
    
    // Step 4: Save module to database
    console.log('💾 Step 4: Saving module to database...');
    const saveResponse = await axiosInstance.post('/api/learning-modules', generatedModule);
    
    console.log('✅ Module saved successfully!');
    console.log(`📝 Saved Module ID: ${saveResponse.data._id}`);
    console.log(`🏷️ Module Title: ${saveResponse.data.title}\n`);
    
    // Step 5: Verify module can be retrieved
    console.log('🔍 Step 5: Verifying saved module...');
    const retrieveResponse = await axiosInstance.get(`/api/learning-modules/${saveResponse.data._id}`);
    
    console.log('✅ Module retrieved successfully!');
    console.log(`📋 Retrieved: "${retrieveResponse.data.title}"`);
    console.log(`📊 Status: ${retrieveResponse.data.isActive ? 'Active' : 'Inactive'}\n`);
    
    console.log('🎉 COMPLETE WORKFLOW TEST PASSED!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Authentication working');
    console.log('  ✅ AI generation working');
    console.log('  ✅ JSON parsing working');
    console.log('  ✅ Module validation working');
    console.log('  ✅ Database save working');
    console.log('  ✅ Module retrieval working');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Workflow test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Authentication issue - check login credentials');
    } else if (error.response?.status === 403) {
      console.log('💡 Permission denied - check user role');
    } else if (error.response?.status === 400) {
      console.log('💡 Validation error - check module data structure');
      if (error.response?.data?.errors) {
        console.log('📋 Validation Errors:');
        Object.keys(error.response.data.errors).forEach(field => {
          console.log(`  - ${field}: ${error.response.data.errors[field].message}`);
        });
      }
    } else if (error.response?.status === 500) {
      console.log('💡 Server error - check backend logs');
    }
    
    return false;
  }
}

// Run the test
testCompleteWorkflow().then(success => {
  process.exit(success ? 0 : 1);
});