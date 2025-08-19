import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DashboardHeader = ({ user, onMobileMenuToggle }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="mobile-menu-toggle"
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            <span className="material-icons-round">menu</span>
          </button>
          <div className="header-brand">
            <h1>HR Management System</h1>
          </div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            {/* Theme Toggle */}
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <span className="material-icons-round">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Notifications */}
            <button className="notification-btn" aria-label="Notifications">
              <span className="material-icons-round">notifications</span>
              <span className="notification-badge">3</span>
            </button>

            {/* User Menu */}
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">
                  <span className="material-icons-round">person</span>
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.fullName || 'User'}</span>
                  <span className="user-role">{user?.role || 'Employee'}</span>
                </div>
              </div>
              <div className="user-dropdown">
                <button className="dropdown-item">
                  <span className="material-icons-round">person</span>
                  Hồ sơ cá nhân
                </button>
                <button className="dropdown-item">
                  <span className="material-icons-round">settings</span>
                  Cài đặt
                </button>
                <hr className="dropdown-divider" />
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span className="material-icons-round">logout</span>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;