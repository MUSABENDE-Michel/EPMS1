// backend-project/models/Salary.js
const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  salaryId: { type: String, unique: true },
  employeeNumber: { type: String, ref: 'Employee', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String, required: true },
  departmentCode: { type: String, ref: 'Department', required: true },
  grossSalary: { type: Number, required: true },
  totalDeduction: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Processed', 'Paid'], default: 'Pending' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Salary', salarySchema);