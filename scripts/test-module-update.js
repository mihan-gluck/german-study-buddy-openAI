// scripts/test-module-update.js

const axios = require('axios');

async function testModuleUpdate() {
  try {
    console.log('🧪 Testing Module Update Functionality...\n');
    
    // Create axios instance with cookie support
    const axiosInstance = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:4000',
      timeout: 30000
    });
    
    // Step 1: Login
    console.log('🔐 Step 1: Logging in as teacher...');
    await axiosInstance.post('/api/auth/login', {
      regNo: 'TEA001',
      password: 'password123'
    });
    console.log('✅ Login successful\n');
    
    // Step 2: Get existing modules
    console.log('📋 Step 2: Fetching existing modules...');
    const modulesResponse = await axiosInstance.get('/api/learning-modules');
    const modules = modulesResponse.data.modules;
    
    if (modules.length === 0) {
      console.log('❌ No modules found to test update');
      return false;
    }
    
    const testModule = modules[0];
    console.log(`✅ Found module to test: "${testModule.title}"`);
    console.log(`📝 Module ID: ${testModule._id}\n`);
    
    // Step 3: Prepare update data with potential validation issues
    console.log('🔧 Step 3: Preparing update with validation fixes...');
    const updateData = {
      ...testModule,
      title: 'Updated Restaurant Conversation - English Practice',
      description: 'Updated: Practice ordering food in English at a restaurant. Perfect for Tamil speakers learning English. Learn essential restaurant vocabulary and polite expressions.',
      content: {
        ...testModule.content,
        exercises: [
          {
            type: 'multiple-choice', // Valid type
            question: 'What do you say when you enter a restaurant?',
            options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
            correctAnswer: 'Hello',
            explanation: 'Hello is the appropriate greeting when entering a restaurant',
            points: 1
          },
          {
            type: 'sentence-formation', // Invalid type - should be auto-fixed
            question: 'Form a sentence to order food',
            correctAnswer: 'I would like to order the chicken curry',
            explanation: 'This is a polite way to order food',
            points: 2
          }
        ]
      }
    };
    
    console.log('📝 Update includes:');
    console.log('  - Valid exercise type: multiple-choice');
    console.log('  - Invalid exercise type: sentence-formation (should be auto-fixed)');
    console.log('  - Updated title and description\n');
    
    // Step 4: Update the module
    console.log('💾 Step 4: Updating module...');
    const updateResponse = await axiosInstance.put(`/api/learning-modules/${testModule._id}`, updateData);
    
    console.log('✅ Module updated successfully!');
    console.log(`📝 Updated Title: ${updateResponse.data.title}`);
    
    // Step 5: Verify the fixes were applied
    console.log('\n🔍 Step 5: Verifying auto-fixes...');
    const updatedModule = updateResponse.data;
    
    if (updatedModule.content && updatedModule.content.exercises) {
      console.log('📝 Exercise types after update:');
      updatedModule.content.exercises.forEach((exercise, index) => {
        console.log(`  ${index + 1}. ${exercise.type} - "${exercise.question.substring(0, 40)}..."`);
      });
      
      // Check if invalid type was fixed
      const hasInvalidTypes = updatedModule.content.exercises.some(ex => 
        !['multiple-choice', 'fill-blank', 'translation', 'conversation', 'essay', 'role-play'].includes(ex.type)
      );
      
      if (hasInvalidTypes) {
        console.log('❌ Some invalid exercise types were not fixed');
        return false;
      } else {
        console.log('✅ All exercise types are valid');
      }
    }
    
    console.log('\n🎉 MODULE UPDATE TEST PASSED!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Module update working');
    console.log('  ✅ Auto-validation fixes working');
    console.log('  ✅ Invalid exercise types auto-corrected');
    console.log('  ✅ Module saved successfully');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Module update test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('💡 Validation error details:');
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach(field => {
          console.log(`  - ${field}: ${error.response.data.errors[field]}`);
        });
      }
    }
    
    return false;
  }
}

// Run the test
testModuleUpdate().then(success => {
  process.exit(success ? 0 : 1);
});