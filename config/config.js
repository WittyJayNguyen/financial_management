// config/config.js
require('dotenv').config();
const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3000,
  EXPENSE_DIR: path.join(__dirname, '../data'),
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};
