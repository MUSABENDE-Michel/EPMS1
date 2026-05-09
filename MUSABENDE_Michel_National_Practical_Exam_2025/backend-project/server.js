// backend-project/server.js (updated)
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  initializeData();
}).catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const departmentRoutes = require('./routes/departments');
const salaryRoutes = require('./routes/salaries');
const reportRoutes = require('./routes/reports');
// backend-project/server.js (Add to existing routes)
const passwordResetRoutes = require('./routes/passwordReset');


// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/reports', reportRoutes);
// Add this after other route declarations
app.use('/api/password-reset', passwordResetRoutes);
// Initialize data function
async function initializeData() {
  // Check if admin user exists
  const User = require('./models/User');
  const Department = require('./models/Department');
  
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      fullName: 'System Administrator',
      email: 'admin@smartpark.com',
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created');
  }
  
  // Initialize default departments
  const defaultDepts = [
    { departmentCode: 'CW', departmentName: 'Carwash', grossSalary: 300000, totalDeduction: 20000 },
    { departmentCode: 'ST', departmentName: 'Stock', grossSalary: 200000, totalDeduction: 5000 },
    { departmentCode: 'MC', departmentName: 'Mechanic', grossSalary: 450000, totalDeduction: 40000 },
    { departmentCode: 'ADMS', departmentName: 'Administration Staff', grossSalary: 600000, totalDeduction: 70000 }
  ];
  
  for (const dept of defaultDepts) {
    const exists = await Department.findOne({ departmentCode: dept.departmentCode });
    if (!exists) {
      await Department.create(dept);
      console.log(`Department ${dept.departmentName} created`);
    }
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});