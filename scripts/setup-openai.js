// scripts/setup-openai.js
// Setup script for OpenAI ChatGPT-4o integration

require('dotenv').config();
const OpenAIService = require('../services/openaiService');

async function setupOpenAI() {
  console.log('🚀 OpenAI ChatGPT-4o Setup for German Study Buddy');
  console.log('================================================\n');

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OPENAI_API_KEY not found in .env file');
    console.log('\n📋 Setup Instructions:');
    console.log('1. Get your OpenAI API key from: https://platform.openai.com/api-keys');
    console.log('2. Add to your .env file:');
    console.log('   OPENAI_API_KEY=your-api-key-here');
    console.log('   OPENAI_MODEL=gpt-4o');
    console.log('   OPENAI_MAX_TOKENS=1500');
    console.log('   OPENAI_TEMPERATURE=0.7');
    console.log('\n💰 Pricing Information:');
    console.log('- GPT-4o Input: $5.00 per 1M tokens');
    console.log('- GPT-4o Output: $15.00 per 1M tokens');
    console.log('- Estimated cost for 100 students: $50-100/month');
    return;
  }

  console.log('✅ OPENAI_API_KEY found');
  console.log(`📋 Model: ${process.env.OPENAI_MODEL || 'gpt-4o'}`);
  console.log(`📋 Max Tokens: ${process.env.OPENAI_MAX_TOKENS || '1500'}`);
  console.log(`📋 Temperature: ${process.env.OPENAI_TEMPERATURE || '0.7'}\n`);

  // Test OpenAI connection
  console.log('🔍 Testing OpenAI connection...');
  const openaiService = new OpenAIService();
  
  try {
    const result = await openaiService.testConnection();
    
    if (result.success) {
      console.log('✅ OpenAI connection successful!');
      console.log('🎉 ChatGPT-4o is ready for German tutoring\n');
      
      // Test German tutoring capabilities
      console.log('🧪 Testing German tutoring capabilities...');
      await testGermanTutoring(openaiService);
      
    } else {
      console.log('❌ OpenAI connection failed:', result.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your API key is valid');
      console.log('2. Ensure you have sufficient credits');
      console.log('3. Verify your OpenAI account has access to GPT-4o');
    }
  } catch (error) {
    console.log('❌ Error testing OpenAI:', error.message);
  }
}

async function testGermanTutoring(openaiService) {
  try {
    // Create a mock module for testing
    const mockModule = {
      title: 'German Greetings Test',
      description: 'Test module for German greetings',
      level: 'A1',
      category: 'Conversation',
      content: {
        keyTopics: ['Greetings', 'Introductions']
      },
      learningObjectives: [
        { objective: 'Learn basic greetings' }
      ],
      aiTutorConfig: {
        personality: 'friendly and encouraging German tutor',
        focusAreas: ['pronunciation', 'cultural context'],
        helpfulPhrases: ['Hallo', 'Guten Tag', 'Wie geht es dir?']
      }
    };

    // Test response generation
    const response = await openaiService.generateTutorResponse({
      message: 'Hello, I want to learn German greetings',
      module: mockModule,
      sessionType: 'practice',
      previousMessages: [],
      studentLevel: 'A1'
    });

    console.log('✅ German tutoring test successful!');
    console.log('📝 Sample AI Response:');
    console.log(`   "${response.content.substring(0, 100)}..."`);
    console.log(`📋 Message Type: ${response.messageType}`);
    console.log(`💡 Suggestions: ${response.suggestions?.length || 0} provided\n`);

    // Test exercise generation
    console.log('🧪 Testing exercise generation...');
    const exercise = await openaiService.generateExercise(mockModule, 'beginner', 'multiple-choice');
    
    console.log('✅ Exercise generation successful!');
    console.log('📝 Sample Exercise:');
    console.log(`   Question: ${exercise.question}`);
    console.log(`   Type: ${exercise.type}`);
    console.log(`   Options: ${exercise.options?.length || 0} choices\n`);

    // Test answer evaluation
    console.log('🧪 Testing answer evaluation...');
    const evaluation = await openaiService.evaluateGermanAnswer(
      'Hallo',
      'Hallo',
      {
        module: mockModule,
        exerciseType: 'translation',
        question: 'How do you say hello in German?'
      }
    );

    console.log('✅ Answer evaluation successful!');
    console.log(`📝 Evaluation: ${evaluation.isCorrect ? 'Correct' : 'Incorrect'}`);
    console.log(`💬 Feedback: "${evaluation.feedback.substring(0, 80)}..."`);
    console.log(`📊 Score: ${evaluation.score}/100\n`);

    console.log('🎉 All tests passed! ChatGPT-4o is ready for production use.');
    console.log('\n🚀 Next Steps:');
    console.log('1. Start your application: npm start');
    console.log('2. Login as a student and try the AI tutor');
    console.log('3. Test different session types (practice, conversation, assessment)');
    console.log('4. Monitor usage and costs in your OpenAI dashboard');

  } catch (error) {
    console.log('❌ German tutoring test failed:', error.message);
    console.log('\n🔧 This might be due to:');
    console.log('1. Insufficient OpenAI credits');
    console.log('2. Rate limiting');
    console.log('3. Model access restrictions');
    console.log('4. Network connectivity issues');
  }
}

// Run setup if called directly
if (require.main === module) {
  setupOpenAI().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = setupOpenAI;