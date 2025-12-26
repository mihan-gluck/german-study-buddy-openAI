// scripts/test-teacher-navigation.js

const axios = require('axios');

async function testTeacherNavigation() {
  try {
    console.log('🧪 Testing Teacher Navigation to AI Tutor...\n');
    
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
    
    // Step 2: Get teacher profile to verify role
    console.log('👤 Step 2: Verifying teacher role...');
    const profileResponse = await axiosInstance.get('/api/user/profile');
    const user = profileResponse.data;
    
    console.log(`✅ User role: ${user.role}`);
    console.log(`📝 User ID: ${user._id}\n`);
    
    if (user.role !== 'TEACHER') {
      console.log('❌ User is not a teacher, cannot test teacher functionality');
      return false;
    }
    
    // Step 3: Get modules to find one to test
    console.log('📋 Step 3: Getting modules...');
    const modulesResponse = await axiosInstance.get('/api/learning-modules');
    const modules = modulesResponse.data.modules;
    
    if (modules.length === 0) {
      console.log('❌ No modules found for testing');
      return false;
    }
    
    const testModule = modules[0];
    console.log(`✅ Found module: "${testModule.title}"`);
    console.log(`📝 Module ID: ${testModule._id}\n`);
    
    // Step 4: Test teacher test session creation
    console.log('🧪 Step 4: Testing teacher test session...');
    const testSessionResponse = await axiosInstance.post('/api/ai-tutor/start-teacher-test', {
      moduleId: testModule._id,
      sessionType: 'teacher-test'
    });
    
    console.log('✅ Teacher test session created successfully!');
    console.log(`📝 Session ID: ${testSessionResponse.data.sessionId}`);
    console.log(`🧪 Is Test Session: ${testSessionResponse.data.isTestSession}\n`);
    
    console.log('🎉 TEACHER NAVIGATION TEST PASSED!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Teacher login working');
    console.log('  ✅ Teacher role verified');
    console.log('  ✅ Module access working');
    console.log('  ✅ Teacher test session creation working');
    
    console.log('\n🚀 Next Steps:');
    console.log('  1. Login as TEA001 in browser');
    console.log('  2. Go to Learning Modules page');
    console.log('  3. Click "Test Module" button');
    console.log('  4. Should navigate to AI tutor chat with test mode');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Teacher navigation test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Authentication failed - check credentials');
    } else if (error.response?.status === 403) {
      console.log('💡 Permission denied - check role and permissions');
    } else if (error.response?.status === 404) {
      console.log('💡 Resource not found - check endpoints and data');
    }
    
    return false;
  }
}

// Run the test
testTeacherNavigation().then(success => {
  process.exit(success ? 0 : 1);
});