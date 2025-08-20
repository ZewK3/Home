import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const DashboardLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="dashboard-layout">
      {/* App Header */}
      <header className="app-header">
        <div className="header-left">
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Mở menu"
          >
            <span className="material-icons-round">menu</span>
          </button>
          <div className="logo">
            <h1>HR System</h1>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>Welcome</span>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="main-layout">
        {/* Fixed Sidebar (Desktop) */}
        <aside className={`sidebar-wrapper ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-container">
            <Sidebar />
          </div>
          {/* Mobile overlay */}
          {isMobileMenuOpen && (
            <div 
              className="mobile-overlay"
              onClick={closeMobileMenu}
              aria-label="Đóng menu"
            />
          )}
        </aside>

        {/* Content Area */}
        <main className="content-wrapper">
          <div className="main-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
}

export default DashboardLayout