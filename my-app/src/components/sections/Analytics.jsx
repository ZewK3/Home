import React from 'react';

const Analytics = ({ user }) => {
  return (
    <div className="analytics-section">
      <div className="section-header">
        <h1>Báo Cáo</h1>
        <p>Thống kê và phân tích dữ liệu</p>
      </div>
      
      <div className="analytics-container">
        <div className="analytics-controls">
          <div className="period-selector">
            <label>Kỳ báo cáo:</label>
            <select>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm này</option>
            </select>
          </div>
          <div className="report-type">
            <label>Loại báo cáo:</label>
            <select>
              <option value="attendance">Chấm công</option>
              <option value="tasks">Công việc</option>
              <option value="performance">Hiệu suất</option>
              <option value="requests">Đơn từ</option>
            </select>
          </div>
          <button className="btn btn-primary">
            <span className="material-icons-round">analytics</span>
            Tạo báo cáo
          </button>
        </div>
        
        <div className="analytics-summary">
          <div className="summary-card">
            <h3>Tỷ lệ chấm công</h3>
            <div className="metric">95%</div>
          </div>
          <div className="summary-card">
            <h3>Nhiệm vụ hoàn thành</h3>
            <div className="metric">87%</div>
          </div>
          <div className="summary-card">
            <h3>Đơn từ chờ duyệt</h3>
            <div className="metric">7</div>
          </div>
        </div>
        
        <div className="analytics-charts">
          <div className="chart-placeholder">
            <p>Đang phát triển - Biểu đồ thống kê sẽ được triển khai sớm</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;