// test-single-module.js
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
const TEST_USER = {
  regNo: 'STUD042',
  password: 'Student042@2026'
};

// Create axios instance with cookie jar support
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testSingleModule() {
  try {
    // Login
    console.log('🔐 Logging in...');
    const loginResponse = await axiosInstance.post('/api/auth/login', {
      regNo: TEST_USER.regNo,
      password: TEST_USER.password
    });
    console.log('✅ Login successful');
    console.log('Response:', loginResponse.data);
    console.log('Cookies:', loginResponse.headers['set-cookie']);
    
    // Try to start session
    console.log('\n📝 Starting session...');
    const moduleId = '695ddf7ae8cf36280392a3c5'; // Valid 24-char module ID
    
    const startResponse = await axiosInstance.post('/api/ai-tutor/start-session', {
      moduleId: moduleId,
      sessionType: 'practice'
    });
    
    console.log('✅ Session started!');
    console.log('Response:', startResponse.data);
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
  }
}

testSingleModule();
