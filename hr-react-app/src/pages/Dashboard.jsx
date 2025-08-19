import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Import only working CSS files
import '../assets/css/base.css';
import '../assets/css/components.css';
import '../assets/css/navigation.css';
import '../assets/css/modals.css';
import '../assets/css/containers.css';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleViewChange = (view) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'attendance':
        return <AttendanceView />;
      case 'tasks':
        return <TasksView />;
      case 'employees':
        return <EmployeesView />;
      case 'reports':
        return <ReportsView />;
      case 'personal':
        return <PersonalInfoView />;
      default:
        return <DashboardOverview />;
    }
  };

  if (isLoading) {
    return (
      <div id="dashboardLoader" className="dashboard-loader">
        <div className="loader-content">
          <div className="dual-spinner-container">
            <div className="spinner-outer"></div>
            <div className="spinner-inner"></div>
          </div>
          <h3 className="loader-title">Đang tải Dashboard...</h3>
          <p className="loader-subtitle">Vui lòng đợi trong giây lát</p>
          <div className="loader-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
        <div className="loader-background">
          <div className="floating-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-content ${theme}`}>
      {/* Mobile Navigation Dialog */}
      {mobileMenuOpen && (
        <div className="mobile-nav-dialog">
          <div className="mobile-nav-content">
            <div className="mobile-nav-header">
              <h2>Menu</h2>
              <button 
                type="button" 
                className="close-dialog"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <DashboardSidebar 
              isMobile={true} 
              activeView={activeView}
              onViewChange={handleViewChange}
              userRole={user?.role}
            />
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="app-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Dashboard Header */}
      <DashboardHeader 
        user={user}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main App Layout */}
      <div className="app-layout">
        {/* Desktop Sidebar */}
        <DashboardSidebar 
          isMobile={false}
          activeView={activeView}
          onViewChange={handleViewChange}
          userRole={user?.role}
        />

        {/* Main Content */}
        <main className="app-main">
          <div className="main-content">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = () => {
  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Chào mừng bạn đến với hệ thống quản lý HR</p>
      </div>
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons-round">people</span>
          </div>
          <div className="stat-content">
            <h3>Nhân viên</h3>
            <p className="stat-number">125</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons-round">schedule</span>
          </div>
          <div className="stat-content">
            <h3>Chấm công hôm nay</h3>
            <p className="stat-number">98</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons-round">task</span>
          </div>
          <div className="stat-content">
            <h3>Nhiệm vụ</h3>
            <p className="stat-number">24</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons-round">pending</span>
          </div>
          <div className="stat-content">
            <h3>Yêu cầu chờ duyệt</h3>
            <p className="stat-number">7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for different views
const AttendanceView = () => (
  <div className="view-container">
    <h2>Quản lý chấm công</h2>
    <p>Module chấm công GPS sẽ được hiển thị ở đây</p>
  </div>
);

const TasksView = () => (
  <div className="view-container">
    <h2>Quản lý nhiệm vụ</h2>
    <p>Module quản lý công việc sẽ được hiển thị ở đây</p>
  </div>
);

const EmployeesView = () => (
  <div className="view-container">
    <h2>Quản lý nhân sự</h2>
    <p>Module quản lý nhân viên sẽ được hiển thị ở đây</p>
  </div>
);

const ReportsView = () => (
  <div className="view-container">
    <h2>Báo cáo</h2>
    <p>Module báo cáo và thống kê sẽ được hiển thị ở đây</p>
  </div>
);

const PersonalInfoView = () => (
  <div className="view-container">
    <h2>Thông tin cá nhân</h2>
    <p>Thông tin chi tiết về nhân viên sẽ được hiển thị ở đây</p>
  </div>
);

export default Dashboard;