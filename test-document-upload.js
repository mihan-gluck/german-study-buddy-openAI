// test-document-upload.js
// Test document upload functionality for STUD042

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

async function testDocumentUpload() {
  try {
    console.log('🧪 Testing Document Upload Functionality\n');
    console.log('=' .repeat(80));
    
    // Step 1: Login as student
    console.log('\n📝 Step 1: Logging in as STUD042...');
    const loginResponse = await client.post(`${BASE_URL}/api/auth/login`, {
      regNo: 'STUD042',
      password: 'Student042@2026'
    });
    
    if (!loginResponse.data.user) {
      console.error('❌ Login failed');
      console.error('Response data:', loginResponse.data);
      return;
    }
    
    const student = loginResponse.data.user;
    console.log('✅ Login successful!');
    console.log(`   Student: ${student.name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Role: ${student.role}`);
    
    // Step 2: Check if test file exists
    console.log('\n📁 Step 2: Checking for test file...');
    const testFilePath = path.join(__dirname, 'baby cv.pdf');
    
    if (!fs.existsSync(testFilePath)) {
      console.log('⚠️  Test file "baby cv.pdf" not found in current directory');
      console.log('   Creating a dummy test file for demonstration...');
      
      // Create a dummy PDF-like file for testing
      const dummyContent = '%PDF-1.4\nTest Document Content\n';
      fs.writeFileSync(testFilePath, dummyContent);
      console.log('✅ Dummy test file created');
    } else {
      console.log('✅ Test file found:', testFilePath);
    }
    
    // Step 3: Get document requirements
    console.log('\n📋 Step 3: Fetching document requirements...');
    const requirementsResponse = await client.get(`${BASE_URL}/api/student-documents/requirements`);
    
    console.log('✅ Document requirements fetched');
    console.log('   Available document types:');
    if (requirementsResponse.data.requirements && requirementsResponse.data.requirements.length > 0) {
      requirementsResponse.data.requirements.forEach(req => {
        console.log(`   - ${req.name} (${req.type}) ${req.required ? '[REQUIRED]' : ''}`);
      });
    } else {
      console.log('   - CV');
      console.log('   - O_LEVEL_CERTIFICATE');
      console.log('   - A_LEVEL_CERTIFICATE');
      console.log('   - PASSPORT');
      console.log('   - DEGREE_DIPLOMA');
    }
    
    // Step 4: Upload document as A Level Certificate
    console.log('\n📤 Step 4: Uploading "baby cv" as A Level Certificate...');
    
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath));
    formData.append('documentType', 'A_LEVEL_CERTIFICATE');
    formData.append('documentName', 'baby cv');
    formData.append('description', 'Test upload of A Level Certificate');
    
    const uploadResponse = await client.post(
      `${BASE_URL}/api/student-documents/upload`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    if (uploadResponse.data.success) {
      console.log('✅ Document uploaded successfully!');
      console.log('   Document ID:', uploadResponse.data.document._id);
      console.log('   Document Name:', uploadResponse.data.document.documentName);
      console.log('   Document Type:', uploadResponse.data.document.documentTypeDisplay);
      console.log('   File Size:', uploadResponse.data.document.formattedFileSize);
      console.log('   Status:', uploadResponse.data.document.status);
      console.log('   Uploaded At:', new Date(uploadResponse.data.document.uploadedAt).toLocaleString());
    } else {
      console.error('❌ Upload failed:', uploadResponse.data.message);
      return;
    }
    
    // Step 5: Verify document appears in student's documents
    console.log('\n📂 Step 5: Fetching student documents to verify...');
    const documentsResponse = await client.get(`${BASE_URL}/api/student-documents/my-documents`);
    
    console.log('✅ Documents fetched successfully');
    console.log(`   Total documents: ${documentsResponse.data.totalDocuments}`);
    
    if (documentsResponse.data.documents && documentsResponse.data.documents.length > 0) {
      console.log('\n   📄 Your uploaded documents:');
      documentsResponse.data.documents.forEach((doc, index) => {
        console.log(`\n   ${index + 1}. ${doc.documentName}`);
        console.log(`      Type: ${doc.documentTypeDisplay}`);
        console.log(`      Status: ${doc.status}`);
        console.log(`      Size: ${doc.formattedFileSize}`);
        console.log(`      Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}`);
      });
    }
    
    // Step 6: Get document statistics
    console.log('\n📊 Step 6: Fetching document statistics...');
    const statsResponse = await client.get(`${BASE_URL}/api/student-documents/stats`);
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.stats;
      console.log('✅ Statistics fetched');
      console.log(`   Total Documents: ${stats.totalDocuments}`);
      console.log(`   Verified: ${stats.verifiedDocuments}`);
      console.log(`   Pending: ${stats.pendingDocuments}`);
      console.log(`   Rejected: ${stats.rejectedDocuments}`);
      console.log(`   Completion: ${stats.completionPercentage}%`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Document upload test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check the uploads/student-documents folder for the uploaded file');
    console.log('   2. Login to the web app as STUD042 to see the document in the UI');
    console.log('   3. Login as admin to verify/reject the document');
    console.log('='.repeat(80) + '\n');
    
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

testDocumentUpload();
