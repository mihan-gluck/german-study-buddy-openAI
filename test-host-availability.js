// Test host availability check
require('dotenv').config();
const axios = require('axios');

const zoomConfig = {
  accountId: process.env.ZOOM_ACCOUNT_ID,
  clientId: process.env.ZOOM_CLIENT_ID,
  clientSecret: process.env.ZOOM_CLIENT_SECRET,
  apiBaseUrl: 'https://api.zoom.us/v2',
  oauthUrl: 'https://zoom.us/oauth/token'
};

async function getAccessToken() {
  const credentials = Buffer.from(`${zoomConfig.clientId}:${zoomConfig.clientSecret}`).toString('base64');
  const response = await axios.post(
    `${zoomConfig.oauthUrl}?grant_type=account_credentials&account_id=${zoomConfig.accountId}`,
    {},
    { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

async function testHostAvailability() {
  console.log('🔍 Testing host availability for a new meeting NOW...\n');
  
  const token = await getAccessToken();
  
  // Get licensed users
  const usersRes = await axios.get(`${zoomConfig.apiBaseUrl}/users`, {
    headers: { 'Authorization': `Bearer ${token}` },
    params: { page_size: 100, status: 'active' }
  });
  const users = usersRes.data.users.filter(u => u.type === 2);
  
  // Simulate creating a meeting starting NOW
  const startTime = new Date();
  const duration = 60;
  const BUFFER_BEFORE_MS = 15 * 60 * 1000;
  const BUFFER_AFTER_MS = 30 * 60 * 1000;
  const meetingStart = startTime.getTime();
  const meetingEnd = meetingStart + duration * 60 * 1000;
  
  console.log(`New meeting would be: ${startTime.toISOString()} - ${new Date(meetingEnd).toISOString()}\n`);
  
  for (const user of users) {
    console.log(`\n📋 Checking ${user.email}...`);
    
    try {
      const res = await axios.get(`${zoomConfig.apiBaseUrl}/users/${user.id}/meetings`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { type: 'upcoming', page_size: 100 }
      });
      
      const meetings = res.data.meetings || [];
      console.log(`   Found ${meetings.length} upcoming meetings`);
      
      let hasConflict = false;
      for (const m of meetings) {
        const mStartRaw = new Date(m.start_time).getTime();
        const mStart = mStartRaw - BUFFER_BEFORE_MS;
        const mEnd = mStartRaw + (m.duration || 60) * 60 * 1000 + BUFFER_AFTER_MS;
        
        const conflicts = meetingStart < mEnd && meetingEnd > mStart;
        
        if (conflicts) {
          hasConflict = true;
          console.log(`   ❌ CONFLICT with: "${m.topic}"`);
          console.log(`      Meeting time: ${m.start_time} (duration: ${m.duration} min)`);
          console.log(`      Blocked window: ${new Date(mStart).toISOString()} - ${new Date(mEnd).toISOString()}`);
        }
      }
      
      if (!hasConflict) {
        console.log(`   ✅ NO CONFLICT - This host is AVAILABLE`);
      }
      
    } catch (err) {
      console.log(`   ⚠️ ERROR: ${err.response?.data?.message || err.message}`);
    }
  }
}

testHostAvailability().catch(console.error);
