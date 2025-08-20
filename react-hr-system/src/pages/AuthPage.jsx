import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useNotification } from '../lib/auth'
import Notification from '../components/Notification'

const AuthPage = () => {
  const navigate = useNavigate()
  const { login, register, forgotPassword, resetPassword, loading } = useAuth()
  const { notification, showNotification } = useNotification()
  
  const [activeForm, setActiveForm] = useState('login') // login, register, forgot, reset
  const [formData, setFormData] = useState({
    loginEmployeeId: '',
    loginPassword: '',
    rememberMe: false,
    fullName: '',
    phone: '',
    email: '',
    storeName: '',
    position: '',
    password: '',
    confirmPassword: '',
    termsAgreed: false,
    forgotEmail: '',
    verificationCode: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [passwordVisibility, setPasswordVisibility] = useState({})

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

  const handleSubmit = async (e, formType) => {
    e.preventDefault()

    try {
      let result
      
      switch (formType) {
        case 'login': {
          // Validate and trim inputs
          const employeeId = formData.loginEmployeeId?.trim()
          const password = formData.loginPassword?.trim()

          if (!employeeId || !password) {
            showNotification('Vui lòng nhập đầy đủ mã nhân viên và mật khẩu', 'error')
            return
          }

          // Call login with credentials object
          result = await login({
            employeeId,
            password,
            rememberMe: formData.rememberMe
          })

          if (result.success) {
            showNotification(result.message, 'success')
            setTimeout(() => navigate('/dashboard'), 1000)
          } else {
            showNotification(result.message, 'error')
          }
          break
        }

        case 'register':
          result = await register(formData)
          if (result.success) {
            showNotification(result.message, 'success')
            if (result.requiresVerification) {
              // Show verification form or redirect to verification page
              // For now, show instructions to check email
              showNotification('Vui lòng kiểm tra email và nhập mã xác nhận để hoàn tất đăng ký', 'info')
            } else {
              setActiveForm('login')
            }
          } else {
            showNotification(result.message, 'error')
          }
          break
          
        case 'forgot':
          result = await forgotPassword(formData.forgotEmail)
          if (result.success) {
            showNotification(result.message, 'success')
            setActiveForm('reset')
          } else {
            showNotification(result.message, 'error')
          }
          break
          
        case 'reset':
          result = await resetPassword(formData.verificationCode, formData.newPassword)
          if (result.success) {
            showNotification(result.message, 'success')
            setActiveForm('login')
          } else {
            showNotification(result.message, 'error')
          }
          break
          
        default:
          break
      }
    } catch (error) {
      console.error('Form submit error:', error)
      // Handle error safely - check if error has a message
      const errorMessage = error?.message || error?.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      showNotification(errorMessage, 'error')
    }
  }

  return (
    <div className="auth-page">
      {/* Background Effects */}
      <div className="flag-vn"></div>
      <div className="glass-bg">
        <div className="glass-circle circle-1"></div>
        <div className="glass-circle circle-2"></div>
        <div className="glass-circle circle-3"></div>
      </div>
      <div className="aurora"></div>
      <div className="stars"></div>
      <div className="light-streaks"></div>

      {/* Notification */}
      <Notification
        message={notification?.message}
        type={notification?.type}
        show={!!notification}
      />

      {/* Auth Container */}
      <div className="auth-container">
        
        {/* Login Form */}
        {activeForm === 'login' && (
          <div className="form-container active">
            <div className="form-header">
              <div className="logo-container">
                <h2>Đăng nhập</h2>
              </div>
            </div>

            <form className="form" onSubmit={(e) => handleSubmit(e, 'login')}>
              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">badge</span>
                  <input 
                    type="text" 
                    name="loginEmployeeId"
                    value={formData.loginEmployeeId}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="username"
                  />
                  <label>Mã nhân viên</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">lock</span>
                  <input 
                    type={passwordVisibility.loginPassword ? "text" : "password"}
                    name="loginPassword"
                    value={formData.loginPassword}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="current-password"
                  />
                  <label>Mật khẩu</label>
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('loginPassword')}
                  >
                    <span className="material-icons-round">
                      {passwordVisibility.loginPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark">
                    <span className="material-icons-round">check</span>
                  </span>
                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                <span className="material-icons-round btn-icon">login</span>
                <span className="btn-text">Đăng nhập</span>
                {loading && <span className="btn-loader"></span>}
              </button>

              <div className="form-footer">
                <div className="footer-row">
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveForm('forgot'); }} className="forgot-password">
                    Quên mật khẩu?
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveForm('register'); }} className="form-link">
                    Đăng ký ngay
                  </a>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Register Form */}
        {activeForm === 'register' && (
          <div className="form-container active">
            <div className="form-header">
              <div className="logo-container">
                <h2>Đăng ký</h2>
              </div>
            </div>

            <form className="form" onSubmit={(e) => handleSubmit(e, 'register')}>
              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">person</span>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="name"
                  />
                  <label>Họ và tên</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">phone</span>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="tel"
                  />
                  <label>Số điện thoại</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">email</span>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="email"
                  />
                  <label>Email</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">store</span>
                  <select 
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn cửa hàng</option>
                    <option value="ST001">Cửa hàng Quận 1</option>
                    <option value="ST002">Cửa hàng Quận 3</option>
                  </select>
                  <label>Cửa hàng</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">work</span>
                  <input 
                    type="text" 
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required
                  />
                  <label>Chức vụ</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">lock</span>
                  <input 
                    type={passwordVisibility.password ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="new-password"
                  />
                  <label>Mật khẩu</label>
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    <span className="material-icons-round">
                      {passwordVisibility.password ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">lock</span>
                  <input 
                    type={passwordVisibility.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="new-password"
                  />
                  <label>Xác nhận mật khẩu</label>
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    <span className="material-icons-round">
                      {passwordVisibility.confirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    name="termsAgreed"
                    checked={formData.termsAgreed}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="checkmark">
                    <span className="material-icons-round">check</span>
                  </span>
                  <span>Tôi đồng ý với điều khoản sử dụng</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                <span className="material-icons-round btn-icon">person_add</span>
                <span className="btn-text">Đăng ký</span>
                {loading && <span className="btn-loader"></span>}
              </button>

              <div className="form-footer">
                <p>Đã có tài khoản? 
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveForm('login'); }} className="form-link">
                    Đăng nhập ngay
                  </a>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Forgot Password Form */}
        {activeForm === 'forgot' && (
          <div className="form-container active">
            <div className="form-header">
              <div className="logo-container">
                <h2>Quên mật khẩu</h2>
              </div>
            </div>

            <form className="form" onSubmit={(e) => handleSubmit(e, 'forgot')}>
              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">email</span>
                  <input 
                    type="email" 
                    name="forgotEmail"
                    value={formData.forgotEmail}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="email"
                  />
                  <label>Email tài khoản</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                <span className="material-icons-round btn-icon">send</span>
                <span className="btn-text">Gửi mã xác thực</span>
                {loading && <span className="btn-loader"></span>}
              </button>

              <div className="form-footer">
                <p>Nhớ mật khẩu? 
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveForm('login'); }} className="form-link">
                    Đăng nhập ngay
                  </a>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Reset Password Form */}
        {activeForm === 'reset' && (
          <div className="form-container active">
            <div className="form-header">
              <div className="logo-container">
                <h2>Đặt lại mật khẩu</h2>
              </div>
            </div>

            <form className="form" onSubmit={(e) => handleSubmit(e, 'reset')}>
              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">verified_user</span>
                  <input 
                    type="text" 
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required
                    maxLength="8"
                  />
                  <label>Mã xác thực</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">lock</span>
                  <input 
                    type={passwordVisibility.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="new-password"
                  />
                  <label>Mật khẩu mới</label>
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('newPassword')}
                  >
                    <span className="material-icons-round">
                      {passwordVisibility.newPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">lock</span>
                  <input 
                    type={passwordVisibility.confirmNewPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="new-password"
                  />
                  <label>Xác nhận mật khẩu mới</label>
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirmNewPassword')}
                  >
                    <span className="material-icons-round">
                      {passwordVisibility.confirmNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <div className="input-border"></div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                <span className="material-icons-round btn-icon">lock_reset</span>
                <span className="btn-text">Đặt lại mật khẩu</span>
                {loading && <span className="btn-loader"></span>}
              </button>

              <div className="form-footer">
                <p>Chưa nhận được mã? 
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveForm('forgot'); }} className="form-link">
                    Gửi lại mã
                  </a>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthPage