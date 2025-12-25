// scripts/check-modules.js

const mongoose = require('mongoose');
require('dotenv').config();

async function checkModules() {
  try {
    console.log('🔍 Checking modules in database...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Import the LearningModule model
    const LearningModule = require('../models/LearningModule');
    
    // Get all modules
    const modules = await LearningModule.find({ isActive: true })
      .select('_id title createdBy targetLanguage nativeLanguage level category')
      .populate('createdBy', 'name email role')
      .lean();
    
    console.log(`📋 Found ${modules.length} active modules:\n`);
    
    modules.forEach((module, index) => {
      console.log(`${index + 1}. Module ID: ${module._id}`);
      console.log(`   Title: ${module.title}`);
      console.log(`   Created by: ${module.createdBy?.name || 'Unknown'} (${module.createdBy?.role || 'Unknown'})`);
      console.log(`   Languages: ${module.nativeLanguage} → ${module.targetLanguage}`);
      console.log(`   Level: ${module.level} | Category: ${module.category}`);
      console.log(`   ID Length: ${module._id.toString().length} characters`);
      console.log(`   Valid ObjectId: ${mongoose.Types.ObjectId.isValid(module._id)}`);
      console.log('');
    });
    
    // Check for any modules with invalid IDs
    const invalidModules = modules.filter(m => !mongoose.Types.ObjectId.isValid(m._id));
    if (invalidModules.length > 0) {
      console.log('❌ Found modules with invalid ObjectIds:');
      invalidModules.forEach(m => {
        console.log(`   - ${m.title}: ${m._id}`);
      });
    } else {
      console.log('✅ All module IDs are valid ObjectIds');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
    
  } catch (error) {
    console.error('❌ Error checking modules:', error);
  }
}

// Run the check
checkModules();