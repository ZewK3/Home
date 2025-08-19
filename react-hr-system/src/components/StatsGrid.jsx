import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'

const StatsGrid = () => {
  const { getDashboardStats } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getDashboardStats()
      setStats(data)
      setLoading(false)
    }
    
    fetchStats()
  }, [getDashboardStats])

  if (loading) {
    return (
      <div className="stats-grid">
        <div className="stat-card loading">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Đang tải...</h3>
            <p>---</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <h3>Tổng nhân viên</h3>
          <p className="stat-number">{stats.totalEmployees}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <h3>Có mặt hôm nay</h3>
          <p className="stat-number">{stats.todayAttendance}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">⏰</div>
        <div className="stat-content">
          <h3>Giờ làm tháng</h3>
          <p className="stat-number">{stats.monthlyHours}h</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-content">
          <h3>Yêu cầu chờ</h3>
          <p className="stat-number">{stats.pendingRequests}</p>
        </div>
      </div>
    </div>
  )
}

export default StatsGrid