// utils/mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendReminderEmail(to, subject, html) {
  const mailOptions = {
    from: `"Hệ Thống Quản Lý Chi Tiêu" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email đã gửi:', info.response);
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
  }
}

module.exports = { sendReminderEmail };
