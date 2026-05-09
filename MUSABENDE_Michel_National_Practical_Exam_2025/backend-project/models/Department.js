// backend-project/models/Department.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentCode: { type: String, required: true, unique: true },
  departmentName: { type: String, required: true, unique: true },
  grossSalary: { type: Number, required: true },
  totalDeduction: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// No pre-save hook - let the code handle the departmentCode

module.exports = mongoose.model('Department', departmentSchema);