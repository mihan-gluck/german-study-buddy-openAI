// scripts/test-ai-simple.js

const OpenAI = require('openai');
require('dotenv').config();

async function testOpenAI() {
  try {
    console.log('🧪 Testing OpenAI API connection...');
    
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('🤖 Making test API call...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with a simple JSON object."
        },
        {
          role: "user",
          content: "Create a simple test response in JSON format with a 'message' field."
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const response = completion.choices[0].message.content;
    console.log('✅ OpenAI API working!');
    console.log('📝 Response:', response);
    
    return true;
    
  } catch (error) {
    console.error('❌ OpenAI test failed:', error.message);
    
    if (error.code === 'invalid_api_key') {
      console.log('💡 Invalid API key - check your OpenAI API key in .env file');
    } else if (error.code === 'insufficient_quota') {
      console.log('💡 Insufficient quota - check your OpenAI account billing');
    }
    
    return false;
  }
}

// Run the test
testOpenAI();