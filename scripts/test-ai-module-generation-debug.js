#!/usr/bin/env node

/**
 * Debug AI Module Generation
 * 
 * This script tests the AI module generation API to identify
 * where "undefined" values are coming from in the response.
 */

require('dotenv').config();
const axios = require('axios');

async function testAIModuleGeneration() {
  try {
    console.log('🧪 Testing AI Module Generation API...\n');

    // Test data for standard module generation
    const testData = {
      targetLanguage: 'English',
      nativeLanguage: 'German',
      level: 'A1',
      category: 'Conversation',
      difficulty: 'Beginner',
      description: 'A module about ordering food in a restaurant, including greetings, menu vocabulary, asking questions about dishes, dietary restrictions, making requests, and paying the bill. Students should learn polite expressions and cultural etiquette.',
      estimatedDuration: 30,
      moduleType: 'standard',
      generateVocabulary: true,
      generateExercises: true,
      generateConversation: true,
      generateCulturalNotes: true
    };

    console.log('📋 Test Request Data:');
    console.log(JSON.stringify(testData, null, 2));

    // First, get a teacher token for authentication
    console.log('\n🔐 Getting teacher authentication...');
    
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'teacher@germanbuddy.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Teacher authenticated successfully');

    // Now test the AI generation API
    console.log('\n🤖 Calling AI Module Generation API...');
    
    const response = await axios.post('http://localhost:4000/api/ai/generate-module', testData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📊 AI Generation Response:');
    console.log('Status:', response.status);
    console.log('Response Data Structure:');
    
    const moduleData = response.data;
    
    // Check for undefined values in key fields
    console.log('\n🔍 Checking for undefined values:');
    console.log('title:', moduleData.title, '(type:', typeof moduleData.title, ')');
    console.log('description:', moduleData.description ? moduleData.description.substring(0, 100) + '...' : moduleData.description, '(type:', typeof moduleData.description, ')');
    console.log('targetLanguage:', moduleData.targetLanguage, '(type:', typeof moduleData.targetLanguage, ')');
    console.log('nativeLanguage:', moduleData.nativeLanguage, '(type:', typeof moduleData.nativeLanguage, ')');
    console.log('level:', moduleData.level, '(type:', typeof moduleData.level, ')');
    console.log('category:', moduleData.category, '(type:', typeof moduleData.category, ')');
    console.log('difficulty:', moduleData.difficulty, '(type:', typeof moduleData.difficulty, ')');
    console.log('estimatedDuration:', moduleData.estimatedDuration, '(type:', typeof moduleData.estimatedDuration, ')');

    // Check content structure
    console.log('\n📚 Content Structure:');
    console.log('content exists:', !!moduleData.content);
    if (moduleData.content) {
      console.log('allowedVocabulary length:', moduleData.content.allowedVocabulary?.length || 0);
      console.log('exercises length:', moduleData.content.exercises?.length || 0);
      console.log('examples length:', moduleData.content.examples?.length || 0);
      console.log('keyTopics length:', moduleData.content.keyTopics?.length || 0);
    }

    // Check learning objectives
    console.log('\n🎯 Learning Objectives:');
    console.log('learningObjectives length:', moduleData.learningObjectives?.length || 0);
    if (moduleData.learningObjectives && moduleData.learningObjectives.length > 0) {
      console.log('First objective:', moduleData.learningObjectives[0]);
    }

    // Check AI tutor config
    console.log('\n🤖 AI Tutor Config:');
    console.log('aiTutorConfig exists:', !!moduleData.aiTutorConfig);
    if (moduleData.aiTutorConfig) {
      console.log('personality:', moduleData.aiTutorConfig.personality);
      console.log('focusAreas length:', moduleData.aiTutorConfig.focusAreas?.length || 0);
    }

    // Look for any undefined values in the entire object
    console.log('\n🔍 Scanning for undefined values...');
    const undefinedFields = findUndefinedFields(moduleData);
    if (undefinedFields.length > 0) {
      console.log('❌ Found undefined fields:');
      undefinedFields.forEach(field => console.log('  -', field));
    } else {
      console.log('✅ No undefined fields found');
    }

    // Check for null values
    console.log('\n🔍 Scanning for null values...');
    const nullFields = findNullFields(moduleData);
    if (nullFields.length > 0) {
      console.log('⚠️ Found null fields:');
      nullFields.forEach(field => console.log('  -', field));
    } else {
      console.log('✅ No null fields found');
    }

    // Check for empty string values
    console.log('\n🔍 Scanning for empty string values...');
    const emptyFields = findEmptyStringFields(moduleData);
    if (emptyFields.length > 0) {
      console.log('⚠️ Found empty string fields:');
      emptyFields.forEach(field => console.log('  -', field));
    } else {
      console.log('✅ No empty string fields found');
    }

    console.log('\n📋 Full Response (first 500 chars):');
    console.log(JSON.stringify(moduleData, null, 2).substring(0, 500) + '...');

    console.log('\n✅ AI Module Generation test completed!');

  } catch (error) {
    console.error('❌ Error testing AI module generation:', error.response?.data || error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
  }
}

// Helper function to find undefined fields recursively
function findUndefinedFields(obj, path = '') {
  const undefinedFields = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value === undefined) {
      undefinedFields.push(currentPath);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      undefinedFields.push(...findUndefinedFields(value, currentPath));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item === undefined) {
          undefinedFields.push(`${currentPath}[${index}]`);
        } else if (item !== null && typeof item === 'object') {
          undefinedFields.push(...findUndefinedFields(item, `${currentPath}[${index}]`));
        }
      });
    }
  }
  
  return undefinedFields;
}

// Helper function to find null fields recursively
function findNullFields(obj, path = '') {
  const nullFields = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value === null) {
      nullFields.push(currentPath);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      nullFields.push(...findNullFields(value, currentPath));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item === null) {
          nullFields.push(`${currentPath}[${index}]`);
        } else if (item !== null && typeof item === 'object') {
          nullFields.push(...findNullFields(item, `${currentPath}[${index}]`));
        }
      });
    }
  }
  
  return nullFields;
}

// Helper function to find empty string fields recursively
function findEmptyStringFields(obj, path = '') {
  const emptyFields = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value === '') {
      emptyFields.push(currentPath);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      emptyFields.push(...findEmptyStringFields(value, currentPath));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item === '') {
          emptyFields.push(`${currentPath}[${index}]`);
        } else if (item !== null && typeof item === 'object') {
          emptyFields.push(...findEmptyStringFields(item, `${currentPath}[${index}]`));
        }
      });
    }
  }
  
  return emptyFields;
}

// Run the test
testAIModuleGeneration();