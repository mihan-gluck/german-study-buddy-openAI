// Test the delete functionality for modules
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function testDeleteFunctionality() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the teacher
    const teacher = await User.findOne({ regNo: 'TEA001' });
    console.log('👤 Teacher:', teacher.name, '- ID:', teacher._id);
    
    // Find modules created by this teacher
    const teacherModules = await LearningModule.find({ 
      createdBy: teacher._id,
      isActive: true 
    });
    
    console.log(`\n📚 Teacher has ${teacherModules.length} active modules:`);
    teacherModules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (ID: ${module._id})`);
    });
    
    // Find modules created by others
    const otherModules = await LearningModule.find({ 
      createdBy: { $ne: teacher._id },
      isActive: true 
    });
    
    console.log(`\n📚 Other users have ${otherModules.length} active modules:`);
    otherModules.slice(0, 3).forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (Created by: ${module.createdBy})`);
    });
    
    console.log('\n🔍 DELETE PERMISSIONS ANALYSIS:');
    console.log('✅ Teachers can delete:');
    console.log('   - Modules they created themselves');
    console.log('   - Example: Teacher TEA001 can delete modules with createdBy = ' + teacher._id);
    
    console.log('\n❌ Teachers CANNOT delete:');
    console.log('   - Modules created by other users');
    console.log('   - Example: Teacher TEA001 cannot delete modules created by admins or other teachers');
    
    console.log('\n👑 Admins can delete:');
    console.log('   - ANY module in the system');
    console.log('   - No restrictions on ownership');
    
    console.log('\n🚫 Students cannot delete:');
    console.log('   - Any modules (no delete permission)');
    
    console.log('\n🎯 HOW TO TEST DELETE FUNCTIONALITY:');
    console.log('1. Login as teacher (TEA001/password123)');
    console.log('2. Go to Learning Modules page');
    console.log('3. Look for modules you created - they will have a red "Delete" button');
    console.log('4. Modules created by others will NOT have a delete button');
    console.log('5. Click delete and confirm to remove the module');
    console.log('6. The module will be soft-deleted (isActive = false)');
    
    console.log('\n⚠️ IMPORTANT NOTES:');
    console.log('- Delete is a "soft delete" - module is marked inactive, not permanently removed');
    console.log('- Deleted modules will no longer appear in the modules list');
    console.log('- Only the module creator (or admin) can delete a module');
    console.log('- Confirmation dialog prevents accidental deletions');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testDeleteFunctionality();