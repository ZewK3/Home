import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/professional-auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    loginEmployeeId: '',
    loginPassword: '',
    fullName: '',
    phone: '',
    registerEmployeeId: '',
    registerPassword: '',
    confirmPassword: '',
    storeId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const [rememberMe, setRememberMe] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login({
        username: formData.loginEmployeeId,
        password: formData.loginPassword
      });

      if (result.success) {
        showNotification('Đăng nhập thành công!', 'success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        showNotification(result.error || 'Đăng nhập thất bại');
      }
    } catch (error) {
      showNotification('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (formData.registerPassword !== formData.confirmPassword) {
      showNotification('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    // Simulate registration
    try {
      // This would be replaced with actual API call
      showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
      setTimeout(() => {
        setIsLogin(true);
      }, 2000);
    } catch (error) {
      showNotification('Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-page">
      <div className="flag-vn"></div>
      <div className="glass-bg">
        <div className="glass-circle circle-1"></div>
        <div className="glass-circle circle-2"></div>
        <div className="glass-circle circle-3"></div>
      </div>

      <div className="aurora"></div>
      <div className="stars"></div>
      <div className="light-streaks"></div>

      {/* Notification Element */}
      <div className={`notification ${notification.visible ? 'show' : 'hidden'} ${notification.type}`}>
        {notification.message}
      </div>

      {/* Auth Container */}
      <div className="auth-container">
        {/* Login Form */}
        {isLogin && (
          <div className="form-container active">
            <div className="form-header">
              <div className="logo-container">
                <h2>Đăng nhập</h2>
              </div>
            </div>

            <form onSubmit={handleLogin} className="form">
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
                    type={showPassword ? "text" : "password"}
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
                    onClick={togglePasswordVisibility}
                  >
                    <span className="material-icons-round">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark">
                    <span className="material-icons-round">check</span>
                  </span>
                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              <button type="submit" className={`btn btn-primary ${isLoading ? 'loading' : ''}`}>
                <span className="material-icons-round btn-icon">login</span>
                <span className="btn-text">Đăng nhập</span>
                <span className="btn-loader"></span>
              </button>

              <div className="form-footer">
                <div className="footer-row">
                  <a href="#" className="forgot-password">Quên mật khẩu?</a>
                  <a 
                    href="#" 
                    className="form-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLogin(false);
                    }}
                  >
                    Đăng ký ngay
                  </a>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Register Form */}
        {!isLogin && (
          <div className="form-container active">
            <div className="form-header">
              <div className="logo-container">
                <h2>Đăng ký</h2>
              </div>
            </div>

            <form onSubmit={handleRegister} className="form">
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
                  <span className="material-icons-round input-icon">badge</span>
                  <input 
                    type="text" 
                    name="registerEmployeeId"
                    value={formData.registerEmployeeId}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required
                  />
                  <label>Mã nhân viên</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">store</span>
                  <select 
                    name="storeId"
                    value={formData.storeId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn cửa hàng</option>
                    <option value="STORE001">Cửa hàng chính</option>
                    <option value="STORE002">Chi nhánh 1</option>
                    <option value="STORE003">Chi nhánh 2</option>
                  </select>
                  <label>Cửa hàng</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">lock</span>
                  <input 
                    type="password" 
                    name="registerPassword"
                    value={formData.registerPassword}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="new-password"
                  />
                  <label>Mật khẩu</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons-round input-icon">lock</span>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder=" " 
                    required 
                    autoComplete="new-password"
                  />
                  <label>Xác nhận mật khẩu</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <button type="submit" className={`btn btn-primary ${isLoading ? 'loading' : ''}`}>
                <span className="material-icons-round btn-icon">person_add</span>
                <span className="btn-text">Đăng ký</span>
                <span className="btn-loader"></span>
              </button>

              <div className="form-footer">
                <div class="footer-row">
                  <a 
                    href="#" 
                    className="form-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLogin(true);
                    }}
                  >
                    Đã có tài khoản? Đăng nhập
                  </a>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;