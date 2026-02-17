// test-all-ai-modules.js
// Comprehensive test script for all active AI tutor modules

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const LearningModule = require('./models/LearningModule');

const BASE_URL = 'http://localhost:4000';
const TEST_USER = {
  regNo: 'STUD042',
  password: 'Student042@2026'
};

// Create axios instance with cookie jar support
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Enable sending cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login to get auth token
async function login() {
  try {
    console.log('🔐 Logging in as', TEST_USER.regNo);
    const response = await axiosInstance.post('/api/auth/login', {
      regNo: TEST_USER.regNo,
      password: TEST_USER.password
    });
    
    console.log('✅ Login successful\n');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test a single module
async function testModule(module, index, total) {
  const progress = `[${index}/${total}]`;
  console.log(`\n${'='.repeat(100)}`);
  console.log(`${progress} Testing: ${module.title}`);
  console.log(`   ID: ${module._id}`);
  console.log(`   Level: ${module.level} | Language: ${module.targetLanguage} → ${module.nativeLanguage}`);
  console.log('─'.repeat(100));
  
  let sessionId = null;
  
  try {
    // Step 1: Start session
    console.log('   📝 Step 1: Starting session...');
    const startResponse = await axiosInstance.post('/api/ai-tutor/start-session', {
      moduleId: module._id.toString(),
      sessionType: 'practice'
    });
    
    sessionId = startResponse.data.sessionId;
    console.log(`   ✅ Session started: ${sessionId}`);
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Send first message
    console.log('   💬 Step 2: Sending first message...');
    const message1Response = await axiosInstance.post('/api/ai-tutor/send-message', {
      sessionId: sessionId,
      message: 'Hello! I am ready to practice.'
    });
    console.log('   ✅ First message sent and received response');
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 3: Send second message
    console.log('   💬 Step 3: Sending second message...');
    const message2Response = await axiosInstance.post('/api/ai-tutor/send-message', {
      sessionId: sessionId,
      message: 'Thank you for the practice. This was helpful.'
    });
    console.log('   ✅ Second message sent and received response');
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 4: End session properly
    console.log('   🔚 Step 4: Ending session...');
    const endResponse = await axiosInstance.post('/api/ai-tutor/end-session', {
      sessionId: sessionId
    });
    console.log('   ✅ Session ended successfully');
    
    console.log(`\n   ✅ ${progress} Module "${module.title}" - ALL TESTS PASSED`);
    
    return {
      moduleId: module._id.toString(),
      title: module.title,
      status: 'PASSED',
      sessionId: sessionId,
      error: null
    };
    
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    const errorCode = error.response?.data?.code;
    const statusCode = error.response?.status;
    
    console.error(`\n   ❌ ${progress} Module "${module.title}" - FAILED`);
    console.error(`   Status: ${statusCode}`);
    console.error(`   Error: ${errorMsg}`);
    if (errorCode) {
      console.error(`   Code: ${errorCode}`);
    }
    if (error.response?.data) {
      console.error(`   Full response:`, JSON.stringify(error.response.data, null, 2));
    }
    
    // Try to end session if it was started
    if (sessionId) {
      try {
        console.log('   🔄 Attempting to clean up session...');
        await axiosInstance.post('/api/ai-tutor/end-session', { 
          sessionId: sessionId 
        });
        console.log('   ✅ Session cleaned up');
      } catch (cleanupError) {
        console.error('   ⚠️  Could not clean up session');
      }
    }
    
    return {
      moduleId: module._id.toString(),
      title: module.title,
      status: 'FAILED',
      sessionId: sessionId,
      error: errorMsg
    };
  }
}

// Main test function
async function testAllModules() {
  console.log('🚀 Starting AI Tutor Module Testing\n');
  console.log('═'.repeat(100));
  console.log('Test Configuration:');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Test User: ${TEST_USER.username}`);
  console.log('═'.repeat(100));
  
  try {
    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without authentication');
      process.exit(1);
    }
    
    // Step 2: Connect to MongoDB and get active modules
    console.log('📊 Fetching active modules from database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const modules = await LearningModule.find({ isActive: true }).sort({ createdAt: -1 });
    console.log(`✅ Found ${modules.length} active modules to test\n`);
    
    if (modules.length === 0) {
      console.log('⚠️  No active modules found. Nothing to test.');
      await mongoose.disconnect();
      return;
    }
    
    // Step 3: Test each module
    const results = [];
    
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      const result = await testModule(module, i + 1, modules.length);
      results.push(result);
      
      // Add delay between modules to avoid overwhelming the server
      if (i < modules.length - 1) {
        console.log('\n   ⏳ Waiting 2 seconds before next module...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Step 4: Generate summary report
    console.log('\n\n' + '═'.repeat(100));
    console.log('📊 TEST SUMMARY REPORT');
    console.log('═'.repeat(100));
    
    const passed = results.filter(r => r.status === 'PASSED');
    const failed = results.filter(r => r.status === 'FAILED');
    
    console.log(`\n✅ PASSED: ${passed.length}/${results.length} modules`);
    console.log(`❌ FAILED: ${failed.length}/${results.length} modules`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Modules:');
      console.log('─'.repeat(100));
      failed.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.title}`);
        console.log(`   Module ID: ${result.moduleId}`);
        console.log(`   Error: ${result.error}`);
      });
    }
    
    if (passed.length > 0) {
      console.log('\n✅ Passed Modules:');
      console.log('─'.repeat(100));
      passed.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title} (ID: ${result.moduleId})`);
      });
    }
    
    console.log('\n' + '═'.repeat(100));
    console.log(`\n🎯 Success Rate: ${Math.round((passed.length / results.length) * 100)}%`);
    console.log('\n✅ Testing Complete!\n');
    
    await mongoose.disconnect();
    
    // Exit with error code if any tests failed
    if (failed.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during testing:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the tests
testAllModules();
