const sendEmail = async (options) => {
  // In development/testing, we log the email content to the console
  console.log(`\n========================================`);
  console.log(`📧 MOCK EMAIL SENT`);
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message:\n${options.message}`);
  console.log(`========================================\n`);
  
  // A production transporter (e.g., using nodemailer) can be configured here:
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: 'School Management System <no-reply@schoolmanagement.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(mailOptions);
  */
};

module.exports = { sendEmail };
