// test-all-document-types.js
// Test uploading to all document types

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const BASE_URL = 'http://localhost:4000';

// Create axios instance with cookie support
const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar }));

// All document types to test
const documentTypes = [
  { type: 'CV', name: 'baby cv - CV' },
  { type: 'O_LEVEL_CERTIFICATE', name: 'baby cv - O Level Certificate' },
  { type: 'A_LEVEL_CERTIFICATE', name: 'baby cv - A Level Certificate' },
  { type: 'BROWN_CERTIFICATE', name: 'baby cv - Brown Certificate' },
  { type: 'DEGREE_DIPLOMA', name: 'baby cv - Degree/Diploma' },
  { type: 'ACADEMIC_TRANSCRIPT', name: 'baby cv - Academic Transcript' },
  { type: 'PASSPORT', name: 'baby cv - Passport' },
  { type: 'EXPERIENCE_LETTER', name: 'baby cv - Experience Letter' },
  { type: 'LANGUAGE_CERTIFICATE', name: 'baby cv - Language Certificate' },
  { type: 'EXTRACURRICULAR_CERTIFICATE', name: 'baby cv - Extracurricular Certificate' },
  { type: 'AFFIDAVIT', name: 'baby cv - Affidavit' },
  { type: 'POLICE_CLEARANCE', name: 'baby cv - Police Clearance' },
  { type: 'OTHER', name: 'baby cv - Other Document' }
];

async function testAllDocumentTypes() {
  try {
    console.log('🧪 Testing All Document Types Upload\n');
    console.log('=' .repeat(100));
    
    // Step 1: Login as student
    console.log('\n📝 Step 1: Logging in as STUD042...');
    const loginResponse = await client.post(`${BASE_URL}/api/auth/login`, {
      regNo: 'STUD042',
      password: 'Student042@2026'
    });
    
    if (!loginResponse.data.user) {
      console.error('❌ Login failed');
      return;
    }
    
    const student = loginResponse.data.user;
    console.log('✅ Login successful!');
    console.log(`   Student: ${student.name}`);
    console.log(`   Email: ${student.email}`);
    
    // Step 2: Check/Create test file
    console.log('\n📁 Step 2: Preparing test file...');
    const testFilePath = path.join(__dirname, 'baby cv.pdf');
    
    if (!fs.existsSync(testFilePath)) {
      const dummyContent = '%PDF-1.4\nTest Document Content for All Document Types\n';
      fs.writeFileSync(testFilePath, dummyContent);
      console.log('✅ Test file created');
    } else {
      console.log('✅ Test file found');
    }
    
    // Step 3: Upload to all document types
    console.log('\n📤 Step 3: Uploading to all document types...\n');
    console.log('─'.repeat(100));
    
    const results = {
      successful: [],
      failed: []
    };
    
    for (let i = 0; i < documentTypes.length; i++) {
      const docType = documentTypes[i];
      
      try {
        console.log(`\n[${i + 1}/${documentTypes.length}] Uploading as: ${docType.name}`);
        
        const formData = new FormData();
        formData.append('document', fs.createReadStream(testFilePath));
        formData.append('documentType', docType.type);
        formData.append('documentName', docType.name);
        formData.append('description', `Test upload for ${docType.type}`);
        
        const uploadResponse = await client.post(
          `${BASE_URL}/api/student-documents/upload`,
          formData,
          {
            headers: formData.getHeaders()
          }
        );
        
        if (uploadResponse.data.success) {
          console.log(`   ✅ SUCCESS`);
          console.log(`      Document ID: ${uploadResponse.data.document._id}`);
          console.log(`      Status: ${uploadResponse.data.document.status}`);
          console.log(`      Size: ${uploadResponse.data.document.formattedFileSize}`);
          
          results.successful.push({
            type: docType.type,
            name: docType.name,
            id: uploadResponse.data.document._id
          });
        } else {
          console.log(`   ❌ FAILED: ${uploadResponse.data.message}`);
          results.failed.push({
            type: docType.type,
            name: docType.name,
            error: uploadResponse.data.message
          });
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        results.failed.push({
          type: docType.type,
          name: docType.name,
          error: error.message
        });
      }
    }
    
    // Step 4: Verify all documents
    console.log('\n\n📂 Step 4: Fetching all uploaded documents...');
    console.log('─'.repeat(100));
    
    const documentsResponse = await client.get(`${BASE_URL}/api/student-documents/my-documents`);
    
    console.log(`\n✅ Total documents in system: ${documentsResponse.data.totalDocuments}`);
    
    if (documentsResponse.data.documents && documentsResponse.data.documents.length > 0) {
      console.log('\n📄 All uploaded documents:');
      documentsResponse.data.documents.forEach((doc, index) => {
        console.log(`\n   ${index + 1}. ${doc.documentName}`);
        console.log(`      Type: ${doc.documentTypeDisplay}`);
        console.log(`      Status: ${doc.status}`);
        console.log(`      Size: ${doc.formattedFileSize}`);
        console.log(`      Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}`);
      });
    }
    
    // Step 5: Get statistics
    console.log('\n\n📊 Step 5: Document statistics...');
    console.log('─'.repeat(100));
    
    const statsResponse = await client.get(`${BASE_URL}/api/student-documents/stats`);
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.stats;
      console.log(`\n   Total Documents: ${stats.totalDocuments}`);
      console.log(`   Verified: ${stats.verifiedDocuments}`);
      console.log(`   Pending: ${stats.pendingDocuments}`);
      console.log(`   Rejected: ${stats.rejectedDocuments}`);
      console.log(`   Completion: ${stats.completionPercentage}%`);
    }
    
    // Final Summary
    console.log('\n\n' + '='.repeat(100));
    console.log('📋 UPLOAD TEST SUMMARY');
    console.log('='.repeat(100));
    
    console.log(`\n✅ Successful Uploads: ${results.successful.length}/${documentTypes.length}`);
    if (results.successful.length > 0) {
      results.successful.forEach(doc => {
        console.log(`   ✓ ${doc.name}`);
      });
    }
    
    if (results.failed.length > 0) {
      console.log(`\n❌ Failed Uploads: ${results.failed.length}/${documentTypes.length}`);
      results.failed.forEach(doc => {
        console.log(`   ✗ ${doc.name}`);
        console.log(`     Error: ${doc.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(100));
    
    if (results.failed.length === 0) {
      console.log('🎉 ALL DOCUMENT TYPES UPLOADED SUCCESSFULLY!');
    } else {
      console.log('⚠️  Some uploads failed. Check the errors above.');
    }
    
    console.log('\n💡 Next steps:');
    console.log('   1. Check uploads/student-documents folder for all files');
    console.log('   2. Login to web app as STUD042 to see all documents');
    console.log('   3. Login as admin to verify/reject documents');
    console.log('='.repeat(100) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Backend server is not running!');
      console.error('   Start it with: node app.js');
    }
  }
}

testAllDocumentTypes();
