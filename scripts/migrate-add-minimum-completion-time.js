// Migration script to add minimumCompletionTime to existing modules
// This script analyzes existing modules and sets appropriate minimum completion times

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function migrateModules() {
  try {
    console.log('🔄 Starting migration: Add minimumCompletionTime to existing modules\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get all modules
    const modules = await LearningModule.find({});
    console.log(`📊 Found ${modules.length} modules to migrate\n`);

    if (modules.length === 0) {
      console.log('ℹ️  No modules found. Migration complete.');
      process.exit(0);
    }

    let updated = 0;
    let skipped = 0;

    for (const module of modules) {
      // Skip if already has minimumCompletionTime set
      if (module.minimumCompletionTime && module.minimumCompletionTime !== 15) {
        console.log(`⏭️  Skipping "${module.title}" - already has custom minimumCompletionTime: ${module.minimumCompletionTime} min`);
        skipped++;
        continue;
      }

      // Determine appropriate minimum completion time based on module characteristics
      let suggestedTime = 15; // Default

      // Check if it's a role-play module
      const isRolePlay = module.content?.rolePlayScenario;
      
      if (isRolePlay) {
        const scenario = module.content.rolePlayScenario;
        const situation = scenario.situation?.toLowerCase() || '';
        
        // Quick scenarios (5-10 minutes)
        const quickScenarios = [
          'ordering coffee', 'buying ticket', 'asking directions', 
          'greeting', 'introduction', 'quick chat', 'small talk'
        ];
        
        // Standard scenarios (10-15 minutes)
        const standardScenarios = [
          'restaurant', 'shopping', 'hotel', 'pharmacy', 
          'post office', 'bank', 'doctor', 'dentist'
        ];
        
        // Complex scenarios (15-20 minutes)
        const complexScenarios = [
          'job interview', 'business meeting', 'negotiation',
          'complaint', 'problem solving', 'debate', 'presentation'
        ];

        if (quickScenarios.some(s => situation.includes(s))) {
          suggestedTime = 8;
        } else if (standardScenarios.some(s => situation.includes(s))) {
          suggestedTime = 12;
        } else if (complexScenarios.some(s => situation.includes(s))) {
          suggestedTime = 18;
        } else {
          // Default for role-play
          suggestedTime = 12;
        }
      } else {
        // Non-role-play modules
        const category = module.category?.toLowerCase() || '';
        
        if (category === 'grammar' || category === 'vocabulary') {
          suggestedTime = 15; // Standard practice time
        } else if (category === 'conversation') {
          suggestedTime = 12; // Conversation practice
        } else if (category === 'reading' || category === 'writing') {
          suggestedTime = 20; // More time for reading/writing
        } else if (category === 'listening') {
          suggestedTime = 10; // Listening exercises
        } else {
          suggestedTime = 15; // Default
        }
      }

      // Update the module
      module.minimumCompletionTime = suggestedTime;
      await module.save();

      console.log(`✅ Updated "${module.title}"`);
      console.log(`   Type: ${isRolePlay ? 'Role-play' : module.category}`);
      console.log(`   Scenario: ${isRolePlay ? module.content.rolePlayScenario.situation : 'N/A'}`);
      console.log(`   Minimum Completion Time: ${suggestedTime} minutes\n`);
      
      updated++;
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 Migration Summary');
    console.log('='.repeat(70));
    console.log(`✅ Updated: ${updated} modules`);
    console.log(`⏭️  Skipped: ${skipped} modules (already configured)`);
    console.log(`📦 Total: ${modules.length} modules`);
    console.log('='.repeat(70));

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Suggested Time Ranges:');
    console.log('   • Quick scenarios (greetings, ordering): 5-10 minutes');
    console.log('   • Standard scenarios (restaurant, shopping): 10-15 minutes');
    console.log('   • Complex scenarios (interviews, meetings): 15-20 minutes');
    console.log('   • Grammar/Vocabulary practice: 15-20 minutes');
    console.log('   • Reading/Writing exercises: 20-25 minutes');
    
    console.log('\n💡 Teachers can now customize these times when creating/editing modules!');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run migration
migrateModules();
