// export-module-data-to-csv.js
// Script to export all student module testing data to CSV files

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const AiTutorSession = require('./models/AiTutorSession');
const StudentProgress = require('./models/StudentProgress');
const CourseProgress = require('./models/CourseProgress');
const AiConversation = require('./models/aiConversations');
const LearningModule = require('./models/LearningModule');
const User = require('./models/User');
const SessionRecord = require('./models/SessionRecord');

// Helper function to escape CSV values
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Helper function to convert array to CSV row
function arrayToCSV(array) {
  return array.map(escapeCSV).join(',');
}

// Helper function to write CSV file
function writeCSV(filename, headers, rows) {
  const csvContent = [
    arrayToCSV(headers),
    ...rows.map(row => arrayToCSV(row))
  ].join('\n');
  
  const filepath = path.join(__dirname, 'exports', filename);
  fs.writeFileSync(filepath, csvContent, 'utf8');
  console.log(`✅ Exported: ${filename} (${rows.length} rows)`);
}

async function exportData() {
  try {
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Export AI Tutor Sessions
    console.log('📊 Exporting AI Tutor Sessions...');
    const sessions = await AiTutorSession.find()
      .populate('studentId', 'name email')
      .populate('moduleId', 'title level')
      .lean();
    
    const sessionRows = sessions.map(session => [
      session.sessionId,
      session.studentId?.name || 'N/A',
      session.studentId?.email || 'N/A',
      session.moduleId?.title || 'N/A',
      session.moduleId?.level || 'N/A',
      session.sessionType,
      session.status,
      session.isTestSession ? 'Yes' : 'No',
      session.analytics?.totalMessages || 0,
      session.analytics?.correctAnswers || 0,
      session.analytics?.incorrectAnswers || 0,
      session.analytics?.hintsUsed || 0,
      session.analytics?.sessionScore || 0,
      session.analytics?.engagementLevel || 'N/A',
      session.totalDuration || 0,
      session.activeTime || 0,
      session.startTime ? new Date(session.startTime).toISOString() : '',
      session.endTime ? new Date(session.endTime).toISOString() : '',
      session.createdAt ? new Date(session.createdAt).toISOString() : ''
    ]);
    
    writeCSV('ai_tutor_sessions.csv', [
      'Session ID',
      'Student Name',
      'Student Email',
      'Module Title',
      'Module Level',
      'Session Type',
      'Status',
      'Is Test Session',
      'Total Messages',
      'Correct Answers',
      'Incorrect Answers',
      'Hints Used',
      'Session Score',
      'Engagement Level',
      'Total Duration (min)',
      'Active Time (min)',
      'Start Time',
      'End Time',
      'Created At'
    ], sessionRows);

    // 2. Export Session Messages (detailed conversation data)
    console.log('📊 Exporting Session Messages...');
    const messageRows = [];
    sessions.forEach(session => {
      if (session.messages && session.messages.length > 0) {
        session.messages.forEach((msg, index) => {
          messageRows.push([
            session.sessionId,
            session.studentId?.name || 'N/A',
            session.moduleId?.title || 'N/A',
            index + 1,
            msg.role,
            msg.content,
            msg.messageType || 'text',
            msg.metadata?.isCorrect !== undefined ? (msg.metadata.isCorrect ? 'Correct' : 'Incorrect') : 'N/A',
            msg.metadata?.points || '',
            msg.timestamp ? new Date(msg.timestamp).toISOString() : ''
          ]);
        });
      }
    });
    
    writeCSV('session_messages.csv', [
      'Session ID',
      'Student Name',
      'Module Title',
      'Message Number',
      'Role',
      'Content',
      'Message Type',
      'Correctness',
      'Points',
      'Timestamp'
    ], messageRows);

    // 3. Export Student Progress
    console.log('📊 Exporting Student Progress...');
    const progress = await StudentProgress.find()
      .populate('studentId', 'name email')
      .populate('moduleId', 'title level')
      .lean();
    
    const progressRows = progress.map(p => [
      p.studentId?.name || 'N/A',
      p.studentId?.email || 'N/A',
      p.moduleId?.title || 'N/A',
      p.moduleId?.level || 'N/A',
      p.status,
      p.progressPercentage || 0,
      p.totalScore || 0,
      p.maxPossibleScore || 0,
      p.maxPossibleScore > 0 ? Math.round((p.totalScore / p.maxPossibleScore) * 100) : 0,
      p.currentStreak || 0,
      p.bestStreak || 0,
      p.timeSpent || 0,
      p.sessionsCount || 0,
      p.exercisesCompleted?.length || 0,
      p.exercisesCompleted?.filter(ex => ex.isCompleted).length || 0,
      p.objectivesCompleted?.length || 0,
      p.startedAt ? new Date(p.startedAt).toISOString() : '',
      p.completedAt ? new Date(p.completedAt).toISOString() : '',
      p.lastAccessedAt ? new Date(p.lastAccessedAt).toISOString() : ''
    ]);
    
    writeCSV('student_progress.csv', [
      'Student Name',
      'Student Email',
      'Module Title',
      'Module Level',
      'Status',
      'Progress %',
      'Total Score',
      'Max Possible Score',
      'Performance %',
      'Current Streak',
      'Best Streak',
      'Time Spent (min)',
      'Sessions Count',
      'Total Exercises',
      'Completed Exercises',
      'Objectives Completed',
      'Started At',
      'Completed At',
      'Last Accessed'
    ], progressRows);

    // 4. Export Exercise Completion Details
    console.log('📊 Exporting Exercise Completion Details...');
    const exerciseRows = [];
    progress.forEach(p => {
      if (p.exercisesCompleted && p.exercisesCompleted.length > 0) {
        p.exercisesCompleted.forEach(ex => {
          exerciseRows.push([
            p.studentId?.name || 'N/A',
            p.studentId?.email || 'N/A',
            p.moduleId?.title || 'N/A',
            ex.exerciseIndex || 'N/A',
            ex.attempts || 0,
            ex.bestScore || 0,
            ex.isCompleted ? 'Yes' : 'No',
            ex.lastAttemptDate ? new Date(ex.lastAttemptDate).toISOString() : ''
          ]);
        });
      }
    });
    
    writeCSV('exercise_completions.csv', [
      'Student Name',
      'Student Email',
      'Module Title',
      'Exercise Index',
      'Attempts',
      'Best Score',
      'Is Completed',
      'Last Attempt Date'
    ], exerciseRows);

    // 5. Export Vocabulary Tracking
    console.log('📊 Exporting Vocabulary Usage...');
    const vocabRows = [];
    sessions.forEach(session => {
      if (session.analytics?.vocabularyUsed && session.analytics.vocabularyUsed.length > 0) {
        session.analytics.vocabularyUsed.forEach(word => {
          vocabRows.push([
            session.sessionId,
            session.studentId?.name || 'N/A',
            session.studentId?.email || 'N/A',
            session.moduleId?.title || 'N/A',
            session.moduleId?.level || 'N/A',
            word,
            session.createdAt ? new Date(session.createdAt).toISOString() : ''
          ]);
        });
      }
    });
    
    writeCSV('vocabulary_usage.csv', [
      'Session ID',
      'Student Name',
      'Student Email',
      'Module Title',
      'Module Level',
      'Vocabulary Word',
      'Session Date'
    ], vocabRows);

    // 6. Export Course Progress
    console.log('📊 Exporting Course Progress...');
    const courseProgress = await CourseProgress.find()
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .lean();
    
    const courseProgressRows = courseProgress.map(cp => [
      cp.studentId?.name || 'N/A',
      cp.studentId?.email || 'N/A',
      cp.courseId?.title || 'N/A',
      cp.progressPercentage || 0,
      cp.lastUpdated ? new Date(cp.lastUpdated).toISOString() : ''
    ]);
    
    writeCSV('course_progress.csv', [
      'Student Name',
      'Student Email',
      'Course Title',
      'Progress %',
      'Last Updated'
    ], courseProgressRows);

    // 7. Export AI Conversations
    console.log('📊 Exporting AI Conversations...');
    const conversations = await AiConversation.find()
      .populate('userId', 'name email')
      .lean();
    
    const conversationRows = [];
    conversations.forEach(conv => {
      if (conv.messages && conv.messages.length > 0) {
        conv.messages.forEach((msg, index) => {
          conversationRows.push([
            conv._id.toString(),
            conv.userId?.name || 'N/A',
            conv.userId?.email || 'N/A',
            index + 1,
            msg.role,
            msg.text,
            conv.timestamp ? new Date(conv.timestamp).toISOString() : ''
          ]);
        });
      }
    });
    
    writeCSV('ai_conversations.csv', [
      'Conversation ID',
      'User Name',
      'User Email',
      'Message Number',
      'Role',
      'Text',
      'Timestamp'
    ], conversationRows);

    // 8. Export Summary Statistics
    console.log('📊 Generating Summary Statistics...');
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const totalStudents = new Set(sessions.map(s => s.studentId?._id?.toString()).filter(Boolean)).size;
    const totalModules = new Set(sessions.map(s => s.moduleId?._id?.toString()).filter(Boolean)).size;
    const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / totalSessions || 0;
    const totalMessages = sessions.reduce((sum, s) => sum + (s.analytics?.totalMessages || 0), 0);
    
    const summaryRows = [
      ['Total Sessions', totalSessions],
      ['Completed Sessions', completedSessions],
      ['Active Students', totalStudents],
      ['Modules Used', totalModules],
      ['Average Session Duration (min)', avgSessionDuration.toFixed(2)],
      ['Total Messages Exchanged', totalMessages],
      ['Total Student Progress Records', progress.length],
      ['Total Exercise Completions', exerciseRows.length],
      ['Total Vocabulary Words Tracked', vocabRows.length],
      ['Export Date', new Date().toISOString()]
    ];
    
    writeCSV('summary_statistics.csv', [
      'Metric',
      'Value'
    ], summaryRows);

    // 9. Export SessionRecord data (MAIN TABLE FOR ADMIN ANALYTICS)
    console.log('📊 Exporting Session Records (Admin Analytics Source)...');
    const sessionRecords = await SessionRecord.find()
      .populate('studentId', 'name email batch level role')
      .populate('moduleId', 'title level category')
      .lean();
    
    const sessionRecordRows = sessionRecords.map(record => [
      record.sessionId,
      record.studentId?.name || record.studentName || 'N/A',
      record.studentId?.email || record.studentEmail || 'N/A',
      record.studentId?.batch || 'Not assigned',
      record.studentId?.level || 'Not set',
      record.studentId?.role || 'N/A',
      record.moduleId?.title || record.moduleTitle || 'N/A',
      record.moduleId?.level || record.moduleLevel || 'N/A',
      record.moduleId?.category || 'N/A',
      record.sessionType,
      record.sessionState,
      record.durationMinutes || 0,
      record.messages?.length || 0,
      record.summary?.conversationCount || 0,
      record.summary?.vocabularyUsed?.length || 0,
      record.summary?.totalScore || 0,
      record.summary?.correctAnswers || 0,
      record.summary?.incorrectAnswers || 0,
      record.summary?.accuracy || 0,
      record.isModuleCompleted ? 'Yes' : 'No',
      record.teacherReviewed ? 'Yes' : 'No',
      record.startTime ? new Date(record.startTime).toISOString() : '',
      record.endTime ? new Date(record.endTime).toISOString() : '',
      record.createdAt ? new Date(record.createdAt).toISOString() : ''
    ]);
    
    writeCSV('session_records.csv', [
      'Session ID',
      'Student Name',
      'Student Email',
      'Student Batch',
      'Student Level',
      'Student Role',
      'Module Title',
      'Module Level',
      'Module Category',
      'Session Type',
      'Session State',
      'Duration (min)',
      'Total Messages',
      'Conversation Count',
      'Vocabulary Words',
      'Total Score',
      'Correct Answers',
      'Incorrect Answers',
      'Accuracy %',
      'Module Completed',
      'Teacher Reviewed',
      'Start Time',
      'End Time',
      'Created At'
    ], sessionRecordRows);

    // 10. Export SessionRecord Messages (detailed conversation from SessionRecord)
    console.log('📊 Exporting Session Record Messages...');
    const sessionRecordMessageRows = [];
    sessionRecords.forEach(record => {
      if (record.messages && record.messages.length > 0) {
        record.messages.forEach((msg, index) => {
          sessionRecordMessageRows.push([
            record.sessionId,
            record.studentId?.name || record.studentName || 'N/A',
            record.moduleId?.title || record.moduleTitle || 'N/A',
            index + 1,
            msg.role,
            msg.content,
            msg.messageType || 'text',
            msg.timestamp ? new Date(msg.timestamp).toISOString() : ''
          ]);
        });
      }
    });
    
    writeCSV('session_record_messages.csv', [
      'Session ID',
      'Student Name',
      'Module Title',
      'Message Number',
      'Role',
      'Content',
      'Message Type',
      'Timestamp'
    ], sessionRecordMessageRows);

    console.log('\n✅ All data exported successfully!');
    console.log(`📁 Files saved in: ${exportsDir}`);
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the export
exportData();
