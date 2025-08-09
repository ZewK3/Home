import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MobileNavigation from '../components/MobileNavigation';
import MainContent from '../components/MainContent';
import TestingPanel from '../components/TestingPanel';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navigateToSection = (section) => {
    setCurrentSection(section);
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) {
    return (
      <div className="dashboard-loader">
        <div className="loader-content">
          <div className="dual-spinner-container">
            <div className="spinner-outer"></div>
            <div className="spinner-inner"></div>
          </div>
          <h3 className="loader-title">Đang tải Dashboard...</h3>
          <p className="loader-subtitle">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <Header 
        user={user}
        theme={theme}
        onThemeToggle={toggleTheme}
        onLogout={logout}
        onMenuToggle={toggleMobileMenu}
      />
      
      <Sidebar 
        user={user}
        currentSection={currentSection}
        onNavigate={navigateToSection}
      />
      
      <MobileNavigation 
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={navigateToSection}
      />
      
      <MainContent 
        currentSection={currentSection}
        user={user}
        onNavigate={navigateToSection}
      />
      
      <TestingPanel />
    </div>
  );
};

export default Dashboard;