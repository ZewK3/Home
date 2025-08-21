import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import router from './router/index.jsx';

import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components/header.css';
import './styles/components/sidebar.css';
import './styles/components/stats-grid.css';
import './styles/components/quick-actions.css';
import './styles/components/notification.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
