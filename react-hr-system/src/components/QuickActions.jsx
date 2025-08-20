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
      icon: '🕐',
      title: 'Check-in',
      description: 'Ghi nhận giờ vào làm',
      color: 'green'
    },
    {
      id: 'request',
      icon: '📝',
      title: 'Gửi yêu cầu',
      description: 'Tạo yêu cầu nghỉ phép',
      color: 'blue'
    },
    {
      id: 'timesheet',
      icon: '📊',
      title: 'Bảng công',
      description: 'Xem bảng công tháng',
      color: 'purple'
    },
    {
      id: 'profile',
      icon: '👤',
      title: 'Hồ sơ',
      description: 'Cập nhật thông tin',
      color: 'orange'
    }
  ]

  return (
    <div className="quick-actions">
      <h2 className="section-title">Thao tác nhanh</h2>
      <div className="actions-grid">
        {actions.map(action => (
          <button
            key={action.id}
            className={`action-card ${action.color}`}
            onClick={() => handleAction(action.title)}
            disabled={actionLoading === action.title}
          >
            <div className="action-icon">{action.icon}</div>
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