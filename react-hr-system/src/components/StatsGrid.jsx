import { useState, useEffect } from 'react';
import { dashboardService } from '../lib/services/dashboard.service.js';

const StatsGrid = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setStats({
          totalEmployees: 0,
          todayShifts: 0,
          recentMessages: 0,
          pendingRequests: 0,
          currentDay: 'T2'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-grid">
        <div className="stat-card loading">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Đang tải...</h3>
            <p>---</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <h3>Tổng nhân viên</h3>
          <p className="stat-number">{stats.totalEmployees}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <h3>Ca làm hôm nay</h3>
          <p className="stat-number">{stats.todayShifts}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📝</div>
        <div className="stat-content">
          <h3>Yêu cầu chờ duyệt</h3>
          <p className="stat-number">{stats.pendingRequests}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>Hoạt động gần đây</h3>
          <p className="stat-number">{stats.recentMessages}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
