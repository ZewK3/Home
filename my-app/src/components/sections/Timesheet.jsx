import React from 'react';

const Timesheet = ({ user }) => {
  return (
    <div className="timesheet-section">
      <div className="section-header">
        <h1>Bảng Công</h1>
        <p>Xem và quản lý bảng chấm công</p>
      </div>
      
      <div className="timesheet-container">
        <div className="timesheet-header">
          <div className="date-selector">
            <label>Tháng/Năm:</label>
            <input type="month" defaultValue={new Date().toISOString().slice(0, 7)} />
          </div>
          <button className="btn btn-primary">
            <span className="material-icons-round">refresh</span>
            Tải lại
          </button>
        </div>
        
        <div className="timesheet-content">
          <p>Đang phát triển - Chức năng bảng công sẽ được triển khai sớm</p>
        </div>
      </div>
    </div>
  );
};

export default Timesheet;