// backend-project/routes/reports.js
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

// Monthly payroll report
router.get('/monthly-payroll', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const salaries = await Salary.find({ 
      month: parseInt(month), 
      year: parseInt(year) 
    }).sort({ lastName: 1 });
    
    const payrollReport = salaries.map(salary => ({
      firstName: salary.firstName,
      lastName: salary.lastName,
      position: salary.position,
      department: salary.departmentCode,
      netSalary: salary.netSalary,
      grossSalary: salary.grossSalary,
      deductions: salary.totalDeduction
    }));
    
    const summary = {
      totalEmployees: salaries.length,
      totalNetPayroll: salaries.reduce((sum, s) => sum + s.netSalary, 0),
      totalGrossPayroll: salaries.reduce((sum, s) => sum + s.grossSalary, 0),
      totalDeductions: salaries.reduce((sum, s) => sum + s.totalDeduction, 0),
      averageSalary: salaries.length > 0 ? salaries.reduce((sum, s) => sum + s.netSalary, 0) / salaries.length : 0
    };
    
    res.json({ 
      report: payrollReport,
      summary,
      month,
      year
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Department salary summary
router.get('/department-summary', async (req, res) => {
  try {
    const departments = await Department.find();
    const summary = [];
    
    for (const dept of departments) {
      const employees = await Employee.find({ departmentCode: dept.departmentCode });
      const salaries = await Salary.find({ departmentCode: dept.departmentCode });
      
      const totalPayroll = salaries.reduce((sum, s) => sum + s.netSalary, 0);
      const totalGross = salaries.reduce((sum, s) => sum + s.grossSalary, 0);
      const totalDeductions = salaries.reduce((sum, s) => sum + s.totalDeduction, 0);
      
      summary.push({
        departmentCode: dept.departmentCode,
        departmentName: dept.departmentName,
        employeeCount: employees.length,
        baseGrossSalary: dept.grossSalary,
        baseDeduction: dept.totalDeduction,
        totalPayrollProcessed: totalPayroll,
        totalGrossProcessed: totalGross,
        totalDeductionsProcessed: totalDeductions
      });
    }
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yearly salary report
router.get('/yearly-summary', async (req, res) => {
  try {
    const { year } = req.query;
    
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const salaries = await Salary.find({ month, year: parseInt(year) });
      monthlyData.push({
        month,
        totalEmployees: salaries.length,
        totalNetSalary: salaries.reduce((sum, s) => sum + s.netSalary, 0),
        totalGrossSalary: salaries.reduce((sum, s) => sum + s.grossSalary, 0),
        totalDeductions: salaries.reduce((sum, s) => sum + s.totalDeduction, 0)
      });
    }
    
    const yearlyTotal = {
      totalEmployeesProcessed: await Salary.distinct('employeeNumber', { year: parseInt(year) }).then(ids => ids.length),
      totalNetSalary: monthlyData.reduce((sum, m) => sum + m.totalNetSalary, 0),
      totalGrossSalary: monthlyData.reduce((sum, m) => sum + m.totalGrossSalary, 0),
      totalDeductions: monthlyData.reduce((sum, m) => sum + m.totalDeductions, 0)
    };
    
    res.json({ monthlyData, yearlyTotal, year });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Employee salary history
router.get('/employee-history/:employeeNumber', async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeNumber: req.params.employeeNumber });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const salaries = await Salary.find({ employeeNumber: req.params.employeeNumber })
      .sort({ year: -1, month: -1 });
    
    const summary = {
      totalEarned: salaries.reduce((sum, s) => sum + s.netSalary, 0),
      totalGross: salaries.reduce((sum, s) => sum + s.grossSalary, 0),
      totalDeductions: salaries.reduce((sum, s) => sum + s.totalDeduction, 0),
      monthsProcessed: salaries.length
    };
    
    res.json({
      employee: {
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        departmentCode: employee.departmentCode
      },
      salaryHistory: salaries,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;