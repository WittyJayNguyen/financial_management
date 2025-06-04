// models/expenseModel.js
const fs = require('fs').promises;
const path = require('path');
const { EXPENSE_DIR } = require('../config/config');
const { v4: uuidv4 } = require('uuid');

// Hàm tạo thư mục nếu chưa có
async function ensureExpenseDir() {
    await fs.mkdir(EXPENSE_DIR, { recursive: true });
}

// Đọc danh sách expense từ file theo ngày
async function readExpensesByDate(dateStr) {
    await ensureExpenseDir();
    const filePath = path.join(EXPENSE_DIR, `${dateStr}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Ghi expense vào file theo ngày
async function addExpense(expense) {
    await ensureExpenseDir();

    // 👉 Chuẩn hóa dueDate thành yyyy-mm-dd
    const formattedDate = new Date(expense.dueDate).toISOString().slice(0, 10);
    const filePath = path.join(EXPENSE_DIR, `${formattedDate}.json`);

    let expenses = [];
    try {
        const data = await fs.readFile(filePath, 'utf8');
        expenses = JSON.parse(data);
    } catch (error) {
        expenses = [];
    }

    // Gán id mới cho expense và cập nhật lại dueDate chuẩn hóa
    const expenseWithId = {
        id: uuidv4(),
        ...expense,
        dueDate: formattedDate, // đảm bảo đồng bộ ngày
    };

    expenses.push(expenseWithId);
    await fs.writeFile(filePath, JSON.stringify(expenses, null, 2), 'utf8');

    return expenseWithId;
}

// Đọc tất cả expense từ tất cả các file trong thư mục
async function readAllExpenses() {
    await ensureExpenseDir();
    let allExpenses = [];
    const files = await fs.readdir(EXPENSE_DIR);
    for (const file of files) {
        const filePath = path.join(EXPENSE_DIR, file);
        try {
            const data = await fs.readFile(filePath, 'utf8');
            const expenses = JSON.parse(data);
            allExpenses.push(...expenses);
        } catch (error) {
            return error.message;
        }
    }
    return allExpenses;
}

async function sendGroupedReminderEmails(reminders) {
    const groupedByEmail = reminders.reduce((acc, expense) => {
        if (!acc[expense.email]) acc[expense.email] = [];
        acc[expense.email].push(expense);
        return acc;
    }, {});

    for (const [email, expenses] of Object.entries(groupedByEmail)) {
        const html = await ejs.renderFile(
            path.join(__dirname, '../views/expenseReminder.ejs'),
            { expenses }
        );

        const mailOptions = {
            from: `"Hệ Thống Quản Lý Chi Tiêu" <${EMAIL_USER}>`,
            to: email,
            subject: `🔔 Nhắc nhở chi tiêu ngày ${new Date().toISOString().slice(0, 10)}`,
            html,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            return info.response;
        } catch (error) {
            return error.message;
        }
    }
}

module.exports = { readExpensesByDate, addExpense, readAllExpenses, sendGroupedReminderEmails };
