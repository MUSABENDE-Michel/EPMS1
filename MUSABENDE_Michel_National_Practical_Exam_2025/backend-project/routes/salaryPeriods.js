// backend-project/routes/salaryPeriods.js
const express = require('express');
const SalaryPeriod = require('../models/SalaryPeriod');
const Employee = require('../models/Employee');
const router = express.Router();

const checkAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.use(checkAuth);

// Get all salary periods with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const salaryPeriods = await SalaryPeriod.find()
      .populate('employee')
      .skip(skip)
      .limit(limit)
      .sort({ year: -1, month: -1 });
    
    const total = await SalaryPeriod.countDocuments();
    
    res.json({
      salaryPeriods,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get salary periods by employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const salaryPeriods = await SalaryPeriod.find({ employee: req.params.employeeId })
      .populate('employee')
      .sort({ year: -1, month: -1 });
    res.json(salaryPeriods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get salary period by ID
router.get('/:id', async (req, res) => {
  try {
    const salaryPeriod = await SalaryPeriod.findById(req.params.id).populate('employee');
    if (!salaryPeriod) {
      return res.status(404).json({ message: 'Salary period not found' });
    }
    res.json(salaryPeriod);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update salary period
router.put('/:id', async (req, res) => {
  try {
    const salaryPeriod = await SalaryPeriod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!salaryPeriod) {
      return res.status(404).json({ message: 'Salary period not found' });
    }
    res.json(salaryPeriod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;