import React from 'react';

const ShiftAssignment = ({ user }) => {
  return (
    <div className="shift-assignment-section">
      <div className="section-header">
        <h1>Phân Ca</h1>
        <p>Quản lý và phân chia ca làm việc</p>
      </div>
      
      <div className="shift-assignment-container">
        <div className="shift-controls">
          <div className="date-selector">
            <label>Tuần:</label>
            <input type="week" defaultValue={new Date().toISOString().slice(0, 4) + '-W' + Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))} />
          </div>
          <button className="btn btn-primary">
            <span className="material-icons-round">save</span>
            Lưu lịch
          </button>
        </div>
        
        <div className="shift-grid">
          <div className="shift-header">
            <div className="time-slot">Giờ</div>
            <div className="day-header">Thứ 2</div>
            <div className="day-header">Thứ 3</div>
            <div className="day-header">Thứ 4</div>
            <div className="day-header">Thứ 5</div>
            <div className="day-header">Thứ 6</div>
            <div className="day-header">Thứ 7</div>
            <div className="day-header">CN</div>
          </div>
          
          <div className="shift-content">
            <p>Đang phát triển - Bảng phân ca sẽ được triển khai sớm</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftAssignment;