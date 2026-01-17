// scripts/sync-all-monday-students.js
// Full sync of all students from Monday.com to MongoDB with duplicate prevention

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const axios = require('axios');
const bcrypt = require('bcrypt');
const fs = require('fs');

// Monday.com API configuration
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID;
const MONDAY_API_URL = 'https://api.monday.com/v2';

// Column ID mappings
const COLUMN_MAPPING = {
  email: 'text_mkw3spks',
  phone: 'text_mkw2wpvr',
  medium: 'dropdown_mkw09h9j',
  subscription: 'color_mky3jxt1',
  batch: 'dropdown_mkxx6cfp',
  status: 'dropdown_mkxwsaxq',
  teacher: 'person',
  address: 'text_mkv080k2'
};

// Helper function to get column value
function getColumnValue(item, columnId) {
  const column = item.column_values.find(col => col.id === columnId);
  return column ? column.text : null;
}

// Helper function to extract level from status
function extractLevel(statusText) {
  if (!statusText) return 'A1';
  
  const match = statusText.match(/([ABC])\s*(\d)/i);
  if (match) {
    return `${match[1].toUpperCase()}${match[2]}`;
  }
  
  return 'A1';
}

// Helper function to map subscription
function mapSubscription(mondaySubscription) {
  if (!mondaySubscription) return 'SILVER';
  
  const sub = mondaySubscription.toLowerCase();
  if (sub.includes('platinum') || sub.includes('premium')) {
    return 'PLATINUM';
  }
  return 'SILVER';
}

// Helper function to map status
function mapStatus(mondayStatus) {
  if (!mondayStatus) return 'ONGOING';
  
  const status = mondayStatus.toLowerCase();
  if (status.includes('completed') || status.includes('finished')) {
    return 'COMPLETED';
  }
  if (status.includes('withdrew') || status.includes('dropped')) {
    return 'DROPPED';
  }
  if (status.includes('ongoing') || status.includes('active')) {
    return 'ONGOING';
  }
  return 'UNCERTAIN';
}

// Helper function to extract batch number
function extractBatch(batchText) {
  if (!batchText) return '1';
  
  const match = batchText.match(/\d+/);
  return match ? match[0] : '1';
}

// Helper function to find teacher by name
async function findTeacherByName(teacherName) {
  if (!teacherName) {
    const defaultTeacher = await User.findOne({ role: 'TEACHER', isActive: true });
    return defaultTeacher ? defaultTeacher._id : null;
  }
  
  try {
    const teacher = await User.findOne({
      name: { $regex: new RegExp(teacherName, 'i') },
      role: 'TEACHER',
      isActive: true
    });
    
    if (teacher) {
      return teacher._id;
    }
    
    const defaultTeacher = await User.findOne({ role: 'TEACHER', isActive: true });
    return defaultTeacher ? defaultTeacher._id : null;
  } catch (error) {
    const defaultTeacher = await User.findOne({ role: 'TEACHER', isActive: true });
    return defaultTeacher ? defaultTeacher._id : null;
  }
}

