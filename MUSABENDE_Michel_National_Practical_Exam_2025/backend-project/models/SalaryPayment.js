// backend-project/models/SalaryPayment.js
const mongoose = require('mongoose');

const salaryPaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  salaryPeriod: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryPeriod', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  grossSalary: { type: Number, required: true },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  processedAt: { type: Date, default: Date.now },
  calculationDetails: {
    basicSalary: Number,
    allowances: Number,
    tax: Number,
    insurance: Number,
    otherDeductions: Number
  }
});

// Auto-generate payment ID before save
salaryPaymentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('SalaryPayment').countDocuments();
    const paddedNumber = String(count + 1).padStart(3, '0');
    this.paymentId = `PAY${paddedNumber}`;
  }
  next();
});

module.exports = mongoose.model('SalaryPayment', salaryPaymentSchema);