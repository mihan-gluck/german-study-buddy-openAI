// scripts/verify-students-only-filter.js
// Verification script to check if AI analytics correctly filters students only

const mongoose = require('mongoose');
require('dotenv').config();

const SessionRecord = require('../models/SessionRecord');
const User = require('../models/User');

async function verifyStudentsOnlyFilter() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Check all users who have created SessionRecords
    console.log('📊 STEP 1: Checking all users who have AI sessions');
    console.log('='.repeat(60));
    
    const allSessionUsers = await SessionRecord.aggregate([
      {
        $group: {
          _id: '$studentId',
          sessionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          batch: '$user.batch',
          level: '$user.level',
          sessionCount: 1
        }
      },
      { $sort: { sessionCount: -1 } }
    ]);

    console.log(`Total users with AI sessions: ${allSessionUsers.length}\n`);
    
    const students = allSessionUsers.filter(u => u.role === 'STUDENT');
    const teachers = allSessionUsers.filter(u => u.role === 'TEACHER');
    const admins = allSessionUsers.filter(u => u.role === 'ADMIN');
    
    console.log(`👨‍🎓 Students: ${students.length}`);
    console.log(`👨‍🏫 Teachers: ${teachers.length}`);
    console.log(`👨‍💼 Admins: ${admins.length}\n`);

    // Step 2: Show teachers who have AI sessions (these should be filtered out)
    if (teachers.length > 0) {
      console.log('⚠️  TEACHERS WITH AI SESSIONS (should be filtered in analytics):');
      console.log('-'.repeat(60));
      teachers.forEach(teacher => {
        console.log(`  📛 ${teacher.name}`);
        console.log(`     Email: ${teacher.email}`);
        console.log(`     Role: ${teacher.role}`);
        console.log(`     Sessions: ${teacher.sessionCount}`);
        console.log();
      });
    }

    // Step 3: Simulate the analytics query WITH studentsOnly filter
    console.log('📊 STEP 2: Simulating analytics query WITH studentsOnly filter');
    console.log('='.repeat(60));
    
    const studentsOnlyResults = await SessionRecord.aggregate([
      // Lookup user data
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      
      // FILTER: Only students
      { $match: { 'student.role': 'STUDENT' } },
      
      // Group by student
      {
        $group: {
          _id: {
            studentId: '$studentId',
            studentName: '$student.name',
            studentEmail: '$student.email',
            studentBatch: '$student.batch',
            studentLevel: '$student.level'
          },
          totalSessions: { $sum: 1 },
          totalTimeSpent: { $sum: '$durationMinutes' }
        }
      },
      { $sort: { totalTimeSpent: -1 } },
      { $limit: 10 }
    ]);

    console.log(`✅ Results with studentsOnly filter: ${studentsOnlyResults.length} students\n`);
    
    if (studentsOnlyResults.length > 0) {
      console.log('Top 5 students by time spent:');
      console.log('-'.repeat(60));
      studentsOnlyResults.slice(0, 5).forEach((student, index) => {
        console.log(`${index + 1}. ${student._id.studentName}`);
        console.log(`   Email: ${student._id.studentEmail || 'NO EMAIL'}`);
        console.log(`   Batch: ${student._id.studentBatch || 'Not assigned'}`);
        console.log(`   Level: ${student._id.studentLevel || 'Not set'}`);
        console.log(`   Sessions: ${student.totalSessions}`);
        console.log(`   Time: ${student.totalTimeSpent} minutes`);
        console.log();
      });
    }

    // Step 4: Simulate the analytics query WITHOUT studentsOnly filter
    console.log('📊 STEP 3: Simulating analytics query WITHOUT studentsOnly filter');
    console.log('='.repeat(60));
    
    const allUsersResults = await SessionRecord.aggregate([
      // Lookup user data
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      
      // NO FILTER - includes everyone
      
      // Group by student
      {
        $group: {
          _id: {
            studentId: '$studentId',
            studentName: '$student.name',
            studentEmail: '$student.email',
            studentRole: '$student.role',
            studentBatch: '$student.batch',
            studentLevel: '$student.level'
          },
          totalSessions: { $sum: 1 },
          totalTimeSpent: { $sum: '$durationMinutes' }
        }
      },
      { $sort: { totalTimeSpent: -1 } },
      { $limit: 10 }
    ]);

    console.log(`⚠️  Results WITHOUT filter: ${allUsersResults.length} users (includes teachers)\n`);
    
    if (allUsersResults.length > 0) {
      console.log('Top 10 users by time spent (may include teachers):');
      console.log('-'.repeat(60));
      allUsersResults.forEach((user, index) => {
        const roleEmoji = user._id.studentRole === 'STUDENT' ? '👨‍🎓' : 
                         user._id.studentRole === 'TEACHER' ? '👨‍🏫' : '👨‍💼';
        console.log(`${index + 1}. ${roleEmoji} ${user._id.studentName} [${user._id.studentRole}]`);
        console.log(`   Email: ${user._id.studentEmail || 'NO EMAIL'}`);
        console.log(`   Sessions: ${user.totalSessions}, Time: ${user.totalTimeSpent} min`);
        console.log();
      });
    }

    // Step 5: Verification summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const teachersInUnfilteredResults = allUsersResults.filter(u => u._id.studentRole === 'TEACHER').length;
    const teachersInFilteredResults = studentsOnlyResults.filter(u => u._id.studentRole === 'TEACHER').length;
    
    console.log(`\n✅ Students with AI sessions: ${students.length}`);
    console.log(`⚠️  Teachers with AI sessions: ${teachers.length}`);
    console.log(`\n📊 Analytics Results:`);
    console.log(`   - WITH studentsOnly filter: ${studentsOnlyResults.length} users`);
    console.log(`   - WITHOUT studentsOnly filter: ${allUsersResults.length} users`);
    console.log(`\n🎯 Filter Effectiveness:`);
    console.log(`   - Teachers in unfiltered results: ${teachersInUnfilteredResults}`);
    console.log(`   - Teachers in filtered results: ${teachersInFilteredResults}`);
    
    if (teachersInFilteredResults === 0 && teachers.length > 0) {
      console.log(`\n✅ SUCCESS: Filter is working correctly!`);
      console.log(`   All ${teachers.length} teachers are excluded from analytics.`);
    } else if (teachersInFilteredResults > 0) {
      console.log(`\n❌ ERROR: Filter is NOT working!`);
      console.log(`   ${teachersInFilteredResults} teachers still appear in filtered results.`);
    } else {
      console.log(`\n✅ No teachers have AI sessions, so filter has nothing to exclude.`);
    }

    // Step 6: Check for missing emails
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL VERIFICATION');
    console.log('='.repeat(60));
    
    const studentsWithoutEmail = students.filter(s => !s.email || s.email === '');
    if (studentsWithoutEmail.length > 0) {
      console.log(`\n⚠️  WARNING: ${studentsWithoutEmail.length} students without email:`);
      studentsWithoutEmail.forEach(student => {
        console.log(`   - ${student.name} (ID: ${student.userId})`);
      });
    } else {
      console.log(`\n✅ All ${students.length} students have email addresses.`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run verification
verifyStudentsOnlyFilter();
