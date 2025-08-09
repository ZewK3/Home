import React from 'react';

const AttendanceRequest = ({ user }) => {
  return (
    <div className="attendance-request-section">
      <div className="section-header">
        <h1>Đơn Từ</h1>
        <p>Gửi và quản lý đơn xin nghỉ phép</p>
      </div>
      
      <div className="request-container">
        <div className="request-form">
          <h3>Gửi đơn mới</h3>
          <form>
            <div className="form-group">
              <label>Loại đơn:</label>
              <select>
                <option>Nghỉ phép</option>
                <option>Nghỉ ốm</option>
                <option>Đi muộn</option>
                <option>Về sớm</option>
              </select>
            </div>
            <div className="form-group">
              <label>Từ ngày:</label>
              <input type="date" />
            </div>
            <div className="form-group">
              <label>Đến ngày:</label>
              <input type="date" />
            </div>
            <div className="form-group">
              <label>Lý do:</label>
              <textarea rows="4" placeholder="Nhập lý do xin nghỉ..."></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              <span className="material-icons-round">send</span>
              Gửi đơn
            </button>
          </form>
        </div>
        
        <div className="request-history">
          <h3>Lịch sử đơn từ</h3>
          <p>Đang phát triển - Chức năng lịch sử đơn từ sẽ được triển khai sớm</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRequest;