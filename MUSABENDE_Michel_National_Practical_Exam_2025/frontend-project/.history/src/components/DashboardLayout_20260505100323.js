// frontend-project/src/components/DashboardLayout.js
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaBuilding, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaSignOutAlt, 
  FaBars,
  FaUserCircle,
  FaBell
} from 'react-icons/fa';

const DashboardLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard/employees', label: 'Employees', icon: FaUsers },
    { path: '/dashboard/departments', label: 'Departments', icon: FaBuilding },
    { path: '/dashboard/salaries', label: 'Salary', icon: FaMoneyBillWave },
    { path: '/dashboard/reports', label: 'Reports', icon: FaChartLine },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && (
            <div>
              <h2 className="text-xl font-bold">SmartPark</h2>
              <p className="text-xs text-gray-400">EPMS 2025</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FaBars />
          </button>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 transition-colors ${
                  isActive 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className={`${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 transition-colors mt-8"
          >
            <FaSignOutAlt className={`${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Welcome, IRAKOZE TUMUKUNDE AUROLE
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <FaBell className="text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <FaUserCircle className="text-2xl text-gray-600" />
                <span className="text-sm text-gray-700">{user?.fullName || user?.username}</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-8">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                <p>&copy; 2025 SmartPark Employee Payroll Management System</p>
                <p className="text-xs mt-1">National Practical Exam 2025</p>
              </div>
              <div className="space-x-4">
                <Link to="/dashboard" className="hover:text-primary-600">Home</Link>
                <Link to="/dashboard/employees" className="hover:text-primary-600">Employees</Link>
                <Link to="/dashboard/reports" className="hover:text-primary-600">Reports</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;