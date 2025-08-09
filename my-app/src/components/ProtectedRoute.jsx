import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="dashboard-loader">
        <div className="loader-content">
          <div className="dual-spinner-container">
            <div className="spinner-outer"></div>
            <div className="spinner-inner"></div>
          </div>
          <h3 className="loader-title">Đang tải...</h3>
          <p className="loader-subtitle">Vui lòng đợi trong giây lát</p>
          <div className="loader-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;