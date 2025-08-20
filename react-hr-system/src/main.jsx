import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import router from './router/index.jsx';

import './index.css';
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/auth-clean.css';
import './styles/dashboard-clean.css';
import './styles/layout.css';
import './styles/examples.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
