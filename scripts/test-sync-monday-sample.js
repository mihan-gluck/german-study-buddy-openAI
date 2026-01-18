// scripts/test-sync-monday-sample.js
// Test sync 2-3 students from Monday.com with auto-generated RegNos

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const axios = require('axios');
const bcrypt = require('bcrypt');

// Monday.com API configuration
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID;
const MONDAY_API_URL = 'https://api.monday.com/v2';

// Column ID mappings (based on preview)
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
  
  // Extract level from status like "A1 Ongoing", "B 1 Ongoing", "A 2 Ongoing"
  const match = statusText.match(/([ABC])\s*(\d)/i);
  if (match) {
    return `${match[1].toUpperCase()}${match[2]}`;
  }
  
  return 'A1'; // Default
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
  
  // Extract number from "Batch 11", "Batch 5", etc.
  const match = batchText.match(/\d+/);
  return match ? match[0] : '1';
}

// Helper function to find teacher by name
async function findTeacherByName(teacherName) {
  if (!teacherName) {
    // Return default teacher (Aiswarya)
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
    
    // If not found, return default teacher (Aiswarya)
    console.log(`⚠️  Teacher "${teacherName}" not found, using default teacher`);
    const defaultTeacher = await User.findOne({ role: 'TEACHER', isActive: true });
    return defaultTeacher ? defaultTeacher._id : null;
  } catch (error) {
    console.log(`⚠️  Error finding teacher: ${teacherName}`);
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
    
    // Extract numbers from RegNos like "STUD024"
    const numbers = students
      .map(s => {
        const match = s.regNo.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      })
      .filter(n => n > 0);
    
    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    
    // Format with leading zeros (STUD025, STUD026, etc.)
    return `STUD${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error getting next RegNo:', error);
    return 'STUD001';
  }
}

async function testSyncSample() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Get next RegNo
    console.log('🔢 Finding next available RegNo...');
    let nextRegNo = await getNextRegNo();
    console.log(`✅ Next RegNo will be: ${nextRegNo}\n`);

    // Step 2: Fetch students from Monday.com
    console.log('🌐 Fetching students from Monday.com...');
    
    const query = `
      query {
        boards(ids: [${MONDAY_BOARD_ID}]) {
          name
          items_page(limit: 10) {
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

    console.log(`✅ Found ${mondayItems.length} students in Monday.com\n`);

    // Step 3: Get existing students from MongoDB
    console.log('📊 Fetching existing students from MongoDB...');
    const existingStudents = await User.find({ role: 'STUDENT' })
      .select('email regNo')
      .lean();
    
    console.log(`✅ Found ${existingStudents.length} existing students\n`);

    // Step 4: Process first 3 students that don't exist in MongoDB
    console.log('🔄 Processing students...\n');
    console.log('='.repeat(80));
    
    let processedCount = 0;
    const studentsToAdd = [];
    
    for (const item of mondayItems) {
      if (processedCount >= 3) break; // Only process 3 students
      
      const name = item.name;
      const email = getColumnValue(item, COLUMN_MAPPING.email);
      
      // Skip if no email
      if (!email) {
        console.log(`⏭️  Skipping "${name}" - No email\n`);
        continue;
      }
      
      // Skip if already exists
      const exists = existingStudents.some(s => 
        s.email === email || s.regNo === nextRegNo
      );
      
      if (exists) {
        console.log(`⏭️  Skipping "${name}" - Already exists in MongoDB\n`);
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
      
      // Display transformation
      console.log(`\n📝 STUDENT ${processedCount + 1}: ${name}`);
      console.log('─'.repeat(80));
      console.log('\n📊 MONDAY.COM DATA:');
      console.log(`   Name:         ${name}`);
      console.log(`   Email:        ${email}`);
      console.log(`   Medium:       ${medium}`);
      console.log(`   Subscription: ${subscription}`);
      console.log(`   Batch:        ${batch}`);
      console.log(`   Status:       ${status}`);
      console.log(`   Teacher:      ${teacherName || 'Not assigned'}`);
      
      console.log('\n⬇️  TRANSFORMATION:');
      console.log(`   RegNo:        ${nextRegNo} (auto-generated)`);
      console.log(`   Level:        ${level} (extracted from status)`);
      console.log(`   Subscription: ${mappedSubscription} (mapped)`);
      console.log(`   Status:       ${mappedStatus} (mapped)`);
      console.log(`   Batch:        ${batchNumber} (extracted)`);
      console.log(`   Medium:       [${mediumArray.join(', ')}] (array)`);
      console.log(`   Teacher ID:   ${teacherId || 'null'} (looked up)`);
      console.log(`   Password:     ${plainPassword} (generated)`);
      
      console.log('\n✅ MONGODB DOCUMENT:');
      console.log(JSON.stringify({
        _id: '(will be auto-generated)',
        name: studentData.name,
        email: studentData.email,
        regNo: studentData.regNo,
        password: '(hashed with bcrypt)',
        role: studentData.role,
        subscription: studentData.subscription,
        level: studentData.level,
        batch: studentData.batch,
        medium: studentData.medium,
        assignedTeacher: studentData.assignedTeacher,
        studentStatus: studentData.studentStatus,
        isActive: studentData.isActive
      }, null, 2));
      
      console.log('\n' + '='.repeat(80));
      
      processedCount++;
      
      // Increment RegNo for next student
      const currentNumber = parseInt(nextRegNo.match(/\d+/)[0]);
      nextRegNo = `STUD${String(currentNumber + 1).padStart(3, '0')}`;
    }
    
    if (studentsToAdd.length === 0) {
      console.log('\n⚠️  No new students to add (all already exist in MongoDB)');
      await mongoose.connection.close();
      return;
    }
    
    // Step 5: Confirm before adding
    console.log('\n\n📋 SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nStudents to add: ${studentsToAdd.length}`);
    console.log('\nStudents:');
    studentsToAdd.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.data.name} (${s.data.email}) - RegNo: ${s.data.regNo}`);
    });
    
    console.log('\n⚠️  This is a TEST. Students will be added to MongoDB.');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 6: Add students to MongoDB
    console.log('💾 Adding students to MongoDB...\n');
    
    for (const student of studentsToAdd) {
      try {
        const newStudent = await User.create(student.data);
        console.log(`✅ Added: ${student.data.name} (${student.data.regNo})`);
        console.log(`   Password: ${student.plainPassword}`);
        console.log(`   MongoDB ID: ${newStudent._id}\n`);
      } catch (error) {
        console.log(`❌ Failed to add ${student.data.name}:`);
        console.log(`   Error: ${error.message}\n`);
      }
    }
    
    // Step 7: Verify
    console.log('\n📊 VERIFICATION');
    console.log('='.repeat(80));
    
    const finalCount = await User.countDocuments({ role: 'STUDENT' });
    console.log(`\nTotal students in MongoDB: ${finalCount}`);
    console.log(`Before: ${existingStudents.length}`);
    console.log(`Added: ${studentsToAdd.length}`);
    console.log(`Expected: ${existingStudents.length + studentsToAdd.length}`);
    
    if (finalCount === existingStudents.length + studentsToAdd.length) {
      console.log('\n✅ Verification successful!');
    } else {
      console.log('\n⚠️  Count mismatch - please check manually');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ TEST SYNC COMPLETE!\n');
    
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

testSyncSample();
