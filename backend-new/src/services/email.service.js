import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Premium Email Template
const getEmailTemplate = (title, content, actionUrl, actionText) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
    body { font-family: 'Outfit', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
    .header { background: #000000; padding: 30px; text-align: center; }
    .logo { color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
    .welcome-text { font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #1a1a1a; }
    .btn { display: inline-block; padding: 14px 28px; background: #FF4D00; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; margin-top: 25px; transition: opacity 0.3s; }
    .btn:hover { opacity: 0.9; }
    .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666666; }
    .powered-by { font-weight: 600; color: #000000; margin-top: 10px; display: block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${process.env.CLIENT_URL}" class="logo">VAYUTRENZ</a>
    </div>
    <div class="content">
      <div class="welcome-text">${title}</div>
      ${content}
      ${actionUrl ? `<div style="text-align: center;"><a href="${actionUrl}" class="btn">${actionText}</a></div>` : ''}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} VayuTrenz. All rights reserved.</p>
      <span class="powered-by">Powered by Vayunex Solution</span>
    </div>
  </div>
</body>
</html>
`

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html
    })
    console.log('📧 Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Email failed:', error)
    return null
  }
}

export const sendWelcomeEmail = async (user) => {
  const html = getEmailTemplate(
    `Welcome to VayuTrenz, ${user.name}!`,
    `<p>Thank you for joining the future of fashion. We're excited to have you on board.</p>
     <p>Discover our latest premium collections designed just for you.</p>
     <p>Get ready to experience style like never before.</p>`,
    `${process.env.CLIENT_URL}/products`,
    'Start Shopping'
  )
  return sendEmail(user.email, 'Welcome to VayuTrenz', html)
}

export const sendResetPasswordEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
  const html = getEmailTemplate(
    'Reset Your Password',
    `<p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
     <p>Click the button below to set a new password:</p>`,
    resetUrl,
    'Reset Password'
  )
  return sendEmail(user.email, 'Reset Password Request', html)
}

export const sendOtpEmail = async (user, otp) => {
  const html = getEmailTemplate(
    'Verify Your Email',
    `<p>Your verification code is:</p>
     <div style="font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #000; text-align: center; margin: 20px 0;">${otp}</div>
     <p>This code will expire in 10 minutes.</p>`,
    null, // No action button
    null
  )
  return sendEmail(user.email, 'Verification Code - VayuTrenz', html)
}
