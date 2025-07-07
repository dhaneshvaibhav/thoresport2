const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,         // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password
  },
});

// Function to send an email
async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"ThorEsports" <${process.env.GMAIL_USER}>`, // Sender address
      to,                                                 // List of receivers (comma separated or array)
      subject,                                            // Subject line
      html,                                               // HTML body
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Example usage (uncomment to test):
// sendMail({
//   to: 'recipient@email.com',
//   subject: 'Test Email from ThorEsports',
//   html: '<h1>Hello from ThorEsports!</h1><p>This is a test email sent via Nodemailer and Gmail SMTP.</p>',
// });

module.exports = sendMail; 