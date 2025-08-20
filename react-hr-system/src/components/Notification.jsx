const Notification = ({ message, type = 'info', show }) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  if (!show || !message) return null

  return (
    <div className={`notification ${type} show`} role="alert" aria-live="polite">
      <span className="notification-icon">{icons[type] || icons.info}</span>
      <span className="notification-message">{message}</span>
    </div>
  )
}

export default Notification
