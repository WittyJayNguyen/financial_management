// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');
const expenseRoutes = require('./routes/expenseRoutes');
const { PORT } = require('./config/config');
const { checkAndSendExpenseReminders } = require('./services/reminderService');

const app = express();

// Cấu hình view
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Router
app.use(expenseRoutes);

// Cron job: chạy mỗi ngày lúc 7 giờ sáng
cron.schedule('0 7 * * *', () => {
  console.log('🕖 Đang kiểm tra các khoản chi tiêu cần nhắc...');
  checkAndSendExpenseReminders();
});

// Hoặc chạy ngay server khởi động (nếu bạn muốn)
checkAndSendExpenseReminders();

// Khởi động server
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}/admin`);
});
