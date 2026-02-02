// Migration script to set existing modules as visible to students

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function migrateModuleVisibility() {
  try {
    console.log('🔄 Starting module visibility migration...\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find all modules that don't have visibleToStudents field set
    const modules = await LearningModule.find({
      $or: [
        { visibleToStudents: { $exists: false } },
        { visibleToStudents: null }
      ]
    });
    
    console.log(`📊 Found ${modules.length} modules to migrate\n`);
    
    if (modules.length === 0) {
      console.log('✅ No modules need migration. All modules already have visibility settings.\n');
      return;
    }
    
    let updated = 0;
    let errors = 0;
    
    for (const module of modules) {
      try {
        // Set existing modules as visible to students (maintain current behavior)
        // Set publishedAt to createdAt for existing modules
        module.visibleToStudents = true;
        module.publishedAt = module.createdAt || new Date();
        
        await module.save();
        updated++;
        
        console.log(`✅ ${updated}/${modules.length} - ${module.title} (${module.level})`);
      } catch (error) {
        errors++;
        console.error(`❌ Error updating ${module.title}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total modules found: ${modules.length}`);
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('');
    
    if (updated > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('');
      console.log('📝 What happened:');
      console.log('   - All existing modules are now visible to students');
      console.log('   - publishedAt date set to module creation date');
      console.log('   - New modules will default to hidden (draft mode)');
      console.log('');
      console.log('🎯 Next steps:');
      console.log('   1. Deploy the updated code to production');
      console.log('   2. Teachers can now hide/show modules using the visibility toggle');
      console.log('   3. New modules will be hidden by default until published');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
  }
}

migrateModuleVisibility();
