import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import StatsGrid from '../components/StatsGrid';
import QuickActions from '../components/QuickActions';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h1>Chào mừng đến với HR System</h1>
        <p>Quản lý nhân sự hiệu quả và chuyên nghiệp</p>
      </div>

      <StatsGrid />

      <div className="dashboard-sections">
        <QuickActions />

        <div className="recent-activities">
          <h2 className="section-title">Hoạt động gần đây</h2>
          <div className="activities-list">
            <div className="activity-item">
              <div className="activity-icon">👤</div>
              <div className="activity-content">
                <p><strong>Nguyễn Văn A</strong> đã check-in lúc 08:30</p>
                <span className="activity-time">5 phút trước</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-content">
                <p><strong>Trần Thị B</strong> gửi yêu cầu nghỉ phép</p>
                <span className="activity-time">10 phút trước</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <p><strong>Lê Văn C</strong> hoàn thành task #123</p>
                <span className="activity-time">15 phút trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
