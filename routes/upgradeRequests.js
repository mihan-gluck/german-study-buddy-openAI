// routes/upgradeRequests.js
// Handle subscription upgrade requests from students

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const transporter = require("../config/emailConfig");

// Request subscription upgrade (SILVER → PLATINUM)
router.post("/request-upgrade", verifyToken, async (req, res) => {
  try {
    const user = req.user; // From verifyToken middleware
    
    // Get user details from request or database
    const studentName = user.name || "Student";
    const studentEmail = user.email || "No email";
    const studentRegNo = user.regNo || "No RegNo";
    const currentSubscription = user.subscription || "SILVER";
    const studentPhone = req.body.phone || "Not provided";
    const studentMessage = req.body.message || "No additional message";
    
    console.log('📧 Upgrade request received from:', studentName, studentEmail);
    
    // Email to sales team (default: languageschool@gluckglobal.com)
    const salesTeamEmail = process.env.SALES_TEAM_EMAIL || 'languageschool@gluckglobal.com';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: salesTeamEmail,
      subject: `🚀 Upgrade Request: ${studentName} wants PLATINUM subscription`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .value { color: #333; }
            .features { background: #e8f4f8; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .features ul { margin: 10px 0; padding-left: 20px; }
            .features li { margin: 8px 0; }
            .cta { background: #667eea; color: white; padding: 15px 30px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 New Upgrade Request</h1>
              <p>A student wants to upgrade to PLATINUM!</p>
            </div>
            
            <div class="content">
              <div class="info-box">
                <h2>📋 Student Information</h2>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">${studentName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Registration No:</span>
                  <span class="value">${studentRegNo}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">${studentEmail}</span>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">${studentPhone}</span>
                </div>
                <div class="info-row">
                  <span class="label">Current Subscription:</span>
                  <span class="value">${currentSubscription}</span>
                </div>
                <div class="info-row">
                  <span class="label">Requested Upgrade:</span>
                  <span class="value">PLATINUM</span>
                </div>
                <div class="info-row">
                  <span class="label">Request Date:</span>
                  <span class="value">${new Date().toLocaleString()}</span>
                </div>
              </div>
              
              ${studentMessage !== "No additional message" ? `
              <div class="info-box">
                <h3>💬 Student Message</h3>
                <p>${studentMessage}</p>
              </div>
              ` : ''}
              
              <div class="features">
                <h3>🎯 PLATINUM Features Student Wants</h3>
                <ul>
                  <li>🤖 AI Tutor with voice conversation</li>
                  <li>💬 Real-time dialogue bubbles</li>
                  <li>🎭 Role-play scenarios</li>
                  <li>📊 Engagement scoring</li>
                  <li>🎯 Personalized learning experience</li>
                </ul>
              </div>
              
              <div class="cta">
                <h3>⚡ Action Required</h3>
                <p>Please contact this student within 24 hours to discuss the upgrade.</p>
                <p><strong>📞 Call: ${studentPhone}</strong></p>
                <p><strong>📧 Email: ${studentEmail}</strong></p>
              </div>
              
              <div class="footer">
                <p>This is an automated email from GermanBuddy Learning Management System</p>
                <p>© ${new Date().getFullYear()} Gluck Global. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    // Send email to sales team
    await transporter.sendMail(mailOptions);
    console.log('✅ Upgrade request email sent to sales team');
    
    // Optional: Send confirmation email to student
    const studentMailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: '✅ Your Upgrade Request Has Been Received',
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
            .features { background: #e8f4f8; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .features ul { margin: 10px 0; padding-left: 20px; }
            .features li { margin: 8px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Request Received!</h1>
              <p>Thank you for your interest in PLATINUM</p>
            </div>
            
            <div class="content">
              <div class="success-box">
                <h2>🎉 Your upgrade request has been submitted successfully!</h2>
                <p>Our sales team will contact you within 24 hours.</p>
              </div>
              
              <div class="info-box">
                <h3>📋 Request Details</h3>
                <p><strong>Name:</strong> ${studentName}</p>
                <p><strong>Current Plan:</strong> ${currentSubscription}</p>
                <p><strong>Requested Plan:</strong> PLATINUM</p>
                <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="features">
                <h3>🚀 What You'll Get with PLATINUM</h3>
                <ul>
                  <li>🤖 <strong>AI Tutor:</strong> Interactive voice conversations with AI</li>
                  <li>💬 <strong>Real-time Feedback:</strong> Instant corrections and suggestions</li>
                  <li>🎭 <strong>Role-play Scenarios:</strong> Practice real-life situations</li>
                  <li>📊 <strong>Engagement Scoring:</strong> Track your progress in detail</li>
                  <li>🎯 <strong>Personalized Learning:</strong> AI adapts to your level</li>
                </ul>
              </div>
              
              <div class="info-box">
                <h3>📞 What Happens Next?</h3>
                <ol>
                  <li>Our sales team will review your request</li>
                  <li>You'll receive a call within 24 hours</li>
                  <li>We'll discuss pricing and payment options</li>
                  <li>Once confirmed, your account will be upgraded immediately</li>
                  <li>You'll get instant access to all PLATINUM features</li>
                </ol>
              </div>
              
              <div class="info-box" style="background: #fff3cd; border-left-color: #ffc107;">
                <h3>❓ Questions?</h3>
                <p>Feel free to reach out to us:</p>
                <p>📧 Email: ${process.env.EMAIL_USER}</p>
                <p>📞 Phone: [Your Phone Number]</p>
              </div>
              
              <div class="footer">
                <p>This is an automated confirmation from GermanBuddy LMS</p>
                <p>© ${new Date().getFullYear()} Gluck Global. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(studentMailOptions);
    console.log('✅ Confirmation email sent to student');
    
    res.status(200).json({
      success: true,
      message: 'Upgrade request submitted successfully! Our sales team will contact you within 24 hours.',
      requestDetails: {
        studentName,
        studentEmail,
        currentSubscription,
        requestedSubscription: 'PLATINUM',
        requestDate: new Date()
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing upgrade request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit upgrade request. Please try again or contact support.',
      error: error.message
    });
  }
});

module.exports = router;
