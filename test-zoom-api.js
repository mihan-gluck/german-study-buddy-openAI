// Quick test script for Zoom API connection
require('dotenv').config();
const axios = require('axios');

const zoomConfig = {
  accountId: process.env.ZOOM_ACCOUNT_ID,
  clientId: process.env.ZOOM_CLIENT_ID,
  clientSecret: process.env.ZOOM_CLIENT_SECRET,
  apiBaseUrl: 'https://api.zoom.us/v2',
  oauthUrl: 'https://zoom.us/oauth/token'
};

async function testZoomConnection() {
  console.log('🔍 Testing Zoom API connection...\n');
  console.log('Account ID:', zoomConfig.accountId);
  console.log('Client ID:', zoomConfig.clientId);
  console.log('Client Secret:', zoomConfig.clientSecret ? '***' + zoomConfig.clientSecret.slice(-4) : 'MISSING');

  try {
    // Step 1: Get access token
    console.log('\n📡 Step 1: Getting access token...');
    const credentials = Buffer.from(`${zoomConfig.clientId}:${zoomConfig.clientSecret}`).toString('base64');
    
    const tokenResponse = await axios.post(
      `${zoomConfig.oauthUrl}?grant_type=account_credentials&account_id=${zoomConfig.accountId}`,
      {},
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const token = tokenResponse.data.access_token;
    console.log('✅ Access token obtained successfully!');

    // Step 2: Get users
    console.log('\n📡 Step 2: Getting Zoom users...');
    const usersResponse = await axios.get(`${zoomConfig.apiBaseUrl}/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { page_size: 100, status: 'active' }
    });

    const users = usersResponse.data.users || [];
    const licensedUsers = users.filter(u => u.type === 2);
    
    console.log(`✅ Found ${users.length} total users, ${licensedUsers.length} licensed users:`);
    licensedUsers.forEach(u => {
      console.log(`   - ${u.email} (ID: ${u.id})`);
    });

    // Step 3: Check upcoming meetings for each licensed user
    console.log('\n📡 Step 3: Checking upcoming meetings...');
    for (const user of licensedUsers) {
      const meetingsRes = await axios.get(`${zoomConfig.apiBaseUrl}/users/${user.id}/meetings`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { type: 'upcoming', page_size: 10 }
      });
      const meetings = meetingsRes.data.meetings || [];
      console.log(`   ${user.email}: ${meetings.length} upcoming meeting(s)`);
      meetings.slice(0, 3).forEach(m => {
        console.log(`      - ${m.topic} @ ${m.start_time}`);
      });
    }

    console.log('\n✅ Zoom API connection test PASSED!');
  } catch (error) {
    console.error('\n❌ Zoom API test FAILED:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

testZoomConnection();
