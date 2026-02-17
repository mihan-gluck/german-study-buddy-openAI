// test-delete-all-documents.js
// Delete all uploaded documents for STUD042

const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const BASE_URL = 'http://localhost:4000';

// Create axios instance with cookie support
const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar }));

async function deleteAllDocuments() {
  try {
    console.log('🗑️  Testing Document Deletion for STUD042\n');
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
    
    // Step 2: Get all documents
    console.log('\n📂 Step 2: Fetching all documents...');
    const documentsResponse = await client.get(`${BASE_URL}/api/student-documents/my-documents`);
    
    const documents = documentsResponse.data.documents || [];
    console.log(`✅ Found ${documents.length} documents`);
    
    if (documents.length === 0) {
      console.log('\n✨ No documents to delete. Student account is clean!');
      console.log('=' .repeat(100) + '\n');
      return;
    }
    
    // Show all documents
    console.log('\n📄 Documents to be deleted:');
    documents.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.documentName} (${doc.documentTypeDisplay}) - ${doc.status}`);
    });
    
    // Step 3: Delete each document
    console.log('\n🗑️  Step 3: Deleting documents...\n');
    console.log('─'.repeat(100));
    
    const results = {
      deleted: [],
      failed: [],
      skipped: []
    };
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      
      try {
        console.log(`\n[${i + 1}/${documents.length}] Deleting: ${doc.documentName}`);
        console.log(`   Type: ${doc.documentTypeDisplay}`);
        console.log(`   Status: ${doc.status}`);
        
        // Check if document is verified (cannot be deleted)
        if (doc.status === 'VERIFIED') {
          console.log(`   ⚠️  SKIPPED - Cannot delete verified documents`);
          results.skipped.push({
            name: doc.documentName,
            type: doc.documentTypeDisplay,
            reason: 'Document is verified'
          });
          continue;
        }
        
        const deleteResponse = await client.delete(
          `${BASE_URL}/api/student-documents/${doc._id}`
        );
        
        if (deleteResponse.data.success) {
          console.log(`   ✅ DELETED successfully`);
          results.deleted.push({
            name: doc.documentName,
            type: doc.documentTypeDisplay,
            id: doc._id
          });
        } else {
          console.log(`   ❌ FAILED: ${deleteResponse.data.message}`);
          results.failed.push({
            name: doc.documentName,
            type: doc.documentTypeDisplay,
            error: deleteResponse.data.message
          });
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        
        if (error.response?.data?.message) {
          console.log(`   Details: ${error.response.data.message}`);
        }
        
        results.failed.push({
          name: doc.documentName,
          type: doc.documentTypeDisplay,
          error: error.response?.data?.message || error.message
        });
      }
    }
    
    // Step 4: Verify deletion
    console.log('\n\n📂 Step 4: Verifying deletion...');
    console.log('─'.repeat(100));
    
    const verifyResponse = await client.get(`${BASE_URL}/api/student-documents/my-documents`);
    const remainingDocs = verifyResponse.data.documents || [];
    
    console.log(`\n✅ Remaining documents: ${remainingDocs.length}`);
    
    if (remainingDocs.length > 0) {
      console.log('\n📄 Documents still in system:');
      remainingDocs.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.documentName} (${doc.documentTypeDisplay}) - ${doc.status}`);
      });
    } else {
      console.log('\n✨ All documents deleted! Student account is clean.');
    }
    
    // Step 5: Get updated statistics
    console.log('\n\n📊 Step 5: Updated statistics...');
    console.log('─'.repeat(100));
    
    const statsResponse = await client.get(`${BASE_URL}/api/student-documents/stats`);
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.stats;
      console.log(`\n   Total Documents: ${stats.totalDocuments}`);
      console.log(`   Verified: ${stats.verifiedDocuments}`);
      console.log(`   Pending: ${stats.pendingDocuments}`);
      console.log(`   Rejected: ${stats.rejectedDocuments}`);
    }
    
    // Final Summary
    console.log('\n\n' + '='.repeat(100));
    console.log('📋 DELETION TEST SUMMARY');
    console.log('='.repeat(100));
    
    console.log(`\n✅ Successfully Deleted: ${results.deleted.length}/${documents.length}`);
    if (results.deleted.length > 0) {
      results.deleted.forEach(doc => {
        console.log(`   ✓ ${doc.name} (${doc.type})`);
      });
    }
    
    if (results.skipped.length > 0) {
      console.log(`\n⚠️  Skipped: ${results.skipped.length}/${documents.length}`);
      results.skipped.forEach(doc => {
        console.log(`   ⊘ ${doc.name} (${doc.type})`);
        console.log(`     Reason: ${doc.reason}`);
      });
    }
    
    if (results.failed.length > 0) {
      console.log(`\n❌ Failed to Delete: ${results.failed.length}/${documents.length}`);
      results.failed.forEach(doc => {
        console.log(`   ✗ ${doc.name} (${doc.type})`);
        console.log(`     Error: ${doc.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(100));
    
    if (results.failed.length === 0 && results.skipped.length === 0) {
      console.log('🎉 ALL DOCUMENTS DELETED SUCCESSFULLY!');
    } else if (results.failed.length === 0) {
      console.log('✅ All deletable documents removed successfully!');
      console.log('⚠️  Some verified documents were skipped (cannot be deleted by students)');
    } else {
      console.log('⚠️  Some deletions failed. Check the errors above.');
    }
    
    console.log('\n💡 Notes:');
    console.log('   • Students cannot delete VERIFIED documents');
    console.log('   • Only PENDING and REJECTED documents can be deleted');
    console.log('   • Physical files are also removed from the server');
    console.log('   • Admin can delete any document regardless of status');
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

deleteAllDocuments();
