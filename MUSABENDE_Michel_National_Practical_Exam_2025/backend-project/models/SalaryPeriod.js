// backend-project/models/SalaryPeriod.js
const mongoose = require('mongoose');

const salaryPeriodSchema = new mongoose.Schema({
  periodId: { type: String, required: true, unique: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  basicSalary: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate period ID before save
salaryPeriodSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('SalaryPeriod').countDocuments();
    const paddedNumber = String(count + 1).padStart(3, '0');
    this.periodId = `SAL${paddedNumber}`;
  }
  next();
});

module.exports = mongoose.model('SalaryPeriod', salaryPeriodSchema);