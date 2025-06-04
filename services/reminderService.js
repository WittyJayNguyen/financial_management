const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const ejs = require('ejs');
const { sendReminderEmail } = require('../utils/mailer');

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function checkAndSendExpenseReminders() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);

    const filePath = path.resolve(__dirname, '..', 'data', `${todayStr}.json`);

    if (!fs.existsSync(filePath)) {
      return;
    }

    const data = await fsp.readFile(filePath, 'utf8');
    const expenses = JSON.parse(data);

    const reminders = expenses.filter(e => {
      const dueDate = new Date(e.dueDate);``
      dueDate.setHours(0, 0, 0, 0);
      const diffMs = dueDate - today;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return diffDays === e.remindBeforeDays;
    });

    if (reminders.length === 0) {
      return;
    }

    const templatePath = path.resolve(__dirname, '..', 'views', 'expenseReminder.ejs');
    const html = await ejs.renderFile(templatePath, { expenses: reminders });

    const emails = new Set(reminders.map(r => r.email));
    for (const email of emails) {
      await sendReminderEmail(email, `🔔 Nhắc nhở chi tiêu ngày ${todayStr}`, html);
    }
  } catch (error) {
    return res.status(500).send('❌ Lỗi khi kiểm tra và gửi nhắc nhở: ' + error.message);

  }
}

module.exports = { checkAndSendExpenseReminders };
