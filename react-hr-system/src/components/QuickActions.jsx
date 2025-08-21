import { useState } from 'react'

const QuickActions = () => {
  const [actionLoading, setActionLoading] = useState(null)

  const handleAction = async (actionName) => {
    setActionLoading(actionName)
    
    // Mock action processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert(`Thực hiện ${actionName} thành công!`)
    setActionLoading(null)
  }

  const actions = [
    {
      id: 'checkin',
      icon: 'schedule',
      title: 'Check-in',
      description: 'Ghi nhận giờ vào làm'
    },
    {
      id: 'request',
      icon: 'assignment',
      title: 'Gửi yêu cầu',
      description: 'Tạo yêu cầu nghỉ phép'
    },
    {
      id: 'timesheet',
      icon: 'calendar_month',
      title: 'Bảng công',
      description: 'Xem bảng công tháng'
    },
    {
      id: 'profile',
      icon: 'person',
      title: 'Hồ sơ',
      description: 'Cập nhật thông tin'
    }
  ]

  return (
    <div className="quick-actions">
      <h2 className="section-title">Thao tác nhanh</h2>
      <div className="actions-grid">
        {actions.map(action => (
          <button
            key={action.id}
            className="action-card"
            onClick={() => handleAction(action.title)}
            disabled={actionLoading === action.title}
          >
            <div className="action-icon">
              <span className="material-icons-round">{action.icon}</span>
            </div>
            <div className="action-content">
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
            {actionLoading === action.title && (
              <div className="action-loading">
                <div className="spinner"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions