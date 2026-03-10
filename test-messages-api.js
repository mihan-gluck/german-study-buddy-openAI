// test-messages-api.js
// Test if messages are returned from the API

require('dotenv').config();
const mongoose = require('mongoose');
const AiTutorSession = require('./models/AiTutorSession');
const User = require('./models/User');
const LearningModule = require('./models/LearningModule'); // Add this

async function testMessagesAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find a recent session with messages
    const session = await AiTutorSession.findOne({ 
      messages: { $exists: true, $ne: [] } 
    })
    .sort({ createdAt: -1 })
    .populate('studentId')
    .populate('moduleId');

    if (!session) {
      console.log('❌ No sessions with messages found');
      return;
    }

    console.log('\n📊 Session Info:');
    console.log('Session ID:', session.sessionId);
    console.log('Student:', session.studentId?.name);
    console.log('Module:', session.moduleId?.title);
    console.log('Messages count:', session.messages?.length || 0);

    // Simulate the aggregation pipeline from adminAnalytics.js
    const pipeline = [
      { $match: { _id: session._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $lookup: {
          from: 'learningmodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'module'
        }
      },
      { $unwind: '$student' },
      { $unwind: '$module' },
      {
        $project: {
          sessionId: 1,
          studentName: '$student.name',
          moduleName: '$module.title',
          moduleLevel: '$module.level',
          sessionState: '$status',
          durationMinutes: '$totalDuration',
          summary: '$analytics',
          messages: 1, // Include messages
          createdAt: 1
        }
      }
    ];

    const result = await AiTutorSession.aggregate(pipeline);

    console.log('\n📋 Aggregation Result:');
    console.log('Has messages field:', !!result[0].messages);
    console.log('Messages count:', result[0].messages?.length || 0);
    
    if (result[0].messages && result[0].messages.length > 0) {
      console.log('\n✅ Messages are included in aggregation!');
      console.log('Sample message:', {
        role: result[0].messages[0].role,
        content: result[0].messages[0].content.substring(0, 50) + '...',
        timestamp: result[0].messages[0].timestamp
      });
    } else {
      console.log('\n❌ Messages are NOT included in aggregation!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testMessagesAPI();
