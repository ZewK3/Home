import React from 'react';

const PermissionManagement = ({ user }) => {
  return (
    <div className="permission-management-section">
      <div className="section-header">
        <h1>Phân Quyền</h1>
        <p>Quản lý quyền hạn người dùng</p>
      </div>
      
      <div className="permission-management-container">
        <div className="search-section">
          <div className="search-controls">
            <input 
              type="text" 
              placeholder="Tìm kiếm nhân viên..." 
              className="search-input"
            />
            <button className="btn btn-primary">
              <span className="material-icons-round">search</span>
              Tìm kiếm
            </button>
          </div>
        </div>
        
        <div className="user-list">
          <div className="list-header">
            <h3>Danh sách nhân viên</h3>
            <span className="user-count">Tổng: 0 người</span>
          </div>
          
          <div className="user-grid">
            <p>Đang phát triển - Danh sách người dùng và phân quyền sẽ được triển khai sớm</p>
          </div>
        </div>
        
        <div className="permission-roles">
          <h3>Các vai trò</h3>
          <div className="role-list">
            <div className="role-card">
              <h4>Admin (AD)</h4>
              <p>Quyền quản trị toàn hệ thống</p>
            </div>
            <div className="role-card">
              <h4>Area Manager (AM)</h4>
              <p>Quản lý khu vực</p>
            </div>
            <div className="role-card">
              <h4>Store Leader (QL)</h4>
              <p>Quản lý cửa hàng</p>
            </div>
            <div className="role-card">
              <h4>Employee (NV)</h4>
              <p>Nhân viên cơ bản</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;