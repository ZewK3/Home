import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSidebarMenu } from '../lib/hooks/useSidebarMenu.js'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const { menu, loading, error, refetch } = useSidebarMenu()
  const [activeMenu, setActiveMenu] = useState(null)

  const toggleSubmenu = (menuId) => {
    setActiveMenu(activeMenu === menuId ? null : menuId)
  }

  const handleMenuClick = async (item) => {
    if (item.action === 'logout') {
      await logout()
    } else if (item.submenu) {
      toggleSubmenu(item.id)
    } else if (item.path) {
      // TODO: Add navigation logic when React Router is set up
      console.log('Navigate to:', item.path)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="loading-spinner">
            <span className="material-icons-round rotating">refresh</span>
            <p>Đang tải menu...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="error-state">
            <span className="material-icons-round">error_outline</span>
            <p>Không thể tải menu</p>
            <button className="retry-btn" onClick={refetch}>
              <span className="material-icons-round">refresh</span>
              Thử lại
            </button>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span className="material-icons-round">account_circle</span>
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || user?.fullName || 'User'}</p>
              <p className="user-role">{user?.role || user?.position || 'Guest'}</p>
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

  // Normal state with menu items
  return (
    <div className="sidebar">
      <nav className="sidebar-menu">
        {menu && menu.length > 0 ? (
          menu.map(item => (
            <div key={item.id} className="menu-item">
              <button
                className={`menu-link ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                <span className="material-icons-round menu-icon">{item.icon}</span>
                <span className="menu-text">{item.title}</span>
                {item.submenu && item.submenu.length > 0 && (
                  <span className={`material-icons-round submenu-arrow ${activeMenu === item.id ? 'open' : ''}`}>
                    keyboard_arrow_down
                  </span>
                )}
              </button>
              
              {item.submenu && item.submenu.length > 0 && activeMenu === item.id && (
                <div className="submenu">
                  {item.submenu.map(subitem => (
                    <button 
                      key={subitem.id} 
                      className="submenu-link"
                      onClick={() => handleMenuClick(subitem)}
                    >
                      {subitem.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-menu">
            <span className="material-icons-round">menu</span>
            <p>Không có menu khả dụng</p>
          </div>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <span className="material-icons-round">account_circle</span>
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || user?.fullName || 'User'}</p>
            <p className="user-role">{user?.role || user?.position || 'Guest'}</p>
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