#!/usr/bin/env node

/**
 * Test Admin Module Deletion
 * 
 * This script tests the actual deletion process for the admin user
 * to identify why the deletion might be failing.
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

async function testAdminModuleDeletion() {
  try {
    console.log('🧪 Testing Admin Module Deletion...\n');

    // Connect to MongoDB to get module info
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the specific module
    const moduleName = "Restaurant Conversation - English Practice";
    const module = await LearningModule.findOne({ 
      title: { $regex: moduleName, $options: 'i' }
    });

    if (!module) {
      console.log(`❌ Module "${moduleName}" not found`);
      return;
    }

    console.log('📋 Module to Delete:');
    console.log('  Title:', module.title);
    console.log('  ID:', module._id);
    console.log('  Is Active:', module.isActive);

    // Step 1: Login as admin
    console.log('\n🔐 Step 1: Authenticating as admin...');
    
    try {
      const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
        email: 'techintern2@gluckglobal.com',
        password: 'password123'
      });

      const token = loginResponse.data.token;
      const adminUser = loginResponse.data.user;
      
      console.log('✅ Admin authenticated successfully');
      console.log('  Name:', adminUser.name);
      console.log('  Role:', adminUser.role);
      console.log('  ID:', adminUser.id);

      // Step 2: Test the deletion API directly
      console.log('\n🗑️ Step 2: Testing deletion API...');
      
      try {
        const deleteResponse = await axios.delete(`http://localhost:4000/api/learning-modules/${module._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Deletion API Response:');
        console.log('  Status:', deleteResponse.status);
        console.log('  Message:', deleteResponse.data.message);
        console.log('  Module Title:', deleteResponse.data.moduleTitle);

        // Verify the module is soft-deleted
        const updatedModule = await LearningModule.findById(module._id);
        
        console.log('\n📋 Module Status After Deletion:');
        console.log('  Is Active:', updatedModule.isActive);
        console.log('  Last Updated By:', updatedModule.lastUpdatedBy);
        
        if (!updatedModule.isActive) {
          console.log('✅ Module successfully soft-deleted!');
        } else {
          console.log('❌ Module deletion failed - still active');
        }

      } catch (deleteError) {
        console.log('❌ Deletion API Error:');
        console.log('  Status:', deleteError.response?.status);
        console.log('  Message:', deleteError.response?.data?.message || deleteError.message);
        
        if (deleteError.response?.status === 403) {
          console.log('  🔒 Permission denied - check admin role');
        } else if (deleteError.response?.status === 404) {
          console.log('  🔍 Module not found');
        } else if (deleteError.response?.status === 500) {
          console.log('  🔥 Server error - check backend logs');
        }
      }

      // Step 3: Test frontend permission check
      console.log('\n🎯 Step 3: Testing frontend permission logic...');
      
      // Simulate the canDeleteModule function
      const canDelete = (currentUser, moduleToDelete) => {
        if (!currentUser) return false;
        
        // Admins can delete any module
        if (currentUser.role === 'ADMIN') return true;
        
        // Teachers can delete modules they created
        if (currentUser.role === 'TEACHER') {
          return moduleToDelete.createdBy === currentUser.id || 
                 moduleToDelete.createdBy?.toString() === currentUser.id?.toString();
        }
        
        // Students cannot delete modules
        return false;
      };

      const frontendCanDelete = canDelete(adminUser, module);
      console.log('Frontend canDeleteModule result:', frontendCanDelete ? '✅ CAN DELETE' : '❌ CANNOT DELETE');

    } catch (loginError) {
      console.log('❌ Login Error:');
      console.log('  Status:', loginError.response?.status);
      console.log('  Message:', loginError.response?.data?.message || loginError.message);
      console.log('  Data:', loginError.response?.data);
      
      if (loginError.response?.status === 400) {
        console.log('  🔑 Invalid credentials - check email/password');
      }
      
      return; // Exit if login fails
    }

    // Step 4: Check for common issues
    console.log('\n🔍 Step 4: Checking for common issues...');
    
    console.log('Admin Role Check:', adminUser.role === 'ADMIN' ? '✅ ADMIN' : '❌ NOT ADMIN');
    console.log('Module Exists:', module ? '✅ EXISTS' : '❌ NOT FOUND');
    console.log('Module Active:', module.isActive ? '✅ ACTIVE' : '❌ INACTIVE');
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. If API deletion worked but UI doesn\'t show delete button:');
    console.log('   - Check browser console for JavaScript errors');
    console.log('   - Verify currentUser object in browser: localStorage.getItem("currentUser")');
    console.log('   - Try hard refresh (Ctrl+F5) to clear cache');
    
    console.log('\n2. If delete button appears but clicking does nothing:');
    console.log('   - Check browser Network tab for failed requests');
    console.log('   - Look for CORS or authentication errors');
    console.log('   - Verify the confirmation dialog appears');
    
    console.log('\n3. If you get permission errors:');
    console.log('   - Ensure you\'re logged in as admin@germanbuddy.com');
    console.log('   - Check that the JWT token is valid');
    console.log('   - Try logging out and logging back in');

  } catch (error) {
    console.error('❌ Error testing admin module deletion:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔥 Server Connection Error:');
      console.log('  Make sure the backend server is running on port 4000');
      console.log('  Run: npm start or node app.js');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testAdminModuleDeletion();