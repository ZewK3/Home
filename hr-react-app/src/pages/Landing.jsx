import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/landing.css';

const Landing = () => {
  const [currentLang, setCurrentLang] = useState('vi');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Setup scroll effects
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageToggle = () => {
    setShowLangDropdown(!showLangDropdown);
  };

  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
    setShowLangDropdown(false);
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      const targetPosition = targetElement.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="nav-container">
            <div className="nav-brand">
              <img src="/images/logo.png" alt="HR Logo" className="nav-logo" />
              <span className="nav-title">Professional HR</span>
            </div>
            <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`} id="nav-menu">
              <a href="#features" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'features')}>
                Tính năng
              </a>
              <a href="#benefits" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'benefits')}>
                Lợi ích
              </a>
              <a href="#contact" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'contact')}>
                Liên hệ
              </a>
              <Link to="/auth" className="nav-link nav-cta">
                Đăng nhập
              </Link>
            </div>
            <div className="nav-actions">
              {/* Language Toggle */}
              <div className="lang-toggle">
                <button 
                  className={`lang-btn ${currentLang === 'vi' ? 'active' : ''}`}
                  onClick={handleLanguageToggle}
                >
                  <span className="flag-emoji">🇻🇳</span>
                  {currentLang.toUpperCase()}
                </button>
                {showLangDropdown && (
                  <div className="lang-dropdown">
                    <button 
                      className="lang-btn" 
                      onClick={() => handleLanguageChange('en')}
                    >
                      <span className="flag-emoji">🇺🇸</span>
                      EN
                    </button>
                  </div>
                )}
              </div>
              <div 
                className={`nav-toggle ${mobileMenuOpen ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="nav-toggle-line"></span>
                <span className="nav-toggle-line"></span>
                <span className="nav-toggle-line"></span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Hệ thống quản lý <span className="hero-highlight">nhân sự</span> 
              chuyên nghiệp
            </h1>
            <p className="hero-description">
              Giải pháp toàn diện cho quản lý nhân sự, chấm công, tính lương 
              và báo cáo với công nghệ cloud hiện đại
            </p>
            <div className="hero-actions">
              <Link to="/auth" className="btn btn-primary">
                Bắt đầu ngay
              </Link>
              <a href="#features" className="btn btn-secondary" onClick={(e) => handleSmoothScroll(e, 'features')}>
                Tìm hiểu thêm
              </a>
            </div>
            {/* Test Account Info */}
            <div className="test-account-info">
              <div className="demo-card">
                <h3>🎯 Tài khoản Demo</h3>
                <p>Dùng thông tin sau để trải nghiệm hệ thống:</p>
                <div className="demo-credentials">
                  <div className="credential-item">
                    <span className="label">Tài khoản:</span>
                    <span className="value">ADMIN</span>
                  </div>
                  <div className="credential-item">
                    <span className="label">Mật khẩu:</span>
                    <span className="value">ADMIN123</span>
                  </div>
                </div>
                <Link to="/auth" className="btn btn-demo">
                  Trải nghiệm ngay
                </Link>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image">
              <div style={{
                width: '100%', 
                height: '400px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                borderRadius: '1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                <div>HR Dashboard Preview</div>
                <div style={{ fontSize: '1rem', opacity: '0.8', marginTop: '0.5rem' }}>
                  Giao diện quản lý hiện đại
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Tính năng nổi bật</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg className="icon">
                  <use href="#icon-users"></use>
                </svg>
              </div>
              <h3 className="feature-title">Quản lý nhân sự</h3>
              <p className="feature-description">
                Quản lý thông tin nhân viên, hợp đồng và sự nghiệp một cách hiệu quả
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg className="icon">
                  <use href="#icon-clock"></use>
                </svg>
              </div>
              <h3 className="feature-title">Chấm công thông minh</h3>
              <p className="feature-description">
                Chấm công GPS, theo dõi giờ làm việc và quản lý ca làm việc tự động
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg className="icon">
                  <use href="#icon-money"></use>
                </svg>
              </div>
              <h3 className="feature-title">Tính lương tự động</h3>
              <p className="feature-description">
                Tính toán lương, thưởng, phụ cấp và các khoản khấu trừ một cách chính xác
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg className="icon">
                  <use href="#icon-chart"></use>
                </svg>
              </div>
              <h3 className="feature-title">Báo cáo chi tiết</h3>
              <p className="feature-description">
                Phân tích dữ liệu và tạo báo cáo chuyên nghiệp cho quản lý
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Nhân viên được quản lý</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Hỗ trợ</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5 ⭐</div>
              <div className="stat-label">Đánh giá người dùng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Tại sao chọn chúng tôi?</h2>
              <ul className="benefits-list">
                <li className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Giao diện hiện đại, dễ sử dụng</span>
                </li>
                <li className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Bảo mật cao với công nghệ Cloudflare</span>
                </li>
                <li className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Tích hợp đa nền tảng</span>
                </li>
                <li className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Hỗ trợ 24/7</span>
                </li>
              </ul>
            </div>
            <div className="benefits-visual">
              <div style={{
                width: '100%', 
                height: '300px', 
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                borderRadius: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: '1.25rem', 
                fontWeight: '600'
              }}>
                System Benefits
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title">Professional HR</h3>
              <p className="footer-description">
                Hệ thống quản lý nhân sự chuyên nghiệp
              </p>
            </div>
            <div className="footer-section">
              <h3 className="footer-title">Liên hệ</h3>
              <ul className="footer-links">
                <li><a href="mailto:support@hr-system.com">support@hr-system.com</a></li>
                <li><a href="tel:+84123456789">+84 123 456 789</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3 className="footer-title">Hỗ trợ</h3>
              <ul className="footer-links">
                <li><a href="#help">Trợ giúp</a></li>
                <li><a href="#privacy">Bảo mật</a></li>
                <li><a href="#terms">Điều khoản</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Professional HR Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* SVG Icons */}
      <svg style={{ display: 'none' }}>
        <defs>
          <symbol id="icon-users" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </symbol>
          <symbol id="icon-clock" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </symbol>
          <symbol id="icon-money" viewBox="0 0 24 24">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </symbol>
          <symbol id="icon-chart" viewBox="0 0 24 24">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
          </symbol>
        </defs>
      </svg>
    </div>
  );
};

export default Landing;