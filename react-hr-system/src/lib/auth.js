import { useState, useEffect, useCallback } from 'react'
import { authService } from './services/auth.service.js'

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