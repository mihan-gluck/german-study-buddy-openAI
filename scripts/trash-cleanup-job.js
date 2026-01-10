// scripts/trash-cleanup-job.js
// Automated Trash Cleanup Job - Runs daily to clean up expired modules

require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function runTrashCleanup() {
  try {
    console.log('🧹 Starting automated trash cleanup job...');
    console.log('📅 Current time:', new Date().toISOString());
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find expired items first for reporting
    const expiredItems = await LearningModule.find({
      isDeleted: true,
      scheduledDeletionDate: { $lte: new Date() }
    }).populate('deletedBy', 'name email regNo');
    
    console.log(`📊 Found ${expiredItems.length} expired items to permanently delete`);
    
    if (expiredItems.length > 0) {
      console.log('📋 Expired items:');
      expiredItems.forEach((item, index) => {
        const daysInTrash = Math.ceil((new Date() - new Date(item.deletedAt)) / (1000 * 60 * 60 * 24));
        console.log(`   ${index + 1}. "${item.title}" (${item.level})`);
        console.log(`      Deleted: ${item.deletedAt.toLocaleDateString()}`);
        console.log(`      Deleted by: ${item.deletedBy?.name || 'Unknown'}`);
        console.log(`      Days in trash: ${daysInTrash}`);
        console.log(`      Scheduled deletion: ${item.scheduledDeletionDate.toLocaleDateString()}`);
        console.log('');
      });
      
      // Perform cleanup
      const result = await LearningModule.cleanupExpiredTrash();
      
      console.log(`✅ Cleanup completed successfully!`);
      console.log(`🗑️ Permanently deleted: ${result.deletedCount} modules`);
      
      // Log cleanup summary
      const summary = {
        timestamp: new Date().toISOString(),
        deletedCount: result.deletedCount,
        deletedModules: expiredItems.map(item => ({
          id: item._id.toString(),
          title: item.title,
          level: item.level,
          deletedAt: item.deletedAt,
          deletedBy: item.deletedBy?.name || 'Unknown',
          daysInTrash: Math.ceil((new Date() - new Date(item.deletedAt)) / (1000 * 60 * 60 * 24))
        }))
      };
      
      console.log('📊 Cleanup Summary:', JSON.stringify(summary, null, 2));
      
    } else {
      console.log('✨ No expired items found. Trash is clean!');
    }
    
    // Get current trash statistics
    const currentTrashItems = await LearningModule.find({ isDeleted: true });
    console.log(`📈 Current trash status: ${currentTrashItems.length} items remaining`);
    
    if (currentTrashItems.length > 0) {
      const nextExpirations = currentTrashItems
        .map(item => ({
          title: item.title,
          daysRemaining: Math.ceil((new Date(item.scheduledDeletionDate) - new Date()) / (1000 * 60 * 60 * 24))
        }))
        .filter(item => item.daysRemaining > 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .slice(0, 5);
      
      if (nextExpirations.length > 0) {
        console.log('⏰ Next items to expire:');
        nextExpirations.forEach((item, index) => {
          console.log(`   ${index + 1}. "${item.title}" - ${item.daysRemaining} days remaining`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error during trash cleanup:', error);
    throw error;
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    console.log('🎉 Trash cleanup job completed');
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  runTrashCleanup()
    .then(() => {
      console.log('✅ Trash cleanup job finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Trash cleanup job failed:', error);
      process.exit(1);
    });
}

module.exports = { runTrashCleanup };