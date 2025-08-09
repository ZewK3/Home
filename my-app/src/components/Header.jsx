import React from 'react';

const Header = ({ user, theme, onThemeToggle, onLogout, onMenuToggle }) => {
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      onLogout();
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          className="mobile-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle mobile menu"
        >
          <span className="material-icons-round">menu</span>
        </button>
        <h1 className="header-title">HR Management System</h1>
      </div>
      
      <div className="header-right">
        <div className="header-controls">
          {/* Theme Toggle */}
          <button 
            className="theme-toggle"
            onClick={onThemeToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="material-icons-round">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
          
          {/* User Info */}
          <div className="user-info">
            <div className="user-avatar">
              <span className="material-icons-round">person</span>
            </div>
            <div className="user-details">
              <span className="user-name">{user?.fullName || 'Người dùng'}</span>
              <span className="user-role">{user?.position || 'Nhân viên'}</span>
            </div>
          </div>
          
          {/* Logout Button */}
          <button 
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Đăng xuất"
          >
            <span className="material-icons-round">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;