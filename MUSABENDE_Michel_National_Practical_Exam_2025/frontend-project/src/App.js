// frontend-project/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';
import EmployeeList from './components/EmployeeList';
import DepartmentList from './components/DepartmentList';
import SalaryForm from './components/SalaryForm';
import Reports from './components/Reports';

// Configure axios
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get('/auth/session');
      if (response.data.loggedIn) {
        setIsAuthenticated(true);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading SmartPark EPMS...</p>
          <p className="text-sm text-gray-500 mt-2">Employee Payroll Management System</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? 
            <Login onLogin={handleLogin} /> : 
            <Navigate to="/dashboard" />
          } 
        />
        <Route 
          path="/register" 
          element={
            !isAuthenticated ? 
            <Register /> : 
            <Navigate to="/dashboard" />
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            !isAuthenticated ? 
            <ForgotPassword /> : 
            <Navigate to="/dashboard" />
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            !isAuthenticated ? 
            <ResetPassword /> : 
            <Navigate to="/dashboard" />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
            <DashboardLayout user={user} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } 
        >
          <Route index element={<DashboardHome />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="salaries" element={<SalaryForm />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;