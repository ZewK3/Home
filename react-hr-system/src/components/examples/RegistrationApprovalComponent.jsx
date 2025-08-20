import { useState, useEffect } from 'react'
import { registrationService } from '../../lib/services/registrations.service.js'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Example component for registration approval workflow
 * Replaces old JS functionality with React state management
 */
const RegistrationApprovalComponent = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState([])
  const [processing, setProcessing] = useState({})
  const [error, setError] = useState(null)

  // Check if user has approval rights
  const canApprove = user && ['AD', 'QL'].includes(user.role || user.position)

  useEffect(() => {
    if (canApprove) {
      loadPendingRegistrations()
    } else {
      setLoading(false)
    }
  }, [canApprove])

  const loadPendingRegistrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await registrationService.getPending()
      setRegistrations(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Không thể tải danh sách đăng ký chờ duyệt')
      console.error('Failed to load pending registrations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (employeeId, fullName) => {
    if (!window.confirm(`Bạn có chắc muốn duyệt đăng ký của ${fullName}?`)) {
      return
    }

    setProcessing(prev => ({ ...prev, [employeeId]: 'approving' }))
    
    try {
      await registrationService.approve(employeeId)
      
      // Remove from pending list
      setRegistrations(prev => prev.filter(reg => reg.employeeId !== employeeId))
      
      alert(`Đã duyệt đăng ký của ${fullName}`)
    } catch (err) {
      alert(`Lỗi khi duyệt: ${err.message}`)
    } finally {
      setProcessing(prev => ({ ...prev, [employeeId]: null }))
    }
  }

  const handleReject = async (employeeId, fullName) => {
    const reason = prompt(`Lý do từ chối đăng ký của ${fullName}:`)
    if (!reason) return

    setProcessing(prev => ({ ...prev, [employeeId]: 'rejecting' }))
    
    try {
      await registrationService.reject(employeeId, reason)
      
      // Remove from pending list
      setRegistrations(prev => prev.filter(reg => reg.employeeId !== employeeId))
      
      alert(`Đã từ chối đăng ký của ${fullName}`)
    } catch (err) {
      alert(`Lỗi khi từ chối: ${err.message}`)
    } finally {
      setProcessing(prev => ({ ...prev, [employeeId]: null }))
    }
  }

  if (!canApprove) {
    return (
      <div className="registration-approval">
        <div className="no-permission">
          <span className="material-icons-round">lock</span>
          <p>Bạn không có quyền duyệt đăng ký</p>
          <small>Chỉ Admin (AD) và Quản lý (QL) mới có thể duyệt đăng ký</small>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="registration-approval">
        <div className="loading">
          <span className="material-icons-round rotating">refresh</span>
          <p>Đang tải danh sách đăng ký...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="registration-approval">
      <div className="header">
        <h3>Duyệt đăng ký nhân viên</h3>
        <button onClick={loadPendingRegistrations} className="refresh-btn">
          <span className="material-icons-round">refresh</span>
          Làm mới
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="material-icons-round">error</span>
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {registrations.length === 0 ? (
        <div className="no-registrations">
          <span className="material-icons-round">check_circle</span>
          <p>Không có đăng ký nào chờ duyệt</p>
        </div>
      ) : (
        <div className="registrations-list">
          {registrations.map((registration) => (
            <div key={registration.employeeId} className="registration-card">
              <div className="registration-info">
                <h4>{registration.fullName}</h4>
                <div className="details">
                  <p><strong>Mã NV:</strong> {registration.employeeId}</p>
                  <p><strong>Email:</strong> {registration.email}</p>
                  <p><strong>Điện thoại:</strong> {registration.phone}</p>
                  <p><strong>Cửa hàng:</strong> {registration.storeName}</p>
                  <p><strong>Vị trí:</strong> {registration.position}</p>
                  <p><strong>Ngày gia nhập:</strong> {new Date(registration.joinDate).toLocaleDateString()}</p>
                  <p><strong>Ngày đăng ký:</strong> {new Date(registration.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="registration-actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleApprove(registration.employeeId, registration.fullName)}
                  disabled={processing[registration.employeeId]}
                >
                  {processing[registration.employeeId] === 'approving' ? (
                    <>
                      <span className="material-icons-round rotating">check_circle</span>
                      Đang duyệt...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-round">check_circle</span>
                      Duyệt
                    </>
                  )}
                </button>
                
                <button 
                  className="reject-btn"
                  onClick={() => handleReject(registration.employeeId, registration.fullName)}
                  disabled={processing[registration.employeeId]}
                >
                  {processing[registration.employeeId] === 'rejecting' ? (
                    <>
                      <span className="material-icons-round rotating">cancel</span>
                      Đang từ chối...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-round">cancel</span>
                      Từ chối
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="approval-info">
        <p><strong>Người duyệt:</strong> {user?.fullName || user?.name}</p>
        <p><strong>Quyền hạn:</strong> {user?.role || user?.position}</p>
      </div>
    </div>
  )
}

export default RegistrationApprovalComponent