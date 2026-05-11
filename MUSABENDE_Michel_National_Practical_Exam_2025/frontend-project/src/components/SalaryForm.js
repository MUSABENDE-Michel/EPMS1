// frontend-project/src/components/SalaryForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaEye, FaUsers, FaUserCheck } from 'react-icons/fa';
import BulkPayroll from './BulkPayroll';

const SalaryForm = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [activeTab, setActiveTab] = useState('individual');
  const [activePeriod, setActivePeriod] = useState(null);
  const [formData, setFormData] = useState({
    employeeNumber: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
    fetchDepartments();
    fetchActivePeriod();
  }, [pagination.currentPage]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/salaries?page=${pagination.currentPage}&limit=${pagination.limit}`);
      setSalaries(response.data.salaries || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch salaries:', error);
      toast.error('Failed to fetch salaries');
      setSalaries([]);
    } finally {
      setLoading(false);
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

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    }
  };

  const fetchActivePeriod = async () => {
    try {
      const response = await axios.get('/salaries/active-period');
      setActivePeriod(response.data);
    } catch (error) {
      console.error('Failed to fetch active period:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if period is allowed
    if (formData.year > activePeriod?.activeYear || 
        (formData.year === activePeriod?.activeYear && formData.month > activePeriod?.activeMonth)) {
      toast.error(`Cannot process period ${formData.year}-${formData.month}. Active period is ${activePeriod?.activePeriod}`);
      return;
    }
    
    try {
      if (editingSalary) {
        await axios.put(`/salaries/${editingSalary._id}`, formData);
        toast.success('Salary record updated successfully');
      } else {
        await axios.post('/salaries', formData);
        toast.success('Salary record created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchSalaries();
    } catch (error) {
      console.error('Error saving salary:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (salary) => {
    setEditingSalary(salary);
    setFormData({
      employeeNumber: salary.employeeNumber,
      grossSalary: salary.grossSalary,
      totalDeduction: salary.totalDeduction,
      month: salary.month,
      year: salary.year
    });
    setShowModal(true);
  };

  const handleView = (salary) => {
    setSelectedSalary(salary);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        await axios.delete(`/salaries/${id}`);
        toast.success('Salary record deleted successfully');
        fetchSalaries();
      } catch (error) {
        toast.error('Failed to delete salary record');
      }
    }
  };

  const resetForm = () => {
    setEditingSalary(null);
    setFormData({
      employeeNumber: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading salary records...</p>
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
            <h2 className="text-3xl font-bold mb-2">Salary Management</h2>
            <p className="text-blue-100">Manage employee salary records with active period control</p>
          </div>
          {activePeriod && (
            <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
              <p className="text-xs">Active Period</p>
              <p className="text-lg font-bold">{activePeriod.activePeriod}</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Period Info */}
      {activePeriod && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            📅 <strong>Active Period:</strong> {activePeriod.activePeriod} - You can only process salaries up to this period. Future periods are disabled.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-3 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'individual'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaUserCheck /> Individual Payroll
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-6 py-3 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'bulk'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaUsers /> Bulk Payroll (By Department)
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'individual' ? (
            // Individual Payroll Section
            <div className="space-y-6">
              {/* Add Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaPlus /> Process Individual Salary
                </button>
              </div>

              {/* Salaries Table */}
              {salaries.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No salary records found. Click "Process Individual Salary" to create one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deduction</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salaries.map((salary) => (
                        <tr key={salary._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{salary.salaryId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {salary.firstName} {salary.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{salary.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{salary.departmentCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {salary.grossSalary.toLocaleString()} RWF
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                            {salary.totalDeduction.toLocaleString()} RWF
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">
                            {salary.netSalary.toLocaleString()} RWF
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {getMonthName(salary.month)} {salary.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <button
                              onClick={() => handleView(salary)}
                              className="text-green-600 hover:text-green-800 mx-1 transition-colors"
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEdit(salary)}
                              className="text-blue-600 hover:text-blue-800 mx-1 transition-colors"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(salary._id)}
                              className="text-red-600 hover:text-red-800 mx-1 transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            pagination.currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Bulk Payroll Section
            <BulkPayroll />
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slideUp">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingSalary ? 'Edit Salary Record' : 'Process New Salary'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  name="employeeNumber"
                  value={formData.employeeNumber}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  disabled={editingSalary}
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp.employeeNumber}>
                      {emp.employeeNumber} - {emp.firstName} {emp.lastName} ({emp.position})
                    </option>
                  ))}
                </select>
              </div>
              
              {editingSalary && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gross Salary (RWF)</label>
                    <input
                      type="number"
                      name="grossSalary"
                      value={formData.grossSalary}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Deduction (RWF)</label>
                    <input
                      type="number"
                      name="totalDeduction"
                      value={formData.totalDeduction}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  disabled={formData.year > activePeriod?.activeYear}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option 
                      key={m} 
                      value={m}
                      disabled={formData.year === activePeriod?.activeYear && m > activePeriod?.activeMonth}
                    >
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  min="2024"
                  max={activePeriod?.activeYear || 2030}
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {editingSalary ? 'Update' : 'Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slideUp">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Salary Details
            </h3>
            <div className="space-y-3">
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Salary ID</p>
                <p className="font-semibold font-mono">{selectedSalary.salaryId}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Employee</p>
                <p className="font-semibold">{selectedSalary.firstName} {selectedSalary.lastName}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-semibold">{selectedSalary.position}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-semibold">{selectedSalary.departmentCode}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Gross Salary</p>
                <p className="font-semibold text-blue-600">{selectedSalary.grossSalary.toLocaleString()} RWF</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Total Deduction</p>
                <p className="font-semibold text-red-600">{selectedSalary.totalDeduction.toLocaleString()} RWF</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Net Salary</p>
                <p className="font-semibold text-green-600 text-lg">{selectedSalary.netSalary.toLocaleString()} RWF</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Period</p>
                <p className="font-semibold">{getMonthName(selectedSalary.month)} {selectedSalary.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Date</p>
                <p className="font-semibold">{new Date(selectedSalary.paymentDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryForm;