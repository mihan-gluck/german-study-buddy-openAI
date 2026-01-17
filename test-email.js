// test-email.js
// Test email configuration for upgrade request system

require('dotenv').config();
const transporter = require('./config/emailConfig');

async function testEmail() {
  try {
    console.log('\n📧 Testing Email Configuration...\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : '❌ NOT SET');
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ ERROR: Email credentials not configured in .env file\n');
      console.log('Please update your .env file with:');
      console.log('EMAIL_USER=your-email@gmail.com');
      console.log('EMAIL_PASS=your-16-character-app-password\n');
      return;
    }
    
    if (process.env.EMAIL_USER === 'your-email@gmail.com' || 
        process.env.EMAIL_PASS === 'your-app-password') {
      console.error('❌ ERROR: Please replace placeholder values in .env file\n');
      console.log('Current values are placeholders. Update with real credentials.\n');
      return;
    }
    
    console.log('📤 Sending test email...\n');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '✅ Test Email - Upgrade Request System Working',
      text: 'If you receive this email, your email configuration is working correctly!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email Configuration Test</h1>
              <p>Your upgrade request system is ready!</p>
            </div>
            
            <div class="content">
              <div class="success-box">
                <h2>🎉 Email Sending Works!</h2>
                <p>Your email configuration is correct and working.</p>
              </div>
              
              <div class="info-box">
                <h3>📋 Test Details</h3>
                <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
                <p><strong>To:</strong> ${process.env.EMAIL_USER}</p>
                <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>System:</strong> GermanBuddy LMS</p>
              </div>
              
              <div class="info-box">
                <h3>✅ What This Means</h3>
                <ul>
                  <li>Email credentials are correct</li>
                  <li>SMTP connection is working</li>
                  <li>Upgrade request emails will be sent successfully</li>
                  <li>Students will receive confirmation emails</li>
                  <li>Sales team will receive upgrade requests</li>
                </ul>
              </div>
              
              <div class="info-box" style="background: #e8f4f8; border-left-color: #17a2b8;">
                <h3>🚀 Next Steps</h3>
                <ol>
                  <li>Test the upgrade request flow in the application</li>
                  <li>Login as a SILVER student</li>
                  <li>Click "Start AI Tutor" on any module</li>
                  <li>Request upgrade and verify emails are sent</li>
                </ol>
              </div>
              
              <div class="footer">
                <p>This is a test email from GermanBuddy LMS</p>
                <p>© ${new Date().getFullYear()} Gluck Global. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY!\n');
    console.log('Message ID:', info.messageId);
    console.log('Recipient:', process.env.EMAIL_USER);
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📬 Check your inbox:', process.env.EMAIL_USER);
    console.log('📧 If you received the email, your configuration is correct!\n');
    console.log('🎯 Next: Test the upgrade request flow in the application\n');
    
  } catch (error) {
    console.log('═══════════════════════════════════════════════════════');
    console.error('❌ ERROR SENDING TEST EMAIL\n');
    console.error('Error Message:', error.message);
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (error.code === 'EAUTH') {
      console.log('🔧 AUTHENTICATION ERROR - How to Fix:\n');
      console.log('1. Go to: https://myaccount.google.com/security');
      console.log('2. Enable 2-Step Verification');
      console.log('3. Go to: https://myaccount.google.com/apppasswords');
      console.log('4. Generate an App Password for "Mail" on "Windows Computer"');
      console.log('5. Copy the 16-character password (remove spaces)');
      console.log('6. Update .env file:');
      console.log('   EMAIL_USER=your-email@gmail.com');
      console.log('   EMAIL_PASS=abcdefghijklmnop  (16 chars, no spaces)');
      console.log('7. Restart backend: node app.js');
      console.log('8. Run this test again: node test-email.js\n');
    } else if (error.code === 'ECONNECTION') {
      console.log('🔧 CONNECTION ERROR - How to Fix:\n');
      console.log('1. Check your internet connection');
      console.log('2. Make sure port 587 is not blocked by firewall');
      console.log('3. Try using port 465 with secure: true in emailConfig.js\n');
    } else {
      console.log('🔧 UNKNOWN ERROR - Debug Info:\n');
      console.log('Full error:', error);
      console.log('\nPlease check:');
      console.log('1. Email credentials in .env file');
      console.log('2. Internet connection');
      console.log('3. Gmail security settings\n');
    }
  }
}

// Run the test
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║                                                        ║');
console.log('║     📧 EMAIL CONFIGURATION TEST                       ║');
console.log('║     GermanBuddy LMS - Upgrade Request System          ║');
console.log('║                                                        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

testEmail();
