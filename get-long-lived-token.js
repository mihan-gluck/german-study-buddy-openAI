// get-long-lived-token.js
require('dotenv').config();
const axios = require('axios');

async function getLongLivedToken() {
  try {
    console.log('🔄 Exchanging short-lived token for long-lived token...\n');
    
    // You need these from your Meta App Dashboard
    const APP_ID = 'YOUR_APP_ID'; // Get from https://developers.facebook.com/apps/
    const APP_SECRET = 'YOUR_APP_SECRET'; // Get from App Settings > Basic
    const SHORT_LIVED_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!APP_ID || APP_ID === 'YOUR_APP_ID') {
      console.error('❌ Please update APP_ID in this script');
      console.log('   Get it from: https://developers.facebook.com/apps/');
      console.log('   Your App > Settings > Basic > App ID');
      return;
    }

    if (!APP_SECRET || APP_SECRET === 'YOUR_APP_SECRET') {
      console.error('❌ Please update APP_SECRET in this script');
      console.log('   Get it from: https://developers.facebook.com/apps/');
      console.log('   Your App > Settings > Basic > App Secret (click Show)');
      return;
    }

    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: APP_ID,
        client_secret: APP_SECRET,
        fb_exchange_token: SHORT_LIVED_TOKEN
      }
    });

    const longLivedToken = response.data.access_token;
    const expiresIn = response.data.expires_in;

    console.log('✅ Successfully got long-lived token!\n');
    console.log('📋 Token Details:');
    console.log(`   Expires in: ${expiresIn} seconds (${Math.floor(expiresIn / 86400)} days)`);
    console.log('\n🔑 Your Long-Lived Token:');
    console.log('─'.repeat(100));
    console.log(longLivedToken);
    console.log('─'.repeat(100));
    console.log('\n📝 Update your .env file:');
    console.log(`META_ACCESS_TOKEN=${longLivedToken}`);
    console.log('\n⚠️  Note: Even long-lived tokens expire after ~60 days. You\'ll need to refresh again.');

  } catch (error) {
    console.error('❌ Error exchanging token:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure APP_ID and APP_SECRET are correct');
      console.log('   2. Make sure your current token is valid');
      console.log('   3. Check that your app has the required permissions');
    }
  }
}

getLongLivedToken();
