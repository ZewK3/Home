const Notification = ({ message, type, show }) => {
  const icons = {
    success: '✓',
    error: '✕', 
    warning: '⚠',
    info: 'ℹ'
  }

  if (!show) return null

  return (
    <div className={`notification ${type} show`}>
      <span className="notification-icon">{icons[type] || '✓'}</span>
      <span className="notification-message">{message}</span>
    </div>
  )
}

export default Notification