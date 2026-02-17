// test-meta-leads.js
// Quick test script to fetch real Meta leads

require('dotenv').config();
const axios = require('axios');

async function testMetaLeads() {
  console.log('🔍 Testing Meta Lead Ads Integration...\n');

  // Check configuration
  console.log('📋 Configuration Check:');
  console.log('✓ META_ACCESS_TOKEN:', process.env.META_ACCESS_TOKEN ? `${process.env.META_ACCESS_TOKEN.substring(0, 20)}...` : '❌ NOT SET');
  console.log('✓ META_PAGE_ID:', process.env.META_PAGE_ID || '❌ NOT SET');
  console.log('✓ META_FORM_ID:', process.env.META_FORM_ID || '(Optional - will fetch all forms)');
  console.log('');

  if (!process.env.META_ACCESS_TOKEN || !process.env.META_PAGE_ID) {
    console.log('❌ Missing required configuration!');
    console.log('Please add META_ACCESS_TOKEN and META_PAGE_ID to your .env file');
    return;
  }

  try {
    // Test 1: Get today's leads
    console.log('📊 Test 1: Fetching today\'s leads...');
    const todayResponse = await axios.get('http://localhost:4000/api/meta-leads/today', {
      headers: {
        'Cookie': 'authToken=test' // You'll need a real auth token
      }
    });
    
    console.log('✅ Today\'s leads:', todayResponse.data.count);
    if (todayResponse.data.leads && todayResponse.data.leads.length > 0) {
      console.log('Sample lead:', JSON.stringify(todayResponse.data.leads[0], null, 2));
    }
    console.log('');

  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️  Authentication required. Let me try direct API call...\n');
      
      // Direct API call without authentication
      await testDirectAPI();
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

async function testDirectAPI() {
  console.log('🔗 Testing Direct Meta API Call...\n');
  
  const accessToken = process.env.META_ACCESS_TOKEN;
  const pageId = process.env.META_PAGE_ID;
  const formId = process.env.META_FORM_ID;

  try {
    // Step 1: Try to get page access token
    console.log('Step 1: Getting page access token...');
    let pageAccessToken = accessToken;
    
    try {
      const accountsResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: accessToken }
      });
      
      if (accountsResponse.data.data && accountsResponse.data.data.length > 0) {
        console.log('✅ Found pages:', accountsResponse.data.data.length);
        accountsResponse.data.data.forEach(page => {
          console.log(`   - ${page.name} (ID: ${page.id})`);
        });
        
        const page = accountsResponse.data.data.find(p => p.id === pageId || p.id === pageId.replace('act_', ''));
        if (page) {
          pageAccessToken = page.access_token;
          console.log('✅ Using page access token for:', page.name);
        }
      }
    } catch (err) {
      console.log('⚠️  Using provided token (might already be a page token)');
    }
    console.log('');

    // Step 2: Get lead forms
    console.log('Step 2: Getting lead forms...');
    const formsUrl = `https://graph.facebook.com/v18.0/${pageId}/leadgen_forms`;
    const formsResponse = await axios.get(formsUrl, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,name,status,leads_count'
      }
    });

    const forms = formsResponse.data.data || [];
    console.log(`✅ Found ${forms.length} lead form(s):`);
    forms.forEach(form => {
      console.log(`   - ${form.name || 'Unnamed'} (ID: ${form.id})`);
      console.log(`     Status: ${form.status}, Leads: ${form.leads_count || 'N/A'}`);
    });
    console.log('');

    // Step 3: Get leads from today
    console.log('Step 3: Fetching leads from today...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sinceTimestamp = Math.floor(today.getTime() / 1000);

    let allLeads = [];
    const targetFormId = formId || (forms.length > 0 ? forms[0].id : null);

    if (!targetFormId) {
      console.log('❌ No form ID available');
      return;
    }

    const leadsUrl = `https://graph.facebook.com/v18.0/${targetFormId}/leads`;
    const leadsResponse = await axios.get(leadsUrl, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,created_time,field_data',
        filtering: JSON.stringify([{
          field: 'time_created',
          operator: 'GREATER_THAN',
          value: sinceTimestamp
        }])
      }
    });

    allLeads = leadsResponse.data.data || [];
    console.log(`✅ Found ${allLeads.length} lead(s) from today\n`);

    // Display leads
    if (allLeads.length > 0) {
      console.log('📋 Lead Details:\n');
      allLeads.forEach((lead, index) => {
        console.log(`Lead #${index + 1}:`);
        console.log(`  ID: ${lead.id}`);
        console.log(`  Created: ${new Date(lead.created_time).toLocaleString()}`);
        
        if (lead.field_data) {
          console.log('  Data:');
          lead.field_data.forEach(field => {
            const value = field.values && field.values.length > 0 ? field.values[0] : '';
            console.log(`    ${field.name}: ${value}`);
          });
        }
        console.log('');
      });
    } else {
      console.log('ℹ️  No leads found today. Try checking last 7 days...\n');
      
      // Try last 7 days
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const since7Days = Math.floor(last7Days.getTime() / 1000);
      
      const leads7DaysResponse = await axios.get(leadsUrl, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,created_time,field_data',
          filtering: JSON.stringify([{
            field: 'time_created',
            operator: 'GREATER_THAN',
            value: since7Days
          }])
        }
      });
      
      const leads7Days = leads7DaysResponse.data.data || [];
      console.log(`📊 Found ${leads7Days.length} lead(s) in last 7 days`);
      
      if (leads7Days.length > 0) {
        console.log('\nMost recent lead:');
        const recentLead = leads7Days[0];
        console.log(`  Created: ${new Date(recentLead.created_time).toLocaleString()}`);
        if (recentLead.field_data) {
          recentLead.field_data.forEach(field => {
            const value = field.values && field.values.length > 0 ? field.values[0] : '';
            console.log(`  ${field.name}: ${value}`);
          });
        }
      }
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Add these to your .env file:');
    console.log(`   META_PAGE_ID=${pageId}`);
    if (forms.length > 0) {
      console.log(`   META_FORM_ID=${forms[0].id}`);
    }
    console.log('2. The system will automatically sync leads daily at 11:50 PM CET');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.error || error.message);
    
    if (error.response?.data?.error) {
      console.log('\n💡 Troubleshooting:');
      const errorMsg = error.response.data.error.message;
      
      if (errorMsg.includes('access token')) {
        console.log('- Your access token might be expired or invalid');
        console.log('- Generate a new token from: https://developers.facebook.com/tools/explorer/');
      }
      
      if (errorMsg.includes('permissions')) {
        console.log('- Make sure you have these permissions:');
        console.log('  • leads_retrieval');
        console.log('  • pages_read_engagement');
        console.log('  • pages_show_list');
      }
      
      if (errorMsg.includes('Page Access Token')) {
        console.log('- You need a Page Access Token, not a User Access Token');
        console.log('- In Graph API Explorer, select your page from the dropdown');
      }
    }
  }
}

// Run the test
testMetaLeads();
