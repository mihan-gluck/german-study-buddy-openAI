// Script to export student credentials data to JSON/CSV
// Usage: node scripts/export-credentials-sent.js [--sent|--not-sent|--all] [--format=json|csv]

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const filterType = args.find(arg => arg.startsWith('--'))?.replace('--', '') || 'all';
const formatArg = args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'json';

async function exportCredentialsData() {
  try {
    console.log('📊 Exporting Student Credentials Data\n');
    console.log('='.repeat(80));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get all students
    const allStudents = await User.find({ role: 'STUDENT' })
      .select('name email regNo level subscription lastCredentialsEmailSent createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`📋 Total Students: ${allStudents.length}\n`);

    // Filter based on type
    let studentsToExport = [];
    let filename = '';
    
    switch (filterType) {
      case 'sent':
        studentsToExport = allStudents.filter(s => s.lastCredentialsEmailSent);
        filename = 'students-credentials-sent';
        console.log(`✅ Exporting ${studentsToExport.length} students who received credentials\n`);
        break;
      
      case 'not-sent':
        studentsToExport = allStudents.filter(s => !s.lastCredentialsEmailSent);
        filename = 'students-credentials-not-sent';
        console.log(`❌ Exporting ${studentsToExport.length} students who never received credentials\n`);
        break;
      
      case 'all':
      default:
        studentsToExport = allStudents;
        filename = 'students-credentials-all';
        console.log(`📋 Exporting all ${studentsToExport.length} students\n`);
        break;
    }

    // Add status field
    const exportData = studentsToExport.map(student => ({
      name: student.name,
      email: student.email,
      regNo: student.regNo,
      level: student.level,
      subscription: student.subscription || 'None',
      credentialsSent: student.lastCredentialsEmailSent ? 'Yes' : 'No',
      lastSentDate: student.lastCredentialsEmailSent 
        ? new Date(student.lastCredentialsEmailSent).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Never',
      accountCreated: new Date(student.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      daysWithoutCredentials: student.lastCredentialsEmailSent 
        ? 0 
        : Math.floor((Date.now() - new Date(student.createdAt)) / (1000 * 60 * 60 * 24))
    }));

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Declare filename variables outside the if block
    let csvFilename = '';
    let jsonFilename = '';
    let exportedFilename = '';
    
    // Export based on format
    if (formatArg === 'csv') {
      // Export as CSV
      csvFilename = `${filename}-${timestamp}.csv`;
      exportedFilename = csvFilename;
      const csvPath = path.join(__dirname, '..', csvFilename);
      
      // CSV headers
      const headers = [
        'Name',
        'Email',
        'RegNo',
        'Level',
        'Subscription',
        'Credentials Sent',
        'Last Sent Date',
        'Account Created',
        'Days Without Credentials'
      ];
      
      // CSV rows
      const rows = exportData.map(student => [
        `"${student.name}"`,
        student.email,
        student.regNo,
        student.level,
        student.subscription,
        student.credentialsSent,
        student.lastSentDate,
        student.accountCreated,
        student.daysWithoutCredentials
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      fs.writeFileSync(csvPath, csvContent);
      console.log(`✅ CSV exported successfully!`);
      console.log(`📁 File: ${csvFilename}\n`);
      
    } else {
      // Export as JSON (default)
      jsonFilename = `${filename}-${timestamp}.json`;
      exportedFilename = jsonFilename;
      const jsonPath = path.join(__dirname, '..', jsonFilename);
      
      const jsonData = {
        exportDate: new Date().toISOString(),
        filterType: filterType,
        totalStudents: exportData.length,
        statistics: {
          credentialsSent: exportData.filter(s => s.credentialsSent === 'Yes').length,
          credentialsNotSent: exportData.filter(s => s.credentialsSent === 'No').length,
          bySubscription: {
            SILVER: exportData.filter(s => s.subscription === 'SILVER').length,
            PLATINUM: exportData.filter(s => s.subscription === 'PLATINUM').length,
            None: exportData.filter(s => s.subscription === 'None').length
          },
          byLevel: {
            A1: exportData.filter(s => s.level === 'A1').length,
            A2: exportData.filter(s => s.level === 'A2').length,
            B1: exportData.filter(s => s.level === 'B1').length,
            B2: exportData.filter(s => s.level === 'B2').length,
            C1: exportData.filter(s => s.level === 'C1').length,
            C2: exportData.filter(s => s.level === 'C2').length
          }
        },
        students: exportData
      };
      
      fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
      console.log(`✅ JSON exported successfully!`);
      console.log(`📁 File: ${jsonFilename}\n`);
    }

    // Show summary
    console.log('='.repeat(80));
    console.log('📊 EXPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`Filter Type:          ${filterType}`);
    console.log(`Format:               ${formatArg.toUpperCase()}`);
    console.log(`Total Records:        ${exportData.length}`);
    console.log(`Credentials Sent:     ${exportData.filter(s => s.credentialsSent === 'Yes').length}`);
    console.log(`Credentials Not Sent: ${exportData.filter(s => s.credentialsSent === 'No').length}`);
    console.log('='.repeat(80));
    console.log('\n');

    // Show file location
    console.log('📍 File Location:');
    console.log(`   ${path.join(__dirname, '..')}${path.sep}${exportedFilename}`);
    console.log('\n');

    console.log('✅ Export complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Show usage if help requested
if (args.includes('--help') || args.includes('-h')) {
  console.log('\n📖 USAGE:');
  console.log('='.repeat(80));
  console.log('node scripts/export-credentials-sent.js [OPTIONS]\n');
  console.log('OPTIONS:');
  console.log('  --sent              Export only students who received credentials');
  console.log('  --not-sent          Export only students who never received credentials');
  console.log('  --all               Export all students (default)');
  console.log('  --format=json       Export as JSON (default)');
  console.log('  --format=csv        Export as CSV');
  console.log('  --help, -h          Show this help message\n');
  console.log('EXAMPLES:');
  console.log('  node scripts/export-credentials-sent.js --sent');
  console.log('  node scripts/export-credentials-sent.js --not-sent --format=csv');
  console.log('  node scripts/export-credentials-sent.js --all --format=json');
  console.log('='.repeat(80));
  console.log('\n');
  process.exit(0);
}

// Run the script
exportCredentialsData();
