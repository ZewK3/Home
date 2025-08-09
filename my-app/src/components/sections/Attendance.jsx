import React from 'react';

const Attendance = ({ user }) => {
  return (
    <div className="attendance-section">
      <div className="section-header">
        <h1>Chấm Công</h1>
        <p>Chấm công với định vị GPS</p>
      </div>
      
      <div className="attendance-container">
        <div className="attendance-card">
          <div className="current-time">
            <h2>{new Date().toLocaleTimeString('vi-VN')}</h2>
            <p>{new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <div className="attendance-actions">
            <button className="btn btn-success attendance-btn">
              <span className="material-icons-round">login</span>
              Chấm công vào
            </button>
            <button className="btn btn-warning attendance-btn">
              <span className="material-icons-round">logout</span>
              Chấm công ra
            </button>
          </div>
          
          <div className="location-info">
            <span className="material-icons-round">location_on</span>
            <p>Đang xác định vị trí...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;