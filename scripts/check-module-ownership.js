// Check module ownership
require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const User = require('../models/User');

async function checkModuleOwnership() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the teacher
    const teacher = await User.findOne({ regNo: 'TEA001' });
    console.log('👤 Teacher ID:', teacher._id.toString());
    
    // Find all modules
    const modules = await LearningModule.find({}).populate('createdBy', 'name regNo');
    
    console.log('\n📚 All modules:');
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`);
      console.log(`   ID: ${module._id}`);
      console.log(`   Created by: ${module.createdBy?.name || 'Unknown'} (${module.createdBy?.regNo || 'Unknown'})`);
      console.log(`   Creator ID: ${module.createdBy?._id?.toString() || 'Unknown'}`);
      console.log(`   Can teacher test: ${module.createdBy?._id?.toString() === teacher._id.toString() ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkModuleOwnership();