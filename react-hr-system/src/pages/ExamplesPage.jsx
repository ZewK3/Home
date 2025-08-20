import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import AttendanceComponent from '../components/examples/AttendanceComponent'
import RegistrationApprovalComponent from '../components/examples/RegistrationApprovalComponent'
import TaskManagementComponent from '../components/examples/TaskManagementComponent'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Demo page showcasing the new React components that replace old JS functionality
 */
const ExamplesPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('attendance')

  const tabs = [
    {
      id: 'attendance',
      title: 'Chấm công',
      icon: 'access_time',
      component: AttendanceComponent,
      description: 'GPS-based check-in/out system'
    },
    {
      id: 'registrations',
      title: 'Duyệt đăng ký',
      icon: 'how_to_reg',
      component: RegistrationApprovalComponent,
      description: 'Employee registration approval workflow',
      requiresRole: ['AD', 'QL']
    },
    {
      id: 'tasks',
      title: 'Quản lý công việc',
      icon: 'assignment',
      component: TaskManagementComponent,
      description: 'Task assignment and approval system'
    }
  ]

  const hasAccess = (tab) => {
    if (!tab.requiresRole) return true
    const userRole = user?.role || user?.position
    return tab.requiresRole.includes(userRole)
  }

  const availableTabs = tabs.filter(hasAccess)
  const activeTabData = availableTabs.find(tab => tab.id === activeTab) || availableTabs[0]
  const ActiveComponent = activeTabData?.component

  return (
    <DashboardLayout>
      <div className="examples-page">
        <div className="page-header">
          <h1>Tính năng mới</h1>
          <p>Các tính năng đã được chuyển từ JavaScript thuần sang React</p>
        </div>

        <div className="feature-info">
          <div className="info-card">
            <h3>🚀 Đã chuyển đổi</h3>
            <ul>
              <li>✅ DOM manipulation → React hooks & state</li>
              <li>✅ Manual API calls → Service layer</li>
              <li>✅ Inline event handlers → React event system</li>
              <li>✅ jQuery dependencies → Pure React</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3>📱 Cải thiện UX</h3>
            <ul>
              <li>✅ Loading states for all operations</li>
              <li>✅ Error handling with retry options</li>
              <li>✅ Responsive design</li>
              <li>✅ Real-time status updates</li>
            </ul>
          </div>
        </div>

        <div className="demo-tabs">
          <div className="tab-header">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="material-icons-round">{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTabData && (
              <>
                <div className="tab-description">
                  <h3>{activeTabData.title}</h3>
                  <p>{activeTabData.description}</p>
                </div>
                
                <div className="component-demo">
                  <ActiveComponent />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="implementation-notes">
          <h3>💡 Ghi chú triển khai</h3>
          <div className="notes-grid">
            <div className="note-card">
              <h4>Service Layer</h4>
              <p>Tất cả API calls được tổ chức trong <code>src/lib/services/</code></p>
              <ul>
                <li><code>attendance.service.js</code> - Chấm công & ca làm việc</li>
                <li><code>registrations.service.js</code> - Duyệt đăng ký</li>
                <li><code>tasks.service.js</code> - Quản lý công việc</li>
              </ul>
            </div>
            
            <div className="note-card">
              <h4>State Management</h4>
              <p>AuthContext provides centralized user state</p>
              <ul>
                <li>Single <code>/auth/me</code> call per session</li>
                <li>5-minute user cache to reduce API calls</li>
                <li>Automatic token management</li>
              </ul>
            </div>
            
            <div className="note-card">
              <h4>Error Handling</h4>
              <p>Consistent error boundaries and user feedback</p>
              <ul>
                <li>Loading states for all async operations</li>
                <li>Retry mechanisms for failed requests</li>
                <li>Graceful degradation when API fails</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="migration-status">
          <h3>📋 Migration Status</h3>
          <div className="status-list">
            <div className="status-item completed">
              <span className="material-icons-round">check_circle</span>
              <span>Authentication & Session Management</span>
            </div>
            <div className="status-item completed">
              <span className="material-icons-round">check_circle</span>
              <span>User Role & Permission System</span>
            </div>
            <div className="status-item completed">
              <span className="material-icons-round">check_circle</span>
              <span>GPS-based Attendance Tracking</span>
            </div>
            <div className="status-item completed">
              <span className="material-icons-round">check_circle</span>
              <span>Registration Approval Workflow</span>
            </div>
            <div className="status-item completed">
              <span className="material-icons-round">check_circle</span>
              <span>Task Assignment & Management</span>
            </div>
            <div className="status-item pending">
              <span className="material-icons-round">schedule</span>
              <span>Schedule Management (Ready for implementation)</span>
            </div>
            <div className="status-item pending">
              <span className="material-icons-round">schedule</span>
              <span>Timesheet Reports (Ready for implementation)</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ExamplesPage