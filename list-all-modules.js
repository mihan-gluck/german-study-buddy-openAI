// list-all-modules.js
// List all learning modules in the database

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('./models/LearningModule');

async function listAllModules() {
  try {
    console.log('🔍 Fetching all learning modules...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all modules
    const modules = await LearningModule.find({}).sort({ createdAt: -1 });

    if (modules.length === 0) {
      console.log('❌ No modules found in database');
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Found ${modules.length} modules:\n`);
    console.log('═'.repeat(100));

    modules.forEach((module, index) => {
      console.log(`\n${index + 1}. ${module.title}`);
      console.log('   ' + '─'.repeat(80));
      console.log(`   📋 ID: ${module._id}`);
      console.log(`   📚 Level: ${module.level}`);
      console.log(`   🌍 Target Language: ${module.targetLanguage}`);
      console.log(`   🏠 Native Language: ${module.nativeLanguage}`);
      console.log(`   ${module.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   📅 Created: ${module.createdAt?.toLocaleDateString() || 'N/A'}`);
      
      // Show content type
      if (module.content?.rolePlayScenario) {
        console.log(`   🎭 Type: Role-Play`);
        console.log(`   📍 Scenario: ${module.content.rolePlayScenario.situation}`);
      } else if (module.content?.exercises && module.content.exercises.length > 0) {
        console.log(`   📝 Type: Exercises (${module.content.exercises.length} exercises)`);
      } else {
        console.log(`   📖 Type: Standard Module`);
      }
      
      // Show URL for teacher test
      console.log(`   🔗 Test URL: /ai-tutor-chat?moduleId=${module._id}&sessionType=teacher-test&testMode=true`);
    });

    console.log('\n' + '═'.repeat(100));
    console.log(`\n📊 Summary: ${modules.length} total modules`);
    console.log(`   ✅ Active: ${modules.filter(m => m.isActive).length}`);
    console.log(`   ❌ Inactive: ${modules.filter(m => !m.isActive).length}`);

    await mongoose.disconnect();
    console.log('\n✅ Done\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

listAllModules();
