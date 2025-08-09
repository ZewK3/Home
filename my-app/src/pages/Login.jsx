import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData);
      if (result.success) {
        // Login successful, redirect handled by ProtectedRoute
      } else {
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      setError('Lỗi hệ thống. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  // Test login function for development
  const testLogin = async (testUser) => {
    const testCredentials = {
      employeeId: testUser,
      password: 'password123'
    };
    setFormData(testCredentials);
    const result = await login(testCredentials);
    if (!result.success) {
      showNotification(`Test login cho ${testUser}: ${result.message}`);
    }
  };

  return (
    <>
      <div className='flag-vn'></div>
      <div className="glass-bg">
        <div className="glass-circle circle-1"></div>
        <div className="glass-circle circle-2"></div>
        <div className="glass-circle circle-3"></div>
      </div>

      <div className="aurora"></div>
      <div className="stars"></div>
      <div className="light-streaks"></div>

      {/* Notification Element */}
      {notification && (
        <div className="notification">{notification}</div>
      )}

      {/* Auth Container */}
      <div className="auth-container">
        {/* Login Form */}
        <div className="form-container active">
          <div className="form-header">
            <div className="logo-container">
              <h2>Đăng nhập</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <div className="input-group">
                <span className="material-icons-round input-icon">badge</span>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="Mã nhân viên"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="material-icons-round input-icon">lock</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mật khẩu"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="material-icons-round">hourglass_empty</span>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <span className="material-icons-round">login</span>
                  Đăng nhập
                </>
              )}
            </button>

            {/* Test Buttons for Development */}
            <div className="test-login-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                Test Users (Development)
              </p>
              <div className="test-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => testLogin('ADMIN001')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                >
                  Admin
                </button>
                <button 
                  type="button" 
                  onClick={() => testLogin('AM001')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                >
                  Manager
                </button>
                <button 
                  type="button" 
                  onClick={() => testLogin('QL001')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                >
                  Store Leader
                </button>
                <button 
                  type="button" 
                  onClick={() => testLogin('NV001')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                >
                  Employee
                </button>
              </div>
            </div>
          </form>

          <div className="form-footer">
            <p>
              <span className="material-icons-round">shield</span>
              Hệ thống bảo mật cao
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;