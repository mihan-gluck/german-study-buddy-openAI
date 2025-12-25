// Test student enrollment process
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

// Create axios instance with cookie support
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testStudentEnrollment() {
  console.log('🧪 Testing Student Enrollment Process...\n');

  try {
    // Step 1: Login as PLATINUM student
    console.log('1️⃣ Logging in as PLATINUM student...');
    const loginResponse = await apiClient.post('/auth/login', {
      regNo: 'STU001',
      password: 'password123'
    });
    
    console.log('✅ Student login successful');
    console.log('👤 User:', loginResponse.data.user.name, '- Role:', loginResponse.data.user.role);
    console.log('💎 Subscription:', loginResponse.data.user.subscription);

    // Step 2: Get available modules
    console.log('\n2️⃣ Getting available modules...');
    const modulesResponse = await apiClient.get('/learning-modules');
    
    const modules = modulesResponse.data.modules || modulesResponse.data;
    console.log(`✅ Found ${modules.length} modules`);
    
    if (modules.length === 0) {
      console.log('❌ No modules available for enrollment');
      return;
    }

    // Show first few modules
    console.log('\n📚 Available modules:');
    modules.slice(0, 3).forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (ID: ${module._id})`);
      console.log(`   Level: ${module.level} | Category: ${module.category}`);
      console.log(`   Target: ${module.targetLanguage} | Native: ${module.nativeLanguage}`);
    });

    // Step 3: Try to enroll in the first module
    const testModule = modules[0];
    console.log(`\n3️⃣ Attempting to enroll in: "${testModule.title}"`);
    console.log(`Module ID: ${testModule._id}`);
    
    const enrollResponse = await apiClient.post(`/learning-modules/${testModule._id}/enroll`);
    
    console.log('✅ Enrollment successful!');
    console.log('📋 Enrollment response:', enrollResponse.data);

    // Step 4: Try to enroll in the same module again (should fail)
    console.log('\n4️⃣ Attempting to enroll again (should fail)...');
    try {
      await apiClient.post(`/learning-modules/${testModule._id}/enroll`);
      console.log('❌ Unexpected: Second enrollment succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Expected: Already enrolled error -', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Student enrollment test completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during enrollment testing:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Specific error analysis
    if (error.response?.status === 404) {
      console.log('\n🔍 404 Error Analysis:');
      console.log('This could mean:');
      console.log('- Module ID is incorrect or malformed');
      console.log('- Module was deleted (isActive = false)');
      console.log('- Enrollment endpoint URL is wrong');
      console.log('- Backend route is not properly registered');
    } else if (error.response?.status === 401) {
      console.log('\n🔍 401 Error Analysis:');
      console.log('Authentication issue - student not properly logged in');
    } else if (error.response?.status === 403) {
      console.log('\n🔍 403 Error Analysis:');
      console.log('Permission issue - student role or subscription problem');
    }
  }
}

// Run the test
testStudentEnrollment();