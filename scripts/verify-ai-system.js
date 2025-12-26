// scripts/verify-ai-system.js

const fs = require('fs');
const path = require('path');

function verifyAISystem() {
  console.log('🔍 Verifying AI Module Creation System...\n');
  
  const checks = [
    {
      name: 'Backend AI Route',
      path: 'routes/aiModuleGenerator.js',
      required: true
    },
    {
      name: 'Module Creation Choice Component',
      path: 'src/app/components/teacher-dashboard/module-creation-choice.component.ts',
      required: true
    },
    {
      name: 'AI Module Creator Component',
      path: 'src/app/components/teacher-dashboard/ai-module-creator.component.ts',
      required: true
    },
    {
      name: 'Environment Configuration',
      path: 'src/environments/environment.prod.ts',
      required: true
    },
    {
      name: 'OpenAI API Key',
      path: '.env',
      required: true,
      check: (content) => content.includes('OPENAI_API_KEY=sk-')
    },
    {
      name: 'App Routing Configuration',
      path: 'src/app/app-routing.module.ts',
      required: true,
      check: (content) => content.includes('module-creation-choice') && content.includes('create-module-ai')
    },
    {
      name: 'Backend Route Registration',
      path: 'app.js',
      required: true,
      check: (content) => content.includes('aiModuleGeneratorRoutes') && content.includes('/api/ai')
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    const fullPath = path.join(process.cwd(), check.path);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (check.check) {
        const passed = check.check(content);
        console.log(`${passed ? '✅' : '❌'} ${check.name}: ${passed ? 'PASS' : 'FAIL'}`);
        if (!passed) allPassed = false;
      } else {
        console.log(`✅ ${check.name}: EXISTS`);
      }
    } else {
      console.log(`❌ ${check.name}: MISSING`);
      if (check.required) allPassed = false;
    }
  });
  
  console.log('\n📋 System Status:');
  console.log(`Overall: ${allPassed ? '✅ READY' : '❌ ISSUES FOUND'}`);
  
  if (allPassed) {
    console.log('\n🚀 AI Module Creation System is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Login as TEACHER (TEA001/password123)');
    console.log('2. Go to Learning Modules page');
    console.log('3. Click "Create New Module"');
    console.log('4. Choose "Create with AI Assistant"');
    console.log('5. Fill out the form and generate your module!');
  } else {
    console.log('\n⚠️ Please fix the issues above before using the system.');
  }
  
  return allPassed;
}

// Run verification
verifyAISystem();