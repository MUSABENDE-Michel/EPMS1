// backend-project/routes/departments.js
const express = require('express');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const router = express.Router();

const checkAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.use(checkAuth);

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single department
router.get('/:code', async (req, res) => {
  try {
    const department = await Department.findOne({ departmentCode: req.params.code });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create department
router.post('/', async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update department
router.put('/:code', async (req, res) => {
  try {
    const department = await Department.findOneAndUpdate(
      { departmentCode: req.params.code },
      req.body,
      { new: true, runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete department
router.delete('/:code', async (req, res) => {
  try {
    const employees = await Employee.find({ departmentCode: req.params.code });
    if (employees.length > 0) {
      return res.status(400).json({ message: 'Cannot delete department with existing employees' });
    }
    
    await Department.findOneAndDelete({ departmentCode: req.params.code });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;