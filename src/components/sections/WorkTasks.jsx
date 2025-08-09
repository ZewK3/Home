import React from 'react';

const WorkTasks = ({ user }) => {
  return (
    <div className="work-tasks-section">
      <div className="section-header">
        <h1>Công Việc</h1>
        <p>Quản lý và theo dõi nhiệm vụ</p>
      </div>
      
      <div className="tasks-container">
        <div className="tasks-header">
          <div className="filter-controls">
            <select className="filter-select">
              <option value="all">Tất cả</option>
              <option value="pending">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
          <button className="btn btn-primary">
            <span className="material-icons-round">add</span>
            Thêm nhiệm vụ
          </button>
        </div>
        
        <div className="tasks-content">
          <p>Đang phát triển - Chức năng quản lý công việc sẽ được triển khai sớm</p>
        </div>
      </div>
    </div>
  );
};

export default WorkTasks;