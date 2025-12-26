// Test script to verify teacher module testing API
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

async function testTeacherModuleTesting() {
  console.log('🧪 Testing Teacher Module Testing API...\n');

  try {
    // Step 1: Login as teacher
    console.log('1️⃣ Logging in as teacher...');
    const loginResponse = await apiClient.post('/auth/login', {
      regNo: 'TEA001',
      password: 'password123'
    });
    
    console.log('✅ Teacher login successful');
    console.log('👤 User:', loginResponse.data.user.name, '- Role:', loginResponse.data.user.role);

    // Step 2: Get learning modules
    console.log('\n2️⃣ Getting learning modules...');
    const modulesResponse = await apiClient.get('/learning-modules');
    
    const modules = modulesResponse.data.modules || modulesResponse.data;
    console.log(`✅ Found ${modules.length} modules`);
    
    if (modules.length === 0) {
      console.log('❌ No modules found to test');
      return;
    }

    const testModule = modules[0];
    console.log(`📚 Testing module: ${testModule.title} (ID: ${testModule._id})`);

    // Step 3: Start teacher test session
    console.log('\n3️⃣ Starting teacher test session...');
    const sessionResponse = await apiClient.post('/ai-tutor/start-teacher-test', {
      moduleId: testModule._id,
      sessionType: 'teacher-test'
    });
    
    console.log('✅ Teacher test session started successfully!');
    console.log('📋 Session details:', {
      sessionId: sessionResponse.data.sessionId,
      moduleId: sessionResponse.data.moduleId,
      sessionType: sessionResponse.data.sessionType,
      status: sessionResponse.data.status
    });

    // Step 4: Send a test message
    console.log('\n4️⃣ Sending test message...');
    const messageResponse = await apiClient.post('/ai-tutor/send-message', {
      sessionId: sessionResponse.data.sessionId,
      message: 'Hello, I am testing this module as a teacher.',
      messageType: 'text'
    });
    
    console.log('✅ Message sent successfully!');
    console.log('🤖 AI Response:', messageResponse.data.response?.content || 'No response content');

    // Step 5: End session
    console.log('\n5️⃣ Ending test session...');
    const endResponse = await apiClient.post('/ai-tutor/end-session', {
      sessionId: sessionResponse.data.sessionId
    });
    
    console.log('✅ Session ended successfully!');
    console.log('📊 Session summary:', endResponse.data.summary || 'No summary available');

    console.log('\n🎉 Teacher module testing workflow completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during testing:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
  }
}

// Run the test
testTeacherModuleTesting();