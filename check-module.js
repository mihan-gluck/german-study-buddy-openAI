// check-module.js
// Check if a specific module exists and is active

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('./models/LearningModule');

const MODULE_ID = '695ddf7ae8cf36280392a3c58';

async function checkModule() {
  try {
    console.log('🔍 Checking module:', MODULE_ID);
    console.log('');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Find the module
    const module = await LearningModule.findById(MODULE_ID);

    if (!module) {
      console.log('❌ Module NOT FOUND in database');
      console.log('');
      console.log('This module ID does not exist. Possible reasons:');
      console.log('  - Module was deleted');
      console.log('  - Wrong module ID');
      console.log('  - Database was reset');
      console.log('');
      console.log('💡 Solution: Create a new module or use a different module ID');
    } else {
      console.log('✅ Module FOUND!');
      console.log('');
      console.log('📋 Module Details:');
      console.log('  ID:', module._id);
      console.log('  Title:', module.title);
      console.log('  Level:', module.level);
      console.log('  Target Language:', module.targetLanguage);
      console.log('  Native Language:', module.nativeLanguage);
      console.log('  Is Active:', module.isActive ? '✅ YES' : '❌ NO (INACTIVE)');
      console.log('  Created:', module.createdAt);
      console.log('');

      if (!module.isActive) {
        console.log('⚠️  MODULE IS INACTIVE!');
        console.log('');
        console.log('💡 Solution: Activate this module in the database');
        console.log('   Run: node activate-module.js ' + MODULE_ID);
      } else {
        console.log('✅ Module is active and ready to use!');
      }
    }

    await mongoose.disconnect();
    console.log('');
    console.log('✅ Done');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkModule();
