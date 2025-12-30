#!/usr/bin/env node

/**
 * Test Student Performance History
 * 
 * This script demonstrates what students can see in their performance history,
 * including multiple attempts, improvements, and detailed analytics.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SessionRecord = require('../models/SessionRecord');
const User = require('../models/User');
const LearningModule = require('../models/LearningModule');

async function testStudentPerformanceHistory() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get a student for testing
    const student = await User.findOne({ role: 'STUDENT' });
    if (!student) {
      console.log('❌ No student found for testing');
      return;
    }

    console.log(`\n👤 Testing performance history for: ${student.name} (${student.email})`);

    // Get all session records for this student
    const sessionRecords = await SessionRecord.find({ studentId: student._id })
      .populate('moduleId', 'title level category')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${sessionRecords.length} session records`);

    if (sessionRecords.length === 0) {
      console.log('❌ No session records found. Creating sample data...');
      // You could create sample data here if needed
      return;
    }

    // Calculate statistics (same as API)
    const totalSessions = sessionRecords.length;
    const completedSessions = sessionRecords.filter(s => s.sessionState === 'completed').length;
    const modulesCompleted = sessionRecords.filter(s => s.isModuleCompleted).length;
    
    const totalTimeSpent = sessionRecords.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalScore = sessionRecords.reduce((sum, s) => sum + (s.summary?.totalScore || 0), 0);
    const averageScore = totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0;
    
    // Calculate unique vocabulary learned
    const allVocabulary = new Set();
    sessionRecords.forEach(s => {
      if (s.summary?.vocabularyUsed) {
        s.summary.vocabularyUsed.forEach(word => allVocabulary.add(word));
      }
    });
    
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    const averageSessionDuration = totalSessions > 0 ? Math.round(totalTimeSpent / totalSessions) : 0;
    
    // Calculate improvement trend
    let improvementTrend = 'stable';
    if (sessionRecords.length >= 10) {
      const recent5 = sessionRecords.slice(0, 5);
      const previous5 = sessionRecords.slice(5, 10);
      
      const recentAvg = recent5.reduce((sum, s) => sum + (s.summary?.totalScore || 0), 0) / 5;
      const previousAvg = previous5.reduce((sum, s) => sum + (s.summary?.totalScore || 0), 0) / 5;
      
      if (recentAvg > previousAvg + 10) {
        improvementTrend = 'improving';
      } else if (recentAvg < previousAvg - 10) {
        improvementTrend = 'declining';
      }
    }

    // Display student performance dashboard
    console.log('\n📊 STUDENT PERFORMANCE DASHBOARD');
    console.log('=' .repeat(60));

    console.log('\n📈 Learning Statistics:');
    console.log(`   📚 Total Sessions: ${totalSessions}`);
    console.log(`   ✅ Modules Completed: ${modulesCompleted}`);
    console.log(`   ⏱️ Total Study Time: ${formatTimeSpent(totalTimeSpent)}`);
    console.log(`   🎯 Average Score: ${averageScore} points`);
    console.log(`   📊 Success Rate: ${completionRate}%`);
    console.log(`   📝 Words Learned: ${allVocabulary.size} unique words`);
    console.log(`   ⏰ Avg Session: ${averageSessionDuration} minutes`);
    console.log(`   📈 Trend: ${getTrendLabel(improvementTrend)} ${getTrendIcon(improvementTrend)}`);

    // Group sessions by module
    const moduleGroups = {};
    sessionRecords.forEach(record => {
      const moduleId = record.moduleId._id.toString();
      if (!moduleGroups[moduleId]) {
        moduleGroups[moduleId] = {
          moduleTitle: record.moduleTitle,
          moduleLevel: record.moduleLevel,
          moduleCategory: record.moduleId?.category || 'General',
          sessions: []
        };
      }
      moduleGroups[moduleId].sessions.push(record);
    });

    // Sort sessions within each module by date
    Object.values(moduleGroups).forEach(group => {
      group.sessions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    console.log('\n📚 SESSION HISTORY BY MODULE:');
    console.log('=' .repeat(60));

    Object.values(moduleGroups).forEach(group => {
      console.log(`\n📖 ${group.moduleTitle} (${group.moduleLevel}) - ${group.sessions.length} attempts`);
      console.log('─' .repeat(50));

      group.sessions.forEach((session, index) => {
        const attemptNum = index + 1;
        const date = new Date(session.createdAt).toLocaleDateString();
        const status = getStatusIcon(session.sessionState);
        const summary = session.summary || {};
        
        console.log(`\n   ${attemptNum}. ${status} Attempt ${attemptNum} (${date})`);
        console.log(`      💬 Conversations: ${summary.conversationCount || 0}`);
        console.log(`      ⏱️ Time: ${summary.timeSpentMinutes || session.durationMinutes || 0} minutes`);
        console.log(`      🎯 Score: ${summary.totalScore || 0} points`);
        console.log(`      📊 Accuracy: ${summary.accuracy || 0}%`);
        
        if (summary.vocabularyUsed && summary.vocabularyUsed.length > 0) {
          const vocabDisplay = summary.vocabularyUsed.slice(0, 5).join(', ');
          const moreCount = summary.vocabularyUsed.length > 5 ? ` (+${summary.vocabularyUsed.length - 5} more)` : '';
          console.log(`      📚 Vocabulary: ${vocabDisplay}${moreCount}`);
        }

        // Show improvement from previous attempt
        if (index > 0) {
          const prevSession = group.sessions[index - 1];
          const currentScore = summary.totalScore || 0;
          const prevScore = prevSession.summary?.totalScore || 0;
          const scoreDiff = currentScore - prevScore;

          if (scoreDiff > 10) {
            console.log(`      📈 Improved by ${scoreDiff} points! 🎉`);
          } else if (scoreDiff < -10) {
            console.log(`      📉 Score decreased by ${Math.abs(scoreDiff)} points`);
          }
        }

        console.log(`      📋 Status: ${getStatusLabel(session.sessionState)}`);
        if (session.isModuleCompleted) {
          console.log(`      🏆 MODULE COMPLETED! 🎉`);
        }
      });
    });

    // Show vocabulary progress
    console.log('\n📚 VOCABULARY LEARNING PROGRESS:');
    console.log('─' .repeat(40));
    
    const vocabularyBySession = [];
    const seenWords = new Set();
    
    // Process sessions in chronological order
    const chronologicalSessions = [...sessionRecords].reverse();
    chronologicalSessions.forEach((session, index) => {
      if (session.summary?.vocabularyUsed) {
        const newWords = session.summary.vocabularyUsed.filter(word => !seenWords.has(word));
        newWords.forEach(word => seenWords.add(word));
        
        if (newWords.length > 0) {
          vocabularyBySession.push({
            sessionDate: new Date(session.createdAt).toLocaleDateString(),
            moduleTitle: session.moduleTitle,
            newWords: newWords,
            totalWordsLearned: seenWords.size
          });
        }
      }
    });

    vocabularyBySession.forEach(entry => {
      console.log(`\n📅 ${entry.sessionDate} - ${entry.moduleTitle}`);
      console.log(`   🆕 New words: ${entry.newWords.join(', ')}`);
      console.log(`   📊 Total vocabulary: ${entry.totalWordsLearned} words`);
    });

    // Show learning insights
    console.log('\n💡 LEARNING INSIGHTS:');
    console.log('─' .repeat(30));

    // Most practiced module
    const moduleAttempts = Object.entries(moduleGroups)
      .map(([id, group]) => ({ title: group.moduleTitle, attempts: group.sessions.length }))
      .sort((a, b) => b.attempts - a.attempts);

    if (moduleAttempts.length > 0) {
      console.log(`🎯 Most practiced: ${moduleAttempts[0].title} (${moduleAttempts[0].attempts} attempts)`);
    }

    // Best performing module
    const moduleScores = Object.entries(moduleGroups)
      .map(([id, group]) => {
        const avgScore = group.sessions.reduce((sum, s) => sum + (s.summary?.totalScore || 0), 0) / group.sessions.length;
        return { title: group.moduleTitle, avgScore: Math.round(avgScore) };
      })
      .sort((a, b) => b.avgScore - a.avgScore);

    if (moduleScores.length > 0) {
      console.log(`🏆 Best performance: ${moduleScores[0].title} (${moduleScores[0].avgScore} avg points)`);
    }

    // Study patterns
    const studyDays = sessionRecords.map(s => new Date(s.createdAt).toDateString());
    const uniqueStudyDays = new Set(studyDays).size;
    console.log(`📅 Study days: ${uniqueStudyDays} different days`);

    // Persistence analysis
    const multiAttemptModules = Object.values(moduleGroups).filter(g => g.sessions.length > 1);
    if (multiAttemptModules.length > 0) {
      console.log(`💪 Persistence: Retried ${multiAttemptModules.length} modules multiple times`);
    }

    console.log('\n🎉 Student Performance History Analysis Complete!');

    console.log('\n📱 WHAT STUDENTS SEE IN THEIR DASHBOARD:');
    console.log('=' .repeat(60));
    console.log('✅ Complete session history with all attempts');
    console.log('✅ Performance statistics and trends');
    console.log('✅ Vocabulary learning progress');
    console.log('✅ Improvement indicators between attempts');
    console.log('✅ Module completion status');
    console.log('✅ Detailed session breakdowns');
    console.log('✅ Learning insights and patterns');
    console.log('✅ Ability to retry modules directly');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Helper functions
function formatTimeSpent(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function getTrendLabel(trend) {
  switch (trend) {
    case 'improving': return 'Improving';
    case 'stable': return 'Stable';
    case 'declining': return 'Needs Focus';
    default: return trend;
  }
}

function getTrendIcon(trend) {
  switch (trend) {
    case 'improving': return '📈';
    case 'stable': return '➡️';
    case 'declining': return '📉';
    default: return '';
  }
}

function getStatusIcon(state) {
  switch (state) {
    case 'completed': return '✅';
    case 'manually_ended': return '⚠️';
    case 'abandoned': return '❌';
    case 'active': return '🔄';
    default: return '❓';
  }
}

function getStatusLabel(state) {
  switch (state) {
    case 'completed': return 'Completed Successfully';
    case 'manually_ended': return 'Stopped Early';
    case 'abandoned': return 'Abandoned';
    case 'active': return 'In Progress';
    default: return state;
  }
}

// Run the test
testStudentPerformanceHistory();