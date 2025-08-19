import { useState } from 'react'
import { useAuth } from '../lib/auth'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const [activeMenu, setActiveMenu] = useState(null)

  const menuItems = [
    {
      id: 'dashboard',
      icon: 'dashboard',
      title: 'Trang chủ',
      roles: ['AD', 'QL', 'AM', 'NV']
    },
    {
      id: 'schedule',
      icon: 'schedule',
      title: 'Lịch làm việc',
      roles: ['AD', 'QL', 'AM', 'NV'],
      submenu: [
        { id: 'view-schedule', title: 'Xem lịch làm', roles: ['AD', 'QL', 'AM', 'NV'] },
        { id: 'create-schedule', title: 'Tạo lịch làm', roles: ['AD', 'QL'] }
      ]
    },
    {
      id: 'tasks',
      icon: 'assignment',
      title: 'Công việc',
      roles: ['AD', 'QL', 'AM', 'NV'],
      submenu: [
        { id: 'my-tasks', title: 'Công việc của tôi', roles: ['AD', 'QL', 'AM', 'NV'] },
        { id: 'assign-tasks', title: 'Phân công', roles: ['AD', 'QL'] }
      ]
    },
    {
      id: 'requests',
      icon: 'request_page',
      title: 'Yêu cầu',
      roles: ['AD', 'QL', 'AM', 'NV'],
      submenu: [
        { id: 'submit-request', title: 'Gửi yêu cầu', roles: ['AD', 'QL', 'AM', 'NV'] },
        { id: 'approve-requests', title: 'Duyệt yêu cầu', roles: ['AD', 'QL'] }
      ]
    },
    {
      id: 'management',
      icon: 'business_center',
      title: 'Quản lý',
      roles: ['AD', 'QL'],
      submenu: [
        { id: 'employee-mgmt', title: 'Quản lý nhân viên', roles: ['AD', 'QL'] },
        { id: 'store-mgmt', title: 'Quản lý cửa hàng', roles: ['AD'] },
        { id: 'registration-approval', title: 'Duyệt đăng ký', roles: ['AD'] },
        { id: 'grant-access', title: 'Phân quyền', roles: ['AD'] }
      ]
    },
    {
      id: 'personal',
      icon: 'person',
      title: 'Thông tin cá nhân',
      roles: ['AD', 'QL', 'AM', 'NV']
    }
  ]

  const hasRole = (roles) => {
    if (!user?.role) return false
    return roles.includes(user.role)
  }

  const toggleSubmenu = (menuId) => {
    setActiveMenu(activeMenu === menuId ? null : menuId)
  }

  const filteredMenuItems = menuItems.filter(item => hasRole(item.roles))

  return (
    <div className="sidebar">
      <nav className="sidebar-menu">
        {filteredMenuItems.map(item => (
          <div key={item.id} className="menu-item">
            <button
              className={`menu-link ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => item.submenu ? toggleSubmenu(item.id) : null}
            >
              <span className="material-icons-round menu-icon">{item.icon}</span>
              <span className="menu-text">{item.title}</span>
              {item.submenu && (
                <span className={`material-icons-round submenu-arrow ${activeMenu === item.id ? 'open' : ''}`}>
                  keyboard_arrow_down
                </span>
              )}
            </button>
            
            {item.submenu && activeMenu === item.id && (
              <div className="submenu">
                {item.submenu
                  .filter(subitem => hasRole(subitem.roles))
                  .map(subitem => (
                    <button key={subitem.id} className="submenu-link">
                      {subitem.title}
                    </button>
                  ))
                }
              </div>
            )}
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <span className="material-icons-round">account_circle</span>
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'User'}</p>
            <p className="user-role">{user?.role || 'Guest'}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <span className="material-icons-round">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar