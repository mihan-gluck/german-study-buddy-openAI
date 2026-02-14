// scripts/get-monday-columns.js
// Helper script to get Monday.com board column IDs

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const axios = require('axios');

// Support both MONDAY_API_KEY and MONDAY_API_TOKEN
const MONDAY_API_KEY = process.env.MONDAY_API_KEY || process.env.MONDAY_API_TOKEN;
const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID;

async function getMondayColumns() {
  console.log('🔍 Fetching Monday.com board columns...\n');

  console.log('📋 Checking .env file...');
  console.log(`   .env path: ${path.join(__dirname, '..', '.env')}`);
  console.log(`   MONDAY_API_KEY found: ${!!MONDAY_API_KEY}`);
  console.log(`   MONDAY_BOARD_ID found: ${!!MONDAY_BOARD_ID}`);
  console.log('');

  if (!MONDAY_API_KEY || !MONDAY_BOARD_ID) {
    console.log('❌ Missing configuration!');
    console.log('Please add to your .env file:');
    console.log('  MONDAY_API_KEY=your_api_key');
    console.log('  MONDAY_BOARD_ID=your_board_id');
    console.log('');
    console.log('💡 Make sure your .env file is in the root directory');
    console.log('   (same folder as package.json)');
    return;
  }

  console.log('📋 Configuration:');
  console.log(`   Board ID: ${MONDAY_BOARD_ID}`);
  console.log(`   API Key: ${MONDAY_API_KEY.substring(0, 20)}...`);
  console.log('');

  try {
    const query = `
      query ($boardId: ID!) {
        boards (ids: [$boardId]) {
          name
          columns {
            id
            title
            type
            settings_str
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.monday.com/v2',
      {
        query: query,
        variables: { boardId: MONDAY_BOARD_ID }
      },
      {
        headers: {
          'Authorization': MONDAY_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      console.error('❌ Monday.com API errors:', response.data.errors);
      return;
    }

    const board = response.data.data.boards[0];
    
    if (!board) {
      console.log('❌ Board not found. Check your MONDAY_BOARD_ID');
      return;
    }

    console.log(`✅ Board: ${board.name}\n`);
    console.log('📊 Columns:\n');
    console.log('=' .repeat(80));
    console.log('| Column Title                  | Column ID      | Type           |');
    console.log('=' .repeat(80));

    board.columns.forEach(column => {
      const title = column.title.padEnd(30);
      const id = column.id.padEnd(15);
      const type = column.type.padEnd(15);
      console.log(`| ${title}| ${id}| ${type}|`);
    });

    console.log('=' .repeat(80));
    console.log('');

    // Suggest mapping based on column names
    console.log('💡 Suggested Mapping for services/mondayService.js:\n');
    console.log('```javascript');
    console.log('const columnValues = {');

    const emailCol = board.columns.find(c => c.type === 'email' || c.title.toLowerCase().includes('email'));
    if (emailCol) {
      console.log(`  ${emailCol.id}: leadData.email || '',  // ${emailCol.title}`);
    }

    const phoneCol = board.columns.find(c => c.type === 'phone' || c.title.toLowerCase().includes('phone'));
    if (phoneCol) {
      console.log(`  ${phoneCol.id}: leadData.phone || '',  // ${phoneCol.title}`);
    }

    const dateCol = board.columns.find(c => c.type === 'date' && !c.title.toLowerCase().includes('due'));
    if (dateCol) {
      console.log(`  ${dateCol.id}: leadData.createdTime ? new Date(leadData.createdTime).toISOString().split('T')[0] : '',  // ${dateCol.title}`);
    }

    const textCols = board.columns.filter(c => c.type === 'text');
    if (textCols.length > 0) {
      console.log(`  ${textCols[0].id}: leadData.metaLeadId || '',  // ${textCols[0].title} (Lead ID)`);
    }

    const numberCol = board.columns.find(c => c.type === 'numeric');
    if (numberCol) {
      console.log(`  ${numberCol.id}: leadData.customFields['how_old_are_you?'] || '',  // ${numberCol.title} (Age)`);
    }

    const statusCols = board.columns.filter(c => c.type === 'color');
    if (statusCols.length > 0) {
      console.log(`  ${statusCols[0].id}: leadData.customFields['may_we_know_your_highest_level_of_education?'] || '',  // ${statusCols[0].title} (Education)`);
    }

    const longTextCol = board.columns.find(c => c.type === 'long-text');
    if (longTextCol) {
      console.log(`  ${longTextCol.id}: JSON.stringify(leadData.customFields, null, 2),  // ${longTextCol.title} (All details)`);
    }

    console.log('};');
    console.log('```\n');

    console.log('📝 Next Steps:');
    console.log('1. Copy the column IDs from above');
    console.log('2. Update services/mondayService.js with your column IDs');
    console.log('3. Test the sync: curl -X POST http://localhost:4000/api/meta-leads/sync');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Your Monday API key might be invalid');
      console.log('   Get a new key from: https://monday.com/developers/v2/try-it-yourself');
    }
  }
}

getMondayColumns();
