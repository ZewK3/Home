import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ExamplesPage from '../pages/ExamplesPage.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    element: <App />, // provides outlet
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        element: <ProtectedRoute />, // requires auth
        children: [
          {
            element: <DashboardLayout />, // layout for protected routes
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/examples', element: <ExamplesPage /> },
            ],
          },
        ],
      },
      {
        path: '/',
        element: <Navigate to="/auth" replace />,
      },
    ],
  },
]);

export default router;
