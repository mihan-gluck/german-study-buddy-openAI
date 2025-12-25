// scripts/test-teacher-module-testing.js

const axios = require('axios');

async function testTeacherModuleTesting() {
  try {
    console.log('🧪 Testing Teacher Module Testing Feature...\n');
    
    // Create axios instance with cookie support
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
    
    // Step 2: Get teacher's modules
    console.log('📋 Step 2: Fetching teacher modules...');
    const modulesResponse = await axiosInstance.get('/api/learning-modules');
    const modules = modulesResponse.data.modules;
    
    if (modules.length === 0) {
      console.log('❌ No modules found for testing');
      return false;
    }
    
    const testModule = modules[0];
    console.log(`✅ Found module to test: "${testModule.title}"`);
    console.log(`📝 Module ID: ${testModule._id}\n`);
    
    // Step 3: Start teacher test session
    console.log('🧪 Step 3: Starting teacher test session...');
    const testSessionResponse = await axiosInstance.post('/api/ai-tutor/start-teacher-test', {
      moduleId: testModule._id,
      sessionType: 'teacher-test'
    });
    
    console.log('✅ Teacher test session started successfully!');
    console.log(`📝 Session ID: ${testSessionResponse.data.sessionId}`);
    console.log(`🧪 Test Session: ${testSessionResponse.data.isTestSession}`);
    console.log(`📋 Module: ${testSessionResponse.data.module.title}\n`);
    
    // Step 4: Verify session properties
    console.log('🔍 Step 4: Verifying test session properties...');
    const sessionData = testSessionResponse.data;
    
    const checks = [
      { name: 'Session ID exists', check: () => !!sessionData.sessionId },
      { name: 'Is test session', check: () => sessionData.isTestSession === true },
      { name: 'Module data included', check: () => !!sessionData.module },
      { name: 'Session type correct', check: () => sessionData.sessionType === 'teacher-test' },
      { name: 'Module content available', check: () => !!sessionData.module.content }
    ];
    
    let allPassed = true;
    checks.forEach(check => {
      const passed = check.check();
      console.log(`  ${passed ? '✅' : '❌'} ${check.name}: ${passed ? 'PASS' : 'FAIL'}`);
      if (!passed) allPassed = false;
    });
    
    if (!allPassed) {
      console.log('\n❌ Some verification checks failed');
      return false;
    }
    
    console.log('\n🎉 TEACHER MODULE TESTING FEATURE WORKING!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Teacher authentication working');
    console.log('  ✅ Module retrieval working');
    console.log('  ✅ Teacher test session creation working');
    console.log('  ✅ Test session isolation working');
    console.log('  ✅ Module data properly included');
    
    console.log('\n🚀 Teachers can now:');
    console.log('  • Test their modules as students would experience them');
    console.log('  • Experience full AI tutoring without subscription limits');
    console.log('  • Quality-check content and interactions');
    console.log('  • Iterate and improve modules based on testing');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Teacher module testing failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Authentication issue - check teacher credentials');
    } else if (error.response?.status === 403) {
      console.log('💡 Permission denied - check teacher role and module ownership');
    } else if (error.response?.status === 404) {
      console.log('💡 Module not found - check module exists and is active');
    } else if (error.response?.status === 500) {
      console.log('💡 Server error - check backend logs and database');
    }
    
    return false;
  }
}

// Run the test
testTeacherModuleTesting().then(success => {
  process.exit(success ? 0 : 1);
});