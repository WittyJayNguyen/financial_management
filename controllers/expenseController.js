const transporter = require('../config/mailer');
const { EMAIL_USER } = require('../config/config');
const { addExpense, readAllExpenses } = require('../models/expenseModel');
const ejs = require('ejs');
const path = require('path');

const emailMessageIds = {};

async function sendReminderEmail(to, subject, expenses) {
  const html = await ejs.renderFile(
    path.join(__dirname, '../views/expenseReminder.ejs'),
    { expenses }
  );

  const mailOptions = {
    from: `"Hệ Thống Quản Lý Chi Tiêu" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  if (emailMessageIds[to]) {
    mailOptions.inReplyTo = emailMessageIds[to];
    mailOptions.references = emailMessageIds[to];
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email đã gửi:', info.response);
    emailMessageIds[to] = info.messageId;
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
  }
}

async function getAdminView(req, res) {
  const expenses = await readAllExpenses();
  res.render('admin', { expenses });
}

async function addExpenseController(req, res) {
  const { name, amount, dueDate, remindBeforeDays, email } = req.body;

  if (!name || !amount || !dueDate || remindBeforeDays === undefined || !email) {
    return res.status(400).send('❌ Dữ liệu nhập không hợp lệ!');
  }

  // ✅ Chuẩn hóa ngày thành 'YYYY-MM-DD'
  const formattedDueDate = new Date(dueDate).toISOString().slice(0, 10);

  const newExpense = {
    name,
    amount: Number(amount),
    dueDate: formattedDueDate,
    remindBeforeDays: Number(remindBeforeDays),
    email,
  };

  try {
    // ✅ Gọi addExpense và nhận lại expense đã được gán id
    const savedExpense = await addExpense(newExpense);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(formattedDueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays === savedExpense.remindBeforeDays) {
      await sendReminderEmail(
        savedExpense.email,
        `🔔 Nhắc nhở chi tiêu: ${savedExpense.name}`,
        [savedExpense]
      );
    }

    res.redirect('/admin');
  } catch (error) {
    console.error('❌ Lỗi khi thêm expense:', error.message);
    res.status(500).send('❌ Lỗi lưu dữ liệu: ' + error.message);
  }
}

module.exports = { getAdminView, addExpenseController };
