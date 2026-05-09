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

// Active period configuration (can be changed by admin)
let activeYear = new Date().getFullYear();
let activeMonth = new Date().getMonth() + 1;

// Get active period
router.get('/active-period', async (req, res) => {
  try {
    res.json({ 
      activeYear, 
      activeMonth,
      activePeriod: `${activeYear}-${String(activeMonth).padStart(2, '0')}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update active period (admin only)
router.post('/active-period', async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (year < 2020 || year > 2030) {
      return res.status(400).json({ message: 'Invalid year' });
    }
    if (month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid month' });
    }
    
    activeYear = year;
    activeMonth = month;
    
    res.json({ 
      message: 'Active period updated successfully',
      activeYear,
      activeMonth,
      activePeriod: `${activeYear}-${String(activeMonth).padStart(2, '0')}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate salary ID function
async function generateSalaryId() {
  const count = await Salary.countDocuments();
  const paddedNumber = String(count + 1).padStart(4, '0');
  return `SAL${paddedNumber}`;
}

// Get all available periods for an employee
router.get('/available-periods/:employeeNumber', async (req, res) => {
  try {
    const { employeeNumber } = req.params;
    
    const existingSalaries = await Salary.find({ 
      employeeNumber,
      year: { $lte: activeYear }
    });
    
    const processedPeriods = existingSalaries.map(s => `${s.year}-${s.month}`);
    
    const availablePeriods = [];
    
    // Generate available periods up to active period
    for (let year = 2024; year <= activeYear; year++) {
      const maxMonth = (year === activeYear) ? activeMonth : 12;
      for (let month = 1; month <= maxMonth; month++) {
        const periodKey = `${year}-${month}`;
        if (!processedPeriods.includes(periodKey)) {
          availablePeriods.push({ year, month });
        }
      }
    }
    
    res.json({ 
      availablePeriods,
      activePeriod: { year: activeYear, month: activeMonth }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
    console.error('Error fetching salaries:', error);
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

// Create single salary (Insert operation)
router.post('/', async (req, res) => {
  try {
    const { employeeNumber, month, year } = req.body;
    
    // Check active period restriction
    if (year > activeYear || (year === activeYear && month > activeMonth)) {
      return res.status(400).json({ 
        message: `Cannot process salary for period ${year}-${month}. Active period is ${activeYear}-${activeMonth}` 
      });
    }
    
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
    
    // Generate salary ID
    const salaryId = await generateSalaryId();
    
    const salary = new Salary({
      salaryId: salaryId,
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
    console.log(`Salary created successfully with ID: ${salaryId}`);
    res.status(201).json(salary);
  } catch (error) {
    console.error('Error creating salary:', error);
    res.status(400).json({ message: error.message });
  }
});

// NEW: Process payroll for entire department
router.post('/process-department', async (req, res) => {
  try {
    const { departmentCode, month, year, processAll } = req.body;
    
    // Check active period restriction
    if (year > activeYear || (year === activeYear && month > activeMonth)) {
      return res.status(400).json({ 
        message: `Cannot process salary for period ${year}-${month}. Active period is ${activeYear}-${activeMonth}` 
      });
    }
    
    // Get department
    const department = await Department.findOne({ departmentCode });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all employees in department
    const query = { departmentCode, status: 'Active' };
    const employees = await Employee.find(query);
    
    if (employees.length === 0) {
      return res.status(404).json({ message: 'No active employees found in this department' });
    }
    
    const results = {
      processed: [],
      skipped: [],
      errors: []
    };
    
    for (const employee of employees) {
      try {
        // Check if salary already exists
        const existingSalary = await Salary.findOne({ 
          employeeNumber: employee.employeeNumber, 
          month, 
          year 
        });
        
        if (existingSalary) {
          results.skipped.push({
            employeeNumber: employee.employeeNumber,
            name: `${employee.firstName} ${employee.lastName}`,
            reason: 'Salary already processed'
          });
          continue;
        }
        
        const grossSalary = department.grossSalary;
        const totalDeduction = department.totalDeduction;
        const netSalary = grossSalary - totalDeduction;
        
        const salaryId = await generateSalaryId();
        
        const salary = new Salary({
          salaryId: salaryId,
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
        results.processed.push({
          employeeNumber: employee.employeeNumber,
          name: `${employee.firstName} ${employee.lastName}`,
          netSalary
        });
      } catch (error) {
        results.errors.push({
          employeeNumber: employee.employeeNumber,
          name: `${employee.firstName} ${employee.lastName}`,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Processed ${results.processed.length} employees, skipped ${results.skipped.length}, errors ${results.errors.length}`,
      departmentCode,
      departmentName: department.departmentName,
      period: { month, year },
      results
    });
  } catch (error) {
    console.error('Error processing department payroll:', error);
    res.status(500).json({ message: error.message });
  }
});

// NEW: Process payroll for ALL employees (all departments)
router.post('/process-all', async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Check active period restriction
    if (year > activeYear || (year === activeYear && month > activeMonth)) {
      return res.status(400).json({ 
        message: `Cannot process salary for period ${year}-${month}. Active period is ${activeYear}-${activeMonth}` 
      });
    }
    
    // Get all active employees
    const employees = await Employee.find({ status: 'Active' });
    
    if (employees.length === 0) {
      return res.status(404).json({ message: 'No active employees found' });
    }
    
    const results = {
      processed: [],
      skipped: [],
      errors: []
    };
    
    for (const employee of employees) {
      try {
        // Check if salary already exists
        const existingSalary = await Salary.findOne({ 
          employeeNumber: employee.employeeNumber, 
          month, 
          year 
        });
        
        if (existingSalary) {
          results.skipped.push({
            employeeNumber: employee.employeeNumber,
            name: `${employee.firstName} ${employee.lastName}`,
            reason: 'Salary already processed'
          });
          continue;
        }
        
        // Get department details
        const department = await Department.findOne({ departmentCode: employee.departmentCode });
        if (!department) {
          results.errors.push({
            employeeNumber: employee.employeeNumber,
            name: `${employee.firstName} ${employee.lastName}`,
            error: 'Department not found'
          });
          continue;
        }
        
        const grossSalary = department.grossSalary;
        const totalDeduction = department.totalDeduction;
        const netSalary = grossSalary - totalDeduction;
        
        const salaryId = await generateSalaryId();
        
        const salary = new Salary({
          salaryId: salaryId,
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
        results.processed.push({
          employeeNumber: employee.employeeNumber,
          name: `${employee.firstName} ${employee.lastName}`,
          department: employee.departmentCode,
          netSalary
        });
      } catch (error) {
        results.errors.push({
          employeeNumber: employee.employeeNumber,
          name: `${employee.firstName} ${employee.lastName}`,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Processed ${results.processed.length} employees, skipped ${results.skipped.length}, errors ${results.errors.length}`,
      period: { month, year },
      results
    });
  } catch (error) {
    console.error('Error processing all payroll:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update salary
router.put('/:id', async (req, res) => {
  try {
    const { grossSalary, totalDeduction, month, year } = req.body;
    const netSalary = grossSalary - totalDeduction;
    
    // Check active period restriction for updates
    if (year > activeYear || (year === activeYear && month > activeMonth)) {
      return res.status(400).json({ 
        message: `Cannot update salary for period ${year}-${month}. Active period is ${activeYear}-${activeMonth}` 
      });
    }
    
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

// Get pending salary periods for department
router.get('/pending-department/:departmentCode', async (req, res) => {
  try {
    const { departmentCode } = req.params;
    const employees = await Employee.find({ departmentCode, status: 'Active' });
    const employeeNumbers = employees.map(e => e.employeeNumber);
    
    const existingSalaries = await Salary.find({ 
      employeeNumber: { $in: employeeNumbers }
    });
    
    const processedPeriods = new Set();
    existingSalaries.forEach(s => {
      processedPeriods.add(`${s.year}-${s.month}`);
    });
    
    const pendingPeriods = [];
    
    // Generate pending periods up to active period
    for (let year = 2024; year <= activeYear; year++) {
      const maxMonth = (year === activeYear) ? activeMonth : 12;
      for (let month = 1; month <= maxMonth; month++) {
        const periodKey = `${year}-${month}`;
        if (!processedPeriods.has(periodKey)) {
          pendingPeriods.push({ year, month });
        }
      }
    }
    
    res.json({ 
      departmentCode,
      employeeCount: employees.length,
      pendingPeriods,
      activePeriod: { year: activeYear, month: activeMonth }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;