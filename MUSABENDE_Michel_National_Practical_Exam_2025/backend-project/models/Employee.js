// backend-project/models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeNumber: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  position: { type: String, required: true },
  telephone: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  hiredDate: { type: Date, required: true },
  departmentCode: { type: String, ref: 'Department', required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

// Remove pre-save hook - we'll generate employeeNumber in the route

module.exports = mongoose.model('Employee', employeeSchema);