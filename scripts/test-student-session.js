// Test student session functionality
const mongoose = require('mongoose');
const User = require('../models/User');
const LearningModule = require('../models/LearningModule');

async function testStudentSession() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mihangluck:Mihan123@cluster0.ixhzd.mongodb.net/german-study-buddy?retryWrites=true&w=majority');
    
    console.log('🔍 Testing student session functionality...');
    
    // Find a PLATINUM student
    const student = await User.findOne({ role: 'STUDENT', subscription: 'PLATINUM' });
    console.log('👤 Found PLATINUM student:', {
      regNo: student?.regNo,
      subscription: student?.subscription,
      role: student?.role
    });
    
    // Find an active module
    const module = await LearningModule.findOne({ isActive: true });
    console.log('📚 Found active module:', {
      id: module?._id,
      title: module?.title,
      level: module?.level,
      category: module?.category
    });
    
    if (!student) {
      console.log('❌ No PLATINUM student found');
      return;
    }
    
    if (!module) {
      console.log('❌ No active module found');
      return;
    }
    
    console.log('✅ Student session test setup complete');
    console.log('📋 Test details:');
    console.log(`   Student: ${student.regNo} (${student.subscription})`);
    console.log(`   Module: ${module.title} (${module._id})`);
    console.log('   Next: Try enrolling in this module through the UI');
    
  } catch (error) {
    console.error('❌ Error testing student session:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testStudentSession();