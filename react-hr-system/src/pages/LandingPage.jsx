import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/landing.css'

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="hero">
        <h1>HR Management System</h1>
        <p>Giải pháp quản lý nhân sự toàn diện.</p>
        <Link className="btn-login" to="/auth">Đăng nhập</Link>
      </header>
      <section className="features">
        <div className="feature">
          <h3>Quản lý nhân sự</h3>
          <p>Theo dõi hồ sơ, vai trò và phân quyền.</p>
        </div>
        <div className="feature">
          <h3>Chấm công</h3>
          <p>Ghi nhận thời gian làm việc chính xác.</p>
        </div>
        <div className="feature">
          <h3>Báo cáo</h3>
          <p>Thống kê, phân tích dữ liệu trực quan.</p>
        </div>
      </section>
      <footer className="footer">
        © {new Date().getFullYear()} HR System
      </footer>
    </div>
  )
}
