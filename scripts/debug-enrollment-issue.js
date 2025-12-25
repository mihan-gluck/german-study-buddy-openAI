// Debug the enrollment issue by checking specific module access
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function debugEnrollmentIssue() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all active modules with their exact IDs
    const activeModules = await LearningModule.find({ isActive: true });
    
    console.log('🔍 DEBUGGING ENROLLMENT ISSUE\n');
    
    console.log('📋 All active modules with exact IDs:');
    activeModules.forEach((module, index) => {
      console.log(`${index + 1}. "${module.title}"`);
      console.log(`   ID: ${module._id}`);
      console.log(`   ID Type: ${typeof module._id}`);
      console.log(`   ID String: "${module._id.toString()}"`);
      console.log(`   ID Length: ${module._id.toString().length}`);
      console.log(`   isActive: ${module.isActive}`);
      console.log(`   Created by: ${module.createdBy}`);
      console.log('');
    });
    
    // Test specific module lookup
    if (activeModules.length > 0) {
      const testModule = activeModules[0];
      console.log('🧪 Testing module lookup:');
      console.log(`Testing with ID: ${testModule._id}`);
      
      // Test findById with the exact ID
      const foundModule = await LearningModule.findById(testModule._id);
      console.log(`✅ findById result: ${foundModule ? 'FOUND' : 'NOT FOUND'}`);
      
      if (foundModule) {
        console.log(`   Title: ${foundModule.title}`);
        console.log(`   isActive: ${foundModule.isActive}`);
      }
      
      // Test findById with string version
      const foundModuleStr = await LearningModule.findById(testModule._id.toString());
      console.log(`✅ findById (string) result: ${foundModuleStr ? 'FOUND' : 'NOT FOUND'}`);
    }
    
    console.log('\n💡 POSSIBLE CAUSES OF "MODULE NOT FOUND":');
    console.log('1. Module ID format issue (should be 24-character hex string)');
    console.log('2. Module was soft-deleted (isActive = false)');
    console.log('3. Frontend sending wrong module ID');
    console.log('4. Backend route parameter parsing issue');
    console.log('5. Database connection issue');
    
    console.log('\n🔍 NEXT STEPS:');
    console.log('1. Check browser network tab for exact API call being made');
    console.log('2. Check backend logs during enrollment attempt');
    console.log('3. Verify the module ID being sent from frontend');
    console.log('4. Test with a known good module ID');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugEnrollmentIssue();