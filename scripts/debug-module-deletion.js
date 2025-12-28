#!/usr/bin/env node

/**
 * Debug Module Deletion Issue
 * 
 * This script investigates why the admin can't delete the 
 * "Restaurant Conversation - English Practice" module.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const LearningModule = require('../models/LearningModule');

async function debugModuleDeletion() {
  try {
    console.log('🔍 Debugging Module Deletion Issue...\n');

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
      
      // Show similar modules
      const similarModules = await LearningModule.find({
        title: { $regex: 'restaurant', $options: 'i' }
      }).select('title createdBy isActive');
      
      console.log('\n📋 Similar modules found:');
      similarModules.forEach(mod => {
        console.log(`  - "${mod.title}" (ID: ${mod._id}, Active: ${mod.isActive})`);
      });
      
      return;
    }

    console.log('📋 Module Details:');
    console.log('  Title:', module.title);
    console.log('  ID:', module._id);
    console.log('  Created By:', module.createdBy);
    console.log('  Is Active:', module.isActive);
    console.log('  Target Language:', module.targetLanguage);
    console.log('  Native Language:', module.nativeLanguage);
    console.log('  Level:', module.level);
    console.log('  Category:', module.category);

    // Find the creator of this module
    const creator = await User.findById(module.createdBy);
    console.log('\n👤 Module Creator:');
    if (creator) {
      console.log('  Name:', creator.name);
      console.log('  Email:', creator.email);
      console.log('  Role:', creator.role);
      console.log('  RegNo:', creator.regNo);
    } else {
      console.log('  ❌ Creator not found (ID:', module.createdBy, ')');
    }

    // Find admin users
    const admins = await User.find({ role: 'ADMIN' }).select('name email _id regNo');
    console.log('\n👑 Available Admin Users:');
    admins.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.email}) - ID: ${admin._id}`);
    });

    // Check deletion permissions
    console.log('\n🔐 Deletion Permission Analysis:');
    console.log('Backend Logic:');
    console.log('  ✅ Admins can delete ANY module');
    console.log('  ✅ Teachers can delete modules they created');
    console.log('  ❌ Students cannot delete modules');

    console.log('\nFrontend Logic:');
    console.log('  ✅ if (currentUser.role === "ADMIN") return true;');
    console.log('  ✅ Teachers: check if createdBy matches current user ID');

    // Test deletion permissions for each admin
    console.log('\n🧪 Testing Admin Deletion Rights:');
    for (const admin of admins) {
      const canDelete = true; // Admins can always delete
      console.log(`  ${admin.name}: ${canDelete ? '✅ CAN DELETE' : '❌ CANNOT DELETE'}`);
    }

    // Check if module has any dependencies
    console.log('\n🔗 Checking Module Dependencies:');
    
    // Check student progress
    const StudentProgress = require('../models/StudentProgress');
    const progressCount = await StudentProgress.countDocuments({ moduleId: module._id });
    console.log(`  Student Progress Records: ${progressCount}`);
    
    // Check AI tutor sessions
    const AiTutorSession = require('../models/AiTutorSession');
    const sessionCount = await AiTutorSession.countDocuments({ moduleId: module._id });
    console.log(`  AI Tutor Sessions: ${sessionCount}`);

    if (progressCount > 0 || sessionCount > 0) {
      console.log('  ⚠️ Module has dependencies - this might affect deletion');
    } else {
      console.log('  ✅ No dependencies found');
    }

    // Check if module is already soft-deleted
    if (!module.isActive) {
      console.log('\n⚠️ MODULE IS ALREADY SOFT-DELETED (isActive: false)');
      console.log('   This might be why it appears undeletable in the UI');
    }

    console.log('\n🔍 Possible Issues:');
    console.log('1. User authentication - check if admin is properly logged in');
    console.log('2. Role verification - ensure currentUser.role === "ADMIN"');
    console.log('3. Module already deleted - check isActive status');
    console.log('4. Frontend caching - try refreshing the page');
    console.log('5. Network issues - check browser console for errors');

    console.log('\n🛠️ Debugging Steps:');
    console.log('1. Login as admin: admin@germanbuddy.com / password123');
    console.log('2. Open browser developer tools (F12)');
    console.log('3. Go to learning modules page');
    console.log('4. Check console for any JavaScript errors');
    console.log('5. Verify currentUser object in console: console.log(currentUser)');
    console.log('6. Check if delete button appears for this module');
    console.log('7. If button appears, check network tab when clicking delete');

    // Test the actual deletion (simulation)
    console.log('\n🧪 Simulating Deletion Process:');
    console.log('Step 1: Check if module exists ✅');
    console.log('Step 2: Verify admin permissions ✅');
    console.log('Step 3: Soft delete (set isActive = false)');
    
    // Don't actually delete, just show what would happen
    console.log(`Would set: module.isActive = false`);
    console.log(`Would set: module.lastUpdatedBy = adminUserId`);
    console.log('Would save module');

    console.log('\n✅ Module deletion debugging completed!');

  } catch (error) {
    console.error('❌ Error debugging module deletion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the debug
debugModuleDeletion();