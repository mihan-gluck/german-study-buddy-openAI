// scripts/test-teacher-messaging.js

const axios = require('axios');

async function testTeacherMessaging() {
  try {
    console.log('🧪 Testing Teacher Test Messaging...\n');
    
    // Create axios instance
    const axiosInstance = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:4000',
      timeout: 30000
    });
    
    // Step 1: Login as teacher
    console.log('🔐 Step 1: Logging in as teacher...');
    await axiosInstance.post('/api/auth/login', {
      regNo: 'TEA001',
      password: 'password123'
    });
    console.log('✅ Login successful\n');
    
    // Step 2: Get modules
    console.log('📋 Step 2: Getting modules...');
    const modulesResponse = await axiosInstance.get('/api/learning-modules');
    const modules = modulesResponse.data.modules;
    
    if (modules.length === 0) {
      console.log('❌ No modules found for testing');
      return false;
    }
    
    const testModule = modules[0];
    console.log(`✅ Found module: "${testModule.title}"\n`);
    
    // Step 3: Start teacher test session
    console.log('🧪 Step 3: Starting teacher test session...');
    const testSessionResponse = await axiosInstance.post('/api/ai-tutor/start-teacher-test', {
      moduleId: testModule._id,
      sessionType: 'teacher-test'
    });
    
    const sessionId = testSessionResponse.data.sessionId;
    console.log(`✅ Test session started: ${sessionId}\n`);
    
    // Step 4: Test sending a message
    console.log('💬 Step 4: Testing message sending...');
    const messageResponse = await axiosInstance.post('/api/ai-tutor/send-message', {
      sessionId: sessionId,
      message: 'Hello, I am testing this module as a teacher.',
      messageType: 'text'
    });
    
    console.log('✅ Message sent successfully!');
    console.log(`🤖 AI Response: ${messageResponse.data.response.content.substring(0, 100)}...\n`);
    
    // Step 5: Test ending session
    console.log('🔚 Step 5: Testing session end...');
    const endResponse = await axiosInstance.post('/api/ai-tutor/end-session', {
      sessionId: sessionId
    });
    
    console.log('✅ Session ended successfully!');
    console.log(`📊 Session Summary: ${endResponse.data.sessionSummary.totalMessages} messages\n`);
    
    console.log('🎉 TEACHER TEST MESSAGING WORKING!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Teacher test session creation working');
    console.log('  ✅ Teacher message sending working');
    console.log('  ✅ AI response generation working');
    console.log('  ✅ Session ending working');
    console.log('  ✅ No subscription restrictions for teachers');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Teacher messaging test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('💡 Permission denied - check role restrictions in endpoints');
    } else if (error.response?.status === 404) {
      console.log('💡 Session not found - check session creation and lookup');
    } else if (error.response?.status === 500) {
      console.log('💡 Server error - check backend logs');
    }
    
    return false;
  }
}

// Run the test
testTeacherMessaging().then(success => {
  process.exit(success ? 0 : 1);
});