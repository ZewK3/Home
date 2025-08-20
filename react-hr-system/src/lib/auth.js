import { useState, useEffect, useCallback } from 'react'
import { authService } from './services/auth.service.js'
import { CONFIG } from './config.js'

// Auth Hook for React
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Verify token by getting user info
          const userData = await authService.me()
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          console.warn('Token verification failed:', error)
          // Clear invalid token
          authService.logout()
          setIsAuthenticated(false)
          setUser(null)
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  // Login function
  const login = useCallback(async (employeeId, password, rememberMe = false) => {
    try {
      setLoading(true)
      
      const sessionData = await authService.login({ employeeId, password })
      
      // Get user data after successful login
      const userData = await authService.me()
      
      setUser(userData)
      setIsAuthenticated(true)
      
      return {
        success: true,
        message: 'Đăng nhập thành công!',
        user: userData,
        token: sessionData.token
      }
    } catch (error) {
      console.error('Login failed:', error)
      return {
        success: false,
        message: error.message || 'Đăng nhập thất bại'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Register function
  const register = useCallback(async (formData) => {
    try {
      setLoading(true)
      
      const result = await authService.register({
        employeeId: formData.employeeId || formData.loginEmployeeId,
        fullName: formData.fullName,
        storeName: formData.storeName,
        position: formData.position || 'NV',
        password: formData.password,
        phone: formData.phone,
        email: formData.email,
        joinDate: formData.joinDate
      })
      
      return {
        success: true,
        message: result.message || 'Đã gửi mã xác nhận tới email của bạn',
        requiresVerification: result.requiresVerification
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return {
        success: false,
        message: error.message || 'Đăng ký thất bại'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Verify email function
  const verifyEmail = useCallback(async (employeeId, verificationCode) => {
    try {
      setLoading(true)
      
      const result = await authService.verifyEmail({ employeeId, verificationCode })
      
      return {
        success: true,
        message: result.message || 'Xác nhận email thành công!'
      }
    } catch (error) {
      console.error('Email verification failed:', error)
      return {
        success: false,
        message: error.message || 'Xác nhận email thất bại'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Forgot password function (placeholder - not implemented in backend yet)
  const forgotPassword = useCallback(async (email) => {
    return {
      success: false,
      message: 'Tính năng quên mật khẩu sẽ được phát triển trong tương lai'
    }
  }, [])

  // Reset password function (placeholder - not implemented in backend yet)
  const resetPassword = useCallback(async (code, newPassword) => {
    return {
      success: false,
      message: 'Tính năng đặt lại mật khẩu sẽ được phát triển trong tương lai'
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [])

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout
  }
}

// Theme Hook
export const useTheme = () => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const storedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light'
    setTheme(storedTheme)
    document.documentElement.setAttribute('data-theme', storedTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, [theme])

  return {
    theme,
    toggleTheme
  }
}

// Notification Hook for React
export const useNotification = () => {
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now()
    setNotification({ id, message, type })

    if (duration > 0) {
      setTimeout(() => {
        setNotification(prev => prev?.id === id ? null : prev)
      }, duration)
    }
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  return {
    notification,
    showNotification,
    hideNotification
  }
}