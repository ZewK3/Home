import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import AuthPage from '../pages/AuthPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import ExamplesPage from '../pages/ExamplesPage.jsx'
import LandingPage from '../pages/LandingPage.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import React from 'react'

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? element : <Navigate to="/auth" replace />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/auth',
    element: <AuthPage />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
    )
  },
  {
    path: '/examples',
    element: <ExamplesPage />
  }
])

export const AppRouter = () => <RouterProvider router={router} />

