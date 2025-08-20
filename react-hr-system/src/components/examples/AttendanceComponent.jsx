import { useState, useEffect } from 'react'
import { attendanceService } from '../../lib/services/attendance.service.js'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Example component showing how to use attendance service
 * Replaces old DOM manipulation from assets/js/
 */
const AttendanceComponent = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentShift, setCurrentShift] = useState(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [error, setError] = useState(null)

  // Load current shift on component mount
  useEffect(() => {
    loadCurrentShift()
  }, [])

  const loadCurrentShift = async () => {
    try {
      setLoading(true)
      setError(null)
      const shift = await attendanceService.getCurrentShift()
      setCurrentShift(shift)
    } catch (err) {
      setError('Không thể tải thông tin ca làm việc')
      console.error('Failed to load current shift:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị GPS')
      return
    }

    setCheckingIn(true)
    setError(null)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      }

      const result = await attendanceService.checkIn(locationData)
      setCurrentShift(result.shift || currentShift)
      
      // Show success message
      alert('Chấm công thành công!')
      
    } catch (err) {
      if (err.code) {
        // GPS error
        switch (err.code) {
          case 1:
            setError('Vui lòng cho phép truy cập vị trí')
            break
          case 2:
            setError('Không thể xác định vị trí')
            break
          case 3:
            setError('Timeout khi lấy vị trí')
            break
          default:
            setError('Lỗi GPS không xác định')
        }
      } else {
        setError(err.message || 'Chấm công thất bại')
      }
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị GPS')
      return
    }

    setCheckingIn(true)
    setError(null)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      }

      const result = await attendanceService.checkOut(locationData)
      setCurrentShift(result.shift || null)
      
      // Show success message
      alert('Kết thúc ca làm việc thành công!')
      
    } catch (err) {
      if (err.code) {
        // GPS error
        switch (err.code) {
          case 1:
            setError('Vui lòng cho phép truy cập vị trí')
            break
          case 2:
            setError('Không thể xác định vị trí')
            break
          case 3:
            setError('Timeout khi lấy vị trí')
            break
          default:
            setError('Lỗi GPS không xác định')
        }
      } else {
        setError(err.message || 'Kết thúc ca thất bại')
      }
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="attendance-component">
        <div className="loading">
          <span className="material-icons-round rotating">refresh</span>
          <p>Đang tải thông tin chấm công...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="attendance-component">
      <h3>Chấm công</h3>
      
      {error && (
        <div className="error-message">
          <span className="material-icons-round">error</span>
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="current-shift">
        <h4>Ca làm việc hiện tại</h4>
        {currentShift ? (
          <div className="shift-info">
            <p><strong>Cửa hàng:</strong> {currentShift.storeName}</p>
            <p><strong>Ca:</strong> {currentShift.shiftTime}</p>
            <p><strong>Trạng thái:</strong> {currentShift.status}</p>
            {currentShift.checkInTime && (
              <p><strong>Giờ vào:</strong> {new Date(currentShift.checkInTime).toLocaleString()}</p>
            )}
          </div>
        ) : (
          <p>Chưa có ca làm việc nào được bắt đầu</p>
        )}
      </div>

      <div className="attendance-actions">
        {!currentShift || currentShift.status === 'pending' ? (
          <button 
            className="check-in-btn"
            onClick={handleCheckIn}
            disabled={checkingIn}
          >
            {checkingIn ? (
              <>
                <span className="material-icons-round rotating">location_on</span>
                Đang chấm công...
              </>
            ) : (
              <>
                <span className="material-icons-round">login</span>
                Chấm công vào
              </>
            )}
          </button>
        ) : (
          <button 
            className="check-out-btn"
            onClick={handleCheckOut}
            disabled={checkingIn}
          >
            {checkingIn ? (
              <>
                <span className="material-icons-round rotating">location_on</span>
                Đang kết thúc...
              </>
            ) : (
              <>
                <span className="material-icons-round">logout</span>
                Kết thúc ca
              </>
            )}
          </button>
        )}
      </div>

      <div className="user-info-display">
        <p><strong>Nhân viên:</strong> {user?.fullName || user?.name}</p>
        <p><strong>Mã NV:</strong> {user?.employeeId}</p>
        <p><strong>Vị trí:</strong> {user?.position || user?.role}</p>
      </div>
    </div>
  )
}

export default AttendanceComponent