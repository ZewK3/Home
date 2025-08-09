import React from 'react';

const TaskAssignment = ({ user }) => {
  return (
    <div className="task-assignment-section">
      <div className="section-header">
        <h1>Nhiệm Vụ</h1>
        <p>Phân công và theo dõi nhiệm vụ</p>
      </div>
      
      <div className="task-assignment-container">
        <div className="assignment-form">
          <h3>Phân công nhiệm vụ mới</h3>
          <form>
            <div className="form-group">
              <label>Tên nhiệm vụ:</label>
              <input type="text" placeholder="Nhập tên nhiệm vụ..." />
            </div>
            <div className="form-group">
              <label>Mô tả:</label>
              <textarea rows="3" placeholder="Mô tả chi tiết nhiệm vụ..."></textarea>
            </div>
            <div className="form-group">
              <label>Phân công cho:</label>
              <select>
                <option>Chọn nhân viên...</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hạn hoàn thành:</label>
              <input type="datetime-local" />
            </div>
            <div className="form-group">
              <label>Độ ưu tiên:</label>
              <select>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              <span className="material-icons-round">assignment</span>
              Phân công
            </button>
          </form>
        </div>
        
        <div className="assignment-list">
          <h3>Nhiệm vụ đã phân công</h3>
          <p>Đang phát triển - Danh sách nhiệm vụ sẽ được hiển thị tại đây</p>
        </div>
      </div>
    </div>
  );
};

export default TaskAssignment;