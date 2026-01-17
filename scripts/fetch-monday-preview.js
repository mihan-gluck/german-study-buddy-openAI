// scripts/fetch-monday-preview.js
// Fetch students from Monday.com and preview BEFORE adding to MongoDB

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const axios = require('axios');

// Monday.com API configuration
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID;
const MONDAY_API_URL = 'https://api.monday.com/v2';

async function fetchMondayPreview() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Fetch existing students from MongoDB
    console.log('📊 Fetching existing students from MongoDB...');
    const existingStudents = await User.find({ role: 'STUDENT' })
      .select('email regNo')
      .lean();
    
    console.log(`✅ Found ${existingStudents.length} existing students in MongoDB\n`);

    // Step 2: Fetch students from Monday.com
    console.log('🌐 Fetching students from Monday.com...');
    
    if (!MONDAY_API_TOKEN || !MONDAY_BOARD_ID) {
      console.log('❌ ERROR: Monday.com credentials not found!');
      console.log('');
      console.log('Please add these to your .env file:');
      console.log('');
      console.log('MONDAY_API_TOKEN=your_api_token_here');
      console.log('MONDAY_BOARD_ID=your_board_id_here');
      console.log('');
      console.log('📖 How to get credentials:');
      console.log('');
      console.log('1. API Token:');
      console.log('   - Go to Monday.com');
      console.log('   - Click your profile picture (top right)');
      console.log('   - Click "Admin" → "API"');
      console.log('   - Copy your API token');
      console.log('');
      console.log('2. Board ID:');
      console.log('   - Open your student board in Monday.com');
      console.log('   - Look at the URL: https://yourcompany.monday.com/boards/1234567890');
      console.log('   - The number 1234567890 is your Board ID');
      console.log('');
      await mongoose.connection.close();
      process.exit(1);
    }

    // GraphQL query to fetch board data
    const query = `
      query {
        boards(ids: [${MONDAY_BOARD_ID}]) {
          name
          items_page(limit: 500) {
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      MONDAY_API_URL,
      { query },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      console.log('❌ Monday.com API Error:');
      console.log(JSON.stringify(response.data.errors, null, 2));
      await mongoose.connection.close();
      process.exit(1);
    }

    const board = response.data.data.boards[0];
    const mondayItems = board.items_page.items;

    console.log(`✅ Found ${mondayItems.length} students in Monday.com board: "${board.name}"\n`);

    // Step 3: Display column structure (first item)
    console.log('📋 MONDAY.COM BOARD STRUCTURE');
    console.log('='.repeat(80));
    console.log('');
    console.log('Columns found in your board:');
    console.log('');
    
    if (mondayItems.length > 0) {
      const firstItem = mondayItems[0];
      console.log(`Sample Item: "${firstItem.name}"`);
      console.log('');
      console.log('Available Columns:');
      firstItem.column_values.forEach((col, index) => {
        console.log(`   ${index + 1}. Column ID: "${col.id}"`);
        console.log(`      Text: "${col.text}"`);
        console.log(`      Value: ${col.value ? col.value.substring(0, 50) : 'null'}`);
        console.log('');
      });
    }

    console.log('='.repeat(80));
    console.log('');
    console.log('⚠️ IMPORTANT: Please tell me which column IDs match these fields:');
    console.log('');
    console.log('Required Fields:');
    console.log('   - Name (student full name)');
    console.log('   - Email');
    console.log('   - Registration Number (RegNo)');
    console.log('   - Batch');
    console.log('   - Level (A1, A2, B1, B2, C1, C2)');
    console.log('   - Subscription (SILVER, PLATINUM)');
    console.log('   - Status (Active, Ongoing, etc.)');
    console.log('   - Medium (Tamil, Sinhala, English)');
    console.log('   - Teacher Name');
    console.log('');
    console.log('='.repeat(80));
    console.log('');

    // Step 4: Parse students (you'll need to update column IDs)
    console.log('📊 PREVIEW OF MONDAY.COM DATA');
    console.log('='.repeat(80));
    console.log('');
    console.log('Showing first 10 students from Monday.com:');
    console.log('');

    const previewCount = Math.min(10, mondayItems.length);
    
    for (let i = 0; i < previewCount; i++) {
      const item = mondayItems[i];
      
      console.log(`${i + 1}. ${item.name}`);
      console.log(`   Monday.com ID: ${item.id}`);
      
      // Display all column values
      item.column_values.forEach(col => {
        if (col.text && col.text.trim()) {
          console.log(`   ${col.id}: ${col.text}`);
        }
      });
      
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('');

    // Step 5: Compare with MongoDB
    console.log('🔍 COMPARISON WITH MONGODB');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Total in Monday.com: ${mondayItems.length}`);
    console.log(`Total in MongoDB: ${existingStudents.length}`);
    console.log(`Potential new students: ${mondayItems.length - existingStudents.length} (approximate)`);
    console.log('');
    console.log('⚠️ Note: Exact count will be determined after column mapping');
    console.log('');
    console.log('='.repeat(80));
    console.log('');

    // Step 6: Export raw data for review
    const fs = require('fs');
    fs.writeFileSync(
      'monday-raw-data.json',
      JSON.stringify(mondayItems, null, 2)
    );
    console.log('💾 Raw Monday.com data exported to: monday-raw-data.json');
    console.log('');

    console.log('='.repeat(80));
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('');
    console.log('1. Review the column structure above');
    console.log('2. Tell me which column IDs match which fields');
    console.log('3. I will create a mapping configuration');
    console.log('4. Run preview again with proper mapping');
    console.log('5. Review transformed data before adding to MongoDB');
    console.log('');
    console.log('Example column mapping:');
    console.log('   "text" → Name');
    console.log('   "email" → Email');
    console.log('   "text4" → Registration Number');
    console.log('   "status" → Status');
    console.log('   etc.');
    console.log('');
    console.log('='.repeat(80));

    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

fetchMondayPreview();
