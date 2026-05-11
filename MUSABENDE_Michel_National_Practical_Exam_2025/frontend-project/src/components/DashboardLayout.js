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
  FaBell,
  FaHome,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaCog
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const DashboardLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: MdDashboard, color: 'text-blue-400' },
    { path: '/dashboard/employees', label: 'Employees', icon: FaUsers, color: 'text-green-400' },
    { path: '/dashboard/departments', label: 'Departments', icon: FaBuilding, color: 'text-purple-400' },
    { path: '/dashboard/salaries', label: 'Salary', icon: FaMoneyBillWave, color: 'text-yellow-400' },
    { path: '/dashboard/reports', label: 'Reports', icon: FaChartLine, color: 'text-red-400' },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 z-20 shadow-2xl ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* Logo Area */}
        <div className={`p-6 flex items-center justify-between border-b border-gray-700 ${!sidebarOpen && 'flex-col'}`}>
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaFileInvoiceDollar className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  SmartPark
                </h2>
                <p className="text-xs text-gray-400">EPMS 2025</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FaFileInvoiceDollar className="text-white text-xl" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg hover:bg-gray-800 transition-all duration-200 ${!sidebarOpen && 'mt-4'}`}
          >
            <FaBars />
          </button>
        </div>
        
        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.fullName || user?.username}</p>
                <p className="text-xs text-gray-400">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="mt-8 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 my-1 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} ${isActive ? 'text-white' : item.color} group-hover:text-white transition-colors`} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1 h-8 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 my-1 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-900/20 hover:text-red-300 mt-8 ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <FaSignOutAlt className={`${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </nav>
        
        {/* Version Info */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">Version 1.0.0 | National Exam 2025</p>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-md sticky top-0 z-10">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user?.fullName?.split(' ')[0] || user?.username}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Date Display */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                  <FaBell className="text-gray-600 text-xl" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-20">
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-500">No new notifications</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile Dropdown */}
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <FaUserCircle className="text-white text-2xl" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
        
{/* Static Footer - Smaller Version */}
<footer className="bg-white border-t border-gray-200 mt-12 no-print">
  <div className="px-6 py-4">
    <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 space-y-2 md:space-y-0">
      <div className="flex items-center space-x-4">
        <span>© {new Date().getFullYear()} SmartPark EPMS</span>
        <span>•</span>
        <span>National Practical Exam 2025</span>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Home</Link>
        <Link to="/dashboard/employees" className="hover:text-blue-600 transition-colors">Employees</Link>
        <Link to="/dashboard/departments" className="hover:text-blue-600 transition-colors">Departments</Link>
        <Link to="/dashboard/reports" className="hover:text-blue-600 transition-colors">Reports</Link>
      </div>
      <div>
        <span>Version 1.0.0</span>
      </div>
    </div>
  </div>
</footer>
      </div>
    </div>
  );
};

export default DashboardLayout;