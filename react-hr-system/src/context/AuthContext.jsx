import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/services/auth.service.js';
import { getUserFromCache, setUserToCache, clearUserCache } from '../lib/cache/userCache.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Bootstrap function - called only once when app starts
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const token = localStorage.getItem('hr_auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Try to get user from cache first
        const cachedUser = getUserFromCache();
        if (cachedUser) {
          setUser(cachedUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // Cache miss - fetch from API
        const response = await authService.me();
        const userData = response.data?.user || response.data || response;
        
        if (mounted) {
          setUser(userData);
          setIsAuthenticated(true);
          setUserToCache(userData); // Cache for 5 minutes by default
        }
      } catch (error) {
        console.error('Auth bootstrap failed:', error);
        if (mounted) {
          // Clear invalid token
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      const sessionData = await authService.login(credentials);
      
      // Get user data after successful login
      const response = await authService.me();
      const userData = response.data?.user || response.data || response;
      
      setUser(userData);
      setIsAuthenticated(true);
      setUserToCache(userData);
      
      return {
        success: true,
        message: 'Đăng nhập thành công!',
        user: userData,
        token: sessionData.token
      };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.message || 'Đăng nhập thất bại'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      clearUserCache();
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.me();
      const userData = response.data?.user || response.data || response;
      setUser(userData);
      setUserToCache(userData);
      return userData;
    } catch (error) {
      console.error('Refresh user failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};