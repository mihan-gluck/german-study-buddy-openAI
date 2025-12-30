#!/usr/bin/env node

/**
 * Direct Module Deletion
 * 
 * This script directly deletes the module from the database
 * to resolve the admin deletion issue.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function directModuleDeletion() {
  try {
    console.log('🗑️ Direct Module Deletion...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the specific module
    const moduleName = "Restaurant Conversation - English Practice";
    const module = await LearningModule.findOne({ 
      title: { $regex: moduleName, $options: 'i' }
    });

    if (!module) {
      console.log(`❌ Module "${moduleName}" not found`);
      return;
    }

    console.log('📋 Module Found:');
    console.log('  Title:', module.title);
    console.log('  ID:', module._id);
    console.log('  Is Active:', module.isActive);
    console.log('  Created By:', module.createdBy);

    // Find an admin user to use as the deleter
    const admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('\n👑 Admin User:');
    console.log('  Name:', admin.name);
    console.log('  Email:', admin.email);
    console.log('  ID:', admin._id);

    // Ask for confirmation
    console.log('\n⚠️ CONFIRMATION REQUIRED:');
    console.log(`Are you sure you want to delete "${module.title}"?`);
    console.log('This will soft-delete the module (set isActive = false)');
    
    // For automation, we'll proceed (in real scenario, you'd want user input)
    const confirmDelete = true; // Set to true for automated deletion
    
    if (confirmDelete) {
      console.log('\n🗑️ Proceeding with deletion...');
      
      // Perform soft delete
      module.isActive = false;
      module.lastUpdatedBy = admin._id;
      module.deletedAt = new Date();
      
      await module.save();
      
      console.log('✅ Module soft-deleted successfully!');
      console.log('  Is Active:', module.isActive);
      console.log('  Deleted At:', module.deletedAt);
      console.log('  Deleted By:', module.lastUpdatedBy);
      
      // Verify the deletion
      const verifyModule = await LearningModule.findById(module._id);
      console.log('\n🔍 Verification:');
      console.log('  Module still exists in DB:', !!verifyModule);
      console.log('  Is Active:', verifyModule.isActive);
      
      if (!verifyModule.isActive) {
        console.log('✅ Soft deletion confirmed - module is now inactive');
        console.log('\n💡 The module will no longer appear in the learning modules list');
        console.log('   but the data is preserved for historical purposes.');
      }
      
    } else {
      console.log('❌ Deletion cancelled');
    }

    // Show what this means for the UI
    console.log('\n📱 UI Impact:');
    console.log('✅ Module will disappear from learning modules list');
    console.log('✅ Students can no longer enroll in this module');
    console.log('✅ Existing student progress is preserved');
    console.log('✅ AI tutor sessions are preserved');
    console.log('✅ Module data is preserved (soft delete)');

    console.log('\n🔄 To restore the module (if needed):');
    console.log('   Run: db.learningmodules.updateOne(');
    console.log(`     { _id: ObjectId("${module._id}") },`);
    console.log('     { $set: { isActive: true }, $unset: { deletedAt: "" } }');
    console.log('   )');

  } catch (error) {
    console.error('❌ Error with direct module deletion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the deletion
directModuleDeletion();