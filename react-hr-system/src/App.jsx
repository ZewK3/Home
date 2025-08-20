import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ExamplesPage from './pages/ExamplesPage'
import './styles/layout.css'
import './styles/examples.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/examples" element={<ExamplesPage />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

export default App

export default App
