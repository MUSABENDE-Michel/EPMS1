// frontend-project/src/components/DashboardHome.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaBuilding, FaMoneyBillWave, FaChartLine, FaUserPlus, FaCalendarCheck } from 'react-icons/fa';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSalaries: 0,
    totalPayroll: 0
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, departmentsRes, salariesRes] = await Promise.all([
        axios.get('/employees?page=1&limit=100'),
        axios.get('/departments'),
        axios.get('/salaries?page=1&limit=100')
      ]);

      const employees = employeesRes.data.employees || [];
      const departments = departmentsRes.data || [];
      const salaries = salariesRes.data.salaries || [];

      const totalPayroll = salaries.reduce((sum, s) => sum + s.netSalary, 0);

      setStats({
        totalEmployees: employeesRes.data.total || 0,
        totalDepartments: departments.length,
        totalSalaries: salaries.length,
        totalPayroll: totalPayroll
      });

      setRecentEmployees(employees.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: FaUsers, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', textColor: 'text-blue-600' },
    { title: 'Departments', value: stats.totalDepartments, icon: FaBuilding, color: 'from-green-500 to-green-600', bg: 'bg-green-50', textColor: 'text-green-600' },
    { title: 'Salary Records', value: stats.totalSalaries, icon: FaMoneyBillWave, color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { title: 'Total Payroll', value: `RWF ${stats.totalPayroll.toLocaleString()}`, icon: FaChartLine, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', textColor: 'text-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to SmartPark EPMS</h1>
        <p className="text-blue-100">Employee Payroll Management System - National Practical Exam 2025</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-full`}>
                  <Icon className={`${stat.textColor} text-2xl`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Employees */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            <FaUserPlus /> Recent Employees
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hired Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.employeeNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.firstName} {employee.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{employee.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{employee.departmentCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(employee.hiredDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentEmployees.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;