// Get highest RegNo from MongoDB
async function getNextRegNo() {
  try {
    const students = await User.find({ role: 'STUDENT' })
      .select('regNo')
      .lean();
    
    if (students.length === 0) {
      return 'STUD001';
    }
    
    const numbers = students
      .map(s => {
        const match = s.regNo.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      })
      .filter(n => n > 0);
    
    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    
    return `STUD${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error getting next RegNo:', error);
    return 'STUD001';
  }
}

// Validate email format
function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Check if student is duplicate
function isDuplicate(email, regNo, existingStudents) {
  return existingStudents.some(s => 
    s.email.toLowerCase() === email.toLowerCase() ||
    s.regNo === regNo
  );
}

async function syncAllStudents() {
  const startTime = Date.now();
  const syncReport = {
    startTime: new Date().toISOString(),
    totalInMonday: 0,
    alreadyInMongoDB: 0,
    newStudentsFound: 0,
    successfullyAdded: 0,
    failed: 0,
    duplicatesSkipped: 0,
    invalidEmailSkipped: 0,
    failedStudents: [],
    addedStudents: [],
    skippedStudents: []
  };

  try {
    console.log('🚀 FULL SYNC: Monday.com → MongoDB');
    console.log('='.repeat(80));
    console.log('');
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Get next RegNo
    console.log('🔢 Finding next available RegNo...');
    let nextRegNo = await getNextRegNo();
    console.log(`✅ Starting from: ${nextRegNo}\n`);

    // Step 2: Fetch ALL students from Monday.com (500 limit)
    console.log('🌐 Fetching ALL students from Monday.com...');
    
    const query = `
      query {
        boards(ids: [${MONDAY_BOARD_ID}]) {
          name
          items_page(limit: 500) {
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      MONDAY_API_URL,
      { query },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      console.log('❌ Monday.com API Error:');
      console.log(JSON.stringify(response.data.errors, null, 2));
      await mongoose.connection.close();
      process.exit(1);
    }

    const board = response.data.data.boards[0];
    const mondayItems = board.items_page.items;
    syncReport.totalInMonday = mondayItems.length;

    console.log(`✅ Found ${mondayItems.length} students in Monday.com board: "${board.name}"\n`);

    // Step 3: Get existing students from MongoDB
    console.log('📊 Fetching existing students from MongoDB...');
    const existingStudents = await User.find({ role: 'STUDENT' })
      .select('email regNo')
      .lean();
    
    syncReport.alreadyInMongoDB = existingStudents.length;
    console.log(`✅ Found ${existingStudents.length} existing students\n`);

    // Step 4: Process all students
    console.log('🔄 Processing students...\n');
    console.log('='.repeat(80));
    
    let processedCount = 0;
    const studentsToAdd = [];
    
    for (const item of mondayItems) {
      processedCount++;
      
      const name = item.name;
      const email = getColumnValue(item, COLUMN_MAPPING.email);
      
      // Progress indicator
      if (processedCount % 50 === 0) {
        console.log(`\n📊 Progress: ${processedCount}/${mondayItems.length} students processed...\n`);
      }
      
      // Skip if no email
      if (!email) {
        console.log(`⏭️  [${processedCount}/${mondayItems.length}] Skipping "${name}" - No email`);
        syncReport.skippedStudents.push({ name, reason: 'No email' });
        continue;
      }
      
      // Validate email format
      if (!isValidEmail(email)) {
        console.log(`⏭️  [${processedCount}/${mondayItems.length}] Skipping "${name}" - Invalid email: ${email}`);
        syncReport.invalidEmailSkipped++;
        syncReport.skippedStudents.push({ name, email, reason: 'Invalid email format' });
        continue;
      }
      
      // Check for duplicates (by email only, since RegNo is auto-generated)
      const existsByEmail = existingStudents.some(s => 
        s.email.toLowerCase() === email.toLowerCase()
      );
      
      if (existsByEmail) {
        console.log(`⏭️  [${processedCount}/${mondayItems.length}] Skipping "${name}" - Already exists (${email})`);
        syncReport.duplicatesSkipped++;
        syncReport.skippedStudents.push({ name, email, reason: 'Already exists in MongoDB' });
        continue;
      }
      
      // Extract data
      const medium = getColumnValue(item, COLUMN_MAPPING.medium) || 'English';
      const subscription = getColumnValue(item, COLUMN_MAPPING.subscription);
      const batch = getColumnValue(item, COLUMN_MAPPING.batch);
      const status = getColumnValue(item, COLUMN_MAPPING.status);
      const teacherName = getColumnValue(item, COLUMN_MAPPING.teacher);
      
      // Transform data
      const level = extractLevel(status);
      const mappedSubscription = mapSubscription(subscription);
      const mappedStatus = mapStatus(status);
      const batchNumber = extractBatch(batch);
      const mediumArray = medium.split(',').map(m => m.trim());
      
      // Find teacher
      const teacherId = await findTeacherByName(teacherName);
      
      // Generate password
      const currentYear = new Date().getFullYear();
      const plainPassword = `${nextRegNo}@${currentYear}`;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      // Create student object
      const studentData = {
        name: name,
        email: email,
        regNo: nextRegNo,
        password: hashedPassword,
        role: 'STUDENT',
        subscription: mappedSubscription,
        level: level,
        batch: batchNumber,
        medium: mediumArray,
        assignedTeacher: teacherId,
        studentStatus: mappedStatus,
        isActive: true,
        registeredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      studentsToAdd.push({
        data: studentData,
        plainPassword: plainPassword,
        mondayData: {
          name,
          email,
          medium,
          subscription,
          batch,
          status,
          teacherName
        }
      });
      
      console.log(`✅ [${processedCount}/${mondayItems.length}] Prepared: ${name} (${email}) → ${nextRegNo}`);
      
      // Increment RegNo for next student
      const currentNumber = parseInt(nextRegNo.match(/\d+/)[0]);
      nextRegNo = `STUD${String(currentNumber + 1).padStart(3, '0')}`;
    }
    
    syncReport.newStudentsFound = studentsToAdd.length;
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 PROCESSING SUMMARY');
    console.log('─'.repeat(80));
    console.log(`Total in Monday.com:     ${syncReport.totalInMonday}`);
    console.log(`Already in MongoDB:      ${syncReport.alreadyInMongoDB}`);
    console.log(`Duplicates skipped:      ${syncReport.duplicatesSkipped}`);
    console.log(`Invalid email skipped:   ${syncReport.invalidEmailSkipped}`);
    console.log(`No email skipped:        ${syncReport.skippedStudents.filter(s => s.reason === 'No email').length}`);
    console.log(`New students to add:     ${syncReport.newStudentsFound}`);
    console.log('');
    
    if (studentsToAdd.length === 0) {
      console.log('⚠️  No new students to add (all already exist in MongoDB)');
      console.log('');
      
      // Save report
      const reportFilename = `sync-report-${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(reportFilename, JSON.stringify(syncReport, null, 2));
      console.log(`💾 Report saved to: ${reportFilename}`);
      
      await mongoose.connection.close();
      return;
    }
    
    console.log('⚠️  Ready to add students to MongoDB.');
    console.log('Press Ctrl+C to cancel, or wait 10 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Step 5: Add students to MongoDB
    console.log('💾 Adding students to MongoDB...\n');
    console.log('='.repeat(80));
    
    for (let i = 0; i < studentsToAdd.length; i++) {
      const student = studentsToAdd[i];
      
      try {
        const newStudent = await User.create(student.data);
        syncReport.successfullyAdded++;
        syncReport.addedStudents.push({
          name: student.data.name,
          email: student.data.email,
          regNo: student.data.regNo,
          password: student.plainPassword,
          mongoId: newStudent._id.toString()
        });
        
        console.log(`✅ [${i + 1}/${studentsToAdd.length}] Added: ${student.data.name} (${student.data.regNo})`);
        
        // Progress indicator
        if ((i + 1) % 50 === 0) {
          console.log(`\n📊 Progress: ${i + 1}/${studentsToAdd.length} students added...\n`);
        }
      } catch (error) {
        syncReport.failed++;
        syncReport.failedStudents.push({
          name: student.data.name,
          email: student.data.email,
          regNo: student.data.regNo,
          error: error.message
        });
        
        console.log(`❌ [${i + 1}/${studentsToAdd.length}] Failed: ${student.data.name}`);
        console.log(`   Error: ${error.message}`);
      }
    }
    
    // Step 6: Verify
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 FINAL VERIFICATION');
    console.log('─'.repeat(80));
    
    const finalCount = await User.countDocuments({ role: 'STUDENT' });
    const expectedCount = existingStudents.length + syncReport.successfullyAdded;
    
    console.log(`\nTotal students in MongoDB: ${finalCount}`);
    console.log(`Before sync:               ${existingStudents.length}`);
    console.log(`Successfully added:        ${syncReport.successfullyAdded}`);
    console.log(`Expected total:            ${expectedCount}`);
    
    if (finalCount === expectedCount) {
      console.log('\n✅ Verification successful!');
    } else {
      console.log('\n⚠️  Count mismatch - please check manually');
    }
    
    // Step 7: Generate report
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    syncReport.endTime = new Date().toISOString();
    syncReport.duration = `${Math.floor(duration / 60)}m ${duration % 60}s`;
    syncReport.finalMongoDBCount = finalCount;
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SYNC REPORT');
    console.log('═'.repeat(80));
    console.log(`\n📅 Start Time:              ${syncReport.startTime}`);
    console.log(`📅 End Time:                ${syncReport.endTime}`);
    console.log(`⏱️  Duration:                ${syncReport.duration}`);
    console.log(`\n📊 STATISTICS:`);
    console.log(`   Total in Monday.com:     ${syncReport.totalInMonday}`);
    console.log(`   Already in MongoDB:      ${syncReport.alreadyInMongoDB}`);
    console.log(`   New students found:      ${syncReport.newStudentsFound}`);
    console.log(`   Successfully added:      ${syncReport.successfullyAdded}`);
    console.log(`   Failed:                  ${syncReport.failed}`);
    console.log(`   Duplicates skipped:      ${syncReport.duplicatesSkipped}`);
    console.log(`   Invalid email skipped:   ${syncReport.invalidEmailSkipped}`);
    console.log(`\n✅ FINAL MONGODB COUNT:     ${syncReport.finalMongoDBCount}`);
    
    if (syncReport.failedStudents.length > 0) {
      console.log(`\n⚠️  FAILED STUDENTS (${syncReport.failedStudents.length}):`);
      syncReport.failedStudents.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name} (${s.email})`);
        console.log(`      Error: ${s.error}`);
      });
    }
    
    // Save reports
    const timestamp = new Date().toISOString().split('T')[0];
    const reportFilename = `sync-report-${timestamp}.json`;
    const addedFilename = `added-students-${timestamp}.json`;
    const failedFilename = `failed-students-${timestamp}.json`;
    
    fs.writeFileSync(reportFilename, JSON.stringify(syncReport, null, 2));
    console.log(`\n💾 Full report saved to: ${reportFilename}`);
    
    if (syncReport.addedStudents.length > 0) {
      fs.writeFileSync(addedFilename, JSON.stringify(syncReport.addedStudents, null, 2));
      console.log(`💾 Added students saved to: ${addedFilename}`);
    }
    
    if (syncReport.failedStudents.length > 0) {
      fs.writeFileSync(failedFilename, JSON.stringify(syncReport.failedStudents, null, 2));
      console.log(`💾 Failed students saved to: ${failedFilename}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ FULL SYNC COMPLETE!\n');
    
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');

  } catch (error) {
    console.error('\n❌ SYNC ERROR:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    
    // Save error report
    syncReport.error = error.message;
    const errorFilename = `sync-error-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(errorFilename, JSON.stringify(syncReport, null, 2));
    console.log(`💾 Error report saved to: ${errorFilename}`);
    
    process.exit(1);
  }
}

syncAllStudents();
