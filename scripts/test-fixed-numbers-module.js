// scripts/test-fixed-numbers-module.js

const axios = require('axios');

async function testFixedNumbersModule() {
  try {
    console.log('🧪 Testing Fixed Numbers Module...');
    
    // Create axios instance with cookie support
    const axiosInstance = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:4000'
    });
    
    // First, login as teacher
    console.log('🔐 Logging in as teacher...');
    const loginResponse = await axiosInstance.post('/api/auth/login', {
      regNo: 'TEA001',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    
    // Get the numbers module ID
    console.log('🔍 Finding numbers module...');
    const modulesResponse = await axiosInstance.get('/api/learning-modules');
    const modules = modulesResponse.data.modules || modulesResponse.data;
    const numbersModule = modules.find(module => 
      module.title.toLowerCase().includes('numbers') && 
      module.title.toLowerCase().includes('1') && 
      module.title.toLowerCase().includes('10')
    );
    
    if (!numbersModule) {
      console.log('❌ Numbers module not found in API response');
      return;
    }
    
    console.log('✅ Found numbers module:', numbersModule.title);
    console.log('   Module ID:', numbersModule._id);
    console.log('   Has vocabulary:', numbersModule.content?.allowedVocabulary?.length || 0, 'words');
    console.log('   Has role-play:', !!numbersModule.content?.rolePlayScenario);
    
    // Start teacher test session
    console.log('\\n🧪 Starting teacher test session...');
    const sessionResponse = await axiosInstance.post('/api/ai-tutor/start-teacher-test', {
      moduleId: numbersModule._id,
      sessionType: 'teacher-test'
    });
    
    console.log('✅ Test session started:', sessionResponse.data.sessionId);
    console.log('   Welcome message:', sessionResponse.data.welcomeMessage.content.substring(0, 100) + '...');
    console.log('   Message type:', sessionResponse.data.welcomeMessage.messageType);
    
    // Test sending a message
    console.log('\\n💬 Testing message sending...');
    const messageResponse = await axiosInstance.post('/api/ai-tutor/send-message', {
      sessionId: sessionResponse.data.sessionId,
      message: "let's start counting!",
      messageType: 'text'
    });
    
    console.log('✅ Message sent successfully');
    console.log('   AI Response:', messageResponse.data.response.content.substring(0, 150) + '...');
    console.log('   Response type:', messageResponse.data.response.messageType);
    console.log('   Suggestions:', messageResponse.data.suggestions);
    
    // Test another message
    console.log('\\n💬 Testing number practice...');
    const practiceResponse = await axiosInstance.post('/api/ai-tutor/send-message', {
      sessionId: sessionResponse.data.sessionId,
      message: "Can you teach me the number 5?",
      messageType: 'text'
    });
    
    console.log('✅ Practice message sent');
    console.log('   AI Response:', practiceResponse.data.response.content.substring(0, 150) + '...');
    
    // End session
    console.log('\\n🏁 Ending test session...');
    const endResponse = await axiosInstance.post('/api/ai-tutor/end-session', {
      sessionId: sessionResponse.data.sessionId
    });
    
    console.log('✅ Session ended successfully');
    console.log('   Duration:', endResponse.data.summary.duration, 'minutes');
    console.log('   Total messages:', endResponse.data.summary.totalMessages);
    
    console.log('\\n🎉 Numbers module test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Authentication failed - check login credentials');
    } else if (error.response?.status === 403) {
      console.log('💡 Permission denied - user might not have TEACHER role');
    } else if (error.response?.status === 404) {
      console.log('💡 Resource not found - check module ID or session ID');
    } else if (error.response?.status === 500) {
      console.log('💡 Server error - check server logs for details');
    }
  }
}

// Run the test
testFixedNumbersModule();