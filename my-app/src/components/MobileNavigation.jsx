import React from 'react';

const MobileNavigation = ({ user, isOpen, onClose, onNavigate }) => {
  const hasPermission = (requiredRoles) => {
    if (!user?.position) return false;
    return requiredRoles.includes(user.position);
  };

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      roles: ['AD', 'AM', 'QL', 'NV'],
      onClick: () => onNavigate('dashboard')
    },
    {
      key: 'timesheet',
      label: 'Bảng Công',
      icon: 'calendar_view_month',
      roles: ['AD', 'AM', 'QL', 'NV'],
      onClick: () => onNavigate('timesheet')
    },
    {
      key: 'attendance',
      label: 'Chấm Công',
      icon: 'location_on',
      roles: ['AD', 'AM', 'QL', 'NV'],
      onClick: () => onNavigate('attendance')
    },
    {
      key: 'work-tasks',
      label: 'Công Việc',
      icon: 'task',
      roles: ['AD', 'AM', 'QL', 'NV'],
      onClick: () => onNavigate('work-tasks')
    },
    {
      key: 'attendance-request',
      label: 'Đơn Từ',
      icon: 'assignment',
      roles: ['AD', 'NV'],
      onClick: () => onNavigate('attendance-request')
    },
    {
      key: 'task-assignment',
      label: 'Nhiệm Vụ',
      icon: 'task_alt',
      roles: ['AD', 'NV'],
      onClick: () => onNavigate('task-assignment')
    },
    {
      key: 'shift-assignment',
      label: 'Phân Ca',
      icon: 'schedule',
      roles: ['AD', 'AM'],
      onClick: () => onNavigate('shift-assignment')
    },
    {
      key: 'permission-management',
      label: 'Phân Quyền',
      icon: 'security',
      roles: ['AD'],
      onClick: () => onNavigate('permission-management')
    },
    {
      key: 'analytics',
      label: 'Báo Cáo',
      icon: 'analytics',
      roles: ['AD', 'AM', 'QL'],
      onClick: () => onNavigate('analytics')
    }
  ];

  if (!isOpen) return null;

  return (
    <dialog open className="mobile-nav-dialog">
      <div className="mobile-nav-content">
        <div className="mobile-nav-header">
          <h2>Menu</h2>
          <button type="button" className="close-dialog" onClick={onClose} aria-label="Close navigation">
            <span className="material-icons-round">close</span>
          </button>
        </div>
        <nav className="mobile-nav">
          <ul className="mobile-menu-list">
            {menuItems.map(item => {
              if (!hasPermission(item.roles)) return null;
              
              return (
                <li key={item.key} className="mobile-menu-item">
                  <button className="mobile-menu-link" onClick={item.onClick}>
                    <span className="material-icons-round">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </dialog>
  );
};

export default MobileNavigation;