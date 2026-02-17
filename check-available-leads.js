// check-available-leads.js
// Script to check what leads are available from Meta

require('dotenv').config();
const { fetchMetaLeads, parseMetaLead } = require('./services/metaLeadsService');

async function checkAvailableLeads() {
  try {
    console.log('🔍 Checking available Meta leads...\n');

    const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
    const META_PAGE_ID = process.env.META_PAGE_ID;
    const META_FORM_ID = process.env.META_FORM_ID || '';

    if (!META_ACCESS_TOKEN || !META_PAGE_ID) {
      throw new Error('Missing META_ACCESS_TOKEN or META_PAGE_ID in .env file');
    }

    console.log('📋 Configuration:');
    console.log(`   Meta Page ID: ${META_PAGE_ID}`);
    console.log(`   Meta Form ID: ${META_FORM_ID || 'ALL FORMS'}`);
    console.log('');

    // Fetch leads from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`📅 Fetching leads from last 30 days (since ${thirtyDaysAgo.toLocaleDateString()})...\n`);

    const leads = await fetchMetaLeads(
      META_ACCESS_TOKEN,
      META_PAGE_ID,
      META_FORM_ID,
      thirtyDaysAgo
    );

    console.log(`✅ Found ${leads.length} total leads in the last 30 days\n`);

    if (leads.length === 0) {
      console.log('ℹ️  No leads found. This could mean:');
      console.log('   - No lead ads have been submitted in the last 30 days');
      console.log('   - The form ID is incorrect (if specified)');
      console.log('   - The page ID is incorrect');
      console.log('   - The access token doesn\'t have permission to access leads');
      return;
    }

    // Group leads by date
    const leadsByDate = {};
    leads.forEach(lead => {
      const date = new Date(lead.created_time).toLocaleDateString();
      if (!leadsByDate[date]) {
        leadsByDate[date] = [];
      }
      leadsByDate[date].push(lead);
    });

    // Display leads by date
    console.log('📊 Leads by Date:');
    console.log('─'.repeat(80));
    
    Object.keys(leadsByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
      const dateLeads = leadsByDate[date];
      console.log(`\n📅 ${date} (${dateLeads.length} leads)`);
      
      dateLeads.forEach((lead, index) => {
        const parsed = parseMetaLead(lead);
        console.log(`   ${index + 1}. ${parsed.name || 'No Name'}`);
        console.log(`      Email: ${parsed.email || 'No Email'}`);
        console.log(`      Phone: ${parsed.phone || 'No Phone'}`);
        console.log(`      Form: ${parsed.formName}`);
        console.log(`      Time: ${new Date(lead.created_time).toLocaleTimeString()}`);
      });
    });

    console.log('\n' + '─'.repeat(80));
    console.log(`\n📈 Summary: ${leads.length} leads found across ${Object.keys(leadsByDate).length} days`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAvailableLeads();
