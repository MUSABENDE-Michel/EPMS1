// frontend-project/src/components/SalaryList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';

const SalaryList = () => {
  const [salaryPeriods, setSalaryPeriods] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('periods');
  const [activeMonth, setActiveMonth] = useState(5);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchActiveMonth();
    fetchSalaryPeriods();
    fetchPayments();
  }, [pagination.currentPage]);

  const fetchActiveMonth = async () => {
    try {
      const response = await axios.get('/salary-payments/active-month');
      setActiveMonth(response.data.activeMonth);
    } catch (error) {
      console.error('Failed to fetch active month');
    }
  };

  const fetchSalaryPeriods = async () => {
    try {
      const response = await axios.get(`/salary-periods?page=${pagination.currentPage}&limit=10`);
      setSalaryPeriods(response.data.salaryPeriods);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      toast.error('Failed to fetch salary periods');
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/salary-payments');
      setPayments(response.data.payments);
    } catch (error) {
      toast.error('Failed to fetch salary payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async (periodId, month) => {
    if (month > activeMonth) {
      toast.error(`Cannot process payroll for month ${month} as active month is ${activeMonth}`);
      return;
    }

    try {
      await axios.post('/salary-payments/run-payroll', { periodId });
      toast.success('Payroll processed successfully');
      fetchSalaryPeriods();
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process payroll');
    }
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Salary Management</h2>
          <p className="text-gray-600 mt-1">Process payroll and manage salary payments</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
          Active Month: {getMonthName(activeMonth)} {new Date().getFullYear()}
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('periods')}
              className={`py-2 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'periods'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Salary Periods
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment History
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'periods' && (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaryPeriods.map((period) => (
                <tr key={period._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{period.periodId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {period.employee?.firstName} {period.employee?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {period.year} - {getMonthName(period.month)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${period.basicSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      period.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {period.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {period.status === 'Pending' && (
                      <button
                        onClick={() => handleRunPayroll(period._id, period.month)}
                        className="btn-primary text-sm py-1 px-3 flex items-center gap-1"
                        disabled={period.month > activeMonth}
                      >
                        <FaMoneyBillWave /> Process
                      </button>
                    )}
                    {period.status === 'Paid' && (
                      <span className="text-green-600 flex items-center gap-1">
                        <FaCheckCircle /> Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.paymentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.employee?.firstName} {payment.employee?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${payment.grossSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${payment.deductions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    ${payment.netSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.processedBy?.fullName || payment.processedBy?.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(payment.processedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {activeTab === 'periods' && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
            disabled={pagination.currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SalaryList;