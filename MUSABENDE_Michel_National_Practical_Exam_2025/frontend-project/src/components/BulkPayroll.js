// frontend-project/src/components/BulkPayroll.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaBuilding, 
  FaUsers, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaPlay,
  FaChartLine,
  FaClock
} from 'react-icons/fa';

const BulkPayroll = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activePeriod, setActivePeriod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [pendingInfo, setPendingInfo] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchDepartments();
    fetchActivePeriod();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
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

  const fetchPendingInfo = async () => {
    if (!selectedDepartment) {
      toast.error('Please select a department');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`/salaries/pending-department/${selectedDepartment}`);
      setPendingInfo(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending period information');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDepartment = async () => {
    if (!selectedDepartment) {
      toast.error('Please select a department');
      return;
    }
    
    // Check if period is allowed
    if (selectedYear > activePeriod?.activeYear || 
        (selectedYear === activePeriod?.activeYear && selectedMonth > activePeriod?.activeMonth)) {
      toast.error(`Cannot process period ${selectedYear}-${selectedMonth}. Active period is ${activePeriod?.activePeriod}`);
      return;
    }
    
    setProcessing(true);
    setResult(null);
    
    try {
      const response = await axios.post('/salaries/process-department', {
        departmentCode: selectedDepartment,
        month: selectedMonth,
        year: selectedYear
      });
      
      setResult(response.data);
      toast.success(response.data.message);
      fetchPendingInfo();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process department payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessAll = async () => {
    // Check if period is allowed
    if (selectedYear > activePeriod?.activeYear || 
        (selectedYear === activePeriod?.activeYear && selectedMonth > activePeriod?.activeMonth)) {
      toast.error(`Cannot process period ${selectedYear}-${selectedMonth}. Active period is ${activePeriod?.activePeriod}`);
      return;
    }
    
    if (!window.confirm(`⚠️ WARNING: This will process payroll for ALL employees for ${months[selectedMonth - 1]} ${selectedYear}. This action cannot be undone. Do you want to continue?`)) {
      return;
    }
    
    setProcessing(true);
    setResult(null);
    
    try {
      const response = await axios.post('/salaries/process-all', {
        month: selectedMonth,
        year: selectedYear
      });
      
      setResult(response.data);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process all payroll');
    } finally {
      setProcessing(false);
    }
  };

  const isPeriodAllowed = () => {
    if (!activePeriod) return false;
    return !(selectedYear > activePeriod.activeYear || 
             (selectedYear === activePeriod.activeYear && selectedMonth > activePeriod.activeMonth));
  };

  const getDepartmentName = () => {
    const dept = departments.find(d => d.departmentCode === selectedDepartment);
    return dept ? dept.departmentName : '';
  };

  return (
    <div className="space-y-6">
      {/* Active Period Info */}
      {activePeriod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaClock className="text-blue-600 text-xl mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Active Period Information</p>
              <p className="text-sm text-blue-700">
                Current active period is <strong>{activePeriod.activePeriod}</strong>. 
                You can only process salaries for periods up to and including this date.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Configuration */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600" />
            Payroll Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Period</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {[2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {months.map((month, index) => (
                      <option 
                        key={index} 
                        value={index + 1}
                        disabled={selectedYear === activePeriod?.activeYear && index + 1 > activePeriod?.activeMonth}
                      >
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {!isPeriodAllowed() && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <FaExclamationTriangle /> This period is beyond the active period and cannot be processed
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department (Optional)</label>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setPendingInfo(null);
                }}
                className="input-field"
              >
                <option value="">-- Select Department (Leave empty for all) --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.departmentCode}>
                    {dept.departmentName} ({dept.departmentCode}) - {dept.grossSalary.toLocaleString()} RWF
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleProcessDepartment}
                disabled={!selectedDepartment || processing || !isPeriodAllowed()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? <FaSpinner className="animate-spin" /> : <FaBuilding />}
                Process Department
              </button>
              
              <button
                onClick={handleProcessAll}
                disabled={processing || !isPeriodAllowed()}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? <FaSpinner className="animate-spin" /> : <FaUsers />}
                Process All Employees
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Information & Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-600" />
            Department Information
          </h3>
          
          {selectedDepartment ? (
            <div>
              <button
                onClick={fetchPendingInfo}
                disabled={loading}
                className="mb-4 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaPlay />}
                Check pending periods for {getDepartmentName()}
              </button>
              
              {pendingInfo && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Employees in Department:</span>
                      <span className="text-2xl font-bold text-blue-600">{pendingInfo.employeeCount}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Pending Periods:</p>
                    {pendingInfo.pendingPeriods.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {pendingInfo.pendingPeriods.map((period, idx) => (
                          <span key={idx} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            {period.year}-{String(period.month).padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <FaCheckCircle /> All periods processed for this department!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaBuilding className="text-4xl mx-auto mb-2 opacity-50" />
              <p>Select a department to view information</p>
              <p className="text-xs mt-2">Or use "Process All Employees" for entire organization</p>
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Processing Results for {result.period?.month}-{result.period?.year}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
              <p className="text-sm text-gray-600">Successfully Processed</p>
              <p className="text-2xl font-bold text-green-600">{result.results.processed.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
              <p className="text-sm text-gray-600">Skipped (Already Processed)</p>
              <p className="text-2xl font-bold text-yellow-600">{result.results.skipped.length}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{result.results.errors.length}</p>
            </div>
          </div>
          
          {result.results.processed.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" /> Processed Employees:
              </p>
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Employee</th>
                      <th className="px-3 py-2 text-left">Department</th>
                      <th className="px-3 py-2 text-right">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.processed.map((emp, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2">{emp.name}</td>
                        <td className="px-3 py-2">{emp.department || result.departmentCode}</td>
                        <td className="px-3 py-2 text-right text-green-600 font-semibold">
                          {emp.netSalary?.toLocaleString()} RWF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {result.results.errors.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-red-700 mb-2 flex items-center gap-2">
                <FaExclamationTriangle /> Errors:
              </p>
              <div className="max-h-32 overflow-y-auto border border-red-200 rounded-lg bg-red-50 p-2">
                {result.results.errors.map((err, idx) => (
                  <p key={idx} className="text-sm text-red-600">
                    • {err.name}: {err.error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkPayroll;