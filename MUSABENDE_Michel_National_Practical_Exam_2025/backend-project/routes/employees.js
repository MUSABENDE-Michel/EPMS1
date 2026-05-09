// backend-project/routes/employees.js (Updated - generate employeeNumber in route)
const express = require('express');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const router = express.Router();

const checkAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.use(checkAuth);

// Generate employee number function
async function generateEmployeeNumber() {
  const count = await Employee.countDocuments();
  const paddedNumber = String(count + 1).padStart(3, '0');
  return `EMP${paddedNumber}`;
}

// Get all employees (no pagination for dropdowns)
router.get('/all', async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'Active' }).sort({ firstName: 1 });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching all employees:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all employees with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const employees = await Employee.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Employee.countDocuments();
    
    res.json({
      employees,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create employee
router.post('/', async (req, res) => {
  try {
    console.log('Creating employee with data:', req.body);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'address', 'position', 'telephone', 'gender', 'hiredDate', 'departmentCode'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }
    
    // Generate employee number
    const employeeNumber = await generateEmployeeNumber();
    
    const employeeData = {
      ...req.body,
      employeeNumber: employeeNumber
    };
    
    const employee = new Employee(employeeData);
    await employee.save();
    console.log(`Employee created successfully with number: ${employeeNumber}`);
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;