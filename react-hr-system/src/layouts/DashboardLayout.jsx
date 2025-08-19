import { useState } from 'react'

const DashboardLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="dashboard-content">
      {/* Mobile Navigation Dialog */}
      {isMobileMenuOpen && (
        <dialog 
          open
          className="mobile-nav"
          onClick={(e) => e.target === e.currentTarget && setIsMobileMenuOpen(false)}
        >
          <div className="mobile-nav-content">
            <div className="mobile-nav-header">
              <h3>Menu</h3>
              <button 
                className="close-mobile-nav"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Đóng menu"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <nav className="mobile-nav-menu">
              <p>Mobile menu content will go here</p>
            </nav>
          </div>
        </dialog>
      )}

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
            <span>Admin User</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-menu">
            <p>Sidebar menu will go here</p>
          </nav>
        </aside>

        {/* Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout