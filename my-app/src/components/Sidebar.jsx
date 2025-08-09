import React, { useState } from 'react';

const Sidebar = ({ user, currentSection, onNavigate }) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

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
      key: 'work-management',
      label: 'Quản Lý Công',
      icon: 'schedule',
      roles: ['AD', 'AM', 'QL', 'NV'],
      subItems: [
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
        }
      ]
    },
    {
      key: 'work-tasks',
      label: 'Công Việc',
      icon: 'task',
      roles: ['AD', 'AM', 'QL', 'NV'],
      onClick: () => onNavigate('work-tasks')
    },
    {
      key: 'requests',
      label: 'Gửi Yêu Cầu',
      icon: 'send',
      roles: ['AD', 'NV'],
      subItems: [
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
        }
      ]
    },
    {
      key: 'management',
      label: 'Quản Lý',
      icon: 'admin_panel_settings',
      roles: ['AD', 'AM'],
      subItems: [
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
        }
      ]
    },
    {
      key: 'analytics',
      label: 'Báo Cáo',
      icon: 'analytics',
      roles: ['AD', 'AM', 'QL'],
      onClick: () => onNavigate('analytics')
    }
  ];

  const renderMenuItem = (item) => {
    if (!hasPermission(item.roles)) return null;

    const isActive = currentSection === item.key;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus[item.key];

    return (
      <li key={item.key} className={`nav-item ${hasSubItems ? 'has-submenu' : ''}`}>
        <button
          className={`nav-link ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (hasSubItems) {
              toggleMenu(item.key);
            } else {
              item.onClick();
            }
          }}
        >
          <span className="material-icons-round">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
          {hasSubItems && (
            <span className={`material-icons-round submenu-arrow ${isExpanded ? 'expanded' : ''}`}>
              expand_more
            </span>
          )}
        </button>
        
        {hasSubItems && (
          <ul className={`submenu ${isExpanded ? 'expanded' : ''}`}>
            {item.subItems.map(subItem => {
              if (!hasPermission(subItem.roles)) return null;
              
              const isSubActive = currentSection === subItem.key;
              return (
                <li key={subItem.key} className="submenu-item">
                  <button
                    className={`submenu-link ${isSubActive ? 'active' : ''}`}
                    onClick={subItem.onClick}
                  >
                    <span className="material-icons-round">{subItem.icon}</span>
                    <span className="submenu-text">{subItem.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map(renderMenuItem)}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;