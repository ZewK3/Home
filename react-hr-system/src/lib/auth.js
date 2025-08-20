import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from './config.js'

// Re-export useAuth from context for backwards compatibility
export { useAuth } from '../context/AuthContext.jsx'

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