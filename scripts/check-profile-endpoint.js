// scripts/check-profile-endpoint.js
// Check what the profile endpoint returns for a student

require('dotenv').config();
const axios = require('axios');

async function checkProfileEndpoint() {
  try {
    console.log('Testing profile endpoint...\n');

    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      regNo: 'STUD033',
      password: 'Student033@2026'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful');
    console.log('User from login:', JSON.stringify(loginResponse.data.user, null, 2));

    // Get the cookie from login response
    const cookies = loginResponse.headers['set-cookie'];
    console.log('\n📝 Cookies:', cookies);

    // Now call the profile endpoint
    const profileResponse = await axios.get('http://localhost:4000/api/auth/profile', {
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });

    console.log('\n✅ Profile endpoint response:');
    console.log(JSON.stringify(profileResponse.data, null, 2));

    // Check if level is present
    if (profileResponse.data.level) {
      console.log(`\n✅ Level is present: ${profileResponse.data.level}`);
    } else {
      console.log('\n❌ Level is MISSING from profile response!');
    }

    // Check if medium is present
    if (profileResponse.data.medium) {
      console.log(`✅ Medium is present: ${profileResponse.data.medium.join(', ')}`);
    } else {
      console.log('❌ Medium is MISSING from profile response!');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkProfileEndpoint();
