// frontend-project/src/components/DepartmentList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaBuilding, FaMoneyBillWave, FaUsers, FaChartLine } from 'react-icons/fa';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [activePeriod, setActivePeriod] = useState(null);
  const [formData, setFormData] = useState({
    departmentCode: '',
    departmentName: '',
    grossSalary: '',
    totalDeduction: '',
    description: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchActivePeriod();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to fetch departments');
      setDepartments([]);
    } finally {
      setLoading(false);
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
    try {
      if (editingDepartment) {
        await axios.put(`/departments/${editingDepartment.departmentCode}`, formData);
        toast.success('Department updated successfully');
      } else {
        await axios.post('/departments', formData);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      grossSalary: department.grossSalary,
      totalDeduction: department.totalDeduction,
      description: department.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (departmentCode) => {
    if (window.confirm('Are you sure you want to delete this department? This will affect all employees in this department.')) {
      try {
        await axios.delete(`/departments/${departmentCode}`);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  const resetForm = () => {
    setEditingDepartment(null);
    setFormData({
      departmentCode: '',
      departmentName: '',
      grossSalary: '',
      totalDeduction: '',
      description: ''
    });
  };

  const getDepartmentStats = () => {
    const totalGross = departments.reduce((sum, dept) => sum + dept.grossSalary, 0);
    const totalDeductions = departments.reduce((sum, dept) => sum + dept.totalDeduction, 0);
    const totalNet = totalGross - totalDeductions;
    return { totalGross, totalDeductions, totalNet };
  };

  const stats = getDepartmentStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Department Management</h2>
            <p className="text-purple-100">Configure departments and salary structures</p>
          </div>
          {activePeriod && (
            <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
              <p className="text-xs">Active Period</p>
              <p className="text-lg font-bold">{activePeriod.activePeriod}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Gross Salary</p>
              <p className="text-2xl font-bold">{stats.totalGross.toLocaleString()} RWF</p>
            </div>
            <FaMoneyBillWave className="text-3xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Deductions</p>
              <p className="text-2xl font-bold">{stats.totalDeductions.toLocaleString()} RWF</p>
            </div>
            <FaChartLine className="text-3xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Net Payroll</p>
              <p className="text-2xl font-bold">{stats.totalNet.toLocaleString()} RWF</p>
            </div>
            <FaUsers className="text-3xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add Department
        </button>
      </div>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No departments found. Click "Add Department" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <div key={department._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{department.departmentName}</h3>
                    <p className="text-sm text-gray-300">{department.departmentCode}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(department)}
                      className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors"
                      title="Edit Department"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(department.departmentCode)}
                      className="bg-red-500 p-2 rounded-lg hover:bg-red-600 transition-colors"
                      title="Delete Department"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-gray-600">Gross Salary:</span>
                  <span className="text-lg font-semibold text-blue-600">{department.grossSalary.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-gray-600">Total Deduction:</span>
                  <span className="text-lg font-semibold text-red-600">{department.totalDeduction.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-gray-700">Net Salary:</span>
                  <span className="text-xl font-bold text-green-600">{(department.grossSalary - department.totalDeduction).toLocaleString()} RWF</span>
                </div>
                {department.description && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500">{department.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slideUp">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
                <input
                  type="text"
                  name="departmentCode"
                  value={formData.departmentCode}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  disabled={editingDepartment}
                  placeholder="e.g., CW, ST, MC, ADMS"
                />
                <p className="text-xs text-gray-500 mt-1">Use unique code (max 4 characters)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  name="departmentName"
                  value={formData.departmentName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  placeholder="e.g., Carwash, Stock, Mechanic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gross Salary (RWF)</label>
                <input
                  type="number"
                  name="grossSalary"
                  value={formData.grossSalary}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  placeholder="Enter gross salary amount"
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
                  placeholder="Enter total deduction amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Department description"
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
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {editingDepartment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;