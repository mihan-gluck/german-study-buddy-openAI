// Health Check Script for GermanBuddy Application
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 GERMANBUDDY APPLICATION HEALTH CHECK\n');
console.log('='.repeat(60));

// 1. Environment Variables Check
console.log('\n📋 1. ENVIRONMENT VARIABLES:');
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'OPENAI_API_KEY',
  'ZOOM_CLIENT_ID',
  'ZOOM_CLIENT_SECRET',
  'ZOOM_ACCOUNT_ID',
  'EMAIL_USER',
  'EMAIL_PASS'
];

let envCheckPassed = true;
requiredEnvVars.forEach(varName => {
  const exists = !!process.env[varName];
  console.log(`   ${exists ? '✅' : '❌'} ${varName}: ${exists ? 'Configured' : 'Missing'}`);
  if (!exists) envCheckPassed = false;
});

// 2. Critical Files Check
console.log('\n📁 2. CRITICAL FILES:');
const criticalFiles = [
  'app.js',
  'package.json',
  'angular.json',
  'src/main.ts',
  'src/app/app.component.ts',
  'src/app/app.routes.ts'
];

let filesCheckPassed = true;
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) filesCheckPassed = false;
});

// 3. Critical Directories Check
console.log('\n📂 3. CRITICAL DIRECTORIES:');
const criticalDirs = [
  'node_modules',
  'src',
  'routes',
  'models',
  'middleware',
  'config'
];

let dirsCheckPassed = true;
criticalDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
  if (!exists) dirsCheckPassed = false;
});

// 4. MongoDB Connection Test
console.log('\n🗄️  4. MONGODB CONNECTION:');
async function testMongoConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('   ✅ MongoDB connection successful');
    console.log(`   ✅ Database: ${mongoose.connection.name}`);
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   ✅ Collections found: ${collections.length}`);
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log('   ❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// 5. Routes Check
console.log('\n🛣️  5. API ROUTES:');
const routesDir = './routes';
if (fs.existsSync(routesDir)) {
  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
  console.log(`   ✅ Found ${routeFiles.length} route files:`);
  routeFiles.forEach(file => {
    console.log(`      • ${file}`);
  });
} else {
  console.log('   ❌ Routes directory not found');
}

// 6. Models Check
console.log('\n📊 6. DATABASE MODELS:');
const modelsDir = './models';
if (fs.existsSync(modelsDir)) {
  const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
  console.log(`   ✅ Found ${modelFiles.length} model files:`);
  modelFiles.forEach(file => {
    console.log(`      • ${file}`);
  });
} else {
  console.log('   ❌ Models directory not found');
}

// 7. Build Status
console.log('\n🏗️  7. BUILD STATUS:');
const distExists = fs.existsSync('dist');
console.log(`   ${distExists ? '✅' : '⚠️'} dist folder: ${distExists ? 'Built' : 'Not built (run: npm run build)'}`);

// 8. Dependencies Check
console.log('\n📦 8. DEPENDENCIES:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = Object.keys(packageJson.dependencies || {}).length;
  const devDeps = Object.keys(packageJson.devDependencies || {}).length;
  console.log(`   ✅ Production dependencies: ${deps}`);
  console.log(`   ✅ Development dependencies: ${devDeps}`);
  console.log(`   ✅ node_modules: ${fs.existsSync('node_modules') ? 'Installed' : '❌ Missing (run: npm install)'}`);
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

// Run async checks
(async () => {
  const mongoOk = await testMongoConnection();
  
  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 HEALTH CHECK SUMMARY:\n');
  
  const checks = [
    { name: 'Environment Variables', passed: envCheckPassed },
    { name: 'Critical Files', passed: filesCheckPassed },
    { name: 'Critical Directories', passed: dirsCheckPassed },
    { name: 'MongoDB Connection', passed: mongoOk },
    { name: 'Build Status', passed: distExists }
  ];
  
  const allPassed = checks.every(c => c.passed);
  
  checks.forEach(check => {
    console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}`);
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('\n✅ ALL CHECKS PASSED! Application is ready to run.\n');
    console.log('To start the application:');
    console.log('   Backend:  node app.js');
    console.log('   Frontend: npm start (in another terminal)\n');
  } else {
    console.log('\n⚠️  SOME CHECKS FAILED! Please fix the issues above.\n');
  }
  
  process.exit(allPassed ? 0 : 1);
})();
