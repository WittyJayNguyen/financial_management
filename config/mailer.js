// config/mailer.js
const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('./config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

module.exports = transporter;
