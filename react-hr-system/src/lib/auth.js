import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from './config.js'
import { fetchAPI } from './utils.js'

// Auth Hook for React
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN)
    const storedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA)

    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.warn('Failed to parse user data from storage:', error)
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA)
      }
    }

    setLoading(false)
  }, [])

  // Login function
  const login = useCallback(async (employeeId, password, rememberMe = false) => {
    try {
      setLoading(true)
      
      // Mock API call - replace with actual API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: employeeId,
              name: 'Test User',
              role: 'AD',
              email: 'test@example.com'
            }
          })
        }, 1000)
      })

      if (response.success) {
        setToken(response.token)
        setUser(response.user)
        setIsAuthenticated(true)

        // Store in localStorage
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.token)
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user))
        
        if (rememberMe) {
          localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER_ME, employeeId)
        }

        return { success: true, message: 'Đăng nhập thành công!' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Đăng nhập thất bại. Vui lòng thử lại.' }
    } finally {
      setLoading(false)
    }
  }, [])

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true)
      
      // Mock API call - replace with actual API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Đăng ký thành công!'
          })
        }, 1000)
      })

      return response
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: 'Đăng ký thất bại. Vui lòng thử lại.' }
    } finally {
      setLoading(false)
    }
  }, [])

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      setLoading(true)
      
      // Mock API call - replace with actual API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Mã xác thực đã được gửi đến email của bạn.'
          })
        }, 1000)
      })

      return response
    } catch (error) {
      console.error('Forgot password error:', error)
      return { success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại.' }
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset password function
  const resetPassword = useCallback(async (code, newPassword) => {
    try {
      setLoading(true)
      
      // Mock API call - replace with actual API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Mật khẩu đã được đặt lại thành công!'
          })
        }, 1000)
      })

      return response
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại.' }
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    
    // Clear storage
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA)
    
    // Redirect to auth page
    window.location.href = '/auth'
  }, [])

  // Get dashboard stats (mock data)
  const getDashboardStats = useCallback(async () => {
    try {
      // Mock API call - replace with actual API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalEmployees: 150,
            activeEmployees: 142,
            todayAttendance: 138,
            pendingRequests: 8,
            monthlyHours: 2840,
            averageRating: 4.2
          })
        }, 500)
      })

      return response
    } catch (error) {
      console.error('Dashboard stats error:', error)
      return null
    }
  }, [])

  return {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    getDashboardStats
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

// Notification Hook
export const useNotification = () => {
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    show: false
  })

  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    setNotification({ message, type, show: true })
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, duration)
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }))
  }, [])

  return {
    notification,
    showNotification,
    hideNotification
  }
}