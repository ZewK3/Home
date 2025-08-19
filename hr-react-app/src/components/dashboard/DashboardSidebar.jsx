import React, { useState } from 'react';

const DashboardSidebar = ({ isMobile, activeView, onViewChange, userRole }) => {
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  const toggleMenu = (menuId) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      roles: ['AD', 'AM', 'QL', 'NV']
    },
    {
      id: 'work-management',
      label: 'Quản Lý Công',
      icon: 'schedule',
      roles: ['AD', 'QL', 'NV'],
      children: [
        {
          id: 'timesheet',
          label: 'Bảng Công',
          icon: 'calendar_view_month',
          roles: ['AD', 'AM', 'QL', 'NV']
        },
        {
          id: 'attendance',
          label: 'Chấm Công',
          icon: 'location_on',
          roles: ['AD', 'AM', 'QL', 'NV']
        }
      ]
    },
    {
      id: 'tasks',
      label: 'Công Việc',
      icon: 'task',
      roles: ['AD', 'AM', 'QL', 'NV']
    },
    {
      id: 'submit-request',
      label: 'Gửi Yêu Cầu',
      icon: 'send',
      roles: ['AD', 'NV'],
      children: [
        {
          id: 'attendance-request',
          label: 'Đơn Từ',
          icon: 'assignment',
          roles: ['AD', 'NV']
        },
        {
          id: 'task-assignment',
          label: 'Nhiệm Vụ',
          icon: 'task_alt',
          roles: ['AD', 'NV']
        },
        {
          id: 'shift-assignment',
          label: 'Phân Ca',
          icon: 'schedule_send',
          roles: ['AD', 'AM', 'QL']
        }
      ]
    },
    {
      id: 'task-processing',
      label: 'Xử Lý Yêu Cầu',
      icon: 'pending_actions',
      roles: ['AD', 'QL'],
      children: [
        {
          id: 'task-personnel',
          label: 'Nhân Sự',
          icon: 'people',
          roles: ['AD']
        },
        {
          id: 'task-store',
          label: 'Cửa Hàng',
          icon: 'store',
          roles: ['AD', 'QL']
        },
        {
          id: 'task-finance',
          label: 'Tài Chính',
          icon: 'account_balance',
          roles: ['AD']
        },
        {
          id: 'task-approval',
          label: 'Xét Duyệt',
          icon: 'approval',
          roles: ['AD', 'QL']
        }
      ]
    },
    {
      id: 'registration-approval',
      label: 'Duyệt Đăng Ký',
      icon: 'how_to_reg',
      roles: ['AD', 'QL']
    },
    {
      id: 'grant-access',
      label: 'Phân Quyền',
      icon: 'admin_panel_settings',
      roles: ['AD']
    },
    {
      id: 'personal',
      label: 'Thông Tin Cá Nhân',
      icon: 'person',
      roles: ['AD', 'QL', 'AM', 'NV']
    }
  ];

  const hasAccess = (roles) => {
    return roles.includes(userRole);
  };

  const renderMenuItem = (item) => {
    if (!hasAccess(item.roles)) return null;

    const isExpanded = expandedMenus.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeView === item.id;

    return (
      <li key={item.id} className={`${isMobile ? 'mobile-menu-item' : 'menu-item'}`}>
        <a
          href="#"
          className={`${isMobile ? 'mobile-menu-link' : 'menu-link'} ${isActive ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              onViewChange(item.id);
            }
          }}
        >
          <span className="material-icons-round">{item.icon}</span>
          <span>{item.label}</span>
          {hasChildren && (
            <span className={`material-icons-round expand-icon ${isExpanded ? 'expanded' : ''}`}>
              expand_more
            </span>
          )}
        </a>
        
        {hasChildren && isExpanded && (
          <ul className={`${isMobile ? 'mobile-submenu' : 'submenu'}`}>
            {item.children.map(child => {
              if (!hasAccess(child.roles)) return null;
              
              const isChildActive = activeView === child.id;
              return (
                <li key={child.id} className={`${isMobile ? 'mobile-submenu-item' : 'submenu-item'}`}>
                  <a
                    href="#"
                    className={`${isMobile ? 'mobile-submenu-link' : 'submenu-link'} ${isChildActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onViewChange(child.id);
                    }}
                  >
                    <span className="material-icons-round">{child.icon}</span>
                    <span>{child.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  if (isMobile) {
    return (
      <nav className="mobile-nav">
        <ul className="mobile-menu-list">
          {menuItems.map(renderMenuItem)}
        </ul>
      </nav>
    );
  }

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <ul className="menu-list">
          {menuItems.map(renderMenuItem)}
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;