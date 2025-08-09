import React, { useState, useEffect } from 'react';

const DashboardHome = ({ user, onNavigate }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingRequests: 0,
    activeTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      setTimeout(() => {
        setStats({
          totalEmployees: 45,
          presentToday: 38,
          pendingRequests: 7,
          activeTasks: 23
        });
        
        setRecentActivities([
          {
            id: 1,
            type: 'attendance',
            message: 'Nguyễn Văn A đã chấm công vào lúc 08:30',
            time: '2 phút trước',
            icon: 'schedule'
          },
          {
            id: 2,
            type: 'task',
            message: 'Nhiệm vụ "Kiểm tra hàng tồn kho" đã được hoàn thành',
            time: '15 phút trước',
            icon: 'task_alt'
          },
          {
            id: 3,
            type: 'request',
            message: 'Trần Thị B đã gửi đơn xin nghỉ phép',
            time: '1 giờ trước',
            icon: 'assignment'
          }
        ]);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Chào mừng trở lại, {user?.fullName || 'Người dùng'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('attendance')}>
          <div className="stat-icon">
            <span className="material-icons-round">people</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalEmployees}</h3>
            <p>Tổng nhân viên</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('attendance')}>
          <div className="stat-icon">
            <span className="material-icons-round">check_circle</span>
          </div>
          <div className="stat-content">
            <h3>{stats.presentToday}</h3>
            <p>Có mặt hôm nay</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('attendance-request')}>
          <div className="stat-icon">
            <span className="material-icons-round">pending</span>
          </div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Đơn chờ duyệt</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('work-tasks')}>
          <div className="stat-icon">
            <span className="material-icons-round">assignment</span>
          </div>
          <div className="stat-content">
            <h3>{stats.activeTasks}</h3>
            <p>Nhiệm vụ đang thực hiện</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div className="action-grid">
          <button className="action-card" onClick={() => onNavigate('attendance')}>
            <span className="material-icons-round">location_on</span>
            <span>Chấm công</span>
          </button>
          <button className="action-card" onClick={() => onNavigate('timesheet')}>
            <span className="material-icons-round">calendar_view_month</span>
            <span>Xem bảng công</span>
          </button>
          <button className="action-card" onClick={() => onNavigate('attendance-request')}>
            <span className="material-icons-round">send</span>
            <span>Gửi đơn từ</span>
          </button>
          <button className="action-card" onClick={() => onNavigate('work-tasks')}>
            <span className="material-icons-round">task</span>
            <span>Xem công việc</span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h2>Hoạt động gần đây</h2>
        <div className="activity-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                <span className="material-icons-round">{activity.icon}</span>
              </div>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;