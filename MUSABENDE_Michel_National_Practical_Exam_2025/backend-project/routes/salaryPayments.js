// backend-project/routes/salaries.js
const express = require('express');
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');
const router = express.Router();

const checkAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.use(checkAuth);

// Get all salaries with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const salaries = await Salary.find()
      .skip(skip)
      .limit(limit)
      .sort({ year: -1, month: -1, createdAt: -1 });
    
    const total = await Salary.countDocuments();
    
    res.json({
      salaries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single salary
router.get('/:id', async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }
    res.json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create salary (Insert operation)
router.post('/', async (req, res) => {
  try {
    const { employeeNumber, month, year } = req.body;
    
    // Check if salary already exists for this employee/month/year
    const existingSalary = await Salary.findOne({ employeeNumber, month, year });
    if (existingSalary) {
      return res.status(400).json({ message: 'Salary already processed for this employee in the selected month' });
    }
    
    // Get employee details
    const employee = await Employee.findOne({ employeeNumber });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get department details
    const department = await Department.findOne({ departmentCode: employee.departmentCode });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const grossSalary = department.grossSalary;
    const totalDeduction = department.totalDeduction;
    const netSalary = grossSalary - totalDeduction;
    
    const salary = new Salary({
      employeeNumber: employee.employeeNumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      departmentCode: employee.departmentCode,
      grossSalary,
      totalDeduction,
      netSalary,
      month,
      year,
      status: 'Processed',
      processedBy: req.session.userId
    });
    
    await salary.save();
    res.status(201).json(salary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update salary
router.put('/:id', async (req, res) => {
  try {
    const { grossSalary, totalDeduction, month, year } = req.body;
    const netSalary = grossSalary - totalDeduction;
    
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        netSalary,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }
    res.json(salary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete salary
router.delete('/:id', async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }
    res.json({ message: 'Salary record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process monthly payroll for all employees
router.post('/process-monthly', async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Get all active employees
    const employees = await Employee.find({ status: 'Active' });
    const results = [];
    
    for (const employee of employees) {
      // Check if salary already exists
      const existingSalary = await Salary.findOne({ 
        employeeNumber: employee.employeeNumber, 
        month, 
        year 
      });
      
      if (!existingSalary) {
        const department = await Department.findOne({ departmentCode: employee.departmentCode });
        if (department) {
          const grossSalary = department.grossSalary;
          const totalDeduction = department.totalDeduction;
          const netSalary = grossSalary - totalDeduction;
          
          const salary = new Salary({
            employeeNumber: employee.employeeNumber,
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            departmentCode: employee.departmentCode,
            grossSalary,
            totalDeduction,
            netSalary,
            month,
            year,
            status: 'Processed',
            processedBy: req.session.userId
          });
          
          await salary.save();
          results.push(salary);
        }
      }
    }
    
    res.json({ 
      message: `Processed ${results.length} salary records for ${month}/${year}`,
      count: results.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly report
router.get('/report/monthly', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const salaries = await Salary.find({ 
      month: parseInt(month), 
      year: parseInt(year) 
    }).sort({ lastName: 1 });
    
    const summary = {
      totalEmployees: salaries.length,
      totalGrossSalary: salaries.reduce((sum, s) => sum + s.grossSalary, 0),
      totalDeductions: salaries.reduce((sum, s) => sum + s.totalDeduction, 0),
      totalNetSalary: salaries.reduce((sum, s) => sum + s.netSalary, 0)
    };
    
    res.json({ salaries, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee salary history
router.get('/employee-history/:employeeNumber', async (req, res) => {
  try {
    const salaries = await Salary.find({ 
      employeeNumber: req.params.employeeNumber 
    }).sort({ year: -1, month: -1 });
    
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;