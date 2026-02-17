// show-sample-leads.js
require('dotenv').config();
const { fetchMetaLeads, parseMetaLead } = require('./services/metaLeadsService');

async function showSampleLeads() {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const pageId = process.env.META_PAGE_ID;
    
    console.log('📊 Fetching today\'s leads from Meta...\n');
    
    // Get leads from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const leads = await fetchMetaLeads(accessToken, pageId, null, today);
    const parsedLeads = leads.map(lead => parseMetaLead(lead));
    
    console.log(`✅ Found ${parsedLeads.length} leads from today\n`);
    console.log('=' .repeat(100));
    console.log('SAMPLE DATA THAT WILL BE SYNCED TO MONDAY.COM TONIGHT:');
    console.log('=' .repeat(100));
    
    // Show first 10 leads
    const samplesToShow = Math.min(10, parsedLeads.length);
    
    for (let i = 0; i < samplesToShow; i++) {
      const lead = parsedLeads[i];
      console.log(`\n📋 Lead ${i + 1}:`);
      console.log('─'.repeat(100));
      console.log(`Name:              ${lead.name || 'N/A'}`);
      console.log(`Email:             ${lead.email || 'N/A'}`);
      console.log(`Phone:             ${lead.phone || 'N/A'}`);
      console.log(`Form Name:         ${lead.formName || 'N/A'}`);
      console.log(`Form ID:           ${lead.formId || 'N/A'}`);
      console.log(`Meta Lead ID:      ${lead.metaLeadId || 'N/A'}`);
      console.log(`Date:              ${lead.createdTime ? new Date(lead.createdTime).toISOString().split('T')[0] : 'N/A'}`);
      console.log(`Age:               ${lead.customFields['how_old_are_you?'] || 'N/A'}`);
      console.log(`Qualification:     ${lead.customFields['may_we_know_your_highest_level_of_education?'] || 'N/A'}`);
      console.log(`Field of Study:    ${lead.customFields['your_degree/diploma_field'] || 'N/A'}`);
      console.log(`\nAll Custom Fields: ${JSON.stringify(lead.customFields, null, 2)}`);
    }
    
    console.log('\n' + '='.repeat(100));
    console.log(`\n📌 These ${samplesToShow} leads (and any others from today) will be synced to Monday.com at 11:50 PM CET`);
    console.log('📌 Duplicate check: By email address');
    console.log('📌 Board ID: 5026323056');
    console.log('📌 Source: All 25 forms on your Meta page\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('API Error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

showSampleLeads();
