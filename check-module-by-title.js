// check-module-by-title.js
// Find module by title to check its actual ID

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('./models/LearningModule');

async function checkModuleByTitle() {
  try {
    console.log('🔍 Searching for module: "Lektion 2: das Wochenende gemeinsam planen"\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the module by title
    const module = await LearningModule.findOne({ 
      title: 'Lektion 2: das Wochenende gemeinsam planen' 
    });

    if (!module) {
      console.log('❌ Module NOT FOUND by title');
    } else {
      console.log('✅ Module FOUND!\n');
      console.log('📋 Module Details:');
      console.log('   ID:', module._id.toString());
      console.log('   ID Length:', module._id.toString().length, 'characters');
      console.log('   Title:', module.title);
      console.log('   Level:', module.level);
      console.log('   Is Active:', module.isActive);
      console.log('');
      
      // Check if ID is valid
      const idString = module._id.toString();
      if (idString.length === 24) {
        console.log('✅ ID length is correct (24 characters)');
      } else {
        console.log('❌ ID length is WRONG:', idString.length, 'characters (should be 24)');
      }
      
      console.log('');
      console.log('🔗 Correct URL:');
      console.log(`   /ai-tutor-chat?moduleId=${module._id}&sessionType=teacher-test&testMode=true`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Done\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkModuleByTitle();
