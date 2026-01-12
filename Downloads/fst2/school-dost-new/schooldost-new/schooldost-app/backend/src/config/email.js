// Email Service Configuration - Premium Templates
const nodemailer = require('nodemailer');

// Create transporter - Hostinger SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || 'no_reply@schooldost.com',
        pass: process.env.SMTP_PASS
    }
});

// Premium Email Template Base
const getEmailTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>School Dost</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
              <h1 style="margin: 0; color: #1a1a2e; font-size: 32px; font-weight: 800; letter-spacing: -1px;">
                School<span style="color: #ffffff;">Dost</span>
              </h1>
              <p style="margin: 8px 0 0; color: #1a1a2e; font-size: 14px; opacity: 0.8;">
                Find a Friend & Mentor
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                Connect with us
              </p>
              <div style="margin-bottom: 20px;">
                <a href="#" style="display: inline-block; margin: 0 8px; color: #facc15; text-decoration: none; font-size: 20px;">📱</a>
                <a href="#" style="display: inline-block; margin: 0 8px; color: #facc15; text-decoration: none; font-size: 20px;">💬</a>
                <a href="#" style="display: inline-block; margin: 0 8px; color: #facc15; text-decoration: none; font-size: 20px;">📧</a>
              </div>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 School Dost. All rights reserved.<br>
                Made with ❤️ for students
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Bottom text -->
        <p style="margin: 24px 0 0; color: rgba(255,255,255,0.5); font-size: 12px; text-align: center;">
          This email was sent by School Dost. Please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Send email verification
const sendVerificationEmail = async (email, token, fullName) => {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    
    const content = `
      <div style="text-align: center;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px; line-height: 80px;">✉️</span>
        </div>
        
        <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 28px; font-weight: 700;">
          Hey ${fullName}! 👋
        </h2>
        <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px;">
          Welcome to the School Dost family!
        </p>
        
        <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.6;">
          You're just one click away from connecting with amazing students, finding study partners, and building lifelong friendships.
        </p>
        
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%); color: #1a1a2e; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px rgba(250, 204, 21, 0.4);">
          ✨ Verify My Email
        </a>
        
        <p style="margin: 32px 0 0; color: #9ca3af; font-size: 14px;">
          Link expires in 24 hours
        </p>
        
        <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            Didn't create an account? Just ignore this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
        from: `"School Dost 🎓" <${process.env.SMTP_USER || 'no_reply@schooldost.com'}>`,
        to: email,
        subject: '✨ Verify your School Dost account',
        html: getEmailTemplate(content)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent to:', email);
        return true;
    } catch (error) {
        console.error('❌ Send verification email error:', error);
        return false;
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, fullName) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    const content = `
      <div style="text-align: center;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px; line-height: 80px;">🔐</span>
        </div>
        
        <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 28px; font-weight: 700;">
          Password Reset Request
        </h2>
        <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px;">
          Hey ${fullName}, no worries! It happens.
        </p>
        
        <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.6;">
          Someone (hopefully you!) requested a password reset for your School Dost account. Click the button below to create a new password.
        </p>
        
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%); color: #1a1a2e; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px rgba(250, 204, 21, 0.4);">
          🔑 Reset Password
        </a>
        
        <p style="margin: 32px 0 0; color: #9ca3af; font-size: 14px;">
          Link expires in 1 hour
        </p>
        
        <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            Didn't request this? Just ignore this email and your password won't change.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
        from: `"School Dost 🎓" <${process.env.SMTP_USER || 'no_reply@schooldost.com'}>`,
        to: email,
        subject: '🔐 Reset your School Dost password',
        html: getEmailTemplate(content)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent to:', email);
        return true;
    } catch (error) {
        console.error('❌ Send password reset email error:', error);
        return false;
    }
};

// Send welcome email (after verification)
const sendWelcomeEmail = async (email, fullName) => {
    const content = `
      <div style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 24px;">🎉</div>
        
        <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 28px; font-weight: 700;">
          Welcome to School Dost!
        </h2>
        <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px;">
          Hey ${fullName}, you're all set!
        </p>
        
        <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 1.6;">
          Your email has been verified and your account is now active. Here's what you can do:
        </p>
        
        <table width="100%" style="margin-bottom: 32px;">
          <tr>
            <td style="padding: 16px; background: #fef3c7; border-radius: 12px; text-align: left;">
              <p style="margin: 0 0 8px; font-size: 20px;">🔍 Find Study Partners</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Connect with students from your college</p>
            </td>
          </tr>
          <tr><td style="height: 12px;"></td></tr>
          <tr>
            <td style="padding: 16px; background: #d1fae5; border-radius: 12px; text-align: left;">
              <p style="margin: 0 0 8px; font-size: 20px;">💬 Real-time Chat</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Message your connections instantly</p>
            </td>
          </tr>
          <tr><td style="height: 12px;"></td></tr>
          <tr>
            <td style="padding: 16px; background: #e0e7ff; border-radius: 12px; text-align: left;">
              <p style="margin: 0 0 8px; font-size: 20px;">❤️ Smart Matching</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Our EdgeRank algorithm finds your best matches</p>
            </td>
          </tr>
        </table>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%); color: #1a1a2e; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px rgba(250, 204, 21, 0.4);">
          🚀 Start Exploring
        </a>
      </div>
    `;

    const mailOptions = {
        from: `"School Dost 🎓" <${process.env.SMTP_USER || 'no_reply@schooldost.com'}>`,
        to: email,
        subject: '🎉 Welcome to School Dost - Let\'s find your dost!',
        html: getEmailTemplate(content)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent to:', email);
        return true;
    } catch (error) {
        console.error('❌ Send welcome email error:', error);
        return false;
    }
};

module.exports = {
    transporter,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
};
