// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { getAdminView, addExpenseController } = require('../controllers/expenseController');

router.get('/admin', getAdminView);
router.post('/admin/add', addExpenseController);

module.exports = router;
