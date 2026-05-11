// frontend-project/src/components/Reports.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaChartBar, 
  FaPrint, 
  FaDownload, 
  FaFilePdf, 
  FaFileExcel,
  FaUser,
  FaCalendarAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaChartLine,
  FaUserCheck,
  FaClock
} from 'react-icons/fa';

const Reports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [reportData, setReportData] = useState(null);
  const [departmentSummary, setDepartmentSummary] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchEmployees();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await axios.get('/auth/session');
      if (response.data.loggedIn) {
        setCurrentUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/employees/all');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    }
  };

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/reports/monthly-payroll?year=${selectedYear}&month=${selectedMonth}`);
      setReportData({
        ...response.data,
        generatedBy: currentUser,
        generatedAt: new Date(),
        period: { month: selectedMonth, year: selectedYear }
      });
      setDepartmentSummary(null);
      setYearlyData(null);
      setEmployeeHistory(null);
      toast.success('Monthly report generated successfully');
    } catch (error) {
      toast.error('Failed to fetch monthly report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/reports/department-summary');
      setDepartmentSummary({
        data: response.data,
        generatedBy: currentUser,
        generatedAt: new Date(),
        period: { year: selectedYear }
      });
      setReportData(null);
      setYearlyData(null);
      setEmployeeHistory(null);
      toast.success('Department summary generated successfully');
    } catch (error) {
      toast.error('Failed to fetch department summary');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlySummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/reports/yearly-summary?year=${selectedYear}`);
      setYearlyData({
        ...response.data,
        generatedBy: currentUser,
        generatedAt: new Date(),
        period: { year: selectedYear }
      });
      setReportData(null);
      setDepartmentSummary(null);
      setEmployeeHistory(null);
      toast.success('Yearly summary generated successfully');
    } catch (error) {
      toast.error('Failed to fetch yearly summary');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeHistory = async () => {
    if (!employeeNumber) {
      toast.error('Please select an employee');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/reports/employee-history/${employeeNumber}`);
      const selectedEmp = employees.find(e => e.employeeNumber === employeeNumber);
      setEmployeeHistory({
        ...response.data,
        generatedBy: currentUser,
        generatedAt: new Date(),
        period: { employee: selectedEmp }
      });
      setReportData(null);
      setDepartmentSummary(null);
      setYearlyData(null);
      toast.success('Employee history retrieved successfully');
    } catch (error) {
      toast.error('Failed to fetch employee history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportType === 'monthly') {
      fetchMonthlyReport();
    } else if (reportType === 'department') {
      fetchDepartmentSummary();
    } else if (reportType === 'yearly') {
      fetchYearlySummary();
    } else if (reportType === 'employee') {
      fetchEmployeeHistory();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  const getMonthName = (month) => months[month - 1];

  if (loading && !reportData && !departmentSummary && !yearlyData && !employeeHistory) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Generating professional report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Professional Reports</h2>
            <p className="text-blue-100">Comprehensive payroll analytics and reporting</p>
          </div>
          {reportData && (
            <button onClick={handlePrint} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2">
              <FaPrint /> Print Report
            </button>
          )}
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              <option value="monthly">📊 Monthly Payroll Report</option>
              <option value="department">🏢 Department Summary</option>
              <option value="yearly">📈 Yearly Summary Report</option>
              <option value="employee">👤 Employee Salary History</option>
            </select>
          </div>
          
          {reportType === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="input-field"
                  min="2020"
                  max="2030"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="input-field"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          {reportType === 'yearly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input-field"
                min="2020"
                max="2030"
              />
            </div>
          )}
          
          {reportType === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                className="input-field"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.employeeNumber}>
                    {emp.employeeNumber} - {emp.firstName} {emp.lastName} ({emp.position})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <FaChartBar /> Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Payroll Report */}
      {reportData && !loading && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden print:shadow-none">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">SmartPark Employee Payroll Management System</h3>
              <p className="text-gray-300">Professional Monthly Payroll Report</p>
              <div className="mt-4 flex justify-center space-x-6 text-sm">
                <span className="flex items-center gap-2">
                  <FaCalendarAlt /> {getMonthName(reportData.period.month)} {reportData.period.year}
                </span>
                <span className="flex items-center gap-2">
                  <FaUserCheck /> Generated by: {reportData.generatedBy?.fullName || reportData.generatedBy?.username}
                </span>
                <span className="flex items-center gap-2">
                  <FaClock /> {new Date(reportData.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Executive Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalEmployees}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Net Payroll</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.summary.totalNetPayroll)}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Gross Payroll</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(reportData.summary.totalGrossPayroll)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(reportData.summary.totalDeductions)}</p>
              </div>
            </div>
          </div>

          {/* Detailed Report Table */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Employee Payroll Details</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.report.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.firstName} {record.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(record.grossSalary)}</td>
                      <td className="px-6 py-4 text-sm text-red-600 text-right">{formatCurrency(record.deductions)}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold text-right">{formatCurrency(record.netSalary)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td colSpan="3" className="px-6 py-3 text-right">Totals:</td>
                    <td className="px-6 py-3 text-right">{formatCurrency(reportData.summary.totalGrossPayroll)}</td>
                    <td className="px-6 py-3 text-right">{formatCurrency(reportData.summary.totalDeductions)}</td>
                    <td className="px-6 py-3 text-right">{formatCurrency(reportData.summary.totalNetPayroll)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Report Footer */}
          <div className="bg-gray-50 p-4 border-t text-center text-xs text-gray-500">
            <p>This report is system-generated and does not require signature. For inquiries, contact HR department.</p>
            <p className="mt-1">SmartPark EPMS | National Practical Exam 2025</p>
          </div>
        </div>
      )}

      {/* Department Summary Report */}
      {departmentSummary && !loading && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Department Salary Summary Report</h3>
              <p className="text-gray-300">Annual Department Analytics - {departmentSummary.period.year}</p>
              <div className="mt-4 flex justify-center space-x-6 text-sm">
                <span className="flex items-center gap-2">
                  <FaUserCheck /> Generated by: {departmentSummary.generatedBy?.fullName || departmentSummary.generatedBy?.username}
                </span>
                <span className="flex items-center gap-2">
                  <FaClock /> {new Date(departmentSummary.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departmentSummary.data.map((dept, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{dept.departmentName}</h4>
                      <p className="text-sm text-gray-500">Code: {dept.departmentCode}</p>
                    </div>
                    <FaBuilding className="text-3xl text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Employees:</span>
                      <span className="font-semibold">{dept.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Gross Salary:</span>
                      <span className="font-semibold">{formatCurrency(dept.baseGrossSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Deduction:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(dept.baseDeduction)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Payroll Processed:</span>
                        <span className="font-bold text-green-600">{formatCurrency(dept.totalPayrollProcessed)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 border-t text-center text-xs text-gray-500">
            <p>Department performance summary for the fiscal year {departmentSummary.period.year}</p>
            <p className="mt-1">SmartPark EPMS | National Practical Exam 2025</p>
          </div>
        </div>
      )}

      {/* Yearly Summary Report */}
      {yearlyData && !loading && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Yearly Financial Summary Report</h3>
              <p className="text-gray-300">Comprehensive Annual Payroll Analysis - {yearlyData.period.year}</p>
              <div className="mt-4 flex justify-center space-x-6 text-sm">
                <span className="flex items-center gap-2">
                  <FaUserCheck /> Generated by: {yearlyData.generatedBy?.fullName || yearlyData.generatedBy?.username}
                </span>
                <span className="flex items-center gap-2">
                  <FaClock /> {new Date(yearlyData.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Employees Processed</p>
                <p className="text-2xl font-bold text-purple-600">{yearlyData.yearlyTotal.totalEmployeesProcessed}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Yearly Net Payroll</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(yearlyData.yearlyTotal.totalNetSalary)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Average Monthly Payroll</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(yearlyData.yearlyTotal.totalNetSalary / 12)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Employees</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {yearlyData.monthlyData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{getMonthName(data.month)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{data.totalEmployees}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(data.totalGrossSalary)}</td>
                      <td className="px-6 py-4 text-sm text-red-600 text-right">{formatCurrency(data.totalDeductions)}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold text-right">{formatCurrency(data.totalNetSalary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 p-4 border-t text-center text-xs text-gray-500">
            <p>Year-end financial summary for {yearlyData.period.year}. All amounts are in Rwandan Francs (RWF).</p>
            <p className="mt-1">SmartPark EPMS | National Practical Exam 2025</p>
          </div>
        </div>
      )}

      {/* Employee History Report */}
      {employeeHistory && !loading && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Employee Salary History Report</h3>
              <p className="text-gray-300">
                {employeeHistory.employee.firstName} {employeeHistory.employee.lastName} - {employeeHistory.employee.employeeNumber}
              </p>
              <div className="mt-4 flex justify-center space-x-6 text-sm">
                <span className="flex items-center gap-2">
                  <FaUserCheck /> Generated by: {employeeHistory.generatedBy?.fullName || employeeHistory.generatedBy?.username}
                </span>
                <span className="flex items-center gap-2">
                  <FaClock /> {new Date(employeeHistory.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Months Processed</p>
                <p className="text-2xl font-bold text-blue-600">{employeeHistory.summary.monthsProcessed}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(employeeHistory.summary.totalEarned)}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Gross</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(employeeHistory.summary.totalGross)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(employeeHistory.summary.totalDeductions)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeeHistory.salaryHistory.map((salary, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {getMonthName(salary.month)} {salary.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(salary.grossSalary)}</td>
                      <td className="px-6 py-4 text-sm text-red-600 text-right">{formatCurrency(salary.totalDeduction)}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold text-right">{formatCurrency(salary.netSalary)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(salary.paymentDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 p-4 border-t text-center text-xs text-gray-500">
            <p>Complete salary history for {employeeHistory.employee.firstName} {employeeHistory.employee.lastName}</p>
            <p className="mt-1">SmartPark EPMS | National Practical Exam 2025</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;