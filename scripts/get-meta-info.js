// scripts/get-meta-info.js
// Helper script to get your Meta Page ID and Lead Form IDs

require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE';

async function getMetaInfo() {
  try {
    console.log('🔍 Fetching your Meta Business information...\n');

    // Step 1: Get all pages you manage
    console.log('📄 Step 1: Getting your Facebook Pages...');
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token: ACCESS_TOKEN
      }
    });

    if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
      console.log('❌ No pages found. Make sure your access token has the correct permissions.');
      return;
    }

    console.log(`✅ Found ${pagesResponse.data.data.length} page(s):\n`);
    
    for (const page of pagesResponse.data.data) {
      console.log(`📌 Page Name: ${page.name}`);
      console.log(`   Page ID: ${page.id}`);
      console.log(`   Access Token: ${page.access_token.substring(0, 20)}...`);
      
      // Step 2: Get lead forms for this page
      try {
        console.log(`\n   🔍 Fetching lead forms for ${page.name}...`);
        const formsResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}/leadgen_forms`, {
          params: {
            access_token: page.access_token
          }
        });

        if (formsResponse.data.data && formsResponse.data.data.length > 0) {
          console.log(`   ✅ Found ${formsResponse.data.data.length} lead form(s):`);
          for (const form of formsResponse.data.data) {
            console.log(`      - Form Name: ${form.name || 'Unnamed'}`);
            console.log(`        Form ID: ${form.id}`);
          }
        } else {
          console.log(`   ℹ️  No lead forms found for this page`);
        }
      } catch (formError) {
        console.log(`   ⚠️  Could not fetch forms: ${formError.response?.data?.error?.message || formError.message}`);
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }

    console.log('\n📝 Next Steps:');
    console.log('1. Copy the Page ID from above');
    console.log('2. Copy the Form ID you want to use');
    console.log('3. Add them to your .env file:');
    console.log('   META_PAGE_ID=your_page_id');
    console.log('   META_FORM_ID=your_form_id');
    console.log('   META_ACCESS_TOKEN=your_access_token');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 Tip: Your access token might be invalid or expired.');
      console.log('   Get a new token from: https://developers.facebook.com/tools/explorer/');
    }
  }
}

// Run the script
getMetaInfo();
